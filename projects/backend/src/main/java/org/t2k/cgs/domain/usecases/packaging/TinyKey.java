package org.t2k.cgs.domain.usecases.packaging;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

/**
 * <dt>Created:</dt>
 * <dd>May 1, 2016</dd>
 * <dt>Author:</dt>
 * <dd>Moshe Avdiel</dd>
 */
@Document
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE)
public class TinyKey {

    @Id
    private String id;
    private int publisherId;
    private String courseId;
    private String lessonId;
    private String tinyKey;
    private String publishTarget;
    private String courseTitle;
    private String lessonTitle;

    public TinyKey(int publisherId, String courseId, String lessonId, String tinyKey, String publishTarget, String courseTitle, String lessonTitle) {
        this.publisherId = publisherId;
        this.courseId = courseId;
        this.lessonId = lessonId;
        this.tinyKey = tinyKey;
        this.publishTarget = publishTarget;
        this.courseTitle = courseTitle;
        this.lessonTitle = lessonTitle;
    }

    public String getId() {
        return id;
    }

    public String getPublishTarget() {
        return publishTarget;
    }

    public int getPublisherId() {
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
    public String getCourseTitle() {
        return courseTitle;
    }

    public String getLessonTitle() {
        return lessonTitle;
    }
}