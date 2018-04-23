package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.apache.log4j.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.select.Elements;

import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 05/08/13
 * Time: 16:06
 */
public class FixTeacherGuide extends CommonTask {

    private static Logger logger = Logger.getLogger(FixTeacherGuide.class);

    private static String TEACHER_GUIDE = "teacherGuide";

    private MigrationDao migrationDao;

    @Override
    protected void executeUpInternal() throws Exception {
        logger.info("start fixing teacher guides...");
        fixTeacherGuides();
        logger.info("fixing teacher guides completed.");

    }

    public void fixTeacherGuides() throws Exception {
        List<DBObject> allLessonsDBObjects = getAllLessonsDBObjects();
        logger.info("fixing lessons...");
        if (allLessonsDBObjects != null) {
            for (DBObject lesson : allLessonsDBObjects) {
                fixLessonDBObject((DBObject) lesson.get("contentData"));
                setLastModified((DBObject) lesson.get("contentData"));
                saveLesson(lesson);
            }
        }

        List<DBObject> allAssessmentsDBObjects = getAllAssessmentsDBObject();
        if (allAssessmentsDBObjects != null) {
            for (DBObject assessment : allAssessmentsDBObjects) {
                fixAssessmentDBObject((DBObject) assessment.get("contentData"));
                setLastModified((DBObject) assessment.get("contentData"));
                saveAssessment(assessment);
            }

        }

    }

    private void setLastModified(DBObject contentItem) {
        DBObject header = (DBObject) contentItem.get("header");
        header.put("last-modified",new Date());
    }


    private void fixAssessmentDBObject(DBObject assessment) throws Exception {
        logger.info("fixAssessmentDBObject lesson: " + assessment.get("title") + "    cid: " + assessment.get("cid"));
        fixTeacherGuideInObject(assessment);
        BasicDBList seqObjs = (BasicDBList) ((DBObject) assessment).get("sequences");
        fixSequences(seqObjs);
    }


    public void fixLessonDBObject(DBObject lesson) throws Exception {
        logger.info("fixLessonDBObject lesson: " + lesson.get("title") + "    cid: " + lesson.get("cid"));
        fixTeacherGuideInObject(lesson);
        BasicDBList losObjs = (BasicDBList) lesson.get("learningObjects");
        if (losObjs != null) {
            for (Object loObj : losObjs) {
                BasicDBList seqObjs = (BasicDBList) ((DBObject) loObj).get("sequences");
                fixSequences(seqObjs);
            }
        }
    }

    private void fixSequences(BasicDBList seqObjs) throws Exception {
        if (seqObjs != null) {
            for (Object seqObj : seqObjs) {
                //check if the sequence is DS
                BasicDBList levelsObjs = (BasicDBList) ((DBObject) seqObj).get("levels");
                if (levelsObjs != null && !levelsObjs.isEmpty()) {
                    for (Object levObj : levelsObjs) {
                        DBObject sequence = (DBObject) ((DBObject) levObj).get("sequence");
                        if (sequence != null) {
                            //teacher guide in level
                            fixTeacherGuideInObject(sequence);
                        }
                    }


                } else {
                    fixTeacherGuideInObject((DBObject) seqObj);
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

    private List<DBObject> getAllLessonsDBObjects() {
        return migrationDao.getLessonsDbObjects();
    }

    private List<DBObject> getAllAssessmentsDBObject() {
        return migrationDao.getAssessmentsDbObjects();
    }

    public void fixTeacherGuideInObject(DBObject dbObject) throws Exception {
        DBObject tg = (DBObject) dbObject.get(TEACHER_GUIDE);
        if (tg != null) {
            String tgDataString = (String) tg.get("data");
            String tgDataStringCleaned = cleanTGDataStringHtmlBody(tgDataString, Arrays.asList("class", "style"));
            tg.put("data", tgDataStringCleaned);
            tgDataString = null;
            tgDataStringCleaned = null;
        }

    }

    public String cleanTGDataStringHtmlBody(String tgDataStringHtml, List<String> removeAttributes) throws Exception {

//         String decodedHtml = StringEscapeUtils.escapeHtml(tgDataStringHtml);
        try {
            String decodedHtml = URLDecoder.decode(tgDataStringHtml, "UTF-8");
            Document doc = Jsoup.parse(decodedHtml);
            for (String attrToRemove : removeAttributes) {
                Elements selectedAttrs = doc.select("[" + attrToRemove + "]");
                if (selectedAttrs != null) {
                    logger.info("removing " + selectedAttrs.size() + " of type " + attrToRemove);
                    selectedAttrs.remove();
                }
            }
            String data = doc.body().html();
            return URLEncoder.encode(data, "UTF-8");
        } catch (Exception e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
            logger.error("cant convert . using origin tgDataStringHtml");
            return tgDataStringHtml;
        }
    }

    @Override
    protected void executeDownInternal() throws Exception {
        //To change body of implemented methods use File | Settings | File Templates.
    }


    ///////////////////////
    // Injection Setters //
    ///////////////////////
    public void setMigrationDao(MigrationDao migrationDao) {
        this.migrationDao = migrationDao;
    }
}
