package org.t2k.cgs.model.tocItem;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import org.apache.log4j.Logger;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.model.ContentItemImpl;
import org.t2k.cgs.model.course.CourseCGSObject;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 24/10/12
 * Time: 13:39
 */
public class TocItemCGSObject extends ContentItemImpl {


    private static Logger logger = Logger.getLogger(TocItemCGSObject.class);

    public static final String LEARNING_OBJECTS_FIELD = "learningObjects";
    public static final String SEQUENCES_OBJECTS_FIELD = "sequences";
    public static final String RESOURCES = "resources";
    public static final String CUSTOM_FIELDS = "customFields";
    public static final String IS_HIDDEN = "isHidden";
    public static final String EBOOKS_IDS = "eBooksIds";

    public static final String CGS_LESSON_LEARNING_OBJECTS_FIELD = CGS_CONTENT + "." + LEARNING_OBJECTS_FIELD;
    public static final String CGS_LESSON_RESOURCES_FIELD = CGS_CONTENT + "." + RESOURCES;
    public static final String CGS_ASSESSMENT_SEQUENCES_FIELD = CGS_CONTENT + "." + SEQUENCES_OBJECTS_FIELD;

    public static final String CGS_COURSE_ID = "courseId";
    public static final String CGS_PUBLISHER_ID = "publisherId";

    public static final String CGS_DATA_COURSE_ID = CGS_DATA + "." + CGS_COURSE_ID;
    public static final String CGS_DATA_PUBLISHER_ID = CGS_DATA + "." + CGS_PUBLISHER_ID;
    public static final String CGS_CONTENT_COURSE_ID = CGS_CONTENT + "." + CGS_COURSE_ID;
    public static final String CGS_IS_HIDDEN =  CGS_CONTENT + "." + IS_HIDDEN;
    public static final String CGS_EBOOKS_IDS = CGS_CONTENT + "." + EBOOKS_IDS;
    public static final String CGS_PLACEMENT = CGS_CONTENT + "." + "placement";

    public static final String TYPE = "type";
    public static final String CID = "cid";
    public static final String PUBLISHER = "publisher";
    public static final String PUBLISHER_ID = "publisherId";
    public static final String COURSE_ID = "courseId";
    public static final String VERSION = "version";
    public static final String FORMAT = "format" ;


    private String courseId;
    private int publisherId;
    private EntityType entityType;

    public TocItemCGSObject(DBObject dbObject) {
        super(dbObject,true);
        this.entityType = EntityType.forName(getContentData().get(TYPE).toString());
    }

    public TocItemCGSObject(String tocItemJson, int publisherId, String courseId, EntityType entityType) {
        super((DBObject) JSON.parse(tocItemJson),false);
        this.courseId = courseId;
        this.publisherId = publisherId;
        convertToDbObject();
        this.entityType = entityType;
    }

    public TocItemCGSObject(CourseCGSObject course, EntityType entityType) {
        super((DBObject) JSON.parse("{}"),false);
        this.setContentId(((DBObject) (((BasicDBList) course.getToc().get(TOC_ITEM_REFS)).get(0))).get("cid").toString());
        this.createNewHeader();
        getContentData().put(TYPE, entityType.getName());
        getContentData().put(SCHEMA, course.getSchema());
        getContentData().put("pedagogicalLessonType", "Custom");
        getContentData().put("contentLocales", course.getContentLocales());
        getContentData().put("standards", new BasicDBList());
        getContentData().put("standardPackages", new BasicDBList());
        setTitle("New Lesson");
        this.courseId = course.getEntityId();
        this.publisherId = course.getPublisherId();
        this.entityType = entityType;
        convertToDbObject();
    }

    @Override
    public String getContentVersionNumber() {
        return "NA";
    }

    @Override
    public EntityType getEntityType() {
        return this.entityType;
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

    public void setLearningObjects(DBObject learningObjects) {
        getContentData().put(LEARNING_OBJECTS_FIELD, learningObjects);
    }

    public void setResources(DBObject tocItemResources) {
        getContentData().put(RESOURCES, tocItemResources);
    }

    public void setCustomFields(DBObject tocItemCustomFields) {
        getContentData().put(CUSTOM_FIELDS, tocItemCustomFields);
    }

    public void setSequences(DBObject tocItemResources) {
        getContentData().put(SEQUENCES_OBJECTS_FIELD, tocItemResources);
    }

    protected void convertToCgsObject() {
        if (getCGSData() != null) {
            setCourseId((String) getCGSData().get(CGS_COURSE_ID));
            setPublisherId((Integer) getCGSData().get(CGS_PUBLISHER_ID));
        } else {
            logger.warn("convertToCgsObject :getCGSData is NULL");
        }
    }

    @Override
    protected void convertToDbObject() {
        getCGSData().put(CGS_COURSE_ID, getCourseId());
        getCGSData().put(CGS_PUBLISHER_ID, getPublisherId());
    }

    /**
     * @return
     */
    public List<DBObject> getSequences() {
        List<DBObject> retList = new ArrayList<>();

        if (getEntityType().equals(EntityType.LESSON)) {
            BasicDBList los = (BasicDBList) getContentData().get(LEARNING_OBJECTS_FIELD);
            if (los != null) {
                for (Object loDbObject : los) {
                    BasicDBList sequencesDbObjects = (BasicDBList) ((DBObject) loDbObject).get(SEQUENCES_OBJECTS_FIELD);
                    if (sequencesDbObjects != null && !sequencesDbObjects.isEmpty()) {
                        for (Object seqObj : sequencesDbObjects) {
                            retList.add((DBObject) seqObj);
                        }
                    }
                }
            }
        } else if (getEntityType().equals(EntityType.ASSESSMENT)) {
            BasicDBList sequencesDbObjects = (BasicDBList) getContentData().get(SEQUENCES_OBJECTS_FIELD);
            if (sequencesDbObjects != null && !sequencesDbObjects.isEmpty()) {
                for (Object seqObj : sequencesDbObjects) {
                    retList.add((DBObject) seqObj);
                }
            }
        }
        return retList;
    }

    public List<DBObject> getDifferentiationSequences() {
        List<DBObject> retList = new ArrayList<>();

        if (getEntityType().equals(EntityType.LESSON)) {
            BasicDBList los = (BasicDBList) getContentData().get(LEARNING_OBJECTS_FIELD);
            if (los != null) {
                for (Object loDbObject : los) {
                    BasicDBList sequencesDbObjects = (BasicDBList) ((DBObject) loDbObject).get(SEQUENCES_OBJECTS_FIELD);
                    if (sequencesDbObjects != null && !sequencesDbObjects.isEmpty()) {
                        for (Object seqObj : sequencesDbObjects) {
                            retList.add((DBObject) seqObj);
                        }
                    }
                }
            }
        } else if (getEntityType().equals(EntityType.ASSESSMENT)) {
            BasicDBList sequencesDbObjects = (BasicDBList) getContentData().get(SEQUENCES_OBJECTS_FIELD);
            if (sequencesDbObjects != null && !sequencesDbObjects.isEmpty()) {
                for (Object seqObj : sequencesDbObjects) {
                    retList.add((DBObject) seqObj);
                }
            }
        }
        return retList;
    }

    /**
     * Checks if the toc item contains learning objects (toc items references). It checks recursively in its children,
     * if it has other sub-levels
     *
     * @return true if it contains, false otherwise
     */
    public static boolean tocItemContainsLearningObjects(DBObject tocItem) {
        List<DBObject> tocItemRefs = (List<DBObject>) tocItem.get(TOC_ITEM_REFS);
        if (tocItemRefs != null && tocItemRefs.size() > 0) {
            return true;
        }
        List<DBObject> subTocItems = (List<DBObject>) tocItem.get(TOC_ITEMS);
        if (subTocItems != null && subTocItems.size() > 0) {
            for (DBObject subTocItem : subTocItems) {
                if (tocItemContainsLearningObjects(subTocItem)) {
                    return true;
                }
            }
        }
        return false;
    }
}