package org.t2k.cgs.domain.usecases.packaging;

import atg.taglib.json.util.JSONException;
import com.t2k.common.utils.PublishModeEnum;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.lang.time.StopWatch;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.domain.model.course.CoursesDao;
import org.t2k.cgs.domain.model.tocItem.TocItemDao;
import org.t2k.cgs.domain.model.course.Course;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.model.tocItem.TocItemIndicationForScorm;
import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.service.packaging.PackageManagerImpl;
import org.t2k.cgs.service.packaging.uploaders.BlossomUploader;
import org.t2k.cgs.service.packaging.uploaders.CatalogueUploader;
import org.t2k.cgs.domain.model.user.CGSUserDetails;
import org.t2k.cgs.domain.usecases.tocitem.TocItemsManager;
import org.t2k.cgs.domain.usecases.user.UserService;
import org.t2k.sample.dao.exceptions.DaoException;
import org.t2k.cgs.domain.usecases.ImportCourseData;
import org.t2k.cgs.domain.usecases.TestUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.io.File;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import static org.mockito.Matchers.any;
import static org.mockito.Mockito.when;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 27/04/14
 * Time: 13:18
 */
@ContextConfiguration("/springContext/PackagingServiceTest-context.xml")
public class PackageHandlerParallelTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private PackageManagerImpl packageManager;

    @Autowired
    private CatalogueUploader catalogueUploader;

    @Autowired
    private BlossomUploader blossomUploader;

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private CoursesDao coursesDao;

    @Autowired
    private TocItemDao lessonsDao;

    @Autowired
    private TocItemDao assessmentsDao;

    @Autowired
    private TestUtils testUtils;

    @Autowired
    private TocItemsManager tocItemsManager;

    private final String description = "description";
    private final String releaseNotes = "release note";
    private final String coursesResource = "courses";
    private CGSUserDetails cgsUserDetails = null; // Have to be initialized in setup() or else it throws exception.
    private HashMap<String, ImportCourseData> importedCourses = new HashMap<>();
    private String courseVersionBeforePublish;

    private String coursesFolder;

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
        URL coursesPath = this.getClass().getClassLoader().getResource(coursesResource);
        if (coursesPath == null) {
            throw new Exception(String.format("Courses directory %s does not exist.", coursesPath));
        }
        coursesFolder = new File(coursesPath.getPath()).getAbsolutePath() + File.separator;
        MockitoAnnotations.initMocks(this);
        when(gcrMockHttpClient.executeMethod((HttpMethod) any())).thenReturn(200); // always return a 200 status - OK.

        // setting catalog uploader to work with a mock httpclient object - dont send request to catalog, but mock it
        catalogueUploader.setDefaultHttpClient(gcrMockHttpClient);

    }

    @BeforeMethod
    private void setup() throws Exception {
        cgsUserDetails = testUtils.createMockUser();
    }

//    @AfterClass
//    private void finishTest() throws IOException, DsException {
//        courseVersionBeforePublish = null;
//        for (ImportCourseData importCourseData : importedCourses.values()) {
//            testutils.removeAllResourcesFromImportCourse(importCourseData);
//        }
//
//        for (SimpleCgsUserDetails user : usersAddedByTests) {
//            userService.delete(user.getUserId());
//        }
//    }

    private CoursePackageParams importCourse(String courseFileRelativePath, PublishTarget publishTarget, PublishModeEnum publishMode) throws Exception {
        ImportCourseData importCourseData = testUtils.importCourseFromFile(courseFileRelativePath);
        int publisherId = importCourseData.getPublisherId();
        String courseId = importCourseData.getCourseId();
        importedCourses.put(courseId, importCourseData);
        Course course = coursesDao.getCourse(publisherId, courseId);
        courseVersionBeforePublish = course.getContentData().getVersion();

        List<String> selectedIds = new ArrayList<>();
        List<String> excludeIds = new ArrayList<>();
        getExcludedAndSelectedTocItemsIds(publisherId, courseId, selectedIds, excludeIds);

        return new CoursePackageParams(publisherId, courseId, publishTarget ,publishMode, description, releaseNotes, selectedIds, excludeIds);
    }

    private CGSPackage publishCourse(CoursePackageParams params) throws Exception {
        return publishCourse(params, cgsUserDetails);
    }

    private CGSPackage publishCourse(CoursePackageParams params, CGSUserDetails publishingUser) throws Exception {
        CGSPackage cgsPackage = packageManager.createPackageAndAddToPendingQueue(params.getPublisherId(), params    , publishingUser);
        importedCourses.get(params.getCourseId()).setPackId(cgsPackage.getPackId());
        cgsPackage.setScormSelectedTocItems(new ArrayList<TocItemIndicationForScorm>());
        cgsPackage.setScormExcludeTocItemsIds(new ArrayList<String>());

          importedCourses.get(params.getCourseId()).setPackIdWithVersion(cgsPackage.getPackId().replace(CGSPackage.VERSION_TOKEN, cgsPackage.getVersion().replace('.', '-')));
        String versionAfterPublish = cgsPackage.getVersion();

        if (params.getTarget() == PublishTarget.COURSE_TO_CATALOG || params.getTarget() == PublishTarget.COURSE_TO_FILE) {
            Assert.assertNotEquals(courseVersionBeforePublish, versionAfterPublish, "Version should be increased after publish");
        } else {
            Assert.assertEquals(courseVersionBeforePublish, versionAfterPublish, "Version should remain the same after publish");
        }

        return cgsPackage;
    }


    @Test(dataProvider = "publishToURLData", enabled = false)
    public void publishUrlTests(PublishTestData publishTestData) throws Exception {
        logger.debug("Start Test: PublishToURL for: " + publishTestData);
        CoursePackageParams params = importCourse(publishTestData.getCoursePath(), PublishTarget.COURSE_TO_URL, PublishModeEnum.PRODUCTION);
        logger.debug("  - Import completed.");
        CGSPackage cgsPackage = publishCourse(params);

        long maxMilisForTest = 1000*60*4; // 4 minutes max
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();

        while (cgsPackage.getPackagePhase() != PackagePhase.COMPLETED && cgsPackage.getPackagePhase() != PackagePhase.FAILED &&  stopWatch.getTime() < maxMilisForTest){
            Thread.sleep(333); // wait 1 second to poll
        }

        stopWatch.stop();
        logger.debug(String.format(">>>>>> publish phase is : %s\n>>>>>> publish status is : %s test name: %s", cgsPackage.getPackagePhase(), cgsPackage, publishTestData));
        testUtils.runBaseSuccessfulPublishValidation(cgsPackage);
    }


    @Test(dataProvider = "cataloguePublishTests", enabled = false)
    public void cataloguePublishTests(PublishTestData publishTestData) throws Exception {
        logger.debug(">>>>> Test invoked!!" + publishTestData);
        CoursePackageParams params = importCourse(publishTestData.getCoursePath(), PublishTarget.COURSE_TO_CATALOG, PublishModeEnum.PRODUCTION);
        logger.debug(">>>>> import completed!!");
        CGSPackage cgsPackage = publishCourse(params);

        long maxMilisForTest = 1000*60*4; // 4 minutes max
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        // Do something
        stopWatch.stop();

        while (cgsPackage.getPackagePhase() != PackagePhase.COMPLETED && cgsPackage.getPackagePhase() != PackagePhase.FAILED &&  stopWatch.getTime() < maxMilisForTest){
            Thread.sleep(1000); // wait 1 second to poll
        }
        logger.debug(String.format(">>>>>> publish phase is : %s\n>>>>>> publish status is : %s test name: %s", cgsPackage.getPackagePhase(), cgsPackage, publishTestData));
        testUtils.runBaseSuccessfulPublishValidation(cgsPackage);
    }

    @DataProvider(name = "cataloguePublishTests", parallel = true)
    public Object[][] cataloguePublishTests() throws JSONException {
        return new Object[][]{
//                {new PublishTestData("CourseWithStandardTags", String.format("%scourse_with_tags_in_all_levels.cgscrs", coursesFolder))},
                {new PublishTestData("SmallCourse", String.format("%ssmallCourseWithLessonAndQuiz.cgscrs", coursesFolder))}
//                {new PublishTestData("CourseWithCgsDataFile", String.format("%scourseWithCgsDataFile.cgscrs", coursesFolder))},
//                {new PublishTestData("LargeCourse", String.format("%slargeCourse.cgscrs", coursesFolder))},
//                {new PublishTestData("CourseWithEmptyLessons", String.format("%scourseWithEmptyLessons.cgscrs", coursesFolder))},
//                {new PublishTestData("CourseWithLessonsAndAssessmentWithEmptySequencesToStandAlone", String.format("%scourseWithLessonsAndAssessmentWithEmptySequences.cgscrs", coursesFolder))},
//                {new PublishTestData("CourseWithInvalidSequences", String.format("%scourseWithInvalidSequences.cgscrs", coursesFolder))},
//                {new PublishTestData("CourseWithAppletWithNoBundles", String.format("%scourseWithAppletWithNoBundles.cgscrs", coursesFolder))},
//                {new PublishTestData("CourseWithVeryBigMediaFiles", String.format("%scourseWithVeryBigMediaFiles.cgscrs", coursesFolder))}
        };
    }

    @DataProvider(name = "publishToURLData", parallel = true)
    public Object[][] publishToURLData() throws JSONException {
        return new Object[][]{
                {new PublishTestData("SmallCourse", String.format("%ssmallCourseWithLessonAndQuiz.cgscrs", coursesFolder))}
        };
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
}