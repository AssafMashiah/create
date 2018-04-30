package org.t2k.cgs.persistence.dao;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.DBRef;
import org.apache.log4j.Logger;
import org.bson.types.ObjectId;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.BasicUpdate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.t2k.cgs.config.app.TocItemsMongoDaoConfiguration;
import org.t2k.cgs.domain.model.ContentItem;
import org.t2k.cgs.domain.model.tocItem.*;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Instances of this class are created in {@link TocItemsMongoDaoConfiguration}
 */
public class TocItemsMongoDao extends MongoDao implements TocItemDao {

    private static final Logger LOGGER = Logger.getLogger(TocItemsMongoDao.class);

    private String tocItemCollection;

    public TocItemsMongoDao(String tocItemCollection) {
        this.tocItemCollection = tocItemCollection;
    }

    protected String getTocItemCollection() {
        return tocItemCollection;
    }

    @Override
    public void save(TocItemCGSObject lesson) throws DaoException {
        try {
            Query query = new Query(Criteria.where(TocItemCGSObject.CGS_DATA_COURSE_ID).is(lesson.getCourseId()).
                    and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(lesson.getPublisherId()).
                    and(TocItemCGSObject.CGS_ID).is(lesson.getContentId()));

            DBObject data = lesson.getData();
            getMongoTemplate().upsert(query, new BasicUpdate(data), this.tocItemCollection);
        } catch (DataAccessException e) {
            throw new DaoException(e);

        }
    }

    @Override
    public void save(TocItem tocItem) {
        Query query = new Query(Criteria.where(ContentItem.CGS_ID).is(tocItem.getContentId()).
                and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(tocItem.getCgsData().getPublisherId()).
                and(TocItemCGSObject.CGS_DATA_COURSE_ID).is(tocItem.getCourseId()));
        query.fields().include("_id");
        DBObject dbObject = getMongoTemplate().findOne(query, DBObject.class, this.tocItemCollection);
        if (dbObject != null) tocItem.setId((ObjectId) dbObject.get("_id"));
        getMongoTemplate().save(tocItem, this.tocItemCollection);
    }

    public void saveTocItemDBObject(DBObject tocItem) throws DaoException {
        try {

            getMongoTemplate().insert(tocItem, this.tocItemCollection);

        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public TocItemCGSObject get(int publisherId, String tocItemCId, String courseId, Date lastModified, boolean isPropertiesOnly) throws DaoException {
        try {
            Query query = new Query(Criteria.where(ContentItem.CGS_ID).is(tocItemCId).
                    and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId).
                    and(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId));

            if (lastModified != null) {
                query.addCriteria(Criteria.where(ContentItem.CGS_LAST_MODIFIED).is(lastModified));
            }
            if (isPropertiesOnly) {
                query.fields().exclude(TocItemCGSObject.CGS_LESSON_LEARNING_OBJECTS_FIELD);
            }

            DBObject courseObj = getMongoTemplate().findOne(query, DBObject.class, this.tocItemCollection);
            return convertToCGSObject(courseObj);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    public DBRef getDBRefByCId(String courseId, int publisherId, String tocItemCId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(ContentItem.CGS_ID).is(tocItemCId).
                    and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId).
                    and(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId));

            DBObject tocItemObj = getMongoTemplate().findOne(query, DBObject.class, this.tocItemCollection);
            DBRef result = null;

            if (tocItemObj != null) {
                result = new DBRef(getMongoTemplate().getDb(), this.tocItemCollection, tocItemObj.get("_id"));
            }

            return result;
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public List<TocItemCGSObject> getHiddenLessonsWithSequences(int publisherId, String courseId) throws DaoException {
        Query query = new Query(Criteria.where(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId).
                and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId).and(TocItemCGSObject.CGS_CONTENT + ".isHidden").is(true));

        //exclude heavy unnecessary  fields
        query.fields().exclude(TocItemCGSObject.CGS_LESSON_RESOURCES_FIELD)
                .exclude(TocItemCGSObject.CGS_CONTENT + ".standards")
                .exclude(TocItemCGSObject.CGS_CONTENT + ".standardPackages");
        return readFromDb(query);
    }

    @Override
    public List<TocItemIndicationForScorm> getTocItemsWithHiddenIndication(String courseId, List<String> tocItemsIds) throws DaoException {
        Query query = new Query(Criteria.where(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId).
                and(TocItemCGSObject.CGS_ID).in(tocItemsIds));

        // include only necessary fields
        query.fields().include(TocItemCGSObject.CGS_CONTENT + ".isHidden")
                .include(TocItemCGSObject.CGS_ID)
                .include(TocItemCGSObject.CGS_TITLE);
        try {
            List<DBObject> dbObjects = getMongoTemplate().find(query, DBObject.class, this.tocItemCollection);
            return convertToTocItemHiddenIndications(dbObjects);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    private List<TocItemIndicationForScorm> convertToTocItemHiddenIndications(List<DBObject> dbObjects) {
        List<TocItemIndicationForScorm> tocItemHiddenIndications = new ArrayList<>();
        for (DBObject dbObject : dbObjects) {
            String id = ((DBObject) dbObject.get(TocItemCGSObject.CGS_CONTENT)).get(TocItemCGSObject.CID).toString();
            String title = ((DBObject) dbObject.get(TocItemCGSObject.CGS_CONTENT)).get(TocItemCGSObject.TITLE).toString();
            boolean isHidden = Boolean.parseBoolean((String) dbObject.get(TocItemCGSObject.CGS_CONTENT + ".isHidden"));
            tocItemHiddenIndications.add(new TocItemIndicationForScorm(id, title, isHidden));
        }
        return tocItemHiddenIndications;
    }

    @Override
    public void updateDeletionDateForTocItemsByCourseIdAndTocItemsIds(String courseId, List<String> tocItemsIds, Date deletionDate) {
        Query query = new Query(Criteria.where(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId).
                and(TocItemCGSObject.CGS_ID).in(tocItemsIds));

        Update update = new Update();
        update.set(TocItemCGSObject.CGS_DELETION_DATE, deletionDate);
        getMongoTemplate().updateMulti(query, update, this.tocItemCollection);
    }

    @Override
    public List<TocItemCGSObject> getOnlyNameAndIdsByCourseOfNonHiddenItems(int publisherId, String courseId) throws DaoException {
        try {
            Query query = new Query(Criteria
                    .where(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId)
                    .and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId)
                    .and(TocItemCGSObject.CGS_CONTENT + ".isHidden")
                    .ne(true));

            query.fields()
                    .include(TocItemCGSObject.CGS_TYPE)
                    .include(TocItemCGSObject.CGS_FORMAT)
                    .include(TocItemCGSObject.CGS_TITLE)
                    .include(TocItemCGSObject.CGS_ID);

            List<DBObject> dbObjects = getMongoTemplate().find(query, DBObject.class, this.tocItemCollection);
            return convertToCGSObject(dbObjects);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void deleteByCourseIdAndPublisherId(String courseId, int publisherId) {
        Query query = new Query(Criteria.where(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId).
                and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId));

        getMongoTemplate().remove(query, this.tocItemCollection);
    }

    @Override
    public List<TocItemCGSObject> getByCourseAndIds(int publisherId, String courseId, List<String> allTocItemCIdsFromCourse) {
        Query query = new Query(Criteria.where(ContentItem.CGS_ID).in(allTocItemCIdsFromCourse).
                and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId).
                and(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId));
        List<DBObject> dbObjects = getMongoTemplate().find(query, DBObject.class, this.tocItemCollection);
        return convertToCGSObject(dbObjects);
    }

    private List<TocItemCGSObject> readFromDb(Query query) throws DaoException {
        try {
            List<DBObject> dbObjects = getMongoTemplate().find(query, DBObject.class, this.tocItemCollection);
            return convertToCGSObject(dbObjects);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public TocItemCGSObject get(String dbId, boolean propertiesOnly) throws DaoException {
        Query query = new Query(Criteria.where("_id").is(new ObjectId(dbId)));

        if (propertiesOnly) {
            query.fields().exclude(TocItemCGSObject.CGS_LESSON_LEARNING_OBJECTS_FIELD);
            query.fields().exclude(TocItemCGSObject.CGS_ASSESSMENT_SEQUENCES_FIELD);
            query.fields().exclude(TocItemCGSObject.CGS_LESSON_RESOURCES_FIELD);
        }
        DBObject courseObj = getMongoTemplate().findOne(query, DBObject.class, this.tocItemCollection);
        return convertToCGSObject(courseObj);
    }

    @Override
    public TocItem get(int publisherId, String tocItemCid, String courseId) {
        Query query = new Query(Criteria.where(ContentItem.CGS_ID).is(tocItemCid).
                and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId).
                and(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId));
        Class<? extends TocItem> tocItemClass = this.tocItemCollection.equals("lessons")
                ? Lesson.class
                : Assessment.class;
        return getMongoTemplate().findOne(query, tocItemClass, this.tocItemCollection);
    }

    @Override
    public TocItemCGSObject getContentItemBase(int publisherId, String tocItemCid, String courseId) throws DaoException {
        Query query = new Query(Criteria.where(ContentItem.CGS_ID).is(tocItemCid).
                and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId).
                and(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId));
        query.fields().include("_id");
        query.fields().include(TocItemCGSObject.CGS_TITLE);
        query.fields().include(TocItemCGSObject.CGS_ID);
        query.fields().include(TocItemCGSObject.CGS_TYPE);
        query.fields().include(TocItemCGSObject.CGS_DATA_COURSE_ID);
        query.fields().include(TocItemCGSObject.CGS_LAST_MODIFIED);
        query.fields().include(TocItemCGSObject.CGS_DATA_PUBLISHER_ID);

        DBObject dbObject = getMongoTemplate().findOne(query, DBObject.class, this.tocItemCollection);
        return convertToCGSObject(dbObject);
    }

    @Override
    public TocItemCGSObject getContentItemBase(String tocItemId) {
        Query query = new Query(Criteria.where("_id").is(new ObjectId(tocItemId)));
        query.fields().include("_id");
        query.fields().include(TocItemCGSObject.CGS_TITLE);
        query.fields().include(TocItemCGSObject.CGS_ID);
        query.fields().include(TocItemCGSObject.CGS_TYPE);
        query.fields().include(TocItemCGSObject.CGS_DATA_COURSE_ID);
        query.fields().include(TocItemCGSObject.CGS_LAST_MODIFIED);
        query.fields().include(TocItemCGSObject.CGS_DATA_PUBLISHER_ID);
        DBObject dbObject = getMongoTemplate().findOne(query, DBObject.class, this.tocItemCollection);
        return convertToCGSObject(dbObject);
    }

    @Override
    public List<TocItemCGSObject> getContentItemBases(int publisherId, List<String> tocItemCids, String courseId) {
        Query query = new Query(Criteria.where(ContentItem.CGS_ID).in(tocItemCids).
                and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId).
                and(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId));
        query.fields().include("_id");
        query.fields().include(TocItemCGSObject.CGS_TITLE);
        query.fields().include(TocItemCGSObject.CGS_IS_HIDDEN);
        query.fields().include(TocItemCGSObject.CGS_ID);
        query.fields().include(TocItemCGSObject.CGS_TYPE);
        query.fields().include(TocItemCGSObject.CGS_COURSE_ID);
        query.fields().include(TocItemCGSObject.CGS_LAST_MODIFIED);
        query.fields().include(TocItemCGSObject.CGS_DATA_PUBLISHER_ID);
        query.fields().include(TocItemCGSObject.CGS_FORMAT);
        query.fields().include(TocItemCGSObject.CGS_EBOOKS_IDS);
        query.fields().include(TocItemCGSObject.CGS_PLACEMENT);

        List<DBObject> dbObjects = getMongoTemplate().find(query, DBObject.class, this.tocItemCollection);
        return convertToCGSObject(dbObjects);
    }

    @Override
    public List<TocItemCGSObject> getByCourse(int publisherId, String courseId, boolean isPropertiesOnly) throws DaoException {
        try {
            Query query = new Query(Criteria.where(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId).
                    and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId));

            if (isPropertiesOnly) {
                query.fields().exclude(TocItemCGSObject.CGS_LESSON_LEARNING_OBJECTS_FIELD).exclude(TocItemCGSObject.CGS_ASSESSMENT_SEQUENCES_FIELD);
            }

            List<DBObject> dbObjects = getMongoTemplate().find(query, DBObject.class, this.tocItemCollection);
            return convertToCGSObject(dbObjects);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }

    }

    protected TocItemCGSObject convertToCGSObject(DBObject dbObject) {
        return dbObject == null ? null : new TocItemCGSObject(dbObject);
    }

    protected List<TocItemCGSObject> convertToCGSObject(List<DBObject> dbObjects) {
        List<TocItemCGSObject> cgsObjects = new ArrayList<>();
        for (DBObject dbObject : dbObjects) {
            cgsObjects.add(convertToCGSObject(dbObject));
        }

        return cgsObjects;
    }

    @Override
    public DBCursor getCursor(List<String> tocItemsIds, String courseId) throws DaoException {
        DBCursor dbCursor;
        try {
            BasicDBObject query = new BasicDBObject();
            query.put(TocItemCGSObject.CGS_ID, new BasicDBObject("$in", tocItemsIds));
            query.put(TocItemCGSObject.CGS_DATA_COURSE_ID, courseId);
            dbCursor = getMongoTemplate().getCollection(this.tocItemCollection).find(query);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
        return dbCursor;
    }

    @Override
    public DBCursor getCursorOfAllTocItems(int publisherId, String courseId) throws DaoException {
        DBCursor dbCursor;
        try {
            BasicDBObject query = new BasicDBObject();
            query.put(TocItemCGSObject.CGS_DATA_COURSE_ID, courseId);
            query.put(TocItemCGSObject.CGS_DATA_PUBLISHER_ID, publisherId);
            dbCursor = getMongoTemplate().getCollection(this.tocItemCollection).find(query);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
        return dbCursor;
    }

    public DBCursor getTocItemsByCidAndCourse(List<String> tocItemsIds, String courseId) throws DaoException {
        DBCursor dbCursor;
        try {
            BasicDBObject query = new BasicDBObject();
            query.put(TocItemCGSObject.CGS_ID, new BasicDBObject("$in", tocItemsIds));
            query.put(TocItemCGSObject.CGS_DATA_COURSE_ID, courseId);

            BasicDBObject fields = new BasicDBObject().append("_id", false).append(String.format("%s.header.TOC_IDS_PUBLISHED_TO_PROD", TocItemCGSObject.CGS_CONTENT), false);
            dbCursor = getMongoTemplate().getCollection(this.tocItemCollection).find(query, fields);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }

        return dbCursor;
    }

    @Override
    public DBCursor getTocItemsByCid(List<String> tocItemsIds) throws DaoException {
        DBCursor dbCursor;
        try {
            BasicDBObject query = new BasicDBObject();
            query.put(TocItemCGSObject.CGS_ID, new BasicDBObject("$in", tocItemsIds));

            BasicDBObject fields = new BasicDBObject().append("_id", false).append(TocItemCGSObject.CGS_CONTENT + ".header" + ".TOC_IDS_PUBLISHED_TO_PROD", false);
            dbCursor = getMongoTemplate().getCollection(this.tocItemCollection).find(query, fields);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }

        return dbCursor;
    }

    @Override
    public DBObject getLearningObjectsAndResources(int publisherId, String courseId, String tocItemCId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId).
                    and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId).
                    and(TocItemCGSObject.CGS_ID).is(tocItemCId));
            query.fields().include(TocItemCGSObject.CGS_LESSON_LEARNING_OBJECTS_FIELD);
            query.fields().include(TocItemCGSObject.CGS_LESSON_RESOURCES_FIELD);
            query.fields().include(TocItemCGSObject.CGS_ASSESSMENT_SEQUENCES_FIELD);

            return getMongoTemplate().findOne(query, DBObject.class, this.tocItemCollection);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public TocItemCGSObject getHeader(String tocItemCId, String courseId) throws DaoException {
        Query query = new Query(Criteria.where(ContentItem.CGS_ID).is(tocItemCId).
                and(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId));
        query.fields().include(TocItemCGSObject.CGS_HEADER);
        DBObject dbObject = getMongoTemplate().findOne(query, DBObject.class, this.tocItemCollection);
        return convertToCGSObject(dbObject);
    }

    @Override
    public void delete(String tocItemCid, String courseId, int publisherId) throws DaoException {
        Query query = new Query(Criteria.where(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId).
                and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId).
                and(TocItemCGSObject.CGS_ID).is(tocItemCid));

        getMongoTemplate().remove(query, this.tocItemCollection);
    }

    @Override
    public void deleteTocItems(List<String> tocItemCids, String courseId, int publisherId) throws DaoException {
        Query query = new Query(Criteria.where(TocItemCGSObject.CGS_DATA_COURSE_ID).is(courseId).
                and(TocItemCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId).
                and(TocItemCGSObject.CGS_ID).in(tocItemCids));

        getMongoTemplate().remove(query, this.tocItemCollection);
    }

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
        throw new IllegalAccessError();
    }
}
