package org.t2k.cgs.domain.model.job;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Set;

/**
 * Object used by a {@link Job} for its properties.
 * This class is a mutable POJO
 *
 * @author Alex Burdusel on 2016-09-06.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobProperties {

    /**
     * publisher for which the job was started
     */
    private int publisherId;
    /**
     * Username that started the job
     */
    private String username;
    /**
     * Id of the course for which the job was started
     */
    private String courseId;

    @JsonProperty
    private String eBookId;
    @JsonProperty
    private String eBooksDir;
    private Set<String> updatedCourses;
    private Set<String> failedToUpdateCourses;
    private String oldEBookId;
    private String newEBookId;
    private String removedEBookId;

    /**
     * Used on export/import process to check if a course passed the validation
     */
    @JsonProperty
    private Boolean passValidation;
    private String exportedCourseFileName;
    private String exportedCourseResourceFiles;

    /**
     * publisher for which the job was started
     */
    public int getPublisherId() {
        return publisherId;
    }

    public void setPublisherId(int publisherId) {
        this.publisherId = publisherId;
    }

    /**
     * Username that started the job
     */
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Id of the course for which the job was started
     */
    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    @JsonIgnore
    public String getEBookId() {
        return eBookId;
    }

    @JsonIgnore
    public void setEBookId(String eBookId) {
        this.eBookId = eBookId;
    }

    @JsonIgnore
    public String getEBooksDir() {
        return eBooksDir;
    }

    @JsonIgnore
    public void setEBooksDir(String eBooksDir) {
        this.eBooksDir = eBooksDir;
    }

    public Set<String> getUpdatedCourses() {
        return updatedCourses;
    }

    public void setUpdatedCourses(Set<String> updatedCourses) {
        this.updatedCourses = updatedCourses;
    }

    public Set<String> getFailedToUpdateCourses() {
        return failedToUpdateCourses;
    }

    public void setFailedToUpdateCourses(Set<String> failedToUpdateCourses) {
        this.failedToUpdateCourses = failedToUpdateCourses;
    }

    public String getOldEBookId() {
        return oldEBookId;
    }

    public void setOldEBookId(String oldEBookId) {
        this.oldEBookId = oldEBookId;
    }

    public String getNewEBookId() {
        return newEBookId;
    }

    public void setNewEBookId(String newEBookId) {
        this.newEBookId = newEBookId;
    }

    public String getRemovedEBookId() {
        return removedEBookId;
    }

    public void setRemovedEBookId(String removedEBookId) {
        this.removedEBookId = removedEBookId;
    }

    public String getExportedCourseFileName() {
        return exportedCourseFileName;
    }

    public void setExportedCourseFileName(String exportedCourseFileName) {
        this.exportedCourseFileName = exportedCourseFileName;
    }

    public String getExportedCourseResourceFiles() {
        return exportedCourseResourceFiles;
    }

    public void setExportedCourseResourceFiles(String exportedCourseResourceFiles) {
        this.exportedCourseResourceFiles = exportedCourseResourceFiles;
    }

    /**
     * Used on export/import process to check if a course passed the validation
     */
    @JsonIgnore
    public boolean isPassValidation() {
        return passValidation;
    }

    @JsonIgnore
    public void setPassValidation(boolean passValidation) {
        this.passValidation = passValidation;
    }
}
