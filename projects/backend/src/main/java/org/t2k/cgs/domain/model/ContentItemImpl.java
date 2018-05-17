package org.t2k.cgs.domain.model;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import org.apache.log4j.Logger;
import org.t2k.cgs.persistence.dao.EntityType;

import java.util.Collections;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 22/10/12
 * Time: 14:53
 */
public abstract class ContentItemImpl implements ContentItem {

    private static Logger logger = Logger.getLogger(ContentItemImpl.class);

    private DBObject dbObject;

    public ContentItemImpl(DBObject dbObject, boolean isFullDataBaseObject) {
        if (isFullDataBaseObject) {
            this.dbObject = dbObject;
            convertToCgsObject();
        } else {
            this.dbObject = new BasicDBObject();
            this.dbObject.put(CGS_DATA, new BasicDBObject());
            this.dbObject.put(CGS_CONTENT, dbObject);
        }
    }

    @Override
    public EntityType getEntityType() {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public String getContentVersionNumber() {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public String getEntityId() {
        Object id = this.dbObject.get("_id");
        return id != null ? id.toString() : null;
    }

    public void setEntityId(String id) {
        this.dbObject.put("_id", id);
    }

    @Override
    public String getContentId() {
        DBObject cgsObj = getContentData();
        Object intOb = cgsObj.get(CID);
        return (String) intOb;
    }

    @Override
    public void setContentId(String cid) {
        getContentData().put(CID, cid);
    }

    public DBObject getCgsHeaderData() {
        DBObject o = (DBObject) dbObject.get(CGS_CONTENT);
        return (DBObject) o.get(HEADER);
    }

    @Override
    public Date getLastModified() {
        Date result = null;
        Object dateObj = getCgsHeaderData().get(LAST_MODIFIED);

        if (dateObj == null) {
            result = null;
        } else if (dateObj instanceof Date) {
            result = (Date) getCgsHeaderData().get(LAST_MODIFIED);
            if (result.toString().contains("1970")) {
                result = null;
            }
        }

        return result;
    }

    public boolean isNew() {
        return getLastModified() == null;
    }

    @Override
    public void setLastModified(Date lastModified) {
        DBObject cgsObject = getCgsHeaderData();
        cgsObject.put(LAST_MODIFIED, lastModified);
    }

    @Override
    public void setPublishedToProd(Date date) {
        DBObject cgsObject = getCgsHeaderData();
        cgsObject.put(PUBLISHED_TO_PROD, date);
    }

    @Override
    public void setTocIdsPublishedToProd(List<String> tocIds) {
        DBObject cgsObject = getCgsHeaderData();
        cgsObject.put(TOC_IDS_PUBLISHED_TO_PROD, tocIds);
    }

    public Date getPublishedToProd() {
        DBObject cgsObject = getCgsHeaderData();
        Object published = cgsObject.get(PUBLISHED_TO_PROD);
        return published == null ? null : (Date) published;
    }

    @Override
    public void setEditioned(Date editionedDate) {
        DBObject cgsObject = getCgsHeaderData();
        cgsObject.put(EDITIONED, editionedDate);
    }

    public void removeHeaderEntry(String entry) {
        DBObject headerObj = getCgsHeaderData();
        headerObj.removeField(entry);
    }

    @Override
    public String getTitle() {
        return (String) getContentData().get(TITLE);
    }

    public void setTitle(String newTitle) {
        getContentData().put(TITLE, newTitle);
    }

    @Override
    public DBObject getContentData() {
        return (DBObject) dbObject.get(CGS_CONTENT);
    }

    @Override
    public DBObject getCGSData() {
        return (DBObject) dbObject.get(CGS_DATA);
    }

    @Override
    public DBObject getData() {
        return dbObject;
    }

    @Override
    public String serializeContentData() {
        return JSON.serialize(getContentData());
    }

    @Override
    public String serializeContentHeader() {
        return JSON.serialize(getCgsHeaderData());
    }

    public String getSchema() {
        return (String) getContentData().get(SCHEMA);
    }

    public void createNewHeader() {
        DBObject lastModifiedDBObject = new BasicDBObject();
        lastModifiedDBObject.put(LAST_MODIFIED, new Date());
        getContentData().put(HEADER, lastModifiedDBObject);
    }

    /***
     * Returning a list of all tocs leading from the course's root node to a toc containing @tocItemId
     * The list order is stepping down the toc tree: Toc1->Toc1.2->Toc1.2.1
     *
     * @param tocItemId
     * @return
     */
    public List<DBObject> getTocsLeadingToTocItem(String tocItemId) {
        List<DBObject> result = new LinkedList<>();
        DBObject tocs = null;
        if (getContentData().containsField(TOCS)) {
            tocs = (DBObject) getContentData().get(TOCS);
        } else {
            return result;
        }

        findPathHelper(result, tocs, tocItemId);
        Collections.reverse(result);//reversing the list order so it will return the highest node first and lowest - last
        return result;
    }

    private boolean findPathHelper(List<DBObject> result, DBObject root, String tocItemId) {
        if (tocContainsTocItem(root, tocItemId)) {
            result.add(root);
            return true;
        }

        BasicDBList tocs = null;
        if (root.containsField(TOC_ITEMS))
            tocs = (BasicDBList) root.get(TOC_ITEMS);
        else
            return false;

        for (int i = 0; i < tocs.size(); i++) {
            DBObject toc = (DBObject) tocs.get(i);
            if (findPathHelper(result, toc, tocItemId)) {
                result.add(root);
                return true;
            }
        }

        return false;
    }

    private boolean tocContainsTocItem(DBObject root, String tocItemId) {
        if (!root.containsField(TOC_ITEM_REFS))
            return false;
        BasicDBList tocItemRefs = (BasicDBList) root.get(TOC_ITEM_REFS);
        for (int i = 0; i < tocItemRefs.size(); i++) {
            DBObject ref = (DBObject) tocItemRefs.get(i);
            logger.debug(" ref.get(CID).toString() = " + ref.get(CID).toString() + ", tocItemId = " + tocItemId);
            if (ref.get(CID).toString().equals(tocItemId))
                return true;
        }
        return false;
    }

    protected abstract void convertToCgsObject();

    protected abstract void convertToDbObject();
}
