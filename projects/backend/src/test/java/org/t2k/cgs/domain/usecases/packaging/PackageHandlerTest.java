package org.t2k.cgs.domain.usecases.packaging;

import atg.taglib.json.util.JSONException;
import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.t2k.common.utils.PublishModeEnum;
import com.t2k.configurations.Configuration;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.params.HttpClientParams;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.time.StopWatch;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ArrayNode;
import org.codehaus.jackson.node.ObjectNode;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.course.Course;
import org.t2k.cgs.domain.model.course.CourseCGSObject;
import org.t2k.cgs.domain.model.course.CoursesDao;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.sequence.SequencesDao;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.model.tocItem.TocItemDao;
import org.t2k.cgs.domain.model.tocItem.TocItemIndicationForScorm;
import org.t2k.cgs.domain.model.user.CGSUserDetails;
import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.domain.usecases.ImportCourseData;
import org.t2k.cgs.domain.usecases.TestUtils;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.usecases.packaging.zippers.ScormPackageZipper;
import org.t2k.cgs.domain.usecases.publisher.PublishError;
import org.t2k.cgs.domain.usecases.publisher.PublishErrors;
import org.t2k.cgs.domain.usecases.tocitem.TocItemsManager;
import org.t2k.cgs.domain.usecases.user.UserService;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.service.packaging.PackageHandlerImpl;
import org.t2k.cgs.service.packaging.PackageManagerImpl;
import org.t2k.cgs.service.packaging.PackageResourceHandlerImpl;
import org.t2k.cgs.service.packaging.uploaders.BlossomUploader;
import org.t2k.cgs.service.packaging.uploaders.CatalogueUploader;
import org.t2k.cgs.service.packaging.uploaders.UrlServerUploader;
import org.t2k.sample.dao.exceptions.DaoException;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import static org.mockito.Matchers.any;
import static org.mockito.Mockito.when;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 27/04/14
 * Time: 13:18
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
public class PackageHandlerTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private PackageManagerImpl packageManager;

    @Autowired
    private CatalogueUploader catalogueUploader;

    @Autowired
    private BlossomUploader blossomUploader;

    @Autowired
    private UrlServerUploader urlServerUploader;

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private CoursesDao coursesDao;

    @Autowired
    private TocItemDao lessonsDao;

    @Autowired
    private TocItemDao assessmentsDao;

    @Autowired
    private SequencesDao sequencesDao;

    @Autowired
    private TestUtils testUtils;

    @Autowired
    private CourseDataService courseDataService;

    @Autowired
    private Configuration configuration;

    @Autowired
    private ScormPackageZipper scormPackageZipper;

    @Autowired
    private TocItemsManager tocItemsManager;

    @Autowired
    private PackageHandler packageHandler;

    private final String description = "description";
    private final String releaseNotes = "release note";
    private final String coursesResource = "courses";
    private final String uploadFilesResource = "uploadFiles";
    private final String BACKGROUND_IMAGE = "background-image";
    private CGSUserDetails cgsUserDetails = null; // Have to be initialized in setup() or else it throws exception.
    private CGSUserDetails cgsUserWithBlossomIds = null;
    private HashMap<String, ImportCourseData> importedCourses = new HashMap<>();
    private String courseVersionBeforePublish;

    private String coursesFolder;
    private String uploadFilesFolder;
    private ObjectMapper mapper = new ObjectMapper();

    @Mock
    private HttpClient gcrMockHttpClient;

    @Mock
    private HttpClient blossomMockHttpClientWith200Response;

    @Mock
    private HttpClient blossomMockHttpClientWith401Response;

    @Autowired
    private UserService userService;

    private List<SimpleCgsUserDetails> usersAddedByTests = new ArrayList<>();

    @BeforeClass
    public void classSetup() throws Exception {
        ClassLoader classLoader = this.getClass().getClassLoader();
        URL coursesPath = classLoader.getResource(coursesResource);
        URL uploadFilesPath = classLoader.getResource(uploadFilesResource);
        if (coursesPath == null) {
            throw new Exception(String.format("Courses directory %s does not exist.", coursesPath));
        }
        if (uploadFilesPath == null) {
            throw new Exception(String.format("uploadfiles directory %s does not exist.", uploadFilesPath));
        }
        coursesFolder = new File(coursesPath.getPath()).getAbsolutePath() + File.separator;
        uploadFilesFolder = new File(uploadFilesPath.getPath()).getAbsolutePath();
    }

    @BeforeMethod
    private void setup() throws Exception {
        cgsUserDetails = testUtils.createMockUser();
        cgsUserWithBlossomIds = testUtils.createMockUserWithBlossomIds();
        packageManager.setAsyncMode(false);
        MockitoAnnotations.initMocks(this);
        when(gcrMockHttpClient.executeMethod((HttpMethod) any())).thenReturn(200); // always return a 200 status - OK.

        SimpleCgsUserDetails simpleCgsUserDetails = new SimpleCgsUserDetails(cgsUserWithBlossomIds);
        simpleCgsUserDetails.setExternalId("external-mock-id");
        simpleCgsUserDetails = userService.add(simpleCgsUserDetails, simpleCgsUserDetails.getRole().getId(), true);
        usersAddedByTests.add(simpleCgsUserDetails);

        final SimpleCgsUserDetails finalSimpleCgsUserDetails = simpleCgsUserDetails;

        when(blossomMockHttpClientWith200Response.executeMethod((HttpMethod) any())).thenAnswer(new Answer<Integer>() {
            @Override
            public Integer answer(InvocationOnMock invocation) throws Throwable {
                Object[] arguments = invocation.getArguments();
                if (arguments != null && arguments.length > 0 && arguments[0] != null) {
                    HttpMethod method = (HttpMethod) arguments[0];
                    method.setRequestHeader("Authorization", "Authorization_token");
                    String blossomUrlWithIp = blossomUploader.getBlossomAddressWithIpInsteadOfDomainName(userService.getBlossomUrl(finalSimpleCgsUserDetails));
                    if (method.getURI().getURI().contains(blossomUrlWithIp)) {
                        return 200;
                    }
                }
                return 500;
            }
        });
        when(blossomMockHttpClientWith200Response.getParams()).thenReturn(new HttpClientParams());
        when(blossomMockHttpClientWith401Response.executeMethod((HttpMethod) any())).thenReturn(401);
        catalogueUploader.setDefaultHttpClient(gcrMockHttpClient);
        // setting catalog uploader to work with a mock httpclient object - dont send request to catalog, but mock it
    }

    @AfterMethod
    private void finishTest() throws IOException, DsException {
        courseVersionBeforePublish = null;
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        for (ImportCourseData importCourseData : importedCourses.values()) {
            testUtils.removeAllResourcesFromImportCourse(importCourseData);
        }
        logger.debug("stopwatch testutils.removeAllResourcesFromImportCourse :" + stopWatch.getTime());
        stopWatch.reset();
        stopWatch.start();
        for (SimpleCgsUserDetails user : usersAddedByTests) {
            userService.delete(user.getUserId());
        }
        logger.debug("stopwatch userService.delete :" + stopWatch.getTime());
        stopWatch.reset();
        stopWatch.start();
    }

    private CoursePackageParams importCourse(String courseFileRelativePath, PublishTarget publishTarget,
                                             PublishModeEnum publishMode) throws Exception {
        ImportCourseData importCourseData = testUtils.importCourseFromFile(courseFileRelativePath);
        int publisherId = importCourseData.getPublisherId();
        String courseId = importCourseData.getCourseId();
        importedCourses.put(courseId, importCourseData);
        Course course = coursesDao.getCourse(publisherId, courseId);
        courseVersionBeforePublish = course.getContentData().getVersion();

        List<String> selectedIds = new ArrayList<>();
        List<String> excludeIds = new ArrayList<>();
        getExcludedAndSelectedTocItemsIds(publisherId, courseId, selectedIds, excludeIds);

        return new CoursePackageParams(publisherId, courseId, publishTarget, publishMode, description, releaseNotes, selectedIds, excludeIds);
    }

    private CGSPackage publishCourse(CoursePackageParams params) throws Exception {
        return publishCourse(params, cgsUserDetails);
    }

    private CGSPackage publishCourse(CoursePackageParams params, CGSUserDetails publishingUser) throws Exception {
        CGSPackage cgsPackage = packageManager.createPackageAndAddToPendingQueue(params.getPublisherId(), params, publishingUser);
        importedCourses.get(params.getCourseId()).setPackId(cgsPackage.getPackId());

        List<TocItemIndicationForScorm> tocItemsWithHiddenIndication = new ArrayList<>();
        if (params.getSelectedList() != null && !params.getSelectedList().isEmpty()) {
            tocItemsWithHiddenIndication = tocItemsManager.getTocItemsWithHiddenIndication(params.getCourseId(), params.getSelectedList());
        }

        cgsPackage.setScormSelectedTocItems(tocItemsWithHiddenIndication);
        cgsPackage.setScormExcludeTocItemsIds(params.getExcludeList());
        PackageHandler packageHandler = (PackageHandler) applicationContext.getBean("packageHandler");
        packageHandler.init(cgsPackage);

        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        packageHandler.packageCourse(); //create zip and finish packing
        logger.debug("stopwatch packageHandler.packageCourse :" + stopWatch.getTime());
        stopWatch.reset();
        stopWatch.start();
        importedCourses.get(params.getCourseId()).setPackIdWithVersion(cgsPackage.getPackId().replace(CGSPackage.VERSION_TOKEN, cgsPackage.getVersion().replace('.', '-')));
        logger.debug("stopwatch importedCourses.get :" + stopWatch.getTime());
        stopWatch.reset();
        stopWatch.start();
        String versionAfterPublish = cgsPackage.getVersion();

        if (params.getTarget() == PublishTarget.COURSE_TO_CATALOG || params.getTarget() == PublishTarget.COURSE_TO_FILE) {
            Assert.assertNotEquals(courseVersionBeforePublish, versionAfterPublish, "Version should be increased after publish");
        } else {
            Assert.assertEquals(courseVersionBeforePublish, versionAfterPublish, "Version should remain the same after publish");
        }

        return cgsPackage;
    }

    private void assertZipFileExistAndDelete(CGSPackage cgsPackage) throws IOException {
        String basePath = cgsPackage.getPackageOutputLocation();
        if (basePath != null) {
            File cgsFile = new File(basePath);
            basePath = basePath.replace(cgsFile.getName(), "");
            String zippedFileName = cgsFile.getName().replace("cgs", "scorm.zip");
            basePath = String.format("%sdownload/%s", basePath, zippedFileName);
            File zippedFile = new File(basePath);
            Assert.assertTrue(zippedFile.exists());

            FileUtils.forceDelete(zippedFile);
        }
    }

    @Test
    public void simpleLessonScormPublish() throws Exception {
        // creating a folder for the scp player. We need this because the build machine doesn’t run install – so the folder does not exist after build.
        // Therefore we need to create it by test.
        File scpZipLocation = new File(scormPackageZipper.getScpLocation());
        boolean creationSucceed;
        if (!scpZipLocation.exists()) {
            creationSucceed = scpZipLocation.mkdirs();
            if (!creationSucceed) {
                throw new Exception(String.format("Could not create the folder for scp player in %s", scpZipLocation.getAbsoluteFile()));
            }
        }

        String source = String.format("%scourseWithHiddenLessonAndAppletThatHaveBundles.cgscrs", coursesFolder);
        CoursePackageParams params = importCourse(source, PublishTarget.LESSON_TO_FILE, PublishModeEnum.PRE_PRODUCTION);
        CGSPackage cgsPackage = publishCourse(params);

        testUtils.runBaseSuccessfulPublishValidation(cgsPackage);
    }

    @Test(enabled = false)
    public void simpleCourseScormToUrlServerSuccess() throws Exception {
        blossomUploader.setDefaultHttpClient(blossomMockHttpClientWith200Response); // put the mock httpClient to mock blossom's sever that returns an OK response

        // creating a folder for the scp player. We need this because the build machine doesn’t run install – so the folder does not exist after build.
        // Therefore we need to create it by test.
        File scpZipLocation = new File(scormPackageZipper.getScpLocation());
        boolean creationSucceed;
        if (!scpZipLocation.exists()) {
            creationSucceed = scpZipLocation.mkdirs();
            if (!creationSucceed) {
                throw new Exception(String.format("Could not create the folder for scp player in %s", scpZipLocation.getAbsoluteFile()));
            }
        }

        String source = String.format("%scourseWithHiddenLessonAndAppletThatHaveBundles.cgscrs", coursesFolder);
        CoursePackageParams params = importCourse(source, PublishTarget.COURSE_TO_URL, PublishModeEnum.PRE_PRODUCTION);
        CGSPackage cgsPackage = publishCourse(params, cgsUserWithBlossomIds);
//        Assert.assertEquals(cgsPackage.getCatalogName(), CatalogName.BLOSSOM);

        testUtils.runBaseSuccessfulPublishValidation(cgsPackage);
    }


    @Test
    public void simpleCourseScormToBlossomPublishSuccess() throws Exception {
        blossomUploader.setDefaultHttpClient(blossomMockHttpClientWith200Response); // put the mock httpClient to mock blossom's sever that returns an OK response

        // creating a folder for the scp player. We need this because the build machine doesn’t run install – so the folder does not exist after build.
        // Therefore we need to create it by test.
        File scpZipLocation = new File(scormPackageZipper.getScpLocation());
        boolean creationSucceed;
        if (!scpZipLocation.exists()) {
            creationSucceed = scpZipLocation.mkdirs();
            if (!creationSucceed) {
                throw new Exception(String.format("Could not create the folder for scp player in %s", scpZipLocation.getAbsoluteFile()));
            }
        }

        String source = String.format("%scourseWithHiddenLessonAndAppletThatHaveBundles.cgscrs", coursesFolder);
        CoursePackageParams params = importCourse(source, PublishTarget.COURSE_TO_CATALOG, PublishModeEnum.PRE_PRODUCTION);
        CGSPackage cgsPackage = publishCourse(params, cgsUserWithBlossomIds);
        Assert.assertEquals(cgsPackage.getCatalogName(), CatalogName.BLOSSOM);

        testUtils.runBaseSuccessfulPublishValidation(cgsPackage);
    }

    @Test
    public void simpleCourseScormToBlossomAuthenticationFailure() throws Exception {
        blossomUploader.setDefaultHttpClient(blossomMockHttpClientWith401Response); // put the mock httpClient to mock blossom's sever that returns 401 response - unauthorized user

        // creating a folder for the scp player. We need this because the build machine doesn’t run install – so the folder does not exist after build.
        // Therefore we need to create it by test.
        File scpZipLocation = new File(scormPackageZipper.getScpLocation());
        boolean creationSucceed;
        if (!scpZipLocation.exists()) {
            creationSucceed = scpZipLocation.mkdirs();
            if (!creationSucceed) {
                throw new Exception(String.format("Could not create the folder for scp player in %s", scpZipLocation.getAbsoluteFile()));
            }
        }

        String source = String.format("%scourseWithHiddenLessonAndAppletThatHaveBundles.cgscrs", coursesFolder);
        CoursePackageParams params = importCourse(source, PublishTarget.COURSE_TO_CATALOG, PublishModeEnum.PRE_PRODUCTION);

        CGSPackage cgsPackage = publishCourse(params, cgsUserWithBlossomIds);
        Assert.assertEquals(cgsPackage.getCatalogName(), CatalogName.BLOSSOM);
        Assert.assertTrue(errorsContainsMessage(cgsPackage.getErrors(), "Server's response status 401"));
        Assert.assertEquals(cgsPackage.getPackagePhase(), PackagePhase.FAILED);
    }

    @Test
    public void simpleCataloguePublish() throws Exception {
        String source = String.format("%scourseWithHiddenLessonAndAppletThatHaveBundles.cgscrs", coursesFolder);
        CoursePackageParams params = importCourse(source, PublishTarget.COURSE_TO_CATALOG, PublishModeEnum.PRE_PRODUCTION);
        CGSPackage cgsPackage = publishCourse(params);
        testUtils.runBaseSuccessfulPublishValidation(cgsPackage);
    }

    @Test(dataProvider = "standAloneSuccessfulTestCases")
    public void publishToStandAlone(PublishTestData publishTestData) throws Exception {
        String source = publishTestData.getCoursePath();
        logger.info(String.format("Course path is is: %s", source));
        CoursePackageParams params = importCourse(source, PublishTarget.COURSE_TO_FILE, PublishModeEnum.PRE_PRODUCTION);
        CGSPackage cgsPackage = publishCourse(params);
        testUtils.runBaseSuccessfulPublishValidation(cgsPackage);
        assertZipFileExistAndDelete(cgsPackage);
    }

    @DataProvider(name = "standAloneSuccessfulTestCases")
    public Object[][] standAloneSuccessfulTestCases() throws JSONException {
        return new Object[][]{
                {new PublishTestData("CourseWithStandardTags", String.format("%scourse_with_tags_in_all_levels.cgscrs", coursesFolder))},
                {new PublishTestData("SmallCourse", String.format("%ssmallCourseWithLessonAndQuiz.cgscrs", coursesFolder))},
                {new PublishTestData("CourseWithCgsDataFile", String.format("%scourseWithCgsDataFile.cgscrs", coursesFolder))},
                {new PublishTestData("LargeCourse", String.format("%slargeCourse.cgscrs", coursesFolder))},
                {new PublishTestData("CourseWithEmptyLessons", String.format("%scourseWithEmptyLessons.cgscrs", coursesFolder))},
                {new PublishTestData("CourseWithLessonsAndAssessmentWithEmptySequencesToStandAlone", String.format("%scourseWithLessonsAndAssessmentWithEmptySequences.cgscrs", coursesFolder))},
                {new PublishTestData("CourseWithInvalidSequences", String.format("%scourseWithInvalidSequences.cgscrs", coursesFolder))},
                {new PublishTestData("CourseWithAppletWithNoBundles", String.format("%scourseWithAppletWithNoBundles.cgscrs", coursesFolder))},
                {new PublishTestData("CourseWithMediaFiles", String.format("%scourseWithMediaFiles.cgscrs", coursesFolder))},
                {new PublishTestData("eBookCourseWithBlankPages", String.format("%seBookCourse_virtualPagesAndOverlay.cgscrs", coursesFolder))}

        };
    }

    @Test(dataProvider = "coursesWithoutLessons")
    public void standAlonePublishOfEmptyCourse(String source) throws Exception {
        CoursePackageParams params = importCourse(source, PublishTarget.COURSE_TO_FILE, PublishModeEnum.PRE_PRODUCTION);
        CGSPackage cgsPackage = publishCourse(params);
        List<PublishError> errors = cgsPackage.getErrors();

        Assert.assertEquals(cgsPackage.getPackagePhase(), PackagePhase.FAILED);
        Assert.assertEquals(cgsPackage.getErrors().size(), 1, String.format("Wrong number of errors. Actual errors: %s", Arrays.toString(cgsPackage.getErrors().toArray())));
        Assert.assertTrue(errorsContainsMessage(errors, "Cannot publish a course with no lessons or assessments."));
        Assert.assertTrue(testUtils.areTransactionAndLockReleased(cgsPackage.getCourseId()), "Transaction or lock are not released after publish ended");
    }

    @DataProvider(name = "coursesWithoutLessons")
    public Object[][] coursesWithoutLessons() {
        return new Object[][]{
                {String.format("%semptyCourse.cgscrs", coursesFolder)},
                {String.format("%scourse_with_tocs_and_no_lessons.cgscrs", coursesFolder)}
        };
    }

    @Test
    public void standAlonePublishWithMissingCourseAsset() throws Exception {
        String source = String.format("%scourseWithHiddenLessonAndAppletThatHaveBundles.cgscrs", coursesFolder);
        CoursePackageParams params = importCourse(source, PublishTarget.COURSE_TO_FILE, PublishModeEnum.PRE_PRODUCTION);

        String courseMediaFile = null;
        CourseCGSObject course = coursesDao.getCourse(params.getPublisherId(), params.getCourseId(), null, false);
        for (Object resource : (BasicDBList) course.getContentData().get("resources")) {
            if (((DBObject) resource).get("type").toString().equals("media")) {
                courseMediaFile = ((DBObject) resource).get("href").toString();
                break;
            }
        }

        // Remove an asset from "media" folder
        String courseMediaFileLocation = String.format("%s/publishers/%s/courses/%s/%s", configuration.getProperty("cmsHome"), params.getPublisherId(), params.getCourseId(), courseMediaFile);
        File fileToDelete = new File(courseMediaFileLocation);
        boolean deleteSucceed = FileUtils.deleteQuietly(fileToDelete);
        if (!deleteSucceed) {
            throw new Exception(String.format("Could not delete file: %s", fileToDelete));
        }
        CGSPackage cgsPackage = publishCourse(params);

        List<PublishError> errors = cgsPackage.getErrors();
        logger.debug(String.format("fileToDelete - %s, Errors: %s", fileToDelete, Arrays.toString(cgsPackage.getErrors().toArray())));

        Assert.assertEquals(cgsPackage.getPackagePhase(), PackagePhase.FAILED);
        Assert.assertEquals(cgsPackage.getErrors().size(), 2, String.format("Wrong number of errors. Actual errors: %s", Arrays.toString(cgsPackage.getErrors().toArray())));
        Assert.assertTrue(errorsContainsMessage(errors, "Asset is missing at path: media"));
        Assert.assertTrue(errorsContainsErrorWithSpecificType(errors, PublishErrors.MissingAssetReference));
        Assert.assertTrue(errorsContainsMissingId(errors, cgsPackage.getCourseId()));
        Assert.assertTrue(errorsContainsMessage(errors, String.format(PackageResourceHandlerImpl.COURSE_MISSING_RESOURCE_TEMPLATE, cgsPackage.getCourseTitle(), cgsPackage.getCourseId())));
        Assert.assertTrue(testUtils.areTransactionAndLockReleased(cgsPackage.getCourseId()), "Transaction or lock are not released after publish ended");
    }

    private boolean errorsContainsErrorWithSpecificType(List<PublishError> errors, PublishErrors publishError) {
        for (PublishError error : errors) {
            if (error.getPublishError() != null && error.getPublishError() == publishError)
                return true;
        }

        return false;
    }

    private boolean errorsContainsMissingId(List<PublishError> errors, String entityID) {
        for (PublishError error : errors) {
            if (error.getResourceId() != null && error.getResourceId().contains(entityID))
                return true;
        }

        logger.error(String.format("Package errors doesnt contain error with entity id: %s.\nAll errors: %s", entityID, Arrays.toString(errors.toArray())));
        return false;
    }

    private boolean errorsContainsMessage(List<PublishError> errors, String errorMessage) {
        for (PublishError error : errors) {
            if (error.getMessage() != null && error.getMessage().contains(errorMessage))
                return true;
        }

        return false;
    }

    @Test
    public void standAlonePublishWithMissingSequenceInDb() throws Exception {
        String source = String.format("%scourseWithHiddenLessonAndAppletThatHaveBundles.cgscrs", coursesFolder);
        CoursePackageParams params = importCourse(source, PublishTarget.COURSE_TO_FILE, PublishModeEnum.PRE_PRODUCTION);

        // Remove a sequence from the DB
        List<TocItemCGSObject> lessons = lessonsDao.getByCourse(params.getPublisherId(), params.getCourseId(), false);
        String lessonId = lessons.get(0).getContentId();
        String seqId = lessons.get(0).getSequences().get(0).get("cid").toString();
        sequencesDao.deleteSequence(seqId, lessonId, params.getCourseId());

        CGSPackage cgsPackage = publishCourse(params);

        Assert.assertEquals(cgsPackage.getPackagePhase(), PackagePhase.FAILED);
        Assert.assertEquals(cgsPackage.getErrors().size(), 2, "Wrong number of errors. Actual errors: " + Arrays.toString(cgsPackage.getErrors().toArray()));
        Assert.assertTrue(cgsPackage.getErrors().get(0).getMessage().contains(String.format("Missing sequence was found in course %s, courseId: %s", cgsPackage.getCourseTitle(), cgsPackage.getCourseId())));
        Assert.assertEquals(cgsPackage.getErrors().get(0).getPublishError(), PublishErrors.MissingSequenceReference);
        Assert.assertEquals(cgsPackage.getErrors().get(0).getResourceId(), seqId);
        Assert.assertTrue(errorsContainsMessage(cgsPackage.getErrors(), String.format(PackageResourceHandlerImpl.COURSE_MISSING_RESOURCE_TEMPLATE, cgsPackage.getCourseTitle(), cgsPackage.getCourseId())));
        Assert.assertTrue(testUtils.areTransactionAndLockReleased(cgsPackage.getCourseId()), "Transaction or lock are not released after publish ended");
    }

    @Test
    public void standAlonePublishWithMissingCustomizationPack() throws Exception {
        String source = String.format("%scourseWithHiddenLessonAndAppletThatHaveBundles.cgscrs", coursesFolder);
        CoursePackageParams params = importCourse(source, PublishTarget.COURSE_TO_FILE, PublishModeEnum.PRE_PRODUCTION);

        // Remove the customizationPack from course
        String courseMediaFolderLocation = String.format("%s/publishers/%s/courses/%s/customizationPack", configuration.getProperty("cmsHome"), params.getPublisherId(), params.getCourseId());
        File courseMediaFolder = new File(courseMediaFolderLocation);
        FileUtils.deleteDirectory(courseMediaFolder);

        CGSPackage cgsPackage = publishCourse(params);

        Assert.assertEquals(cgsPackage.getPackagePhase(), PackagePhase.FAILED);
        Assert.assertEquals(cgsPackage.getErrors().size(), 2, "Package errors are: \n" + Arrays.toString(cgsPackage.getErrors().toArray()));
        Assert.assertTrue(cgsPackage.getErrors().get(0).getMessage().contains("Asset is missing at path: customizationPack"));
        Assert.assertEquals(cgsPackage.getErrors().get(0).getPublishError(), PublishErrors.MissingAssetReference);
        Assert.assertEquals(cgsPackage.getErrors().get(0).getResourceId(), cgsPackage.getCourseId());
        Assert.assertTrue(testUtils.areTransactionAndLockReleased(cgsPackage.getCourseId()), "Transaction or lock are not released after publish ended");
    }

    @Test
    public void standAlonePublishWithMissingLessonAsset() throws Exception {
        String source = String.format("%scourseWithHiddenLessonAndAppletThatHaveBundles.cgscrs", coursesFolder);
        CoursePackageParams params = importCourse(source, PublishTarget.COURSE_TO_FILE, PublishModeEnum.PRE_PRODUCTION);

        // removing an asset from one of the lessons
        // finding a lesson with a media resource, and setting the resource's href into "lessonMediaFileHref"
        String lessonMediaFileHref = null;
        TocItemCGSObject lessonObject = null;
        HashMap<String, EntityType> tocItems = courseDataService.getAllTocItemCIdsAndEntityTypeFromCourse(params.getPublisherId(), params.getCourseId());

        for (Map.Entry<String, EntityType> tocItem : tocItems.entrySet()) {
            if (tocItem.getValue() == EntityType.LESSON) {
                TocItemCGSObject lesson = lessonsDao.get(params.getPublisherId(), tocItem.getKey(), params.getCourseId(), null, false);
                if (lesson.getContentData().containsField("resources")) {
                    for (Object resource : (BasicDBList) lesson.getContentData().get("resources")) {
                        if (((DBObject) resource).get("type").toString().equals("media")) {
                            lessonMediaFileHref = ((DBObject) resource).get("href").toString();
                            lessonObject = lesson;
                            break;
                        }
                    }
                }
            }
        }

        if (lessonMediaFileHref == null) {
            throw new Exception("Could not find any lesson that have a media resource");
        }

        // Remove an asset from "media" folder
        String lessonMediaFileLocation = String.format("%s/publishers/%s/courses/%s/%s", configuration.getProperty("cmsHome"), params.getPublisherId(), params.getCourseId(), lessonMediaFileHref);

        File fileToDelete = new File(lessonMediaFileLocation);
        logger.info("fileToDelete " + fileToDelete);

        boolean deleteSucceed = FileUtils.deleteQuietly(fileToDelete);
        if (!deleteSucceed) {
            throw new Exception("Could not delete file: " + fileToDelete);
        }
        logger.info("Deleted file " + fileToDelete.getAbsoluteFile());

        CGSPackage cgsPackage = publishCourse(params);

        String lessonId = lessonObject.getEntityId();

        Assert.assertNotNull(lessonId);
        Assert.assertEquals(cgsPackage.getPackagePhase(), PackagePhase.FAILED);
        Assert.assertEquals(cgsPackage.getErrors().size(), 2);
        Assert.assertTrue(cgsPackage.getErrors().get(0).getMessage().contains("Asset is missing at path: media"));
        Assert.assertTrue(errorsContainsErrorWithSpecificType(cgsPackage.getErrors(), PublishErrors.MissingAssetReference));
        Assert.assertTrue(errorsContainsMissingId(cgsPackage.getErrors(), lessonId));
        Assert.assertTrue(errorsContainsMessage(cgsPackage.getErrors(), String.format(PackageResourceHandlerImpl.COURSE_MISSING_RESOURCE_TEMPLATE, cgsPackage.getCourseTitle(), cgsPackage.getCourseId())));
        Assert.assertTrue(testUtils.areTransactionAndLockReleased(cgsPackage.getCourseId()), "Transaction or lock are not released after publish ended");
    }

    private void getExcludedAndSelectedTocItemsIds(int publisherId, String courseId, List<String> selectedIds, List<String> excludeIds) throws DaoException {
        List<TocItemCGSObject> lessons = lessonsDao.getByCourse(publisherId, courseId, false);
        for (TocItemCGSObject lesson : lessons) {
            if (lesson.getTitle().equals("Main Lesson"))
                selectedIds.add(lesson.getContentId());
            else
                excludeIds.add(lesson.getContentId());
        }

        List<TocItemCGSObject> assemssmets = assessmentsDao.getByCourse(publisherId, courseId, false);
        if (!assemssmets.isEmpty()) {
            TocItemCGSObject assessment = assemssmets.get(0); // There's only one assessment
            excludeIds.add(assessment.getContentId());
        }
    }

    @DataProvider(name = "blankPageData")
    public Object[][] EBookBlankPagesGenerationFromPageDataProvider() {
        return new Object[][]{
                {generatePageNodeForTest("#eee", "testResource", "no-repeat", "left top", "100% 100%", "50px", "100px")},
                {generatePageNodeForTest("#ffff00", false, "no-repeat", "left top", "100% 100%", "100px", "200px")}
        };
    }

    private ObjectNode generatePageNodeForTest(String backgroundColor, Object backgroundImage, String backgroundRepeat, String backgroundPosition, String backgroundSize, String width, String height) {
        ObjectNode page = mapper.createObjectNode();
        page.put("href", "");

        ObjectNode pageVirtualData = mapper.createObjectNode();
        pageVirtualData.put("width", width);
        pageVirtualData.put("height", height);
        pageVirtualData.put("background-color", backgroundColor);
        pageVirtualData.put("background-repeat", backgroundRepeat);
        pageVirtualData.put("background-position", backgroundPosition);
        pageVirtualData.put("background-size", backgroundSize);

        if (backgroundImage.getClass().equals(String.class)) {
            pageVirtualData.put(BACKGROUND_IMAGE, (String) backgroundImage);
        } else {
            if (backgroundImage.getClass().equals(Boolean.class)) {
                pageVirtualData.put(BACKGROUND_IMAGE, (Boolean) backgroundImage);
            }
        }
        page.put(PackageHandlerImpl.BLANK_PAGE_VIRTUAL_DATA, pageVirtualData);
        return page;
    }

    @Test(dataProvider = "blankPageData")
    public void EBookBlankPagesGenerationFromPageTest(ObjectNode page) throws IOException {
        String courseId = "courseId";
        String outputFolder = "blankPageTest";
        String dummyMediaFile = "dummy.png";
        String baseResourcePath = uploadFilesFolder;
        PackageHandlerImpl packageHandlerImpl = (PackageHandlerImpl) packageHandler;
        ArrayNode resources = mapper.createArrayNode();

        JsonNode pageVirtualData = page.get(PackageHandlerImpl.BLANK_PAGE_VIRTUAL_DATA);

        boolean hasBackgroundImage = pageVirtualData.has(BACKGROUND_IMAGE) && pageVirtualData.get(BACKGROUND_IMAGE).isTextual();
        //add dummy resource to the resources of the lesson
        if (hasBackgroundImage) {
            String backgroundImage = pageVirtualData.get(BACKGROUND_IMAGE).getTextValue();
            resources.add(getLessonResourceMock(backgroundImage, dummyMediaFile));
        }

        try {
            String generatedFilePath = packageHandlerImpl.generateBlankPageHtmlFromPage(page, resources, courseId, outputFolder, baseResourcePath, packageHandlerImpl.getBlankPageTemplate());

            //check that the blank page html file was created in the correct location
            File generatedFile = new File(generatedFilePath);
            File expectedFile = new File(String.format("%s/%s/%s/%s", outputFolder, courseId, PackageHandlerImpl.BLANK_PAGES_FOLDER, generatedFile.getName()));
            Assert.assertTrue(generatedFile.exists());
            Assert.assertTrue(expectedFile.exists());
            Assert.assertEquals(generatedFile.getAbsolutePath(), expectedFile.getAbsolutePath());

            //check that the href on the page was updated to the correct path
            String expectedBlankPageHrefPath = String.format("%s%s/%s/%s", PackagingLocalContext.EBOOK_PATH_ELEMENT, courseId, PackageHandlerImpl.BLANK_PAGES_FOLDER, generatedFile.getName());
            Assert.assertTrue(page.has(PackageHandlerImpl.BLANK_PAGE_HREF));
            Assert.assertEquals(page.get(PackageHandlerImpl.BLANK_PAGE_HREF).getTextValue(), expectedBlankPageHrefPath);
            //check that virtual page property was removed
            Assert.assertTrue(!page.has(PackageHandlerImpl.BLANK_PAGE_VIRTUAL_DATA));

            String generatedHtml = FileUtils.readFileToString(generatedFile);
            //check that the html template rendering was completed without unwanted template chars
            Assert.assertTrue(!generatedHtml.contains("{{#"));
            Assert.assertTrue(!generatedHtml.contains("}}"));
            Assert.assertTrue(!generatedHtml.contains("{{/"));
            Assert.assertTrue(!generatedHtml.contains("{{"));

            //check that the wanted valued exists in the generated html
            Iterator<Map.Entry<String, JsonNode>> virtualDataPropertiesIter = pageVirtualData.getFields();
            while (virtualDataPropertiesIter.hasNext()) {
                Map.Entry<String, JsonNode> property = virtualDataPropertiesIter.next();
                String propertyKey = property.getKey();
                JsonNode propertyValueNode = property.getValue();
                if (propertyKey.equals(BACKGROUND_IMAGE)) {
                    if (propertyValueNode.isTextual()) {
                        File originalMediaFile = new File(String.format("%s/%s", baseResourcePath, dummyMediaFile));
                        String filename = originalMediaFile.getName();
                        String newFileExpectedRelativePath = String.format("%s/%s", PackageHandlerImpl.BLANK_PAGE_RESOURCES_FOLDER_NAME, filename);
                        //background image appears as expected in the html
                        Assert.assertTrue(generatedHtml.contains(String.format("%s:url(\"%s\");", propertyKey, newFileExpectedRelativePath)));
                        //media file was copied to the eBook folder
                        File backgroundImageFile = new File(String.format("%s/%s/%s/%s", outputFolder, courseId, PackageHandlerImpl.BLANK_PAGES_FOLDER, newFileExpectedRelativePath));
                        Assert.assertTrue(backgroundImageFile.exists());
                    } else if (propertyValueNode.isBoolean()) {
                        Assert.assertTrue(!generatedHtml.contains(String.format("%s:", propertyKey)));
                    }
                } else {
                    Assert.assertTrue(generatedHtml.contains(String.format("%s:%s;", propertyKey, propertyValueNode.getTextValue())));
                }
            }
        } finally {
            try {
                FileUtils.deleteDirectory(new File(outputFolder));
            } catch (IOException e) {
                logger.error(String.format("fail to delete blank page test folder: %s, in test: EBookBlankPagesGenerationFromPageTest", outputFolder), e);
                throw e;
            }
        }
    }

    private JsonNode getLessonResourceMock(String resId, String mediaPath) {
        ObjectNode resource = mapper.createObjectNode();
        resource.put("href", mediaPath);
        resource.put("type", "media");
        resource.put("resId", resId);
        return resource;
    }
}