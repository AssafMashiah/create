package org.t2k.cgs.persistence.dao;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import org.apache.log4j.Logger;
import org.joda.time.DateTime;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;
import org.t2k.cgs.domain.model.cleanup.CleanupsDao;
import org.t2k.cgs.domain.model.cleanup.CleanupJob;
import org.t2k.cgs.domain.model.cleanup.CleanupStatus;
import org.t2k.cgs.domain.model.cleanup.CleanupType;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 14/08/14
 * Time: 11:08
 */
@Component
public class CleanupsMongoDao extends MongoDao implements CleanupsDao {
    //Course collection name in mongoDb
    private static final String CLEANUPS_COLLECTION = "cleanups";
    private Logger logger = Logger.getLogger(CleanupsMongoDao.class);
    @Override
    public void insertOrUpdateCleanup(CleanupJob cleanupJob) throws DaoException {
        try {
            CleanupJob existingCleanup = getCleanup(cleanupJob.getPublisherId(), cleanupJob.getCourseId(), cleanupJob.getTocItemId(), cleanupJob.getCleanupType(), cleanupJob.getStatus());
            if (existingCleanup == null) {
                cleanupJob.setLastModified(cleanupJob.getCreated());   // for a new object lastmodified = created
                getMongoTemplate().insert(cleanupJob, CLEANUPS_COLLECTION);
            }
            else {
                existingCleanup.setStatus(CleanupStatus.Created);
                existingCleanup.setLastModified(new Date());    // for an existing object - lastModified = current date
                saveCleanup(existingCleanup);
            }
        } catch (DataAccessException e) {
            logger.error(String.format("Error inserting job into DB. job details: %s",cleanupJob.toString()));
            throw new DaoException(e);
        }
    }

    @Override
    public void saveCleanup(CleanupJob cleanupJob) throws DaoException {
        try {
              getMongoTemplate().save(cleanupJob, CLEANUPS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public List<CleanupJob> getWaitingCleanupJobs(int numberOfCleanupsToReturn, CleanupType type) throws DaoException {
        try {
            Query query = new Query(Criteria.where(CleanupJob.STATUS).is(CleanupStatus.Created.name())
                    .and(CleanupJob.CLEANUP_TYPE).is(type.name())
                    .and(CleanupJob.LAST_MODIFIED).lt(new DateTime().minusHours(1).toDate()));    // use .name() because java json converter doesn't handle enums
            query.with(new Sort(Sort.Direction.ASC, CleanupJob.LAST_MODIFIED));
            return getMongoTemplate().find(query.limit(numberOfCleanupsToReturn), CleanupJob.class, CLEANUPS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }


    @Override
    public void removeRelatedCleanups(int publisherId, String courseId) throws DaoException {
        try {
            BasicDBObject query = new BasicDBObject();
            query.put(CleanupJob.PUBLISHER_ID, publisherId);
            query.put(CleanupJob.COURSE_ID, courseId);

            getMongoTemplate().getCollection(CLEANUPS_COLLECTION).remove(query);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    private DBCursor getWaitingCleanups(BasicDBObject query) throws DaoException     {
        try {
            query.put(CleanupJob.STATUS, CleanupStatus.Created.name());     // use .name() because java json converter doesn't handle enums
            BasicDBObject orderBy = new BasicDBObject();
            orderBy.put(CleanupJob.LAST_MODIFIED,1); //sort ascending
            return getMongoTemplate().getCollection(CLEANUPS_COLLECTION).find(query).sort(orderBy);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public DBCursor getWaitingCleanups() throws DaoException {
          return getWaitingCleanups(new BasicDBObject());
    }

    @Override
    public void updateCleanupStatus(int publisherId, String courseId, String itemId, CleanupType cleanupType, CleanupStatus newStatus) throws DaoException {
        try {
            Query query = new Query(Criteria.where(CleanupJob.PUBLISHER_ID).is(publisherId)
                    .and(CleanupJob.COURSE_ID).is(courseId)
                    .and(CleanupJob.TOC_ITEM_ID).is(itemId)
                    .and(CleanupJob.CLEANUP_TYPE).is(cleanupType.name()) // use .name() because java json converter doesn't handle enums
                    .and(CleanupJob.STATUS).is(CleanupStatus.Created.name())); // use .name() because java json converter doesn't handle enums
            Update update = Update.update(CleanupJob.STATUS, newStatus.name())
                    .set(CleanupJob.LAST_MODIFIED, new Date());
            getMongoTemplate().updateFirst(query, update, CLEANUPS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void removeCleanup(CleanupJob cleanupJob) {
        BasicDBObject query = new BasicDBObject();
        query.put(CleanupJob.PUBLISHER_ID, cleanupJob.getPublisherId());
        query.put(CleanupJob.COURSE_ID, cleanupJob.getCourseId());
        query.put(CleanupJob.TOC_ITEM_ID, cleanupJob.getTocItemId());
        query.put(CleanupJob.CLEANUP_TYPE, cleanupJob.getCleanupType().name());    // use .name() because java json converter doesn't handle enums

        getMongoTemplate().getCollection(CLEANUPS_COLLECTION).remove(query);
    }

    @Override
    public CleanupJob getCourseCleanupJob(int publisherId, String courseId, CleanupStatus cleanupStatus){
        return getCleanup(publisherId, courseId,null,CleanupType.COURSE,cleanupStatus);
    }

    @Override
    public CleanupJob getTocItemCleanupJob(int publisherId, String courseId, String tocItemId, CleanupStatus cleanupStatus, CleanupType type){
        return getCleanup(publisherId, courseId, tocItemId, type, cleanupStatus);
    }

    @Override
    public CleanupJob getCleanup(int publisherId, String courseId, String tocItemId, CleanupType cleanupType, CleanupStatus cleanupStatus) {
        Query query = new Query(Criteria.where(CleanupJob.PUBLISHER_ID).is(publisherId).
                and(CleanupJob.COURSE_ID).is(courseId).
                and(CleanupJob.TOC_ITEM_ID).is(tocItemId).
                and(CleanupJob.CLEANUP_TYPE).is(cleanupType.name()).  // use .name() because java json converter doesn't handle enums
                and(CleanupJob.STATUS).is(cleanupStatus.name()));

        return getMongoTemplate().findOne(query, CleanupJob.class, CLEANUPS_COLLECTION);
    }

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
        throw new IllegalAccessError();
    }
}