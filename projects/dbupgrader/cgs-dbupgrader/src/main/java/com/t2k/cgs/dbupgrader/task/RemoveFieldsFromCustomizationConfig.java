package com.t2k.cgs.dbupgrader.task;


import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;

import java.io.File;
import java.io.IOException;
import java.util.List;

public class RemoveFieldsFromCustomizationConfig extends CommonTask {

   private String GRADE_LEVEL = "gradeLevel";
    private String SUBJECT_AREA =  "subjectArea";
    private String log = "";
    private MigrationDao migrationDao;

    private Configuration configuration;

    private static Logger logger = Logger.getLogger(RemoveFieldsFromCustomizationConfig.class);

    @Override
    protected void executeUpInternal() throws Exception {
        try {
            UpdateStandardsPackageConfigJson();
        } catch (Exception e) {
            System.out.print("styleMigration failed, Exception: " + e);
        }
    }

    private File coursesBaseDir() throws Exception {

        String cmsLocation = configuration.getProperty("cmsHome");

        File baseDir = new File(cmsLocation, "publishers");

        if (!baseDir.exists() || !baseDir.isDirectory()){
            logger.debug("Pubilshers folder doesn't exist");
            throw new Exception("Pubilshers folder doesn't exist");
        }


        File packs = new File(cmsLocation, "packs");
        if (!packs.exists())
            packs.mkdirs();
        return  baseDir;
    }

    public void UpdateStandardsPackageConfigJson() throws Exception {
        DBCursor courses = migrationDao.getCoursesDbCursor();
        File baseDir = coursesBaseDir();
        while (courses.hasNext()) {
            DBObject course = courses.next();
            try {
                processCoursePack(course, baseDir);
            } catch (Exception e) {
                System.out.print("Could not handle course "+e);
            }
        }

    }

    private void processCoursePack(DBObject course, File baseDir) throws Exception {

            File configJson = getCustomizationCgsConfigJson(baseDir, course);
            logger.debug("Updated config.json. File path: "+configJson.getPath());
            updateCgsConfigJson(configJson);


        }

    private File getCustomizationCgsConfigJson(File baseDir, DBObject course) throws Exception {
        DBObject contentData = ((DBObject) course.get("contentData"));

        if (contentData.containsField("customizationPack")) {

            DBObject customizationPack = (DBObject) contentData.get("customizationPack");

            String resourceId = (String) customizationPack.get("resourceId");

            List<DBObject> resources = (List<DBObject>) contentData.get("resources");

            DBObject the_resource = null;

            for (DBObject resource : resources) {

                if (resourceId.equals(resource.get("resId"))) {
                    the_resource = resource;
                    break;
                }

            }

            assert the_resource != null;

            String sufix = (String) the_resource.get("baseDir");

            DBObject cgsData = (DBObject) course.get("cgsData");

            String targetdir = cgsData.get("publisherId") +
                    "/courses/" + contentData.get("courseId")
                    + "/" + sufix.trim();


            File oldCustomizationPackDir = new File(baseDir, targetdir);

            if (!oldCustomizationPackDir.exists()) {

                try {
                    log += "ERROR: course without customization pack dir: courseid: " + contentData.get("courseId") + " title: " +
                            contentData.get("title") + "  expected path:" + oldCustomizationPackDir.getPath() + "\n";
                    throw new Exception(log);
                } catch (Exception e) {
                    log += "SYS_ERROR: logging error \n";
                    throw new Exception(log);
                }


            }

            assert oldCustomizationPackDir.isDirectory() && oldCustomizationPackDir.exists();

            logger.debug("oldcustomizationPackDir: processing: " + oldCustomizationPackDir);

            String configJsonPath = oldCustomizationPackDir+"/cgs/config.json";
            File configJson = new File(configJsonPath);
            if(!configJson.exists())
                throw new Exception("Config json doesn't exist : "+configJsonPath);
            return configJson;
    }

    else {
            try {
                logger.error("course without customization pack: courseid: " + contentData.get("courseId") + " title: " +
                        contentData.get("title"));
                throw new Exception(log);
            } catch (Exception e) {
                logger.error("SYS_ERROR: logging error");
                throw new Exception(log);
            }
        }
    }

    private void updateCgsConfigJson(File customizationPackDir) throws IOException, JSONException {

        String config = FileUtils.readFileToString(customizationPackDir);
        JSONObject manifest = new JSONObject(config);
        if (manifest.has(GRADE_LEVEL)){
            manifest.remove(GRADE_LEVEL);
            logger.debug("Removed "+GRADE_LEVEL+" from: "+customizationPackDir.getPath());
        }
        if (manifest.has(SUBJECT_AREA)){
            manifest.remove(SUBJECT_AREA);
            logger.debug("Removed "+SUBJECT_AREA+" from: "+customizationPackDir.getPath());
        }
        FileUtils.writeStringToFile(customizationPackDir, manifest.toString());



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

    @Required
    public void setConfiguration(Configuration configuration) {
        this.configuration = configuration;
    }

    // Methods for test
    public void upgradeSpecificCourse(String courseId) throws Exception {
        File baseDir = coursesBaseDir();
        processCoursePack(migrationDao.getCourseById(courseId),baseDir);

    }

    // Methods for test
    public boolean AllCoursesHaveUpdatedConfigJson() throws Exception {
        DBCursor courses = migrationDao.getCoursesDbCursor();
        File baseDir = coursesBaseDir();
        while (courses.hasNext()) {
            DBObject course = courses.next();
            try {
                if (!courseCustomizationConfigIsModified(course, baseDir)){
                    logger.error("Problem modifiying config file: "+baseDir.getPath());
                    return false;
                }

            } catch (Exception e) {
                System.out.print("Could not handle course: " + course+" Error:"+e);
                logger.error("Could not handle course: " + course, e);

            }
        }
        return true;
    }

    // Methods for test
    private boolean courseCustomizationConfigIsModified(DBObject course, File baseDir) throws Exception {
        File configJson = getCustomizationCgsConfigJson(baseDir, course);
        logger.debug("Updated config.json. File path: " + configJson.getPath());
        JSONObject config = new JSONObject(FileUtils.readFileToString(configJson));
        String subjectArea = "subjectArea";
        String gradeLevel = "gradeLevel";
        if (config.has(subjectArea)){
           return false;
       }
        if (config.has(gradeLevel)){
            return false;
        }
        return true;

    }
}
