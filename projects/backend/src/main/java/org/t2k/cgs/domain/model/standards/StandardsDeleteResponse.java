package org.t2k.cgs.domain.model.standards;

import com.fasterxml.jackson.annotation.JsonAutoDetect;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

/**
 * <dt>Created:</dt><dd>16-02-28</dd>
 * <dt>Author:</dt><dd>Moshe Avdiel</dd>
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE)
public class StandardsDeleteResponse {
    private String publisherId;
    private String publisherName;
    private String courseId;
    private String courseName;

    /**
     * ---[  Default Constructor  ]---
     *
     * @param publisherId
     * @param publisherName
     * @param courseId
     * @param courseName
     */
    public StandardsDeleteResponse(String publisherId, String publisherName, String courseId, String courseName) {
        this.publisherId = publisherId;
        this.publisherName = publisherName;
        this.courseId = courseId;
        this.courseName = courseName;
    }


    //---[    Getters    ]----


    public String getPublisherId() {
        return publisherId;
    }

    public String getPublisherName() {
        return publisherName;
    }

    public String getCourseId() {
        return courseId;
    }

    public String getCourseName() {
        return courseName;
    }
}
