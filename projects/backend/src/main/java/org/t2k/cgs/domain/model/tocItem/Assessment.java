package org.t2k.cgs.domain.model.tocItem;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.data.mongodb.core.mapping.Document;
import org.t2k.cgs.domain.model.CGSData;
import org.t2k.cgs.domain.model.course.Course;

/**
 * @author Alex Burdusel on 2016-06-15.
 */
@Document(collection = "assessments")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Assessment extends TocItem {

    private AssessmentContentData contentData;

    @Override
    public AssessmentContentData getContentData() {
        return contentData;
    }

    public static Assessment newInstance(String courseId, int publisherId, AssessmentContentData lessonContentData) {
        Assessment assessment = new Assessment();
        assessment.cgsData = CGSData.newInstance(publisherId, courseId);
        assessment.contentData = lessonContentData;
        return assessment;
    }

    /**
     * Returns a brief description of this Assessment. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * Assessment{"_id": 1, "cgsData": {...}, "contentData": {...}}
     */
    @Override
    public String toString() {
        return "Assessment{" +
                "\"_id\": \"" + _id + '\"' +
                ", \"cgsData\": " + cgsData +
                ", \"contentData\": " + contentData +
                '}';
    }

    /**
     * {@inheritDoc}
     *
     * @see AssessmentContentData#transformForImport(Course, Course)
     */
    @Override
    public Assessment transformForImport(Course sourceCourse, Course destinationCourse) {
        Assessment transformed = new Assessment();
        transformed.cgsData = CGSData.newInstance(destinationCourse.getCgsData().getPublisherId(), destinationCourse.getCourseId());
        transformed.contentData = (AssessmentContentData) this.contentData.transformForImport(sourceCourse, destinationCourse);
        return transformed;
    }
}
