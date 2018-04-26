package org.t2k.cgs.model.cleanup;

import org.springframework.data.annotation.Id;

import java.util.Date;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 14/08/14
 * Time: 10:44
 */
public class CleanupJob {
    public static String CREATED = "created";
    public static String LAST_MODIFIED ="lastModified";
    public static String COURSE_ID =  "courseId";
    public static String PUBLISHER_ID = "publisherId";
    public static String TOC_ITEM_ID = "tocItemId";
    public static String TOC_ITEM_ENTITY_ID = "tocItemEntityId";
    public static String CLEANUP_TYPE =  "cleanupType"; // Lesson, Assessment, Course, etc
    public static String STATUS = "status";  // Created, InProgress, Finished

    @Id
    private String id;
    private Date created;
    private Date lastModified;
    private int publisherId;
    private String courseId;
    private String tocItemId;
    private String tocItemEntityId;
    private CleanupType cleanupType; // Lesson, Assessment, Course, etc
    private CleanupStatus status;  // Created, InProgress, Finished

    public CleanupJob() { }

    public CleanupJob(int publisherId, String courseId, String tocItemId, String tocItemEntityId, CleanupType cleanupType) {
        Date now = new Date();
        this.created = now;
        this.lastModified = now;
        this.publisherId = publisherId;
        this.courseId = courseId;
        this.tocItemId = tocItemId;
        this.tocItemEntityId = tocItemEntityId;
        this.cleanupType = cleanupType;
        this.status = CleanupStatus.Created;
    }

    @Override
    public String toString() {
        return "CleanupJob{" +
                "id='" + id + '\'' +
                ", created=" + created +
                ", lastModified=" + lastModified +
                ", publisherId=" + publisherId +
                ", courseId='" + courseId + '\'' +
                ", tocItemId='" + tocItemId + '\'' +
                ", tocItemEntityId='" + tocItemEntityId + '\'' +
                ", cleanupType=" + cleanupType +
                ", status=" + status.name() +
                '}';
    }

    public Date getCreated() {
        return created;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public Date getLastModified() {
        return lastModified;
    }

    public void setLastModified(Date lastModified) {
        this.lastModified = lastModified;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public int getPublisherId() {
        return publisherId;
    }

    public void setPublisherId(int publisherId) {
        this.publisherId = publisherId;
    }

    public String getTocItemId() {
        return tocItemId;
    }

    public void setTocItemId(String tocItemId) {
        this.tocItemId = tocItemId;
    }

    public String getTocItemEntityId() {
        return tocItemEntityId;
    }

    public void setTocItemEntityId(String tocItemEntityId) {
        this.tocItemEntityId = tocItemEntityId;
    }

    public CleanupType getCleanupType() {
        return cleanupType;
    }

    public void setCleanupType(CleanupType cleanupType) {
        this.cleanupType = cleanupType;
    }

    public CleanupStatus getStatus() {
        return status;
    }

    public void setStatus(CleanupStatus status) {
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
