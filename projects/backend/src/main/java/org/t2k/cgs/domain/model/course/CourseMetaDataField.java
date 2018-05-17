package org.t2k.cgs.domain.model.course;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.mongodb.DBObject;
import org.t2k.cgs.domain.model.ContentItemBase;
import org.t2k.cgs.domain.model.ContentItemBase;

import java.util.List;

/**
 * //FIXME: 7/26/16 CourseMetaDataField needs to be synchronized with the fields inside schema.js
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 08/07/14
 * Time: 10:59
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseMetaDataField {
    private String cid;

    private String type;

    private String name;

    private String value;

    private List<Object> values;
    private List<Object> selectedValue;

    private Object minValue;
    private Object maxValue;

    private Object timestamp;
    private Object format;
    private Object includeSeconds;

    public static CourseMetaDataField of(DBObject dbObject) {
        CourseMetaDataField courseMetaDataField = new CourseMetaDataField();
        courseMetaDataField.cid = (String) dbObject.get(ContentItemBase.CID);
        courseMetaDataField.type = (String) dbObject.get(ContentItemBase.TYPE);
        courseMetaDataField.name = (String) dbObject.get("name");
        courseMetaDataField.value = (String) dbObject.get("value");
        courseMetaDataField.values = (List<Object>) dbObject.get("values");
        courseMetaDataField.selectedValue = (List<Object>) dbObject.get("selectedValue");
        return courseMetaDataField;
    }

    public String getCid() {
        return cid;
    }

    public void setCid(String cid) {
        this.cid = cid;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    @Override
    public String toString() {
        return "CourseMetaDataField{" +
                "cid='" + cid + '\'' +
                ", type='" + type + '\'' +
                ", name='" + name + '\'' +
                ", value='" + value + '\'' +
                ", values='" + values + '\'' +
                ", selectedValue='" + selectedValue + '\'' +
                '}';
    }

    public List<Object> getValues() {
        return values;
    }

    public List<Object> getSelectedValue() {
        return selectedValue;
    }
}
