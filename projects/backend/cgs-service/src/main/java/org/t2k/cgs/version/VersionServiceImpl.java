package org.t2k.cgs.version;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import org.t2k.cgs.config.SpringProfiles;

import javax.annotation.PostConstruct;
import java.io.*;
import java.util.Arrays;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/27/12
 * Time: 5:13 PM
 */
@Service("versionService")
public class VersionServiceImpl implements VersionService {

    private static Logger logger = Logger.getLogger(VersionServiceImpl.class);

    @Autowired
    private Environment env;

    private Version version;

    // properties values taken from versionProperties PropertyPlaceholderConfigurer cgsConfigProps bean defined in ApplicationConfiguration
    // use the version member to retrieve them, as these properties below may contain tokens from file
    @Value("${versionMajor}")
    private String versionMajor;
    @Value("${versionMinor}")
    private String versionMinor;
    @Value("${versionMilestone}")
    private String versionMilestone;
    @Value("${versionBuild}")
    private String versionBuild;

    @PostConstruct
    private void init() {
        if (env != null && Arrays.asList(env.getActiveProfiles()).contains(SpringProfiles.DEVELOPMENT)) {
            Version gradleVersion = getVersionFromGradle();
            this.version = Version.newInstance(gradleVersion, versionBuild);
        } else {
            this.version = Version.newInstance(versionMajor, versionMinor, versionMilestone, versionBuild);
        }
    }

    private Version getVersionFromGradle() {
        String pathToGradleFile = VersionServiceImpl.class.getProtectionDomain().getCodeSource().getLocation().toString()
                .replaceAll("file:", "")
                .split("/projects/backend/cgs-service/")[0]
//                .replaceAll("/projects/backend/cgs-service/build/classes/main", "")
                + "/cgs-common.gradle";

        File gradleFile = new File(pathToGradleFile);
        if (!gradleFile.exists()) {
            logger.error("Unable to locate 'cgs-common.gradle'");
        }
        Version version = null;
        try {
            List<String> gradleFileContent = FileUtils.readLines(gradleFile);
            for (String line : gradleFileContent) {
                if (line.contains("version")) {
                    String versionString = line
                            .replaceAll("version", "")
                            .replaceAll("=", "")
                            .replaceAll("'", "")
                            .replaceAll("-SNAPSHOT", "")
                            .trim();
                    String[] versionArray = versionString.split("\\.");
                    if (versionArray.length != 3) {
                        logger.warn("Version string extracted from 'cgs-common.gradle' does not contain 3 sections");
                    } else {
                        version = Version.newInstance(versionArray[0], versionArray[1], versionArray[2], "x");
                    }
                    break;
                }
            }
        } catch (IOException e) {
            logger.error("Exception reading 'cgs-common.gradle' file content", e);
        }
        return version;
    }

    @Override
    public String getFullVersion() {
        return version.toString();
    }

    @Override
    public String getVersionMajor() {
        return version.getMajor();
    }

    @Override
    public String getVersionMinor() {
        return version.getMinor();
    }

    @Override
    public String getVersionMilestone() {
        return version.getMilestone();
    }

    @Override
    public String getVersionBuild() {
        return version.getBuild();
    }

    @Override
    public boolean exportVersionFile(File destinationFile) throws IOException {
        try (InputStream resourceAsStream = getClass().getClassLoader().getResourceAsStream("config/version.properties")) {
            if (resourceAsStream == null) {
                logger.error("version.properties file could not be found");
                return false;
            }
            try (FileOutputStream writer = new FileOutputStream(destinationFile)) {
                IOUtils.copy(resourceAsStream, writer);
            }
        }
        if (env != null && Arrays.asList(env.getActiveProfiles()).contains(SpringProfiles.DEVELOPMENT)) {
            replaceTagsInVersionFile(destinationFile);
        }
        return true;
    }

    /**
     * Replaces the version tags with the actual version values. This method is to be used on the spring-boot dev
     * environment, where the version.properties file does not yet have the actual version values
     *
     * @param versionFile version file to replace the tags on
     * @throws IOException if an I/O error occurs.
     */
    private void replaceTagsInVersionFile(File versionFile) throws IOException {
        String versionString = FileUtils.readFileToString(versionFile);
        versionString = versionString.replaceAll("@versionMajor@", version.getMajor());
        versionString = versionString.replaceAll("@versionMinor@", version.getMinor());
        versionString = versionString.replaceAll("@versionMilestone@", version.getMilestone());
        FileWriter fw = new FileWriter(versionFile);
        fw.write(versionString);
        fw.close();
    }
}
