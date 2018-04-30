package org.t2k.cgs.domain.model.classification;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 5/5/13
 * Time: 9:31 AM
 */
public class StandardsChange {

    private static final String UPDATE_CHANGES = "updated";
    private static final String DELETE_CHANGES = "deleted";

    private int publisherId;
    private String courseId;
    private String packageName;
    private String subjectArea;
    private String version;
    private String newVersion;
    private String oldVersion;
    private List<String> errors;
    private Map<String, List<StandardsChangeInstance>> changes;

    public StandardsChange(int publisherId, String courseId) {
        this.changes = new HashMap<String, List<StandardsChangeInstance>>();
        this.packageName = null;
        this.subjectArea = null;
        this.version = null;
        this.newVersion = null;
        this.oldVersion = null;
        this.errors = null;
        this.publisherId = publisherId;
        this.courseId = courseId;
    }

    public void addUpdateChange(StandardsChangeInstance instance) {
        if (!this.changes.containsKey(UPDATE_CHANGES)) {
            this.changes.put(UPDATE_CHANGES, new LinkedList<StandardsChangeInstance>());
        }

        this.changes.get(UPDATE_CHANGES).add(instance);
    }

    public void addDeleteChange(StandardsChangeInstance instance) {
        if (!this.changes.containsKey(DELETE_CHANGES)) {
            this.changes.put(DELETE_CHANGES, new LinkedList<StandardsChangeInstance>());
        }

        this.changes.get(DELETE_CHANGES).add(instance);
    }

    public void addErrorMessage(String message) {
        if (this.errors == null) {
            this.errors = new LinkedList<String>();
        }

        this.errors.add(message);
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public String getSubjectArea() {
        return subjectArea;
    }

    public void setSubjectArea(String subjectArea) {
        this.subjectArea = subjectArea;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public List<String> getErrors() {
        return errors;
    }

    public Map<String, List<StandardsChangeInstance>> getChanges() {
        return changes;
    }

    public String getNewVersion() {
        return newVersion;
    }

    public void setNewVersion(String newVersion) {
        this.newVersion = newVersion;
    }

    public String getOldVersion() {
        return oldVersion;
    }

    public void setOldVersion(String oldVersion) {
        this.oldVersion = oldVersion;
    }

    public int getPublisherId() {
        return publisherId;
    }

    public String getCourseId() {
        return courseId;
    }
}
