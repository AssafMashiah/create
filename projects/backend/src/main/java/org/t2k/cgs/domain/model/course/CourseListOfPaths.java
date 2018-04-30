package org.t2k.cgs.domain.model.course;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 03/06/13
 * Time: 13:17
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseListOfPaths {
    private String sourceCourseId;
    private List<String> pathsList;

    public List<String> getPathsList() {
        return pathsList;
    }

    public void setPathsList(List<String> pathsList) {
        this.pathsList = pathsList;
    }

    public String getSourceCourseId() {
        return sourceCourseId;
    }

    public void setSourceCourseId(String sourceCourseId) {
        this.sourceCourseId = sourceCourseId;
    }

    /**
     * Returns a brief description of this CourseListOfPaths. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * CourseListOfPaths{"sourceCourseId": "asdsdq123", "pathsList": [...]}
     */
    @Override
    public String toString() {
        return "CourseListOfPaths{" +
                "\"sourceCourseId\": \"" + sourceCourseId + '\"' +
                ", \"pathsList\": " + pathsList +
                '}';
    }
}
