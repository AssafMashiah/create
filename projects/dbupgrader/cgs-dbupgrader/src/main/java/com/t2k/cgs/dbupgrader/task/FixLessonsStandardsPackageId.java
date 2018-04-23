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
import java.util.Iterator;
import java.util.List;

public class FixLessonsStandardsPackageId extends CommonTask {

    private static final String LEARNING_OBJECTS = "learningObjects";
    private static final String STANDARDS = "standards";
    private static final String STANDARDS_PACKAGES = "standardPackages";
    private static final String STANDARD_PACKAGE_ID = "stdPackageId";

    private final static Logger LOGGER = Logger.getLogger(UpdateLastModified.class);

    private MigrationDao migrationDao;

    public FixLessonsStandardsPackageId(MigrationDao migrationDao, IUpdateLogDao updateLogDao) {
        Assert.notNull(migrationDao);
        this.migrationDao = migrationDao;
        Assert.notNull(updateLogDao);
        setUpdateLogDao(updateLogDao);
    }

    @Override
    protected void executeUpInternal() throws Exception {
        fixStandardsOnLessons();
    }

    @Override
    protected void executeDownInternal() throws Exception {
    }

    private void fixStandardsOnLessons() {
        DBCursor cursor = migrationDao.getCursor(Collection.LESSONS_COLLECTION);
        int updated = 0;
        Date newLastModified = new Date();
        LOGGER.debug("Fixing standards packages IDs on lessons");
        while (cursor.hasNext()) {
            DBObject lesson = cursor.next();
            if (fixStandardsOnLesson(lesson, newLastModified)) {
                updated++;
            }
        }
        LOGGER.debug("Fixed standards on " + updated + " lessons");
    }

    private boolean fixStandardsOnLesson(DBObject lesson, Date newLastModified) {
        DBObject contentData = (DBObject) lesson.get("contentData");
        boolean objectModified = fixStandardsAndStandardsPackages(contentData);

        List<DBObject> learningObjects = (List<DBObject>) contentData.get(LEARNING_OBJECTS);
        if (learningObjects != null) {
            for (DBObject learningObject : learningObjects) {
                objectModified = objectModified | fixStandardsOnLearningObject(learningObject);
            }
        }
        if (objectModified) {
            updateLastModified(contentData, newLastModified);
            try {
                migrationDao.save(Collection.LESSONS_COLLECTION, lesson);
            } catch (Exception e) {
                LOGGER.error("Error saving to database lesson " + lesson, e);
                return false;
            }
        }
        return objectModified;
    }

    private boolean fixStandardsOnLearningObject(DBObject learningObject) {
        boolean objectModified = fixStandardsAndStandardsPackages(learningObject);
        List<DBObject> sequences = (List<DBObject>) learningObject.get("sequences");
        if (sequences != null) {
            for (DBObject sequence : sequences) {
                objectModified = objectModified | fixStandardsOnSequence(sequence);
            }
        }
        return objectModified;
    }

    private boolean fixStandardsOnSequence(DBObject sequence) {
        boolean objectModified = fixStandardsAndStandardsPackages(sequence);
        List<DBObject> tasks = (List<DBObject>) sequence.get("tasks");
        if (tasks != null) {
            for (DBObject task : tasks) {
                objectModified = objectModified | fixStandardsAndStandardsPackages(task);
            }
        }
        return objectModified;
    }

    /**
     * Removes standards and/or standards packages missing the stdPackageId from the given object
     *
     * @param dbObject an object having standards and standardPackages
     * @return true if the object was modified
     */
    private boolean fixStandardsAndStandardsPackages(DBObject dbObject) {
        boolean objectModified = fixStandards((List<DBObject>) dbObject.get(STANDARDS));
        objectModified = objectModified | fixStandards((List<DBObject>) dbObject.get(STANDARDS_PACKAGES));
        return objectModified;
    }

    /**
     * Removes standards missing the stdPackageId from the given list
     *
     * @param standards a list of objects representing standards, that should have stdPackageId field
     * @return true if the object was modified
     */
    private boolean fixStandards(List<DBObject> standards) {
        boolean objectModified = false;
        if (standards != null) {
            Iterator iterator = standards.iterator();
            while (iterator.hasNext()) {
                DBObject standard = (DBObject) iterator.next();
                if (standard.get(STANDARD_PACKAGE_ID) == null) {
                    iterator.remove();
                    objectModified = true;
                }
            }
        }
        return objectModified;
    }

    /**
     * @return a standardsPackageId build from the standardsPackage
     */
//    private String buildStdPackageId(DBObject parentObject, DBObject standardsPackage) {
//        String cid = (String) parentObject.get("cid");
//        String objectType = (String) parentObject.get("type");
//        String standardName = (String) standardsPackage.get(STANDARD_NAME);
//        if (standardName == null | standardName.trim().length() == 0) {
//            System.out.println("*** ERROR: The standardName contains no value for " + objectType + " with cid " + cid);
//            return null;
//        }
//        String standardSubjectArea = (String) standardsPackage.get(STANDARD_SUBJECT_AREA);
//        if (standardSubjectArea == null | standardSubjectArea.trim().length() == 0) {
//            System.out.println("*** ERROR: The standardSubjectArea contains no value for " + objectType + " with cid " + cid);
//            return null;
//        }
//        String standardVersion = (String) standardsPackage.get(STANDARD_VERSION);
//        if (standardVersion == null | standardVersion.trim().length() == 0) {
//            System.out.println("*** ERROR: The standardVersion contains no value for " + objectType + " with cid " + cid);
//            return null;
//        }
//        return standardName + "_" + standardSubjectArea + "_" + standardVersion;
//    }
    private void updateLastModified(DBObject contentData, Date newLastModified) {
        DBObject header = (DBObject) contentData.get("header");
        if (header == null) {
            LOGGER.warn(String.format("lesson (_id: %s) has no header. contentData: %s", contentData.get("cid"), contentData));
            return;
        }
        header.put("last-modified", newLastModified);
    }
}