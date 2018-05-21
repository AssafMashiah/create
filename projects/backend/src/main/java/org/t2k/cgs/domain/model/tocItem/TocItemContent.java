package org.t2k.cgs.domain.model.tocItem;

import org.t2k.cgs.domain.model.sequence.Sequence;

import javax.validation.Valid;
import java.io.Serializable;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 18/04/13
 * Time: 10:29
 */
public class TocItemContent implements Serializable {

    private String courseId;
    private int publisherId;
    private String tocItemCid;
    private String tocItemJson;
    @Valid
    private List<Sequence> sequences;

    public TocItemContent() {
    }

    public TocItemContent(String courseId, int publisherId, String tocItemCId, String tocItemJson, List<Sequence> sequences) {
        this.courseId = courseId;
        this.publisherId = publisherId;
        this.tocItemCid = tocItemCId;
        this.tocItemJson = tocItemJson;
        this.sequences = sequences;
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

    public String getTocItemCid() {
        return tocItemCid;
    }

    public void setTocItemCid(String tocItemCid) {
        this.tocItemCid = tocItemCid;
    }

    public String getTocItemJson() {
        return tocItemJson;
    }

    public void setTocItemJson(String tocItemJson) {
        this.tocItemJson = tocItemJson;
    }

    public List<Sequence> getSequences() {
        return sequences;
    }

    public void setSequences(List<Sequence> sequences) {
        this.sequences = sequences;
    }

    /**
     * Returns a brief description of this TocItemContents. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * TocItemContents{"courseId": "asdqwe123asd", "publisherId": 1, "tocItemCid": "qweqweasd123vd", "tocItemJson": {...}, "sequences": [...]}
     */
    @Override
    public String toString() {
        return "TocItemContents{" +
                "\"courseId\": \"" + courseId + '\"' +
                ", \"publisherId\": " + publisherId +
                ", \"tocItemCid\": \"" + tocItemCid + '\"' +
                ", \"tocItemJson\": " + tocItemJson +
                ", \"sequences\": " + sequences +
                '}';
    }

}