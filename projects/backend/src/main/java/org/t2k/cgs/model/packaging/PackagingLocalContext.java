package org.t2k.cgs.model.packaging;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 06/12/12
 * Time: 17:00
 */
public class PackagingLocalContext {

    public static final String SEQUENCE_PATH_ELEMENT = "sequences/";
    public static final String LESSON_PATH_ELEMENT = "lessons/";
    public static final String ASSESSMENT_PATH_ELEMENT = "assessments/";
    public static final String APPLET_PATH_ELEMENT = "applets/";
    public static final String MEDIA_PATH_ELEMENT = "media/";
    public static final String EBOOK_PATH_ELEMENT = "ebooks/";
    private static final String LESSONS_TEXT_PATH_ELEMENT = "text/";

    private String basePath;

    public PackagingLocalContext(String basePath) {
        this.basePath = basePath;
    }

    public String getBasePath() {
        return basePath;
    }

    public String getLessonsPath() {
        return basePath + "/" + LESSON_PATH_ELEMENT;
    }

    public String getAssessmentsPath() {
        return basePath + "/" + ASSESSMENT_PATH_ELEMENT;
    }

    public String getSequencesPath() {
        return basePath + "/" + SEQUENCE_PATH_ELEMENT;
    }

    public String getAppletPath() {
        return basePath + "/" + APPLET_PATH_ELEMENT;
    }

    public String getMediaPath() {
        return basePath + "/" + MEDIA_PATH_ELEMENT;
    }

    public String getEBooksPath() {
        return basePath + "/" + EBOOK_PATH_ELEMENT;
	}

    public String getLessonsTextPath() { return basePath + "/" + LESSONS_TEXT_PATH_ELEMENT; }
    @Override
    public String toString() {
        return "PackagingLocalContext{" +
                "basePath='" + basePath + '\'' +
                '}';
    }
}
