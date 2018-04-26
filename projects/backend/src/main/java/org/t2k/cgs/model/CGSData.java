package org.t2k.cgs.model;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 24/06/14
 * Time: 17:38
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CGSData {
    private int publisherId;

    private String courseId;

    public static CGSData newInstance(int publisherId) {
        CGSData cgsData = new CGSData();
        cgsData.publisherId = publisherId;
        return cgsData;
    }

    public static CGSData newInstance(int publisherId, String courseId) {
        CGSData cgsData = new CGSData();
        cgsData.publisherId = publisherId;
        cgsData.courseId = courseId;
        return cgsData;
    }

    public int getPublisherId() {
        return publisherId;
    }

    /**
     * Returns a brief description of this CGSData. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * CGSData{"publisherId": 1, "courseId": "asdsdqwe123123dasd"}
     */
    @Override
    public String toString() {
        return "CGSData{" +
                "\"publisherId\": " + publisherId +
                ", \"courseId\": \"" + courseId + '\"' +
                '}';
    }

    public String getCourseId() {
        return courseId;
    }
}
