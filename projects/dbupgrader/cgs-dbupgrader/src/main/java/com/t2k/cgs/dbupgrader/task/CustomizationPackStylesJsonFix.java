package com.t2k.cgs.dbupgrader.task;


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
import java.util.Arrays;
import java.util.List;

public class CustomizationPackStylesJsonFix extends CommonTask {

    private MigrationDao migrationDao;
    private Configuration configuration;

    private static Logger logger = Logger.getLogger(CustomizationPackStylesJsonFix.class);
    private List<String> LANGUAGES_TO_BE_MODIFIED = Arrays.asList("hebrew");
    private String hebrewLocale = "iw_IL";
    private String THEMING_KEY = "theming";
    private String INTERACTIVE_SEQUENCE_KEY = "interactive_sequence";
    private String PROGRESS_KEY = "progress";
    private String PROGRESS_FONT_KEY = "progress_font";
    JSONObject defaultProgressJson;
    JSONObject defaultInteractiveSequenceJson;
    JSONObject defaultThemingJson;

    private int changedCourses = 0;

    @Override
    protected void executeUpInternal() throws Exception {
        try {
            fixJsonsForHebrewCourses();
        } catch (Exception e) {
            printError(String.format("Failed, Exception: %s", e));
        }
    }

    public void fixJsonsForHebrewCourses() throws Exception {
        initJsonObjects();
        String cmsLocation = configuration.getProperty("cmsHome");
        File baseDir = new File(cmsLocation, "publishers");

        if (!baseDir.exists()) {
            printError(String.format("Could not find cms path: %s", cmsLocation));
            return;
        }

        DBCursor courses = migrationDao.getCoursesByCustomizationPackLanguages(LANGUAGES_TO_BE_MODIFIED);

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
        defaultProgressJson = new JSONObject().put(PROGRESS_FONT_KEY,"'Arial'");
        defaultInteractiveSequenceJson  =  new JSONObject().put(PROGRESS_KEY,defaultProgressJson);
        defaultThemingJson = new JSONObject().put(INTERACTIVE_SEQUENCE_KEY,defaultInteractiveSequenceJson);
        printDebug(String.format("Initializing default jsons for styles.json:\n themingJsonNode: %s", defaultThemingJson.toString()));
    }

    public void upgradeSpecificCourse(String courseId) throws IOException, JSONException {
        initJsonObjects();
        String cmsLocation = configuration.getProperty("cmsHome");
        File baseDir = new File(cmsLocation, "publishers");
        DBObject course = migrationDao.getCourseById(courseId);
        processCoursePack(course, baseDir);
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

            String name = (String) customizationPack.get("language");

            // if this is not a language that needs handling - return null
            if (!LANGUAGES_TO_BE_MODIFIED.contains(name)) {
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
                printError(String.format("Customization pack dir doesn't exist: %s", customizationPackDir.getPath()));
                return false;
            }

            File stylesJson = new File(customizationPackDir.getPath(), "dl/styles.json");
            if (!stylesJson.exists()) {
                printError(String.format("Customization pack file styles.json doesn't exist in path: %s", stylesJson.getPath()));
                return false;
            }

            JSONObject styles = new JSONObject(FileUtils.readFileToString(stylesJson));

            Boolean stylesChanged = false;
            if (styles.has(THEMING_KEY)) {
                JSONObject theming = styles.getJSONObject(THEMING_KEY);
                if (theming.has(INTERACTIVE_SEQUENCE_KEY)) {
                    JSONObject interactiveSeq = theming.getJSONObject(INTERACTIVE_SEQUENCE_KEY);
                    if (interactiveSeq.has(PROGRESS_KEY)) {
                        JSONObject progress = interactiveSeq.getJSONObject(PROGRESS_KEY);
                        if (!progress.has(PROGRESS_FONT_KEY)) {
                            progress.put(PROGRESS_FONT_KEY, "'Arial'");
                            interactiveSeq.put(PROGRESS_KEY, progress);
                            theming.put(INTERACTIVE_SEQUENCE_KEY, interactiveSeq);
                            styles.put(THEMING_KEY, theming);
                            stylesChanged = true;
                        } else {
                            // Do nothing - nothing to change, we will not override existing values.
                        }

                    } else { //no progress key
                        interactiveSeq.put(PROGRESS_KEY,defaultProgressJson);
                        theming.put(INTERACTIVE_SEQUENCE_KEY, interactiveSeq);
                        styles.put(THEMING_KEY, theming);
                        stylesChanged = true;
                    }
                } else { // no interactive_sequence
                    theming.put(INTERACTIVE_SEQUENCE_KEY, defaultInteractiveSequenceJson);
                    styles.put(THEMING_KEY, theming);
                    stylesChanged = true;
                }


            } else { // there is no "theming"
                styles.put(THEMING_KEY, defaultThemingJson);
                stylesChanged = true;
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
