package org.t2k.cgs.domain.usecases.packaging.zippers;

import com.t2k.configurations.Configuration;
import com.t2k.dtp.courseutils.converter.ConverterFactory;
import com.t2k.dtp.courseutils.converter.CourseConverter;
import com.t2k.dtp.courseutils.converter.CourseConverterType;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.core.io.FileSystemResource;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.usecases.packaging.CGSPackage;
import org.t2k.cgs.domain.usecases.packaging.ExtraDataAboutPackageForScorm;
import org.t2k.cgs.utils.FilesUtils;
import org.t2k.cgs.utils.ZipHelper;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 26/05/14
 * Time: 09:48
 */
public class ScormPackageZipper implements PackageZipper {

    private static Logger logger = Logger.getLogger(ScormPackageZipper.class);

    private final String SCORM_CONTROLLING_DOCUMENTS_DIR = "manifestTemplates/scormControllingDocuments";

    private Configuration configuration;
    private ScormManifestBuilder scormManifestBuilder;
    private FilesUtils filesUtils;

    public ScormPackageZipper(Configuration configuration,
                              ScormManifestBuilder scormManifestBuilder,
                              FilesUtils filesUtils) {
        this.configuration = configuration;
        this.scormManifestBuilder = scormManifestBuilder;
        this.filesUtils = filesUtils;
    }

    /**
     * Creates a zip file with structure:
     * --> scp\
     * --> stand alone player files
     * --> {lessonk-id}\
     * --> lesson data
     * --> imsmanifest.xml // manifest for the player
     *
     * @return the path of the SCP folder
     */
    public String getScpLocation() {
        return String.format("%s/scp", configuration.getProperty("cmsHome"));
    }

    public String createPackage(CGSPackage cgsPackage) throws Exception {
        logger.info("createPackageForScorm: SCORM zip file creation started.");
        List<File> temporaryFiles = new ArrayList<>();
        FileSystemResource packageFile = new FileSystemResource(cgsPackage.getPackageOutputLocation());
        CourseConverter courseConverter = ConverterFactory.getConverter(CourseConverterType.GCR2LMS);
        File targetDir = new File(packageFile.getFile().getParent(), String.format("download/%s", cgsPackage.getCourseCId()));
        temporaryFiles.add(targetDir);
        courseConverter.convert(packageFile.getFile(), targetDir);

        // create temp folder to contain the SCORM manifest
        File scormManifestOutputDir = new File(packageFile.getFile().getParent(), String.format("tempManifests/%s", cgsPackage.getPackId()));
        if (!scormManifestOutputDir.exists()) {
            if (!scormManifestOutputDir.mkdirs()) {
                throw new DsException(String.format("Could not create a temp folder for scorm manifest in folder: %s",
                        scormManifestOutputDir.getAbsolutePath()));
            }
        }

        String scpLocation = getScpLocation();

        List<String> foldersToZip = new ArrayList<>();
        foldersToZip.add(scpLocation); // standalone player
        foldersToZip.add(targetDir.getPath()); // course data

        String courseManifestPath = String.format("%s/manifest", targetDir.getAbsolutePath());
        String lessonsManifestsDirPath = String.format("%s/lessons", targetDir.getAbsolutePath());
        String standardsManifestsDirPath = String.format("%s/standards", targetDir.getAbsolutePath());
        long foldersSize = new File(scpLocation).getTotalSpace() + targetDir.getTotalSpace();

        String publisherName = cgsPackage.getPublisherName();
        ExtraDataAboutPackageForScorm extraDataAboutPackageForScorm = new ExtraDataAboutPackageForScorm(foldersSize,
                cgsPackage.getPublishModeEnum(), cgsPackage.getPackStartDate(), publisherName);

        // All files included in the scorm content package should be declared and referenced in the manifest to ensure conformity
        // references to them need to be relative from package root
        List<String> filesIncludedInThePackage = new ArrayList<>();
        // scp files
        filesIncludedInThePackage.addAll(FilesUtils.listFiles(new File(scpLocation), true, true));
        // course files
        filesIncludedInThePackage.addAll(FilesUtils.listFiles(targetDir, true, true));
        copyControllingDocuments(scormManifestOutputDir.getAbsolutePath());

        File scormManifest = scormManifestBuilder.buildScormManifest(cgsPackage, scormManifestOutputDir, courseManifestPath,
                lessonsManifestsDirPath, standardsManifestsDirPath, extraDataAboutPackageForScorm, filesIncludedInThePackage);

        if (scormManifest != null) {
            // add all scorm manifest and Controlling Document(s) Required For XML Parsing to the files to be included in the package
            List<String> scormFiles = Stream.of(scormManifest.getParentFile().listFiles()).map(File::getPath).collect(Collectors.toList());
            foldersToZip.addAll(scormFiles);
            temporaryFiles.add(scormManifestOutputDir.getParentFile());
        }

        String zipFile = String.format("%s/download/%s.scorm.zip", packageFile.getFile().getParent(), packageFile.getFile().getName().replace(".cgs", ""));
        ZipHelper.zipDir(foldersToZip, zipFile);
        try { // Cleanup
            for (File file : temporaryFiles) {
                FileUtils.forceDelete(file);
            }
        } catch (Exception e) {
            logger.error(String.format("createPackageForScorm: Failed to delete courseData folder %s OR scorm manifest file: %s for packageId: %s, courseId: %s", targetDir.getAbsolutePath(), scormManifestOutputDir.getAbsolutePath(), cgsPackage.getPackId(), cgsPackage.getCourseId()), e);
        }

        logger.info(String.format("createPackageForScorm: SCORM zip file creation ended successfully for packageId: %s, courseId: %s", cgsPackage.getPackId(), cgsPackage.getCourseId()));
        return zipFile;
    }

    /**
     * Copies Controlling Document(s) Required For XML Parsing
     *
     * @param destPath destination path to copy the documents to. It will be created if it does not exist
     * @return a list of copied documents names
     */
    private List<String> copyControllingDocuments(String destPath) {
        File jarFile = new File(this.getClass().getProtectionDomain().getCodeSource().getLocation().getPath());
        return filesUtils.extractDirFromJar(jarFile, SCORM_CONTROLLING_DOCUMENTS_DIR, destPath, true);
    }
}