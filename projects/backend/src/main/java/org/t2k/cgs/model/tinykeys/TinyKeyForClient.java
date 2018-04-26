package org.t2k.cgs.model.tinykeys;

import org.t2k.cgs.security.TinyKey;

/**
 * Created by Moshe.Avdiel on 5/2/2016.
 */
public class TinyKeyForClient {

    private String publisherId;
    private String courseId;
    private String lessonId;
    private String tinyKey;
    private String courseName;
    private String lessonName;
    private String publishTarget;


    public TinyKeyForClient(TinyKey tinyKey) {
        this.publisherId    = String.valueOf(tinyKey.getPublisherId());
        this.courseId       = tinyKey.getCourseId();
        this.lessonId       = tinyKey.getLessonId();
        this.tinyKey        = tinyKey.getTinyKey();
        this.publishTarget  = tinyKey.getPublishTarget();
        this.courseName = tinyKey.getCourseTitle();
        this.lessonName = tinyKey.getLessonTitle();
    }

    public String getPublishTarget() {
        return publishTarget;
    }

    public String getPublisherId() {
        return publisherId;
    }

    public String getCourseId() {
        return courseId;
    }

    public String getLessonId() {
        return lessonId;
    }

    public String getTinyKey() {
        return tinyKey;
    }

    public String getCourseName() {
        return courseName;
    }

    public String getLessonName() {
        return lessonName;
    }
}
