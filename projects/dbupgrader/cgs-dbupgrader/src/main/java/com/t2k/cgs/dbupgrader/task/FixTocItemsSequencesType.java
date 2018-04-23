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
import java.util.List;
import java.util.stream.Collectors;

public class FixTocItemsSequencesType extends CommonTask {

    private final static Logger LOGGER = Logger.getLogger(FixLearningPathsIntegrity.class);

    private MigrationDao migrationDao;

    public FixTocItemsSequencesType(MigrationDao migrationDao, IUpdateLogDao updateLogDao) {
        Assert.notNull(migrationDao);
        this.migrationDao = migrationDao;
        Assert.notNull(updateLogDao);
        setUpdateLogDao(updateLogDao);
    }

    @Override
    protected void executeUpInternal() throws Exception {
        fixLessonsSequences();
        fixAssessmentsSequences();
    }

    @Override
    protected void executeDownInternal() throws Exception {
    }

    private void fixLessonsSequences() {
        Date newLastModified = new Date();
        DBCursor cursor = migrationDao.getCursor(Collection.LESSONS_COLLECTION);
        LOGGER.debug("Scanning and fixing sequences types in lessons");
        int updated = 0;
        while (cursor.hasNext()) {
            DBObject dbObject = cursor.next();
            DBObject contentData = (DBObject) dbObject.get("contentData");
            if (contentData == null) {
                LOGGER.warn("Lesson " + dbObject.get("_id") + " has no contentData: " + dbObject);
                continue;
            }
            if (contentData.containsField("learningObjects")) {
                List<DBObject> learningObjects = (List<DBObject>) contentData.get("learningObjects");
                for (DBObject learningObject : learningObjects) {
                    if (learningObject.containsField("sequences")) {
                        List<DBObject> sequences = (List<DBObject>) learningObject.get("sequences");
                        boolean sequencesModified = fixLessonSequences(sequences);
                        if (sequencesModified) {
                            DBObject header = (DBObject) contentData.get("header");
                            if (header == null) {
                                LOGGER.warn("Lesson " + dbObject.get("_id") + " has no header: " + dbObject);
                                continue;
                            }
                            header.put("last-modified", newLastModified);
                            migrationDao.save(Collection.LESSONS_COLLECTION, dbObject);
                            updated++;
                        }
                    }
                }
            }
        }
        LOGGER.debug("Updated " + updated + " lessons");
    }

    private boolean fixLessonSequences(List<DBObject> sequences) {
        boolean modified = false;
        if (sequences.size() > 0) {
            for (DBObject sequence : sequences) {
                if (!sequence.containsField("type")) {
                    sequence.put("type", "sequence");
                    modified = true;
                } else if (sequence.get("type").equals("differentiatedSequenceParent") && sequence.containsField("levels")) {
                    List<DBObject> levels = (List<DBObject>) sequence.get("levels");
                    List<DBObject> levelsSequences = levels.stream()
                            .map(level -> (DBObject) level.get("sequence"))
                            .collect(Collectors.toList());
                    boolean childrenModified = fixLessonSequences(levelsSequences);
                    if (childrenModified) modified = true;
                }
            }
        }
        return modified;
    }

    private void fixAssessmentsSequences() {
        Date newLastModified = new Date();
        DBCursor cursor = migrationDao.getCursor(Collection.ASSESSMENT_COLLECTION);
        LOGGER.debug("Scanning and fixing sequences types in assessments");
        int updated = 0;
        while (cursor.hasNext()) {
            DBObject dbObject = cursor.next();
            DBObject contentData = (DBObject) dbObject.get("contentData");
            if (contentData == null) {
                LOGGER.warn("Assessment " + dbObject.get("_id") + " has no contentData: " + dbObject);
                continue;
            }
            if (contentData.containsField("sequences")) {
                List<DBObject> sequences = (List<DBObject>) contentData.get("sequences");
                boolean sequencesModified = fixAssessmentSequences(sequences);
                if (sequencesModified) {
                    DBObject header = (DBObject) contentData.get("header");
                    if (header == null) {
                        LOGGER.warn("Assessment " + dbObject.get("_id") + " has no header: " + dbObject);
                        continue;
                    }
                    header.put("last-modified", newLastModified);
                    migrationDao.save(Collection.ASSESSMENT_COLLECTION, dbObject);
                    updated++;
                }
            }
        }
        LOGGER.debug("Updated " + updated + " assessments");
    }

    /**
     * @return true if any of the sequences was modified
     */
    private boolean fixAssessmentSequences(List<DBObject> sequences) {
        boolean modified = false;
        if (sequences.size() > 0) {
            for (DBObject sequence : sequences) {
                if (!sequence.containsField("type")) {
                    sequence.put("type", "assessmentSequence");
                    modified = true;
                } else if (sequence.get("type").equals("differentiatedSequenceParent") && sequence.containsField("levels")) {
                    List<DBObject> levels = (List<DBObject>) sequence.get("levels");
                    List<DBObject> levelsSequences = levels.stream()
                            .map(level -> (DBObject) level.get("sequence"))
                            .collect(Collectors.toList());
                    boolean childrenModified = fixAssessmentSequences(levelsSequences);
                    if (childrenModified) modified = true;
                } else if (sequence.get("type").equals("sequence")) {
                    sequence.put("type", "assessmentSequence");
                    modified = true;
                }
            }
        }
        return modified;
    }
}
