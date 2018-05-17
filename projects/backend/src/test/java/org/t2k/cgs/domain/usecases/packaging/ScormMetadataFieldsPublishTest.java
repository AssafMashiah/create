package org.t2k.cgs.domain.usecases.packaging;

import com.t2k.common.utils.PublishModeEnum;
import org.apache.commons.io.FileUtils;
import org.custommonkey.xmlunit.Diff;
import org.custommonkey.xmlunit.XMLUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.util.ReflectionTestUtils;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.usecases.packaging.zippers.ScormManifestBuilder;
import org.t2k.cgs.domain.usecases.TestUtils;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;
import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 27/04/14
 * Time: 13:18
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
public class ScormMetadataFieldsPublishTest extends AbstractTestNGSpringContextTests {

    private final String SCORM_FILE_NAME = "imsmanifest.xml";
    private final String COURSE_FILE_NAME = "course.json";
    private final String LESSON_FILE_NAME = "lesson.json";
    private final String STANDARDS_PATH_NAME = "standards/";
    private final String EXPECTED_MANIFEST_FILE_NAME = "manifest.xml";

    @Autowired
    private ScormManifestBuilder scormManifestBuilder;

    @Autowired
    private TestUtils testUtils;

    Set<File> filesToDelete = new HashSet<>();

    @AfterMethod
    public void tearDownAfterEachTest() throws IOException {
        for (File f : filesToDelete) {
            if (f.exists()) {
                FileUtils.forceDelete(f);
            }
        }
    }

    @Test(dataProvider = "scormManifestTestCases")
    public void scormManifestBuilderTest(ScormManifestTestData testData) throws Exception {
        File tempFolder = new File(testUtils.getResourcePath(""), "scormManifestsTempTestFolder");
        filesToDelete.add(tempFolder);
        File expectedOutput = new File(testData.getExpectedScormManifestXmlFileName());
        String scormManifestFolderOutputPath = String.format("%s%s%s", tempFolder, File.separator, UUID.randomUUID().toString());
        FileUtils.forceMkdir(new File(scormManifestFolderOutputPath)); // creating temp directory if necessary

        File actualManifest = ReflectionTestUtils.invokeMethod(scormManifestBuilder, "buildScormManifestForLesson",
                testData.getCourseFileName(), testData.getLessonFileName(), testData.getStandardsPathName(),
                scormManifestFolderOutputPath, testData.getExtraDataAboutPackageForScorm(), new ArrayList<>());
        validateXMLsTheSame(actualManifest, expectedOutput);
    }

    // each line is a different test case
    @DataProvider(name = "scormManifestTestCases")
    public Object[][] scormManifestTestCases() throws Exception {
        String PUBLISHER_NAME = "publisher name";
        String BASE_PATH = "scormManifests/lesson";
        Calendar calendar = Calendar.getInstance();
        calendar.set(2014, Calendar.JANUARY, 1, 0, 0, 0);
        Date publishStartDate = calendar.getTime();
        return new Object[][]{
                {new ScormManifestTestData("Publish of a lesson without metadata & without learning time should put all automatic filled fields in xml", testUtils.getResourcePath(BASE_PATH + "/s12"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, LESSON_FILE_NAME, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(28567, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("Publish of a lesson with standards but without metadata should put all automatic filled fields in xml", testUtils.getResourcePath(BASE_PATH + "/s1"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, LESSON_FILE_NAME, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(28567, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("Publish of a lesson with standards from 2 standards packages, without extra MD should put all automatic filled fields in xml", testUtils.getResourcePath(BASE_PATH + "/s13"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, LESSON_FILE_NAME, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(28567, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("Publish with long string should put all string in XML", testUtils.getResourcePath(BASE_PATH + "/s2"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, LESSON_FILE_NAME, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(11, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("When a text field contains only spaces – perform \"trim\" and don't put this value into manifest XML", testUtils.getResourcePath(BASE_PATH + "/s3"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, LESSON_FILE_NAME, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(11, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("Publish should not insert bad types of data into xml – bad lesson duration format, bad locale format", testUtils.getResourcePath(BASE_PATH + "/s4"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, LESSON_FILE_NAME, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(11, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("Publish encodes special xml chars using xml 1.0 escaping protocol", testUtils.getResourcePath(BASE_PATH + "/s5"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, LESSON_FILE_NAME, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(28567, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("Publish uses utf-8 to encode multiple languages (Arabic, French, Hebrew, Portuguese, Korean)", testUtils.getResourcePath(BASE_PATH + "/s6"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, LESSON_FILE_NAME, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(28567, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("Publish with errors in scorm custom field names does not break", testUtils.getResourcePath(BASE_PATH + "/s7"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, LESSON_FILE_NAME, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(28567, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("Lesson metadata parameters are taken into xml", testUtils.getResourcePath(BASE_PATH + "/s8"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, LESSON_FILE_NAME, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(28567, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("Course level metadata is taken to scorm", testUtils.getResourcePath(BASE_PATH + "/s9"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, LESSON_FILE_NAME, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(28567, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("When there is a conflict between course and lesson metadata, lesson data is published to xml", testUtils.getResourcePath(BASE_PATH + "/s10"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, LESSON_FILE_NAME, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(28567, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))},
                {new ScormManifestTestData("Lesson's vCard overrides course vCard MD field and publishes to xml", testUtils.getResourcePath(BASE_PATH + "/s11"), EXPECTED_MANIFEST_FILE_NAME, COURSE_FILE_NAME, LESSON_FILE_NAME, STANDARDS_PATH_NAME, new ExtraDataAboutPackageForScorm(11, PublishModeEnum.PRODUCTION, publishStartDate, PUBLISHER_NAME))}
        };
    }

    public void validateXMLsTheSame(File actualOutputXml, File expectedOutputXml) throws IOException, ParserConfigurationException, SAXException, TransformerException {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setNamespaceAware(true);
        dbf.setCoalescing(true);
        dbf.setIgnoringElementContentWhitespace(true);
        dbf.setIgnoringComments(true);

        DocumentBuilder db = dbf.newDocumentBuilder();

        // transform both xmls (expected output & actual output) to their canonical form so we could compare theme easily
        Document actualOutputXmlDoc = db.parse(actualOutputXml);
        actualOutputXmlDoc.normalizeDocument();

        Document expectedOutputXmlDoc = db.parse(expectedOutputXml);
        expectedOutputXmlDoc.normalizeDocument();

        XMLUnit.setIgnoreComments(true);
        XMLUnit.setIgnoreWhitespace(true);
        XMLUnit.setIgnoreDiffBetweenTextAndCDATA(true);
        Diff myDiff = new Diff(expectedOutputXmlDoc, actualOutputXmlDoc);
        boolean areSimilar = myDiff.similar();
        Assert.assertTrue(areSimilar, String.format("The expected manifest output is different then actual.\nDifferences: %s\nExpected: %s\nActual: %s", myDiff,expectedOutputXml,actualOutputXmlDoc.getFirstChild()));
    }
}