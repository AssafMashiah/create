package org.t2k.cgs.domain.usecases;

import java.io.File;

/**
 * Created by Elad.Avidan on 22/09/2014.
 */
public class ImportCourseData {

    private String validateJobId;
    private String importJobId;
    private String packageJobId;
    private String packId;
    private String packIdWithVersion;
    private int publisherId;
    private String courseId;
    private File courseFolder;
    private String courseCid;

    public ImportCourseData() {}

    public String getValidateJobId() {
        return validateJobId;
    }

    public void setValidateJobId(String validateJobId) {
        this.validateJobId = validateJobId;
    }

    public String getImportJobId() {
        return importJobId;
    }

    public void setImportJobId(String importJobId) {
        this.importJobId = importJobId;
    }

    public String getPackageJobId() {
        return packageJobId;
    }

    public void setPackageJobId(String packageJobId) {
        this.packageJobId = packageJobId;
    }

    public String getPackId() {
        return packId;
    }

    public void setPackId(String packId) {
        this.packId = packId;
    }

    public int getPublisherId() {
        return publisherId;
    }

    public void setPublisherId(int publisherId) {
        this.publisherId = publisherId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public File getCourseFolder() {
        return courseFolder;
    }

    public void setCourseFolder(File courseFolder) {
        this.courseFolder = courseFolder;
    }

    public String getPackIdWithVersion() {
        return packIdWithVersion;
    }

    public void setPackIdWithVersion(String packIdWithVersion) {
        this.packIdWithVersion = packIdWithVersion;
    }

    public void setCourseCid(String courseCid) {
        this.courseCid = courseCid;
    }

    public String getCourseCid() {
        return courseCid;
    }
}