package org.t2k.packaging;

import com.t2k.common.utils.PublishModeEnum;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.util.ReflectionTestUtils;
import org.t2k.cgs.Application;
import org.t2k.cgs.model.packaging.ExtraDataAboutPackageForScorm;
import org.t2k.cgs.packaging.ScormManifestBuilder;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeSuite;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * Created by IntelliJ IDEA.
 * User: Elad.Avidan
 * Date: 04/02/2015
 * Time: 15:02
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class ScormManifestBuilderForCourseTest extends AbstractTestNGSpringContextTests {

    private final String BASE_PATH = "scormManifests/course";
    private final String PUBLISHER_NAME = "publisher name";
    private final String SCORM_FILE_NAME = "imsmanifest.xml";
    private final String COURSE_FILE_NAME = "course.json";
    private final String STANDARDS_PATH_NAME = "standards/";
    private final String EXPECTED_MANIFEST_FILE_NAME = "manifest.xml";

    @Autowired
    private ScormManifestBuilder scormManifestBuilder;

    @Autowired
    private TestUtils testUtils;

    private Set<File> filesToDelete = new HashSet<>();
    private Date publishStartDate;

    @BeforeSuite
    public void init() {
        Calendar calendar = Calendar.getInstance();
        calendar.set(2014, Calendar.JANUARY, 1, 0, 0, 0);
        this.publishStartDate = calendar.getTime();
    }

    @AfterMethod
    public void tearDownAfterEachTest() throws IOException {
        for (File f : filesToDelete) {
            if (f.exists()) {
                FileUtils.forceDelete(f);
            }
        }
    }

    @Test(dataProvider = "scormManifestSuccessfulTestCases")
    public void scormManifestSuccessfulTestCases(ScormManifestTestData testData) throws Exception {
        File expectedOutput = new File(testData.getExpectedScormManifestXmlFileName());
        String scormManifestFileOutputPath = getScormManifestFileOutputPath();

        File actualManifest = ReflectionTestUtils.invokeMethod(scormManifestBuilder, "buildScormManifestForCourse",
                testData.getCourseFileName(), testData.getStandardsPathName(), scormManifestFileOutputPath,
                testData.getExtraDataAboutPackageForScorm(),
                new ArrayList<>());
        testUtils.validateXMLsTheSame(actualManifest, expectedOutput);
    }

    @Test(dataProvider = "scormManifestFailureTestCases")
    public void scormManifestFailureTestCases(ScormManifestTestData testData) throws Exception {
        File expectedOutput = new File(testData.getExpectedScormManifestXmlFileName());
        String scormManifestFileOutputPath = getScormManifestFileOutputPath();
        try {
            File actualManifest = ReflectionTestUtils.invokeMethod(scormManifestBuilder, "buildScormManifestForCourse",
                    testData.getCourseFileName(), testData.getStandardsPathName(), scormManifestFileOutputPath,
                    testData.getExtraDataAboutPackageForScorm(),
                    new ArrayList<>());
            testUtils.validateXMLsTheSame(actualManifest, expectedOutput);
        } catch (Exception e) {
            Assert.assertTrue(e.getCause().getMessage().contains("One of '{\"http://www.imsglobal.org/xsd/imscp_v1p1\":item}' is expected."));
        }
    }

    private String getScormManifestFileOutputPath() throws Exception {
        File tempFolder = new File(testUtils.getResourcePath(""), "scormManifestsTempTestFolder");
        tempFolder.mkdirs();
        filesToDelete.add(tempFolder);
        return tempFolder.getPath();
    }

    // each line is a different test case
    @DataProvider(name = "scormManifestSuccessfulTestCases")
    public Object[][] scormManifestTestCases() throws Exception {
        return new Object[][]{
                {new ScormManifestTestData("Publish of a course with 1 lesson", testUtils.getResourcePath(BASE_PATH + "/s3"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, null, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(28567, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("Publish of a course with several levels, lessons, assessments, hidden lessons and standards", testUtils.getResourcePath(BASE_PATH + "/s4"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, null, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(28567, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))}
        };
    }

    // each line is a different test case
    @DataProvider(name = "scormManifestFailureTestCases")
    public Object[][] scormManifestFailureTestCases() throws Exception {
        return new Object[][]{
                {new ScormManifestTestData("Publish of an empty course", testUtils.getResourcePath(BASE_PATH + "/s1"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, null, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(28567, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("Publish of an empty course with standards only", testUtils.getResourcePath(BASE_PATH + "/s2"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, null, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(28567, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))}
        };
    }
}