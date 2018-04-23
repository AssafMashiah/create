package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: efrat.gur
 * Date: 11/09/13
 * Time: 11:25
 */



public class FixStandardPackageId extends CommonTask {

    public static final String CONTENT_DATA = "contentData";
    public static final String STANDARD_PACKAGES = "standardPackages";
    public static final String STANDARDS = "standards";
    public static final String STANDARD_PACKAGES_ID = "stdPackageId";
    public static final String STANDARD_NAME = "name";
    public static final String STANDARD_SUBJECT_AREA = "subjectArea";
    public static final String STANDARD_VERSION = "version";
    public static final String LEARNING_OBJECTS = "learningObjects";
    public static final String SEQUENCES = "sequences";
    public static final String TASKS = "tasks";
    public static final String CID = "cid";
    public static final String COURSE_ID = "courseId";
    public static final String TITLE = "title";
    public static final String CGS_DATA = "cgsData";


    // The convention of the field stdPackageId was changed from std_pck_<number> to
    // <standardName>_<standardSubjectArea>_<standardVersion>

    private static Logger logger = Logger.getLogger(FixStandardPackageId.class);

    private MigrationDao migrationDao;

    private Map<String,String> newCourseStdPackageId = new HashMap<String, String>();

    private Map<String,String> CourseNameToCourseIdMap = new HashMap<String, String>();

    @Override
    protected void executeUpInternal() throws Exception {
        fixCoursesStandardPackageId();
        fixLessonsStandardPackageId();
    }

    // This function will update the field stdPackageid to the new convention
    // for every course that contain standards

    public void fixCoursesStandardPackageId(){

        List<DBObject> coursesObjects = migrationDao.getCoursesDbObjects();
        if (coursesObjects != null) {
            logger.info("INFO: Number of courses to fix:" + coursesObjects.size());
        for (DBObject courseDbObject : coursesObjects) {

            Map<String, DBObject> contentDataMap = (Map<String, DBObject>) courseDbObject.get(CONTENT_DATA);

            Object courseId1 = contentDataMap.get(COURSE_ID);
            String courseId = courseId1.toString();

            Object courseName1 = contentDataMap.get(TITLE);
            String courseName = courseName1.toString();

            System.out.println("INFO: Now handling Course : " + courseName);

            CourseNameToCourseIdMap.put(courseId,courseName);

            Object cid1 = contentDataMap.get(CID);
            String cid = cid1.toString();

            updateStandardPackages(contentDataMap, cid);
            migrationDao.saveCourse(courseDbObject);
        }
     }
    }


// This function will update the field stdPackageid to the new convention
// for every course that contain standards

  public void fixLessonsStandardPackageId(){

       List<DBObject> lessonObjects = migrationDao.getLessonsDbObjects();
       if (lessonObjects != null) {
            logger.info("INFO: Number of lessons to fix: " + lessonObjects.size());
        for (DBObject lessonDbObject : lessonObjects) {

            newCourseStdPackageId.clear();  // For each lesson , clear the newCourseStdPackageId map

            Map<String, DBObject> contentDataMap = (Map<String, DBObject>) lessonDbObject.get(CONTENT_DATA);

            Object lessonCid1 = contentDataMap.get(CID);
            String lessonCid = lessonCid1.toString();

            Map<String, DBObject> cgsDataMap = (Map<String, DBObject>) lessonDbObject.get(CGS_DATA);

            Object courseId1 = cgsDataMap.get(COURSE_ID);
            String courseId = courseId1.toString();


            System.out.print("INFO: Now handling lesson <" + lessonCid  + "> courseId <" + courseId + ">");

            String courseName = CourseNameToCourseIdMap.get(courseId);
            if(courseName != null && courseName.trim().length() > 0){
              System.out.println(" and course name <" + courseName + ">");
            }

            updateStandardPackages(contentDataMap, lessonCid);
            updateStandardLinks(contentDataMap, lessonCid);

            updateLearningObjects(contentDataMap, lessonCid);
            migrationDao.saveLesson(lessonDbObject);

        }
     }
    }


// This function will update the field stdPackageid in the standard package
// to the new convention for every course/lesson that contain standards


        public void updateStandardPackages(Map<String, DBObject> contentDataMap , String cid){

        BasicDBList standardPackagesList = (BasicDBList) contentDataMap.get(STANDARD_PACKAGES);

        if(standardPackagesList != null){
            for (Object standards : standardPackagesList) {


               Map<String, String> standardsMap = (Map<String, String>) standards;

                if (standardsMap != null) {
                    String standardPackageId = standardsMap.get(STANDARD_PACKAGES_ID);
                    if(standardPackageId == null || standardPackageId.trim().length() == 0){
                        System.out.println("*** ERROR: The standardPackageId contains no value for cid " + cid );
                        continue;
                    }

                    logger.info("INFO: Fixing Standard Package id: " + standardPackageId + " for cid " + cid);

                    String standardName = standardsMap.get(STANDARD_NAME);
                    if(standardName == null || standardName.trim().length() == 0){
                        System.out.println("*** ERROR: The standardName contains no value for cid " + cid );
                        continue;
                    }
                    String standardSubjectArea = standardsMap.get(STANDARD_SUBJECT_AREA);
                    if(standardSubjectArea == null || standardSubjectArea.trim().length() == 0 ){
                        System.out.println("*** ERROR: The standardSubjectArea contains no value for cid " + cid );
                        continue;
                    }
                    String standardVersion = standardsMap.get(STANDARD_VERSION);
                    if(standardVersion == null || standardVersion.trim().length() == 0 ){
                        System.out.println("*** ERROR: The standardVersion contains no value for cid " + cid );
                        continue;
                    }
                    String newStandardPackageId = standardName + "_" + standardSubjectArea + "_" + standardVersion;
                    if(newCourseStdPackageId.get(standardPackageId) == null){
                        newCourseStdPackageId.put(standardPackageId,newStandardPackageId);
                    }
                    standardsMap.put(STANDARD_PACKAGES_ID, newStandardPackageId);
                }
            }
        }
  }


// This function will update the field stdPackageid in the standards links
// to the new convention for every lesson/sequence/task that contain standard links

    public void updateStandardLinks(Map<String, DBObject> ObjectsMap, String cid){

        BasicDBList standardsList = (BasicDBList) ObjectsMap.get(STANDARDS);

        if(standardsList != null){
            for (Object standards : standardsList) {

               Map<String, String> standardsMap = (Map<String, String>) standards;
                if (standardsMap != null) {

                    String standardPackageId = standardsMap.get(STANDARD_PACKAGES_ID);
                    String newStandardPackageId = newCourseStdPackageId.get(standardPackageId) ;
                     if(newStandardPackageId == null){
                         System.out.println("*** ERROR: Could not update standardPackageId for package Id " + standardPackageId + " and cid " + cid);
                     }else{
                        standardsMap.put(STANDARD_PACKAGES_ID,newStandardPackageId);
                    }
                }


            }
        }
  }


// This function will update the field stdPackageid in the standards links
// to the new convention for every learning object (sequence/task) that contain standard links

public void updateLearningObjects(Map<String, DBObject> contentDataMap, String cid){


        BasicDBList learningObjectsList = (BasicDBList) contentDataMap.get(LEARNING_OBJECTS);
       // String lessonId = contentDataMap.get(CID).toString();

        if(learningObjectsList != null){
            for (Object los : learningObjectsList) {

               Map<String, DBObject> losMap = (Map<String, DBObject>) los;
                if (losMap != null) {
                  BasicDBList sequencesList = (BasicDBList) losMap.get(SEQUENCES);

                    if(sequencesList != null){
                        for (Object sequence : sequencesList) {

                           Map<String, DBObject> sequenceMap = (Map<String, DBObject>) sequence;
                            if (sequenceMap != null) {

                                Object seqCid1 = sequenceMap.get(CID);
                                String seqCid = seqCid1.toString();
                                logger.info("INFO: Now handling sequence id <" + seqCid  + "> for lesson id <" + cid + ">");
                                updateStandardLinks(sequenceMap, seqCid ) ;
                            }
                            BasicDBList tasksList = (BasicDBList) sequenceMap.get(TASKS);

                            if(tasksList != null){
                                for (Object task : tasksList) {

                                   Map<String, DBObject> tasksMap = (Map<String, DBObject>) task;
                                    if (tasksMap != null) {

                                        Object taskCid1 = tasksMap.get(CID);
                                        String taskCid = taskCid1.toString();
                                        logger.info("INFO: Now handling task id <" + taskCid  + "> for lesson id <" + cid + ">");

                                        updateStandardLinks(tasksMap, taskCid ) ;
                                    }
                                }
                            }
                        }
                  }

               }
            }
        }
  }



    @Override
    protected void executeDownInternal() throws Exception {
        //To change body of implemented methods use File | Settings | File Templates.
    }


    ///////////////////////
    // Injection Setters //
    ///////////////////////
    @Required
    public void setMigrationDao(MigrationDao migrationDao) {
        this.migrationDao = migrationDao;
    }
}


