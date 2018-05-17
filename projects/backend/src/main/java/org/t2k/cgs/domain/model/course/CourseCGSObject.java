package org.t2k.cgs.domain.model.course;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import org.apache.log4j.Logger;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.domain.model.ContentItemImpl;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 24/10/12
 * Time: 13:39
 * <p/>
 * Note: Deprecated as of 26.04.2016 - do not use this class in new implementations. Use Course object instead - Alex Burdusel
 */
@Deprecated
public class CourseCGSObject extends ContentItemImpl {

    private static Logger logger = Logger.getLogger(CourseCGSObject.class);

    private static final String CGS_PUBLISHER_ID = "publisherId";
    private static final String CGS_COURSE_VERSION = "version";
    private static final String CGS_COURSE_ID = "courseId";
    public static final String CGS_COURSE_RESOURCES = "resources";
    public static final String CGS_COURSE_TOC = "toc";
    public static final String CGS_COURSE_LOCALES = "contentLocales";
    public static final String CGS_HEADER_EDITIONED_KEY = "editioned";
    public static final String COVER_REF_ID = "coverRefId";
    public static final String RES_ID = "resId";
    public static final String HREF = "href";
    public static final String STANDARD_PACKAGES = "standardPackages";
    public static final String PACKAGE_NAME = "name";
    public static final String PACKAGE_SUBJECT_AREA = "subjectArea";



    public static final String CGS_COURSE_COVER_REF_ID = CGS_CONTENT + "." + COVER_REF_ID;
    public static final String CGS_COURSE_TOC_FIELD = CGS_CONTENT + "." + CGS_COURSE_TOC;
    public static final String CGS_DATA_PUBLISHER_ID = CGS_DATA + "." + CGS_PUBLISHER_ID;
    public static final String CGS_CONTENT_DATA_COURSE_ID = CGS_CONTENT + "." + CGS_COURSE_ID;
    public static final String CGS_CONTENT_DATA_VERSION = CGS_CONTENT + "." + CGS_COURSE_VERSION;
    public static final String CGS_CONTENT_DATA_RESOURCES = CGS_CONTENT + "." + CGS_COURSE_RESOURCES;
    public static final String CGS_CONTENT_DATA_LOCALES = CGS_CONTENT + "." + CGS_COURSE_LOCALES;
    public static final String CGS_AUTHOR = "author";
    public static final String CGS_CONTENT_DATA_AUTHOR = CGS_CONTENT + "." + CGS_AUTHOR;
    public static final String CGS_CONTENT_DATA_PACKAGE_NAME = CGS_CONTENT + "." + STANDARD_PACKAGES + "." + PACKAGE_NAME;
    public static final String CGS_CONTENT_DATA_PACKAGE_SUBJECT_AREA = CGS_CONTENT + "." + STANDARD_PACKAGES + "." + PACKAGE_SUBJECT_AREA;


    private int publisherId;

    public CourseCGSObject(DBObject dbObject) {
        super(dbObject, true);
    }

    public CourseCGSObject(String courseJson, int publisherId) {
        super((DBObject) JSON.parse(courseJson), false);
        this.publisherId = publisherId;
        convertToDbObject();
    }

    public CourseCGSObject(DBObject dbObject, int publisherId) {
        super(dbObject, false);
        this.publisherId = publisherId;
        convertToDbObject();
    }

    public String getCgsCourseVersion() {
        return (String) getContentData().get(CGS_COURSE_VERSION);
    }

    public String setCgsCourseVersion(String courseVersion) {
        return (String) getContentData().put(CGS_COURSE_VERSION, courseVersion);
    }

    public void removeHeaderEntry(String headerEntry) {
        getCgsHeaderData().removeField(headerEntry);
    }

    protected void convertToCgsObject() {
        if (getCGSData() != null) {
            setPublisherId((Integer) getCGSData().get(CGS_PUBLISHER_ID));
//            setEdition((Integer) getCGSData().get(CGS_COURSE_EDITION));
        }
    }

    public List<String> getContentLocales() {
        List<String> l = new ArrayList<>();
        BasicDBList locales = (BasicDBList) getContentData().get(CGS_COURSE_LOCALES);
        for (Object obj : locales) {
            l.add(obj.toString());
        }
        return l;
    }

    public String getCourseTitle() {
        return (String) getContentData().get("title");
    }

    public DBObject getCourseCustomizationPack() {
        return (DBObject) getContentData().get("customizationPack");
    }

    @Override
    public String getContentVersionNumber() {
        return (String) getContentData().get(CGS_COURSE_VERSION);
    }

    @Override
    protected void convertToDbObject() {
        getCGSData().put(CGS_PUBLISHER_ID, getPublisherId());
        setEntityId(getCourseId());
    }

    public DBObject getToc() {
        return (DBObject) getContentData().get(CGS_COURSE_TOC);
    }

    protected String getCourseId() {
        return (String) getContentData().get(CGS_COURSE_ID);
    }

    public void setPublisherId(int publisherId) {
        this.publisherId = publisherId;
    }

    public int getPublisherId() {
        return publisherId;
    }

    @Override
    public EntityType getEntityType() {
        return EntityType.COURSE;
    }

    public void setCourseId(String courseId) {
        getContentData().put(CGS_COURSE_ID, courseId);
    }
}