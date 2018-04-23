package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;

import java.util.Arrays;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: efrat.gur
 * Date: 11/09/13
 * Time: 11:25
 */


public class EscapeCharactersInStandardPackageDescriptions extends CommonTask {

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
    private static final String STANDARD_DESCRIPTION = "description";
    private static final String STANDARD_PEDAGOGICAL_ID = "pedagogicalId";


    // The convention of the field stdPackageId was changed from std_pck_<number> to
    // <standardName>_<standardSubjectArea>_<standardVersion>

    private static Logger logger = Logger.getLogger(EscapeCharactersInStandardPackageDescriptions.class);

    private MigrationDao migrationDao;


    @Override
    protected void executeUpInternal() throws Exception {
        fixStandardPackageDescription();
    }

    // This function will update the field stdPackageid to the new convention
    // for every course that contain standards

    public void fixStandardPackageDescription() {

        List<DBObject> standards = migrationDao.getAllStandards();
        for (DBObject standard : standards) {
            updateDescription(standard);
            Object packageStandards = standard.get("standards");
            if (packageStandards != null) {
                 updateStandardPackages((DBObject) packageStandards);
                 migrationDao.saveStandard(standard);
            }
        }

    }


// This function will update the field stdPackageid in the standard package
// to the new convention for every course/lesson that contain standards


    public void updateStandardPackages(DBObject standard) {


        BasicDBList standardPackagesList = (BasicDBList) standard.get("children");
        updateDescription(standard);

        if (standardPackagesList != null) {
            for (Object standards : standardPackagesList) {
                updateStandardPackages((DBObject) standards);
            }
        }
    }


    private void updateDescription(DBObject standard) {
        String stdPackageIdentifier = getStandardIdentifier(standard);


        String description = standard.get(STANDARD_DESCRIPTION).toString();
        String descriptionAfterEscaping = processString(description);
        if (description.contains("&"))
            logger.debug("check it out");
        if (!description.equals(descriptionAfterEscaping)) {
            logger.debug("Fixing description for standard: " + stdPackageIdentifier);
            standard.put(STANDARD_DESCRIPTION, descriptionAfterEscaping);
        }
    }

    private String getStandardIdentifier(DBObject standard) {
        String result = "";
        List<String> idFields = Arrays.asList(STANDARD_PACKAGES_ID, STANDARD_NAME, STANDARD_VERSION, STANDARD_PEDAGOGICAL_ID);
        for (String id : idFields) {
            if (standard.containsField(id))
                result += id + ": " + standard.get(id).toString() + ",";
        }
        return result;
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

    public String processString(String str) {
        String value = str;

        //replace &gt.
        value = value.replace("&gt.",">");
        //replace &lt.
        value = value.replace("&lt.","<");
        //replace &quote;
        value = value.replace("&quot;","'");
        //replace \u201C
        value =  value.replace("\u201C","\"");
        //replace \u201D
        value =  value.replace("\u201D","\"");

        return value;
    }
}


