package org.t2k.cgs.course.elasticsearch;

import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.Setting;
import org.t2k.cgs.model.course.Course;
import org.t2k.cgs.model.course.CourseToc;
import org.t2k.cgs.model.tocItem.TocItem;
import org.t2k.cgs.utils.GeneralUtils;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

/**
 * A course object for elasticsearch.
 * <p>
 * MD5 checksum is computed for the class file and also for {@link Setting} file in {@link CourseSearchServiceImpl},
 * <p>
 * WARNING: any change on the class or on the settings file will trigger a re-indexation on elasticsearch for all
 * courses on the next application start-up.
 *
 * @author Alex Burdusel on 2017-01-19.
 */
@Document(indexName = "course")
@Setting(settingPath = "/elasticsearch/courseSearchSettings.json")
public class CourseES {

    /**
     * The courseId of the course object from the database
     */
    @Id
    private String id;
    private int publisherId;

    @Field(type = FieldType.String,
            indexAnalyzer = "nGramAnalyzer",
            searchAnalyzer = "standard")
    private String title;

    /**
     * A list of flattened toc element from the course's toc hierarchy
     */
    @Field(type = FieldType.Nested)
    private List<TocES> tocElements;

    /**
     * A list of all the toc items (lessons/assessments) in the course
     */
    @Field(type = FieldType.Nested)
    private List<TocItemES> tocItems;

    public static CourseES newInstance(Course course, List<TocItem> courseTocItems) {
        CourseES courseES = new CourseES();
        courseES.id = course.getCourseId();
        courseES.publisherId = course.getCgsData().getPublisherId();
        courseES.title = course.getTitle();

        courseES.tocElements = course.getContentData().getToc().getFlattenedTocChildren().stream()
                .map(TocES::newInstance)
                .collect(Collectors.toList());

        courseES.tocItems = courseTocItems.stream()
                .map(TocItemES::newInstance)
                .collect(Collectors.toList());

        return courseES;
    }

    /**
     * The courseId of the course object from the database
     */
    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    /**
     * A list of flattened toc elements from the course's toc hierarchy
     */
    public List<TocES> getTocElements() {
        return tocElements;
    }

    /**
     * A list of all the toc items (lessons/assessments) in the course
     */
    public List<TocItemES> getTocItems() {
        return tocItems;
    }

    public int getPublisherId() {
        return publisherId;
    }

    private static class TocES {
        private String cid;
        @Field(type = FieldType.String,
                indexAnalyzer = "nGramAnalyzer",
                searchAnalyzer = "standard")
        private String title;

        private static TocES newInstance(CourseToc courseToc) {
            TocES tocES = new TocES();
            tocES.cid = courseToc.getCid();
            tocES.title = courseToc.getTitle();
            return tocES;
        }

        public String getCid() {
            return cid;
        }

        public String getTitle() {
            return title;
        }
    }

    public static class TocItemES {
        private String cid;
        @Field(type = FieldType.String,
                indexAnalyzer = "nGramAnalyzer",
                searchAnalyzer = "standard")
        private String title;

        private static TocItemES newInstance(TocItem tocItem) {
            TocItemES tocItemES = new TocItemES();
            tocItemES.cid = tocItem.getContentId();
            tocItemES.title = tocItem.getTitle();
            return tocItemES;
        }

        public String getCid() {
            return cid;
        }

        public String getTitle() {
            return title;
        }
    }

    /**
     * Returns a brief description of this CourseES. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * CourseES{"id": "asd2-asd1-321as-czxc", "publisherId": 1, "title": "Course title"}
     */
    @Override
    public String toString() {
        return "CourseES{" +
                "\"id\": \"" + id + '\"' +
                ", \"publisherId\": " + publisherId +
                ", \"title\": \"" + title + '\"' +
                '}';
    }

    /**
     * Obtain the checksum (MD5 hex) for the contents of the class
     *
     * @return the checksum (MD5 hex) for the contents of the class
     * @throws IOException if the class file cannot be read
     */
    static String getClassMD5Hex() throws IOException {
        return DigestUtils.md5Hex(GeneralUtils.getClassStructure(CourseES.class));
    }

    /**
     * Obtain the checksum (MD5 hex) for the contents of json settings file used for class elasticsearch configuration
     *
     * @return the checksum (MD5 hex) for the contents of json settings file used for class elasticsearch configuration
     * or null if none found
     * @throws IOException if the settings file cannot be read
     */
    static String getSettingsMD5Hex() throws IOException {
        Setting settingAnnotation = CourseES.class.getAnnotation(Setting.class);
        Resource settingsResource = settingAnnotation != null
                ? new ClassPathResource(settingAnnotation.settingPath())
                : null;
        if (settingsResource == null) {
            return null;
        }
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        try (InputStream stream = settingsResource.getInputStream()) {
            int datum = stream.read();
            while (datum != -1) {
                buffer.write(datum);
                datum = stream.read();
            }
        }
        return DigestUtils.md5Hex(buffer.toByteArray());
    }
}
