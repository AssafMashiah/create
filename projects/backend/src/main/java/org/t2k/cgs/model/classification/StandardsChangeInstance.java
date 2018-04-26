package org.t2k.cgs.model.classification;

import java.util.LinkedList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 5/5/13
 * Time: 9:26 AM
 */
public class StandardsChangeInstance {

    private String tocItemCid;
    private String tocItemName;
    private String sequenceCid;
    private String sequenceName;
    private String taskCid;
    private String taskName;
    private String tocId;
    private String courseId;
    private List<String> standardIds;
    private String courseName;
    private String tocName;
    private String loName;
    private String loId;

    public StandardsChangeInstance() {
        this.standardIds = new LinkedList<String>();
        this.tocItemCid = null;
        this.tocItemName = null;
        this.sequenceCid = null;
        this.sequenceName = null;
        this.taskCid = null;
        this.taskName = null;
    }

    public String getTocItemCid() {
        return tocItemCid;
    }

    public void setTocItemCid(String tocItemCid) {
        this.tocItemCid = tocItemCid;
    }

    public String getTocItemName() {
        return tocItemName;
    }

    public void setTocItemName(String tocItemName) {
        this.tocItemName = tocItemName;
    }

    public String getSequenceCid() {
        return sequenceCid;
    }

    public void setSequenceCid(String sequenceCid) {
        this.sequenceCid = sequenceCid;
    }

    public String getSequenceName() {
        return sequenceName;
    }

    public void setSequenceName(String sequenceName) {
        this.sequenceName = sequenceName;
    }

    public List<String> getStandardIds() {
        return standardIds;
    }

    public void addStandard(String pedagogicalId) {
        standardIds.add(pedagogicalId);
    }

    public String getTaskCid() {
        return taskCid;
    }

    public void setTaskCid(String taskCid) {
        this.taskCid = taskCid;
    }

    public String getTaskName() {
        return taskName;
    }

    public void setTaskName(String taskName) {
        this.taskName = taskName;
    }

    public String getTocId() {
        return tocId;
    }

    public void setTocId(String tocId) {
        this.tocId = tocId;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setTocName(String tocName) {
        this.tocName = tocName;
    }

    public String getTocName() {
        return tocName;
    }

    public void setLoName(String loName) {
        this.loName = loName;
    }

    public String getLoName() {
        return loName;
    }

    public void setLoId(String loId) {
        this.loId = loId;
    }

    public String getLoId() {
        return loId;
    }
}
