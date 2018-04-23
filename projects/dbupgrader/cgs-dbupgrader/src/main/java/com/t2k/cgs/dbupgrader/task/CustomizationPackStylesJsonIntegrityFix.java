package com.t2k.cgs.dbupgrader.task;


import atg.taglib.json.util.JSONArray;
import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.cgs.dbupgrader.utils.CourseUtils;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;

import java.io.File;
import java.io.IOException;


public class CustomizationPackStylesJsonIntegrityFix extends CommonTask {

    private MigrationDao migrationDao;
    private Configuration configuration;
    private static Logger logger = Logger.getLogger(CustomizationPackStylesJsonIntegrityFix.class);
    private JSONObject defaultFontWeightNameJson;
    private JSONObject defaultFontWeightValueJson;
    private JSONObject defaultFontWeightJson;
    private JSONObject defaultFontStyleNameJson;
    private JSONObject defaultFontStyleValueJson;
    private JSONObject defaultFontStyleJson;

    private int changedCourses = 0;

    @Override
    protected void executeUpInternal() throws Exception {
        try {
           fixJson();
        } catch (Exception e) {
            printError(String.format("Failed, Exception: %s", e));
        }
    }

    public void fixJson() throws Exception {
        initJsonObjects();
        String cmsLocation = configuration.getProperty("cmsHome");
        File baseDir = new File(cmsLocation, "publishers");
        if (!baseDir.exists()) {
            printError(String.format("Could not find cms path: %s", cmsLocation));
            return;
        }
        DBCursor courses = migrationDao.getCoursesDbCursor();
        while (courses.hasNext()) {
            DBObject course = courses.next();
            try {
                processCoursePack(course, baseDir);
            } catch (Exception e) {
                printError(String.format("Could not handle course: %s", course));
            }
        }
        printDebug(String.format("Total courses changed: %s", changedCourses));
    }

    private void initJsonObjects() throws JSONException {
        defaultFontWeightJson = new JSONObject();
        defaultFontWeightNameJson = defaultFontWeightJson.put("name", "font-weight");
        defaultFontWeightValueJson = defaultFontWeightJson.put("value", "normal");
        defaultFontStyleJson = new JSONObject();
        defaultFontStyleNameJson = defaultFontStyleJson.put("name", "font-style");
        defaultFontStyleValueJson = defaultFontStyleJson.put("value", "normal");
        printDebug(String.format("Initializing default jsons for styles.json:\n defaultFontWeightJson: %s " +
                "\n defaultFontStyleJson: %s", defaultFontWeightJson.toString(), defaultFontStyleJson.toString()));
    }

    private boolean processCoursePack(DBObject course, File baseDir) throws IOException, JSONException {
        DBObject contentData = ((DBObject) course.get("contentData"));
        String courseId = contentData.get("courseId").toString();
        if (contentData != null && contentData.containsField("customizationPack")) {
            DBObject customizationPack = (DBObject) contentData.get("customizationPack");
            if (customizationPack == null) {
                printError(String.format("No customization pack for course %s", courseId));
                return false;
            }
            String localeName = (String) customizationPack.get("name");
            String version = (String) customizationPack.get("version");
            DBObject cgsData = (DBObject) course.get("cgsData");
            String targetDir = cgsData.get("publisherId") +
                    "/courses/" + contentData.get("courseId")
                    + "/" + "customizationPack" + "/" + localeName + "/" + version;
            File customizationPackDir = new File(baseDir, targetDir);
            if (!customizationPackDir.exists()) {
                //printError(String.format("Customization pack dir doesn't exist: %s", customizationPackDir.getPath()));
                return false;
            }
            File stylesJson = new File(customizationPackDir.getPath(), "dl/styles.json");
            if (!stylesJson.exists()) {
                printError(String.format("Customization pack file styles.json doesn't exist in path: %s", stylesJson.getPath()));
                return false;
            }
            JSONObject styles = new JSONObject(FileUtils.readFileToString(stylesJson));
            Boolean stylesChanged = false;
            if (styles.has("fonts")) {
                JSONArray fonts = styles.getJSONArray("fonts");
                for (int i = 0; i < fonts.size(); i++) {
                    JSONObject font = fonts.getJSONObject(i);
                    if (font.has("cssArray")) {
                        JSONArray cssArray = font.getJSONArray("cssArray");
                        boolean hasFontWeight = false;
                        boolean hasFontStyle = false;
                        for (int j = 0; j < cssArray.size(); j++) {
                            JSONObject css = cssArray.getJSONObject(j);
                            if (css.has("name")) {
                                String cssName = css.getString("name");
                                if (cssName.equals("font-weight")) {
                                    hasFontWeight = true;
                                }
                                if (cssName.equals("font-style")) {
                                    hasFontStyle = true;
                                }
                            }
                        }
                        if (!hasFontWeight) {
                            printDebug("CSS Style Rule " + font.get("key") + " has no font weight");
                            cssArray.put(defaultFontWeightJson);
                            stylesChanged = true;
                        }
                        if (!hasFontStyle) {
                            printDebug("CSS Style Rule " + font.get("key") + " has no font style");
                            cssArray.put(defaultFontStyleValueJson);
                            stylesChanged = true;
                        }
                    }
                }
            }
            if (stylesChanged) {
                changedCourses++;
                updateVersion(targetDir, course);
                File copyOfStylesJson = new File(customizationPackDir.getPath().replace(version, customizationPack.get("version").toString()), "dl/styles.json");
                FileUtils.writeStringToFile(copyOfStylesJson, styles.toString());
                printDebug(String.format("Changed dl/styles.json for course: %s\nin path: %s\nwith content : %s", courseId, stylesJson.getPath(), styles.toString()));
            }
            return stylesChanged;
        }
        // nothing to be updated...
        return false;
    }

    @Override
    protected void executeDownInternal() throws Exception {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    private void updateVersion(String targetDir, DBObject course) throws IOException, JSONException {
        String oldVersion = CourseUtils.getOldVersion(targetDir);

        // First, generate the new version
        String newVersion = CourseUtils.generateNewVersion(oldVersion);

        // Second, update the course's version, last-modified date and resource's base directory and save it.
        CourseUtils.updateCourseDocumentsVersion(course, oldVersion, newVersion);
        migrationDao.saveCourse(course);

        // Third, create a new directory with the new version and copy files to it
        CourseUtils.createNewDirForNewVersion(targetDir, configuration.getProperty("cmsHome"), oldVersion, newVersion);
    }

    private void printError(String errorMsg) {
        logger.error(errorMsg);
        System.out.print(errorMsg);
    }

    private void printDebug(String msg) {
        logger.debug(msg);
        System.out.print(msg);
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
}
