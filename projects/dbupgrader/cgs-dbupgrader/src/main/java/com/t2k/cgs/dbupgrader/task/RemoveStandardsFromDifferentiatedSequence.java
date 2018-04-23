package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.apache.log4j.Logger;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 05/08/13
 * Time: 16:06
 */
public class RemoveStandardsFromDifferentiatedSequence extends CommonTask {

    private static Logger logger = Logger.getLogger(RemoveStandardsFromDifferentiatedSequence.class);

    private MigrationDao migrationDao;

    @Override
    protected void executeUpInternal() throws Exception {
        logger.info("start fixing teacher guides...");
        removeStandardsFromLessonsAndAssessmentDifferentiatedSequence();
        logger.info("fixing teacher guides completed.");

    }

    public void removeStandardsFromLessonsAndAssessmentDifferentiatedSequence() throws Exception {
        List<DBObject> allLessonsDBObjects = getAllLessonsThatHaveDifferentiatedLevelDBObjects();
        logger.info("fixing lessons...");
        if (allLessonsDBObjects != null) {
            for (DBObject lesson : allLessonsDBObjects) {
                fixTocItemDBObject((DBObject) lesson.get("contentData"));
                setLastModified((DBObject) lesson.get("contentData"));
                saveLesson(lesson);
            }
        }

        List<DBObject> allAssessmentsDBObjects = getAllAssessmentsThatHaveDifferentiatedLevelDBObjects();
        if (allAssessmentsDBObjects != null) {
            for (DBObject assessment : allAssessmentsDBObjects) {
                fixTocItemDBObject((DBObject) assessment.get("contentData"));
                setLastModified((DBObject) assessment.get("contentData"));
                saveAssessment(assessment);
            }
        }

    }

    private void setLastModified(DBObject contentItem) {
        DBObject header = (DBObject) contentItem.get("header");
        header.put("last-modified",new Date());
    }


    public void fixTocItemDBObject(DBObject lesson) throws Exception {
        logger.info("fixLessonDBObject lesson: " + lesson.get("title") + "    cid: " + lesson.get("cid"));
        BasicDBList losObjects = (BasicDBList) lesson.get("learningObjects");
        if (losObjects != null) {
            for (Object loObj : losObjects) {
                BasicDBList seqObjs = (BasicDBList) ((DBObject) loObj).get("sequences");
                fixSequences(seqObjs);
            }
        }
    }

    private void fixSequences(BasicDBList seqObjs) throws Exception {
        if (seqObjs != null) {
            for (Object seqObj : seqObjs) {
                //check if the sequence is DS
                String type = ((DBObject) seqObj).get("type").toString() ;
                if (type.equals("differentiatedSequenceParent")) {
                    ((DBObject) seqObj).removeField("standards");
                }

            }
        }
    }


    private void saveLesson(DBObject lesson) {
        migrationDao.saveLesson(lesson);
    }

    private void saveAssessment(DBObject assessment) {
        migrationDao.saveAssessment(assessment);
    }

    private List<DBObject> getAllLessonsThatHaveDifferentiatedLevelDBObjects() {
        List<DBObject> list = new ArrayList<>();
        BasicDBObject query = new BasicDBObject();
        query.put("contentData.learningObjects.sequences.type","differentiatedSequenceParent");
        DBCursor cursor = migrationDao.getLessonsByQuery(query);
        while (cursor.hasNext()){
            list.add(cursor.next());
        }
         return list;

    }

    private List<DBObject> getAllAssessmentsThatHaveDifferentiatedLevelDBObjects() {
        List<DBObject> list = new ArrayList<>();
        BasicDBObject query = new BasicDBObject();
        query.put("contentData.learningObjects.sequences.type", "differentiatedSequenceParent");
        DBCursor cursor = migrationDao.getAssessmentsByQuery(query);
        while (cursor.hasNext()){
            list.add(cursor.next());
        }
        return list;
    }


    @Override
    protected void executeDownInternal() throws Exception {

    }


    ///////////////////////
    // Injection Setters //
    ///////////////////////
    public void setMigrationDao(MigrationDao migrationDao) {
        this.migrationDao = migrationDao;
    }
}
