package org.t2k.cgs.domain.usecases.packaging;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 03/12/14
 * Time: 18:22
 */

public class ScormManifestTestData {

    private final String testName;
    private final String expectedScormManifestXmlFileName;
    private final String basePath;
    private final String courseFileName;
    private final String lessonFileName;
    private final String standardsPathName;

    private final ExtraDataAboutPackageForScorm extraDataAboutPackageForScorm;

    public ScormManifestTestData(String testName, String basePath, String expectedScormManifestXmlFileName, String courseFileName, String lessonFileName, String standardsPathName, ExtraDataAboutPackageForScorm extraDataAboutPackageForScorm) {
        this.testName = testName;
        this.expectedScormManifestXmlFileName = String.format("%s/%s", basePath, expectedScormManifestXmlFileName);
        this.basePath = basePath;
        this.courseFileName = String.format("%s/%s", basePath, courseFileName);
        this.lessonFileName = String.format("%s/%s", basePath, lessonFileName);
        this.standardsPathName = String.format("%s/%s", basePath, standardsPathName);
        this.extraDataAboutPackageForScorm = extraDataAboutPackageForScorm;
    }

    private String getTestName() {
        return testName;
    }

    public String getExpectedScormManifestXmlFileName() {
        return expectedScormManifestXmlFileName;
    }

    public ExtraDataAboutPackageForScorm getExtraDataAboutPackageForScorm() {
        return extraDataAboutPackageForScorm;
    }

    private String getBasePath() {
        return basePath;
    }

    public String getCourseFileName() {
        return courseFileName;
    }

    public String getLessonFileName() {
        return lessonFileName;
    }

    public String getStandardsPathName() {
        return standardsPathName;
    }

    @Override
    public String toString() {
        return testName;
    }
}
