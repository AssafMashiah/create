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
 * Date: 03/11/13
 * Time: 11:34
 */
public class FixAssessmentsStandardsPackageId extends CommonTask {

    public static final String CONTENT_DATA = "contentData";
    public static final String STANDARD_PACKAGES = "standardPackages";
    public static final String STANDARDS = "standards";
    public static final String STANDARD_PACKAGES_ID = "stdPackageId";
    public static final String STANDARD_NAME = "name";
    public static final String STANDARD_SUBJECT_AREA = "subjectArea";
    public static final String STANDARD_VERSION = "version";
    public static final String SEQUENCES = "sequences";
    public static final String TASKS = "tasks";
    public static final String CID = "cid";
    public static final String COURSE_ID = "courseId";
    public static final String CGS_DATA = "cgsData";


    // The convention of the field stdPackageId was changed from std_pck_<number> to
    // <standardName>_<standardSubjectArea>_<standardVersion>

    private static Logger logger = Logger.getLogger(FixAssessmentsStandardsPackageId.class);

    private MigrationDao migrationDao;

    private Map<String,String> newCourseStdPackageId = new HashMap<String, String>();

    @Override
    protected void executeUpInternal() throws Exception {
        fixAssessmentsStandardsPackageId();
    }

// This function will update the field stdPackageid to the new convention
// for every course that contain standards

  public void fixAssessmentsStandardsPackageId(){

       List<DBObject> assessmentObjects = migrationDao.getAssessmentsDbObjects();
       if (assessmentObjects != null) {
            logger.info("INFO: Number of lessons to fix: " + assessmentObjects.size());
        for (DBObject assessmentDbObject : assessmentObjects) {

            newCourseStdPackageId.clear();  // For each assessment , clear the newCourseStdPackageId map

            Map<String, DBObject> contentDataMap = (Map<String, DBObject>) assessmentDbObject.get(CONTENT_DATA);

            Object assessmentCid = contentDataMap.get(CID);
            String assessmentCid1 = assessmentCid.toString();

            Map<String, DBObject> cgsDataMap = (Map<String, DBObject>) assessmentDbObject.get(CGS_DATA);

            Object courseId1 = cgsDataMap.get(COURSE_ID);
            String courseId = courseId1.toString();


            System.out.print("INFO: Now handling assessment <" + assessmentCid1  + "> courseId <" + courseId + ">");

            updateStandardPackages(contentDataMap, assessmentCid1);
            updateStandardLinks(contentDataMap, assessmentCid1);

            updateSequences(contentDataMap, assessmentCid1);
            migrationDao.saveAssessment(assessmentDbObject);

        }
     }
    }


// This function will update the field stdPackageid in the standard package
// to the new convention for every Assessment that contain standards


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
// to the new convention for every Assessment/sequence/task that contain standard links

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
// to the new convention for every sequence/task that contain standard links

public void updateSequences(Map<String, DBObject> contentDataMap, String cid){


      BasicDBList sequencesList = (BasicDBList) contentDataMap.get(SEQUENCES);

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
