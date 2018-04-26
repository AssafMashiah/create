package org.t2k.cgs.model.course;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;
import org.springframework.data.annotation.Transient;
import org.t2k.cgs.customIcons.CustomIconsPack;
import org.t2k.cgs.customIcons.PublisherCustomIconsPack;
import org.t2k.cgs.model.CGSResource;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;

/**
 * Note: This class has a natural ordering that is inconsistent with equals. This class extends {@link CustomIconsPack}
 * which implements {@link Comparable}<{@link CustomIconsPack}>
 *
 * @author Alex Burdusel on 2016-07-12.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseCustomIconsPack extends CustomIconsPack {

    @Transient
    private static Logger logger = Logger.getLogger(CourseCustomIconsPack.class);

    /**
     * Reference to resource object inside the course, as on course, we do not keep the refs in the custom icons pack object
     */
    private String resourceId;
    private String cssPath;

    /**
     * @param customIconsDestPath path on disk to the dir where custom icons resources are stored
     * @return
     */
    public static CourseCustomIconsPack newInstance(PublisherCustomIconsPack publisherCustomIconsPack, CGSResource cgsResource,
                                                    String customIconsDestPath) {
        Type type = publisherCustomIconsPack.getType();
        long version = publisherCustomIconsPack.getVersion();
        CourseCustomIconsPack courseCustomIconsPack = new CourseCustomIconsPack();
        String cssFileName = generateCssFile(type, version, cgsResource.getHrefs(), customIconsDestPath);
        if (cssFileName == null) {
            logger.error("Failed to generate custom icons font CSS file to " + customIconsDestPath);
            return null;
        }
        courseCustomIconsPack.cssPath = cgsResource.getBaseDir() + "/" + cssFileName;
        cgsResource.getHrefs().add(cssFileName);

        courseCustomIconsPack.version = version;
        courseCustomIconsPack.type = type;
        courseCustomIconsPack.creationDate = new Date();
        courseCustomIconsPack.resourceId = cgsResource.getResId();
        return courseCustomIconsPack;
    }

    public String getResourceId() {
        return resourceId;
    }

    public String getCssPath() {
        return cssPath;
    }


    /**
     * Generates a css file for the resources included in the custom icons pack
     *
     * @param customIconsPath path on disk to the dir where to write the css file
     * @return name of the css file if the css file was successfully generated, null otherwise
     */
    private static String generateCssFile(Type type, long version, List<String> hrefs, String customIconsPath) {
        StringBuilder builder = new StringBuilder("@font-face{font-family:'");
        builder.append(type.getFontFamily()).append("';")
                .append("src:");
        int filesCount = hrefs.size();
        for (int i = 0; i < filesCount; i++) {
            String fontFile = hrefs.get(i);

            builder.append("url('").append(fontFile).append("?ver=").append(version).append("')")
                    .append("format('");

            String extension = FilenameUtils.getExtension(fontFile);
            FontType fontType = FontType.forName(extension);
            if (fontType == null) {
                logger.warn("Font type not supported");
                return null;
            }
            builder.append(fontType.getFormat())
                    .append("')")
                    .append((i == (filesCount - 1)) ? ";" : ",");
        }
        builder.append("}");

        String cssFileName = type.getFontFamily() + ".css";
        try {
            FileUtils.writeStringToFile(new File(customIconsPath + "/" + cssFileName), builder.toString());
        } catch (IOException e) {
            logger.error("Error writing css file to disk", e);
            return null;
        }
        return cssFileName;
    }

    /**
     * Two {@link CourseCustomIconsPack}s are equal if they are of the same type. We use this to make sure that the course
     * doesn't have multiple {@link CourseCustomIconsPack}s of the same type. Use compareTo to check the version.
     */
    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (obj == this) {
            return true;
        }
        if (obj.getClass() != getClass()) {
            return false;
        }
        CourseCustomIconsPack other = (CourseCustomIconsPack) obj;
        return this.type == other.getType();
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + type.hashCode();
        return result;
    }
}
