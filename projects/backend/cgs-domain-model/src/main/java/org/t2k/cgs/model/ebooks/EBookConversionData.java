package org.t2k.cgs.model.ebooks;

import org.t2k.cgs.enums.EBookConversionServiceTypes;

import java.io.File;

/**
 * @author Alex Burdusel on 2016-06-24.
 */
public class EBookConversionData extends UploadEBookData {

    private String courseName;
    private String contentLanguage;
    private boolean learningObject;

    private EBookConversionData() {
    }

    private EBookConversionData(String eBookId, String eBookDir, int publisherId, String username,
                                File uploadedEBookFile, String jobId, EBookConversionServiceTypes pdfConverter) {
        super(eBookId, eBookDir, publisherId, username, uploadedEBookFile, jobId, pdfConverter);
    }

    private static EBookConversionData newInstance(EBookConversionData.Builder builder) {
        EBookConversionData eBookData = new EBookConversionData(
                builder.eBookId,
                builder.eBookDir,
                builder.publisherId,
                builder.username,
                builder.uploadedEBookFile,
                builder.jobId,
                null);
        eBookData.courseName = builder.courseName;
        eBookData.contentLanguage = builder.contentLanguage;
        eBookData.learningObject = builder.learningObject;
        return eBookData;
    }

    public String getCourseName() {
        return courseName;
    }

    public String getContentLanguage() {
        return contentLanguage;
    }

    public boolean hasLearningObject() {
        return learningObject;
    }

    public static final class Builder {
        String eBookDir;
        int publisherId;
        String username;
        File uploadedEBookFile;
        String eBookId;
        String jobId;
        Object userObject;
        String courseName;
        String contentLanguage;
        boolean learningObject;

        public Builder setEBookDir(String eBookDir) {
            this.eBookDir = eBookDir;
            return this;
        }

        public Builder setPublisherId(int publisherId) {
            this.publisherId = publisherId;
            return this;
        }

        public Builder setUsername(String username) {
            this.username = username;
            return this;
        }

        public Builder setUploadedEBookFile(File uploadedEBookFile) {
            this.uploadedEBookFile = uploadedEBookFile;
            return this;
        }

        public Builder seteBookId(String eBookId) {
            this.eBookId = eBookId;
            return this;
        }

        public Builder setJobId(String jobId) {
            this.jobId = jobId;
            return this;
        }

        public Builder setUserObject(Object userObject) {
            this.userObject = userObject;
            return this;
        }

        public Builder setCourseName(String courseName) {
            this.courseName = courseName;
            return this;
        }

        public Builder setContentLanguage(String contentLanguage) {
            this.contentLanguage = contentLanguage;
            return this;
        }

        public Builder setLearningObject(boolean learningObject) {
            this.learningObject = learningObject;
            return this;
        }

        public EBookConversionData build() {
            return EBookConversionData.newInstance(this);
        }
    }

    @Override
    public String toString() {
        return "EBookConversionData{" +
                "username='" + getUsername() + '\'' +
                ", eBookDir='" + getEBookDir() + '\'' +
                ", publisherId=" + getPublisherId() +
                ", eBookId='" + getEBookId() + '\'' +
                ", jobId='" + getJobId() + '\'' +
                ", isCancelled=" + isCancelled() +
                ", courseName=" + courseName +
                ", contentLanguage=" + contentLanguage +
                ", learningObject=" + learningObject +
                '}';
    }
}