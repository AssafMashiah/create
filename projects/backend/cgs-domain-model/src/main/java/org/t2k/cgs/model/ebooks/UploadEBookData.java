package org.t2k.cgs.model.ebooks;

import org.t2k.cgs.enums.EBookConversionServiceTypes;

import java.io.File;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 18/10/2015
 * Time: 16:05
 */
public class UploadEBookData implements EBookManagerData {

    private EBookConversionServiceTypes selectedPublisherPdfConverter;
    private String eBookDir;
    private int publisherId;
    private String username;
    private File uploadedEBookFile;
    private String eBookId;
    private String jobId;
    private boolean isCancelled;
    private Object userObject;

    public UploadEBookData() {
    }

    public UploadEBookData(String eBookId, String eBookDir, int publisherId, String username,
                           File uploadedEBookFile, String jobId, EBookConversionServiceTypes pdfConverter) {
        this.eBookId = eBookId;
        this.eBookDir = eBookDir;
        this.publisherId = publisherId;
        this.username = username;
        this.uploadedEBookFile = uploadedEBookFile;
        this.jobId = jobId;
        this.selectedPublisherPdfConverter = pdfConverter;
    }

    public static UploadEBookData newInstance(Builder builder) {
        UploadEBookData uploadEBookData = new UploadEBookData();
        uploadEBookData.eBookId = builder.eBookId;
        uploadEBookData.eBookDir = builder.eBookDir;
        uploadEBookData.publisherId = builder.publisherId;
        uploadEBookData.username = builder.username;
        uploadEBookData.uploadedEBookFile = builder.uploadedEBookFile;
        uploadEBookData.jobId = builder.jobId;
        uploadEBookData.selectedPublisherPdfConverter = builder.selectedPublisherPdfConverter;
        return uploadEBookData;
    }

    public static final class Builder {
        private EBookConversionServiceTypes selectedPublisherPdfConverter;
        private String eBookDir;
        private int publisherId;
        private String username;
        private File uploadedEBookFile;
        private String eBookId;
        private String jobId;

        public Builder setPDFConverter(EBookConversionServiceTypes pdfConverter) {
            this.selectedPublisherPdfConverter = pdfConverter;
            return this;
        }

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

        public Builder setEBookId(String eBookId) {
            this.eBookId = eBookId;
            return this;
        }

        public Builder setJobId(String jobId) {
            this.jobId = jobId;
            return this;
        }

        public UploadEBookData build() {
            return UploadEBookData.newInstance(this);
        }
    }

    public File getUploadedEBookFile() {
        return uploadedEBookFile;
    }

    public Object getUserObject() {
        return this.userObject;
    }

    public void setUserObject(Object userObject) {
        this.userObject = userObject;
    }

    @Override
    public String getEBookId() {
        return eBookId;
    }

    @Override
    public String getEBookDir() {
        return eBookDir;
    }

    @Override
    public int getPublisherId() {
        return publisherId;
    }

    public String getUsername() {
        return username;
    }

    @Override
    public String getJobId() {
        return jobId;
    }

    @Override
    public synchronized boolean isCancelled() {
        return isCancelled;
    }

    public synchronized void setCancelled() {
        this.isCancelled = true;
    }

    public EBookConversionServiceTypes getSelectedPdfConverter() {
        return selectedPublisherPdfConverter;
    }

    @Override
    public String toString() {
        return "UploadEBookData{" +
                "username='" + username + '\'' +
                ", eBookDir='" + eBookDir + '\'' +
                ", publisherId=" + publisherId +
                ", eBookId='" + eBookId + '\'' +
                ", jobId='" + jobId + '\'' +
                ", isCancelled=" + isCancelled +
                '}';
    }

    public EBookConversionServiceTypes getSelectedPublisherPdfConverter() {
        return selectedPublisherPdfConverter;
    }
}