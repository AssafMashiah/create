package org.t2k.cgs.domain.usecases.exportimport;

/**
 * Created by IntelliJ IDEA.
 * User: efrat.gur
 * Date: 16/10/13
 * Time: 13:03
 */
public class ExportImportLocalContext {

    public static final String SEQUENCE_PATH_ELEMENT = "sequences/";
    public static final String LESSON_PATH_ELEMENT = "lessons/";
    public static final String ASSESSMENT_PATH_ELEMENT = "assessments/";
    public static final String MEDIA_PATH_ELEMENT = "media/";
    public static final String COURSE_PATH_ELEMENT = "course/";
    public static final String APPLETS_PATH_ELEMENT = "applets/";
    public static final String STANDARDS_PATH_ELEMENT = "standards/";
    public static final String EBOOKS_PATH_ELEMENT = "ebooks/";
    public static final String DB = "DB/";

    private String basePath;

    public ExportImportLocalContext(String basePath) {
        this.basePath = basePath;
    }

    public String getBasePath() {
        return basePath;
    }

    public String getAppletsPath() {
           return getDbPathForItem(APPLETS_PATH_ELEMENT);
    }

    public String getCoursePath() {
           return getDbPathForItem(COURSE_PATH_ELEMENT);
    }

    public String getStandardsPath() {
           return getDbPathForItem(STANDARDS_PATH_ELEMENT);
    }

    public String getLessonsPath() {
        return getDbPathForItem(LESSON_PATH_ELEMENT);
    }

    public String getAssessmentsPath() {
        return getDbPathForItem(ASSESSMENT_PATH_ELEMENT);
    }

    public String getSequencesPath() {
        return getDbPathForItem(SEQUENCE_PATH_ELEMENT);
    }

    public String getEBooksPath() {
        return getDbPathForItem(EBOOKS_PATH_ELEMENT);
    }

    private String getDbPathForItem(String item) {
        return String.format("%s/%s/%s", basePath, DB, item);
    }
}