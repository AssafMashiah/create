package org.t2k.cgs.exportImport;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.apache.commons.lang.StringUtils;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.t2k.utils.JsonDateSerializer;

import java.io.File;
import java.io.Serializable;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * Created by IntelliJ IDEA.
 * User: efrat.gur
 * Date: 24/09/13
 * Time: 12:44
 */

@Document
@JsonAutoDetect
public class ExportImportPackage implements Serializable {

    @Id
    private String packId;
    private String courseId;
    private String courseCId;
    private String courseTitle;
    private int publisherId;
    private String publisherName;
    private String jobId;
    private String userName;
    private String validationId;
    private Date packStartDate;
    private String packageOutputLocation;
    private String cmsPublisherHomeLocation;
    private String eBooksBaseFolderLocation;
    private String cmsEBooksHomeLocation;
    private ExportImportLocalContext localResourcesLocation;
    private String relativeResourcesLocation;
    private String zipFileFullPathName;
    private String zipFileRelativeName;
    private String hostName;
    private List<String> errors = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();
    private File zipFile;

    public enum Type {
        EXPORT,
        IMPORT,
        VALIDATE;
    }

    private Type type;

    public ExportImportPackage(Type type, String courseId, int publisherId, String jobId, String username) {

        this.courseId = courseId;
        this.publisherId = publisherId;
        this.packStartDate = new Date();
        this.userName = username;
        this.jobId = jobId;
        this.type = type;
        this.packId = generateId(courseId);
        try {
            this.hostName = InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException e) {

        }
    }

    public ExportImportPackage(Type type, int publisherId, String jobId, String validationId, String username) {
        this.type = type;
        this.publisherId = publisherId;
        this.packStartDate = new Date();
        this.jobId = jobId;
        this.validationId = validationId;
        this.userName = username;
        this.packId = generateId(jobId);
        try {
            this.hostName = InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException e) {

        }
    }

    public ExportImportPackage(Type type, String jobId) {
        this.packStartDate = new Date();
        this.jobId = jobId;
        this.packId = generateId(jobId);
        this.type = type;
    }

    @JsonProperty("packageId")
    public String getPackId() {
        return packId;
    }

    public void setPackId(String packId) {
        this.packId = packId;
    }

    public void setCourseTitle(String title) {
        this.courseTitle = title;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    @JsonIgnore
    public String getCmsPublisherHomeLocation() {
        return cmsPublisherHomeLocation;
    }

    public void setCmsPublisherHomeLocation(String cmsPublisherHomeLocation) {
        this.cmsPublisherHomeLocation = cmsPublisherHomeLocation;
    }

    @JsonIgnore
    public String getEBooksBaseFolderLocation() {
        return eBooksBaseFolderLocation;
    }

    public void setEBooksBaseFolderLocation(String eBooksBaseFolderLocation) {
        this.eBooksBaseFolderLocation = eBooksBaseFolderLocation;
    }

    @JsonIgnore
    public String getCmsEBooksHomeLocation() {
        return cmsEBooksHomeLocation;
    }

    public void setCmsEBooksHomeLocation(String cmsEBooksHomeLocation) {
        this.cmsEBooksHomeLocation = cmsEBooksHomeLocation;
    }

    @JsonIgnore
    public ExportImportLocalContext getLocalResourcesLocation() {
        return localResourcesLocation;
    }

    public void setLocalResourcesLocation(ExportImportLocalContext localResourcesLocation) {
        this.localResourcesLocation = localResourcesLocation;
    }

    public String getRelativeResourcesLocation() {
        return relativeResourcesLocation;
    }

    public void setRelativeResourcesLocation(String relativeResourcesLocation) {
        this.relativeResourcesLocation = relativeResourcesLocation;
    }

    public String getZipFileFullPathName() {
        return zipFileFullPathName;
    }

    public void setZipFileFullPathName(String zipFileFullPathName) {
        this.zipFileFullPathName = zipFileFullPathName;
    }

    public String getZipFileRelativeName() {
        return zipFileRelativeName;
    }

    public void setZipFileRelativeName(String zipFileRelativeName) {
        this.zipFileRelativeName = zipFileRelativeName;
    }

    public File getZipFile() {
        return zipFile;
    }

    public void setZipFile(File zipFile) {
        this.zipFile = zipFile;
    }

    public int getPublisherId() {
        return publisherId;
    }

    public void setPublisherId(int publisherId) {
        this.publisherId = publisherId;
    }

    public String getPublisherName() {
        return publisherName;
    }

    public void setPublisherName(String publisherName) {
        this.publisherName = publisherName;
    }

    public String getValidationId() {
        return validationId;
    }

    public void setValidationId(String validationId) {
        this.validationId = validationId;
    }

    @JsonSerialize(using = JsonDateSerializer.class)
    public Date getPackStartDate() {
        return packStartDate;
    }

    public void setPackStartDate(Date packStartDate) {
        this.packStartDate = packStartDate;
    }

    public String getHostName() {
        return hostName;
    }

    public void setHostName(String hostName) {
        this.hostName = hostName;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }

    public void addError(String errorMsg) {
        getErrors().add(errorMsg);
    }

    public void addWarning(String warnMsg) {
        getWarnings().add(warnMsg);
    }

    public void addErrors(List<String> errorMsgs) {
        getErrors().addAll(errorMsgs);
    }

    public void addWarnings(List<String> warnMsgs) {
        getWarnings().addAll(warnMsgs);
    }

    public String getPackageOutputLocation() {
        return packageOutputLocation;
    }

    public void setPackageOutputLocation(String packageOutputLocation) {
        this.packageOutputLocation = packageOutputLocation;
    }

    private String generateId(String courseId) {
        String rand = StringUtils.right(UUID.randomUUID().toString(), 4);
        return String.format("%d_%s", System.currentTimeMillis(), rand);
    }

    public String getCourseCId() {
        return courseCId;
    }

    public void setCourseCId(String courseCId) {
        this.courseCId = courseCId;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    @Override
    public String toString() {
        return "CGSPackage{" +
                "packId='" + packId + '\'' +
                ", courseId='" + courseId + '\'' +
                ", courseCId='" + courseCId + '\'' +
                ", courseTitle='" + courseTitle + '\'' +
                ", publisherId=" + publisherId +
                ", publisherName=" + publisherName +
                ", jobId=" + jobId +
                ", userName='" + userName + '\'' +
                ", packStartDate=" + packStartDate +
                ", packageOutputLocation='" + packageOutputLocation + '\'' +
                ", cmsPublisherHomeLocation='" + cmsPublisherHomeLocation + '\'' +
                ", localResourcesLocation=" + localResourcesLocation +
                ", hostName='" + hostName + '\'' +
                ", errors=" + errors +
                ", warnings=" + warnings +
                '}';
    }
}