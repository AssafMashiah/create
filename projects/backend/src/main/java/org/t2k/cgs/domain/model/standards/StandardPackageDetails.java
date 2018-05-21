package org.t2k.cgs.domain.model.standards;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 10:51 AM
 */
public class StandardPackageDetails {

    private String name;
    private String description;
    private String subjectArea;
    private String country;
    private String state;
    private String version;
    private String created;
    private String rootId;
    private boolean isLatest;
    private String purpose;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSubjectArea() {
        return subjectArea;
    }

    public void setSubjectArea(String subjectArea) {
        this.subjectArea = subjectArea;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getCreated() {
        return created;
    }

    public void setCreated(String created) {
        this.created = created;
    }

    public String getRootId() {
        return rootId;
    }

    public void setRootId(String rootId) {
        this.rootId = rootId;
    }

    public boolean isLatest() {
        return isLatest;
    }

    public void setLatest(boolean latest) {
        isLatest = latest;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getPurpose() {
        return purpose;
    }

    @Override
    public String toString() {
        return String.format("name = '%s', subjectArea = '%s', version = '%s', description = '%s', country = '%s', purpose = '%s', created = '%s'", name, subjectArea, version, description, country, purpose, created);
    }
}