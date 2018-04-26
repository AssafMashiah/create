package org.t2k.cgs.rest.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.t2k.cgs.model.Header;
import org.t2k.cgs.model.course.Course;

/**
 * Object contains summarized info for a course
 *
 * @author Alex Burdusel on 2016-09-19.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseInfoDTO {

    private String courseId;
    private String title;
    private String version;
    private String author;
    private Header header;
    @JsonProperty(value = "coverRefId")
    private String coverHref;
    @JsonProperty
    private boolean includeLo;

    private static CourseInfoDTO newInstance(Builder builder) {
        CourseInfoDTO courseDTO = new CourseInfoDTO();
        courseDTO.courseId = builder.courseId;
        courseDTO.title = builder.title;
        courseDTO.version = builder.version;
        courseDTO.author = builder.author;
        courseDTO.header = builder.header;
        courseDTO.coverHref = builder.coverHref;
        courseDTO.includeLo = builder.includeLo;
        return courseDTO;
    }

    public static CourseInfoDTO of(Course course) {
        CourseInfoDTO courseDTO = new CourseInfoDTO();
        if (course.getContentData() == null) return courseDTO;
        courseDTO.courseId = course.getContentData().getCourseId();
        courseDTO.title = course.getContentData().getTitle();
        courseDTO.version = course.getContentData().getVersion();
        courseDTO.author = course.getContentData().getAuthor();
        courseDTO.header = course.getContentData().getHeader();
        course.getContentData().getCover().ifPresent(resource -> courseDTO.coverHref = resource.getHref());
        courseDTO.includeLo = course.getContentData().includeLo();
        return courseDTO;
    }

    public static final class Builder {

        private String courseId;
        private String title;
        private String version;
        private String author;
        private Header header;
        private String coverHref;
        private boolean includeLo;

        public Builder(String courseId, String title) {
            this.courseId = courseId;
            this.title = title;
        }

        public CourseInfoDTO build() {
            return newInstance(this);
        }

        public Builder setVersion(String version) {
            this.version = version;
            return this;
        }

        public Builder setAuthor(String author) {
            this.author = author;
            return this;
        }

        public Builder setHeader(Header header) {
            this.header = header;
            return this;
        }

        public Builder setCoverHref(String coverHref) {
            this.coverHref = coverHref;
            return this;
        }

        public Builder includeLo(boolean includeLo) {
            this.includeLo = includeLo;
            return this;
        }
    }

    public String getCourseId() {
        return courseId;
    }

    public String getTitle() {
        return title;
    }

    public String getVersion() {
        return version;
    }

    public String getAuthor() {
        return author;
    }

    public Header getHeader() {
        return header;
    }

    public String getCoverHref() {
        return coverHref;
    }

    public boolean includeLo() {
        return includeLo;
    }
}
