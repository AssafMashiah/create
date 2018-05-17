package org.t2k.cgs.web.rest;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.t2k.cgs.domain.model.course.Course;
import org.t2k.cgs.domain.model.course.CourseDifferentiation;
import org.t2k.cgs.domain.model.course.CourseToc;
import org.t2k.cgs.service.tocitem.TocItemValidationResponse;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * A DTO object to be transmitted to the client holding summary info about a course and its contents, with toc items
 * (lessons and/or assessments) validated for import
 *
 * @author Alex Burdusel on 2017-01-09.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseTreeDTO {

    private String courseId;
    private String title;
    private CourseDifferentiation differentiation;
    private Toc toc;

    /**
     * @param course                       the course to transform to the DTO
     * @param tocItemValidationResponseMap a map containing all the toc items for the course with validation results
     *                                     for import (errors and/or warnings)
     */
    public CourseTreeDTO(Course course,
                         Map<String, TocItemValidationResponse> tocItemValidationResponseMap) {
        this.courseId = course.getCourseId();
        this.title = course.getTitle();
        this.differentiation = course.getContentData().getDifferentiation();
        this.toc = new Toc(course.getContentData().getToc(),
                tocItemValidationResponseMap);
    }

    public String getCourseId() {
        return courseId;
    }

    public String getTitle() {
        return title;
    }

    public CourseDifferentiation getDifferentiation() {
        return differentiation;
    }

    public Toc getToc() {
        return toc;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Toc {
        private String cid;
        private String title;
        private List<Toc> tocChildren;
        private List<TocItemValidationResponse> tocItems;

        /**
         * @param courseToc
         * @param tocItemValidationResponseMap
         */
        private Toc(CourseToc courseToc,
                    Map<String, TocItemValidationResponse> tocItemValidationResponseMap) {
            this.cid = courseToc.getCid();
            this.title = courseToc.getTitle();

            this.tocChildren = courseToc.getTocItems().stream()
                    .map(childToc -> new Toc(childToc, tocItemValidationResponseMap))
                    .collect(Collectors.toList());

            this.tocItems = courseToc.getTocItemRefs().
                    stream()
                    .map(courseTocItem -> tocItemValidationResponseMap.get(courseTocItem.getCid()))
                    .collect(Collectors.toList());
        }

        public String getCid() {
            return cid;
        }

        public String getTitle() {
            return title;
        }

        public List<Toc> getTocChildren() {
            return tocChildren;
        }

        public List<TocItemValidationResponse> getTocItems() {
            return tocItems;
        }
    }
}
