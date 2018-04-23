package com.t2k.cgs.dbupgrader.task;

import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.Collection;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.dao.IUpdateLogDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.apache.log4j.Logger;
import org.springframework.util.Assert;

import java.util.Date;

/**
 * @author Alex Burdusel on 2016-10-06.
 */
public class UpdateLastModified extends CommonTask {

    private final static Logger LOGGER = Logger.getLogger(UpdateLastModified.class);

    private MigrationDao migrationDao;

    public UpdateLastModified(MigrationDao migrationDao, IUpdateLogDao updateLogDao) {
        Assert.notNull(migrationDao);
        this.migrationDao = migrationDao;
        Assert.notNull(updateLogDao);
        setUpdateLogDao(updateLogDao);
    }

    @Override
    protected void executeUpInternal() throws Exception {
        updateLastModified(Collection.COURSES_COLLECTION);
        updateLastModified(Collection.LESSONS_COLLECTION);
        updateLastModified(Collection.ASSESSMENT_COLLECTION);
    }

    @Override
    protected void executeDownInternal() throws Exception {
    }

    private void updateLastModified(Collection collection) {
        DBCursor cursor = migrationDao.getCursor(collection);
        int toUpdate = cursor.size();
        int updated = 0;
        Date dateZero = new Date(0);
        Date newLastModified = new Date();
        LOGGER.debug(String.format("Updating last-modified on %s objects from '%s' collection", toUpdate, collection.getName()));
        while (cursor.hasNext()) {
            DBObject dbObject = cursor.next();
            DBObject contentData = (DBObject) dbObject.get("contentData");
            if (contentData == null) {
                LOGGER.warn(String.format("%s (_id: %s) %s has no contentData", collection.getName(), dbObject.get("_id"), dbObject));
                continue;
            }
            DBObject header = (DBObject) contentData.get("header");
            if (header == null) {
                LOGGER.warn(String.format("%s (_id: %s) %s has no header", collection.getName(), dbObject.get("_id"), dbObject));
                continue;
            }
            Date lastModified = (Date) header.get("last-modified");
            // we don't update courses with Date(0)
            if (lastModified.compareTo(dateZero) == 0 && collection == Collection.COURSES_COLLECTION) {
                LOGGER.warn(String.format("Course (_id: %s) has last-modified equal to Date(0) and won't be updated", dbObject.get("_id")));
                continue;
            }
            header.put("last-modified", newLastModified);
            try {
                migrationDao.save(collection, dbObject);
            } catch (Exception e) {
                LOGGER.error(String.format("Error saving to database '%s' collection object %s ", collection.getName(), dbObject), e);
                continue;
            }
            updated++;
        }
        cursor.close();
        if (updated < toUpdate) {
            LOGGER.warn(String.format("Not all %s could be updated. Update successful for %s/%s %s",
                    collection.getName(), updated, toUpdate, collection.getName()));
        } else {
            LOGGER.debug(String.format("Successfully updated %s %s", updated, collection.getName()));
        }
    }
}
