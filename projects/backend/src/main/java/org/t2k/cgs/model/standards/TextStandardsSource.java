package org.t2k.cgs.model.standards;

import org.springframework.dao.DataAccessException;
import org.t2k.cgs.model.standards.StandardPackageDetails;

public class TextStandardsSource {

    private String content;
    private String subjectArea;
    private String standardName;
    private String version;
    private String purpose;

    public TextStandardsSource(StandardPackageDetails standardPackageDetails, String content) {
        this.content = content;
        this.standardName = standardPackageDetails.getName();
        this.subjectArea = standardPackageDetails.getSubjectArea();
        this.version = standardPackageDetails.getVersion();
        this.purpose = standardPackageDetails.getPurpose();
    }

    public String getStandardName() {
        return this.standardName;
    }

    public void setStandardName(String standardName) {
        this.standardName = standardName;
    }

    public String getSubjectArea() {
        return this.subjectArea;
    }

    public void setSubjectArea(String subjectArea) {
        this.subjectArea = subjectArea;
    }

    public String getVersion() {
        return this.version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getPurpose() {
        return purpose;
    }

    public String getContent() throws DataAccessException {
        return this.content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}