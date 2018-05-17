package org.t2k.cgs.domain.usecases.course;

import atg.taglib.json.util.JSONException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.BasicDBList;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.usecases.AppletService;
import org.t2k.cgs.domain.usecases.CmsService;
import org.t2k.cgs.domain.model.cleanup.CleanupsDao;
import org.t2k.cgs.persistence.dao.FileDaoImpl;
import org.t2k.cgs.domain.model.course.CoursesDao;
import org.t2k.cgs.domain.model.sequence.SequencesDao;
import org.t2k.cgs.persistence.dao.TocItemsMongoDao;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.usecases.lock.LockService;
import org.t2k.cgs.domain.model.lock.Lock;
import org.t2k.cgs.domain.model.lock.LockUser;
import org.t2k.cgs.domain.model.cleanup.CleanupJob;
import org.t2k.cgs.domain.model.cleanup.CleanupStatus;
import org.t2k.cgs.domain.model.cleanup.CleanupType;
import org.t2k.cgs.domain.model.course.Course;
import org.t2k.cgs.domain.model.course.CourseCGSObject;
import org.t2k.cgs.domain.model.course.CourseCustomizationPack;
import org.t2k.cgs.domain.model.course.CourseDifferentiation;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.model.ContentLocalesTypes;
import org.t2k.cgs.domain.usecases.publisher.PublishError;
import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.domain.model.utils.CGSValidationReport;
import org.t2k.cgs.domain.usecases.packaging.ContentValidator;
import org.t2k.cgs.domain.usecases.publisher.PublisherService;
import org.t2k.cgs.service.scheduling.CleanupScheduler;
import org.t2k.cgs.domain.usecases.tocitem.TocItemsManager;
import org.t2k.cgs.service.validation.ContentItemValidation;
import org.t2k.sample.dao.exceptions.DaoException;
import org.t2k.cgs.domain.usecases.ImportCourseData;
import org.t2k.cgs.domain.usecases.TestUtils;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Created with IntelliJ IDEA.
 * User: alex.zaikman
 * Date: 20/01/14
 * Time: 11:00
 */
//@ContextConfiguration("/springContext/CourseServiceTest-context.xml")
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
public class CourseServiceTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private TocItemsManager tocItemsManager;

    @Autowired
    private CourseDataService courseDataService;

    @Autowired
    private CoursesDao coursesDao;

    @Autowired
    private SequencesDao sequencesDao;

    @Autowired
    private TocItemsMongoDao lessonsDao;

    @Autowired
    private CleanupScheduler cleanupScheduler;

    @Autowired
    private CleanupsDao cleanupsDao;

    @Autowired
    private TestUtils testUtils;

    @Autowired
    private CmsService cmsService;

    @Autowired
    PublisherService accountService;

    @Autowired
    LockService lockService;

    @Autowired
    private ContentItemValidation contentItemValidation;

    @Autowired
    private AppletService appletService;

    @Autowired
    private ContentValidator contentValidator;


    private List<ImportCourseData> importedCourses = new ArrayList<>();

    private List<CourseCGSObject> createdCourses = new ArrayList<>();

    private final String coursesFolder = new File(this.getClass().getClassLoader().getResource("courses/").getPath()).getAbsolutePath() + "/";

    private ImportCourseData importLargeValidCourse1() throws Exception {
        String source = String.format("%scourseWithHiddenLessonAndAppletThatHaveBundles.cgscrs", coursesFolder);
        return testUtils.importCourseFromFile(source);
    }

    private ImportCourseData importLargeValidCourse2() throws Exception {
        String source = String.format("%scourseWithAppletWithNoBundles.cgscrs", coursesFolder);
        return testUtils.importCourseFromFile(source);
    }


    @AfterClass
    public void removeCreatedCourses() throws DaoException {
        for (CourseCGSObject course : createdCourses) {
            coursesDao.deleteCourse(course.getContentId(), course.getPublisherId());
        }
        for (ImportCourseData importCourseData : importedCourses) {
            testUtils.removeAllResourcesFromImportCourse(importCourseData);
        }
    }

    @Test
    public void validationForAValidCourseSuccess() throws Exception {
        try {
            ImportCourseData importCourseData1 = importLargeValidCourse1();
            importedCourses.add(importCourseData1);
            CGSValidationReport courseValidationReport
                    = courseDataService.validateCourseAndSubElements(importCourseData1.getPublisherId(), importCourseData1.getCourseId());
            Assert.assertTrue(courseValidationReport.getMessages().isEmpty());
            Assert.assertTrue(courseValidationReport.isSuccess());

        } catch (Exception e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
            throw e;
        }
    }

    @Test
    public void saveAsTest() throws Exception {
        ImportCourseData importCourseData1 = importLargeValidCourse1();
        importedCourses.add(importCourseData1);
        Job j = new Job(UUID.randomUUID().toString());
        String newCourseId = courseDataService.cloneCourse(importCourseData1.getPublisherId(), importCourseData1.getCourseId(), "new course name", j.getJobId());
//        CGSValidationReport cgsValidationReport = courseDataService.validateCourseAndSubElements(importCourseData1.getPublisherId(), newCourseId);
//        Assert.assertTrue(cgsValidationReport.isSuccess());
    }

    @Test
    public void validationForACourseWithNonValidLessonFailure() throws Exception {
        try {
            ImportCourseData importCourseData2 = importLargeValidCourse2();
            importedCourses.add(importCourseData2);
            List<TocItemCGSObject> lessons = lessonsDao.getByCourse(importCourseData2.getPublisherId(), importCourseData2.getCourseId(), false);

            // messing up the first lesson of the course in mongo, so it will fail on the lesson validation schema
            TocItemCGSObject firstLesson = lessons.get(0);
            firstLesson.getContentData().put("type", "notAValidType"); // expected to be in the "lesson", so this will definitely fail
            firstLesson.getContentData().put("contentLocales", new ArrayList<String>()); // expected to be in an array with size > 0

            lessonsDao.save(firstLesson);

            CGSValidationReport courseValidationReport =
                    courseDataService.validateCourseAndSubElements(importCourseData2.getPublisherId(), importCourseData2.getCourseId());
            Assert.assertFalse(courseValidationReport.getMessages().isEmpty());
            Assert.assertFalse(courseValidationReport.isSuccess());
        } catch (Exception e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
            throw e;
        }
    }

    @Test
    public void validateCourseWithMissingFileFailure() throws DsException {
        CGSValidationReport validationReport = courseDataService.validateCourseAndSubElements(Integer.MAX_VALUE, "bla");
        Assert.assertFalse(validationReport.getMessages().isEmpty());
        Assert.assertFalse(validationReport.isSuccess());
    }

    @Test
    public void validateCourseWithWrongSchemaFailure() throws DsException, IOException, DaoException {
        CourseCGSObject courseWithBadSchema = testUtils.getCourseManifestWithSequences();
        courseWithBadSchema.getContentData().put("what", "this shouldnt be here");
        courseWithBadSchema.setCourseId("mockCourseId-doesnt-exists-anywhere");

        coursesDao.saveCourseCGSObject(courseWithBadSchema);
        createdCourses.add(courseWithBadSchema);
        CGSValidationReport validationReport = courseDataService.validateCourseAndSubElements(courseWithBadSchema.getPublisherId(), courseWithBadSchema.getEntityId());

        Assert.assertFalse(validationReport.getMessages().isEmpty());
        Assert.assertFalse(validationReport.isSuccess());
    }

    @Test
    public void validateCourseWithoutLessonsSuccess() throws IOException, DaoException, DsException {
        CourseCGSObject courseWithoutResources = testUtils.getCourseWithoutTocItemsAndResources();
        coursesDao.saveCourseCGSObject(courseWithoutResources);
        createdCourses.add(courseWithoutResources);
        CGSValidationReport validationReport = courseDataService.validateCourseAndSubElements(courseWithoutResources.getPublisherId(), courseWithoutResources.getEntityId());
        Assert.assertTrue(validationReport.getMessages().isEmpty());
        Assert.assertTrue(validationReport.isSuccess());
    }

    @Test
    public void validateCourseWithMissingLessonsFailure() throws DaoException, IOException, DsException {
        CourseCGSObject courseWithoutResources = testUtils.getCourseWithLessons();
        coursesDao.saveCourseCGSObject(courseWithoutResources);
        createdCourses.add(courseWithoutResources);
        CGSValidationReport validationReport = courseDataService.validateCourseAndSubElements(courseWithoutResources.getPublisherId(), courseWithoutResources.getEntityId());
        Assert.assertFalse(validationReport.getMessages().isEmpty());
        Assert.assertFalse(validationReport.isSuccess());
    }

    @Test
    public void simpleJsonToCourseDifferentiationObjectMapping() throws IOException {
        String validDifferentiationJson = "{\"defaultLevelId\":3,\"levels\":[{\"id\":1,\"name\":\"asdasdas\",\"acronym\":\"jj\"},{\"id\":2,\"name\":\"jghjgfgfgfg\",\"acronym\":\"hh\"},{\"id\":3,\"name\":\"hjghjgh\",\"acronym\":\"gg\"}]}";
        new ObjectMapper().readValue(validDifferentiationJson, CourseDifferentiation.class);
    }

    @Test(groups = "ignore")
    public void courseCleanUpTest() throws Exception {
        int publisherId = 1;
        DBObject lesson1 = testUtils.readResourcesAsDBObject("lessons/lessonWithOneSequence.json");
        DBObject lesson2 = testUtils.readResourcesAsDBObject("lessons/lessonWithOneSequence2.json");
        DBObject seq1 = testUtils.readResourcesAsDBObject("sequences/sequence1.json");
        DBObject seq2 = testUtils.readResourcesAsDBObject("sequences/sequence2.json");
        DBObject seq3 = testUtils.readResourcesAsDBObject("sequences/sequence3.json");
        DBObject seq4 = testUtils.readResourcesAsDBObject("sequences/sequence4.json");
        String courseJson = testUtils.readResourcesAsString("courses/courseWithOneLesson.json");
        String userJson = testUtils.readResourcesAsString("jsons/users/userForCourse.json");
        CourseCGSObject course = new CourseCGSObject(courseJson, publisherId);
        SimpleCgsUserDetails currentCgsUserDetails = new ObjectMapper().readValue(userJson, SimpleCgsUserDetails.class);
        LockUser lockUser = new LockUser(currentCgsUserDetails.toUserDetails());

        DBObject cgsData = (DBObject) lesson1.get("cgsData");
//        int publisherId = Integer.parseInt(cgsData.get("publisherId").toString());
        String courseId = cgsData.get("courseId").toString();
        String lesson1_Id = ((DBObject) lesson1.get("contentData")).get("cid").toString();
        String lesson2_Id = ((DBObject) lesson2.get("contentData")).get("cid").toString();
        CleanupJob courseCleanupJob = null;
        CleanupJob lesson1_cleanupJobAfterCourseCleanup = null;

        // Delete all objects which are being used in this test from the DB if they're exist
        lessonsDao.deleteTocItems(Arrays.asList(lesson1_Id, lesson2_Id), course.getEntityId(), publisherId);
        List<String> sequencesIdsOfLesson1 = new ArrayList<>(3);
        sequencesDao.deleteSequences(sequencesIdsOfLesson1, lesson1_Id, courseId);
        sequencesDao.deleteSequence(seq4.get("seqId").toString(), lesson2_Id, courseId);
        coursesDao.deleteCourse(courseId, publisherId);

        try {
            lessonsDao.saveTocItemDBObject(lesson1);
            lessonsDao.saveTocItemDBObject(lesson2);
            sequencesDao.saveSequenceDBObject(seq1);
            sequencesDao.saveSequenceDBObject(seq2);
            sequencesDao.saveSequenceDBObject(seq3);
            sequencesDao.saveSequenceDBObject(seq4);
            courseDataService.saveCourse(course, lockUser, false);

            // We need to set the cleanupJob's time to 1 hour ago so the cleanupCourses method will catch it.
            courseCleanupJob = cleanupsDao.getCourseCleanupJob(publisherId, courseId, CleanupStatus.Created);
            courseCleanupJob.setLastModified(new DateTime().minusHours(1).toDate());
            cleanupsDao.saveCleanup(courseCleanupJob);

            // We also add a cleanup to the lesson to verify that the course's cleanup deleted it too.
            CleanupJob lesson1_cleanupJob = new CleanupJob(publisherId, courseId, lesson1_Id, lesson1.get("_id").toString(), CleanupType.LESSON);
            cleanupsDao.insertOrUpdateCleanup(lesson1_cleanupJob);

            cleanupScheduler.cleanupCourses();

            // Validate that the sequence was updated with the deletion date
            Sequence sequence1 = sequencesDao.getSequence(seq1.get("seqId").toString(), seq1.get("lessonCId").toString(), courseId);
            Sequence sequence2 = sequencesDao.getSequence(seq2.get("seqId").toString(), seq2.get("lessonCId").toString(), courseId);
            Sequence sequence3 = sequencesDao.getSequence(seq3.get("seqId").toString(), seq3.get("lessonCId").toString(), courseId);
            Sequence sequence4 = sequencesDao.getSequence(seq4.get("seqId").toString(), seq4.get("lessonCId").toString(), courseId);

            Assert.assertNull(sequence1.getDeletionDate());
            Assert.assertNull(sequence2.getDeletionDate());
            Assert.assertNull(sequence3.getDeletionDate());
            Assert.assertNotNull(sequence4.getDeletionDate());

            DBCursor lessonsAfterCleanup = lessonsDao.getCursorOfAllTocItems(publisherId, courseId);
            while (lessonsAfterCleanup.hasNext()) {
                DBObject lessonAfterCleanup = lessonsAfterCleanup.next();
                String lessonId = ((DBObject) lessonAfterCleanup.get("contentData")).get("cid").toString();
                Object deletionDate = ((DBObject) ((DBObject) lessonAfterCleanup.get("contentData")).get("header")).get("deletionDate");
                if (lessonId.equals(lesson1_Id))
                    Assert.assertNull(deletionDate);
                else if (lessonId.equals(lesson2_Id))
                    Assert.assertNotNull(deletionDate);
            }

            lesson1_cleanupJobAfterCourseCleanup = cleanupsDao.getCleanup(lesson1_cleanupJob.getPublisherId(),
                    lesson1_cleanupJob.getCourseId(), lesson1_cleanupJob.getTocItemId(), lesson1_cleanupJob.getCleanupType(),
                    lesson1_cleanupJob.getStatus());
            Assert.assertNull(lesson1_cleanupJobAfterCourseCleanup);

        } catch (DaoException e) {
            logger.error("Failed to add course with 2 sequences to DB", e);
            throw e;
        } catch (DsException e) {
            logger.error("Failed to save lesson in DB", e);
            throw e;
        } finally {
            if (courseCleanupJob != null) cleanupsDao.removeCleanup(courseCleanupJob);
            if (lesson1_cleanupJobAfterCourseCleanup != null)
                cleanupsDao.removeCleanup(lesson1_cleanupJobAfterCourseCleanup);
            lessonsDao.deleteTocItems(Arrays.asList(lesson1_Id, lesson2_Id), course.getEntityId(), publisherId);
            sequencesDao.deleteSequences(sequencesIdsOfLesson1, lesson1_Id, courseId);
            sequencesDao.deleteSequence(seq4.get("seqId").toString(), lesson2_Id, courseId);
            coursesDao.deleteCourse(courseId, publisherId);
        }
    }


    @Test
    public void gettingTocItemsDataForImportLessonGetsOnlyNecessaryData() throws DsException, DaoException, IOException {
        String courseId = "courseIdForTest";
        int publisherId = 100100;

        String course = " {\n" +
                "        \"author\" : \"asaf.editor\",\n" +
                "        \"cgsVersion\" : \"7.0.28.68\",\n" +
                "        \"cid\" : \"322d5eec-da04-47e1-a111-d54640171b4a\",\n" +
                "        \"courseId\" : \"" + courseId + "\",\n" +
                "        \"header\" : {\n" +
                "            \"last-modified\" : {\n" +
                "                \"$date\": \"2014-12-02T07:52:39.146Z\"\n" +
                "            },\n" +
                "        },\n" +
                "        \"includeLo\" : true,\n" +
                "        \"maxDepth\" : 3,\n" +
                "        \"publisher\" : \"myPublishe\",\n" +
                "        \"schema\" : \"course_v4\",\n" +
                "        \"title\" : \"New Course\",\n" +
                "        \"contentLocales\" : [ \n" +
                "            \"en_US\"\n" +
                "        ],\n" +
                "        \"toc\" : {\n" +
                "            \"cid\" : \"94b6f668-8c9a-4501-a2ef-fcc6f16e6422\",\n" +
                "            \"title\" : \"New Course\",\n" +
                "            \"overview\" : \"\",\n" +
                "            \"keywords\" : [],\n" +
                "            \"type\" : \"tocItem\",\n" +
                "            \"tocItemRefs\" : [{\"cid\":\"2dc39b39-bee3-4fc8-a2b3-5e756770c12a\",\n" +
                "\t\t\t\"type\":\"assessment\"\n" +
                "\t\t\t},{\"cid\":\"b8fecc80-0d90-44a0-80cc-a98919173142\",\n" +
                "\t\t\t\"type\":\"lesson\"\n" +
                "\t\t\t},{\"cid\":\"9dfc2abd-6697-4f6e-9c02-c8338471f2a4\",\n" +
                "\t\t\t\"type\":\"lesson\"\n" +
                "\t\t\t}],\n" +
                "            \"tocItems\" : []\n" +
                "        },\n" +
                "        \"type\" : \"course\",\n" +
                "        \"version\" : \"1.0.1\"\n" +
                "}";

        String assessment = "{\n" +
                "        \"cid\" : \"2dc39b39-bee3-4fc8-a2b3-5e756770c12a\",\n" +
                "        \"header\" : {\n" +
                "            \"last-modified\" : {\n" +
                "               \"$date\": \"2014-12-15T15:56:18.671Z\"\n" +
                "            },\n" +
                "        },\n" +
                "        \"schema\" : \"course_v4\",\n" +
                "        \"title\" : \"Assessment for test\",\n" +
                "        \"type\" : \"assessment\",\n" +
                "        \"useForDifferentialRecommendation\" : false,\n" +
                "        \"containsInstructionalSequence\" : false,\n" +
                "        \"checkingType\" : \"auto\"\n" +
                "}";

        String lesson = "{\n" +
                "        \"cid\" : \"b8fecc80-0d90-44a0-80cc-a98919173142\",\n" +
                "        \"header\" : {\n" +
                "            \"last-modified\" : {\n" +
                "               \"$date\": \"2014-12-15T15:56:20.440Z\"\n" +
                "            },\n" +
                "        },\n" +
                "        \"schema\" : \"course_v4\",\n" +
                "        \"pedagogicalLessonType\" : \"Custom\",\n" +
                "        \"contentLocales\" : [ \n" +
                "            \"en_US\"\n" +
                "        ],\n" +
                "        \"standards\" : [],\n" +
                "        \"standardPackages\" : [],\n" +
                "        \"title\" : \"Lesson for test\",\n" +
                "        \"type\" : \"lesson\"\n" +
                "}";
        String hiddenLesson = "" +
                " {\n" +
                "        \"isHidden\" : true,\n" +
                "        \"cid\" : \"9dfc2abd-6697-4f6e-9c02-c8338471f2a4\",\n" +
                "        \"header\" : {\n" +
                "            \"last-modified\" : {\n" +
                "                \"$date\": \"2014-12-15T15:56:20.440Z\"\n" +
                "            },\n" +
                "        },\n" +
                "        \"schema\" : \"course_v4\",\n" +
                "        \"pedagogicalLessonType\" : \"Custom\",\n" +
                "        \"contentLocales\" : [ \n" +
                "            \"en_US\"\n" +
                "        ],\n" +
                "        \"standards\" : [],\n" +
                "        \"standardPackages\" : [],\n" +
                "        \"title\" : \"hidden Lesson\",\n" +
                "        \"type\" : \"lesson\"\n" +
                "}";
        TocItemCGSObject hiddenLessonObject = new TocItemCGSObject(hiddenLesson, publisherId, courseId, EntityType.LESSON);
        TocItemCGSObject normalLessonObject = new TocItemCGSObject(lesson, publisherId, courseId, EntityType.LESSON);
        TocItemCGSObject normalAssessmentObject = new TocItemCGSObject(assessment, publisherId, courseId, EntityType.ASSESSMENT);
        CourseCGSObject courseCGSObject = new CourseCGSObject(course, publisherId);
        LockUser lockUser = new LockUser("mockUser", "mockUser", "mockUser", "mockUser", publisherId);

        try {    // insert data into DB
            tocItemsManager.save(hiddenLessonObject, lockUser); // add a hidden lesson
            tocItemsManager.save(normalLessonObject, lockUser);       // add a normal lesson
            tocItemsManager.save(normalAssessmentObject, lockUser);   // add an assessment
            coursesDao.saveCourseCGSObject(courseCGSObject);
            // test get all types of toc items
            List<TocItemCGSObject> result1 = tocItemsManager.getOnlyNameAndIdsByCourseOfNonHiddenItems(publisherId, courseId, null);
            Assert.assertEquals(result1.size(), 2);


            // test get only assessments
            List<TocItemCGSObject> result2 = tocItemsManager.getOnlyNameAndIdsByCourseOfNonHiddenItems(publisherId, courseId, "assessment");
            Assert.assertEquals(result2.size(), 1);
            Assert.assertEquals(result2.get(0).getTitle(), normalAssessmentObject.getTitle());
            Assert.assertEquals(result2.get(0).getContentId(), normalAssessmentObject.getContentId());


            // test get only lessons
            List<TocItemCGSObject> result3 = tocItemsManager.getOnlyNameAndIdsByCourseOfNonHiddenItems(publisherId, courseId, "lesson");
            Assert.assertEquals(result3.size(), 1);
            Assert.assertEquals(result3.get(0).getTitle(), normalLessonObject.getTitle());
            Assert.assertEquals(result3.get(0).getContentId(), normalLessonObject.getContentId());

            // check the api for getting only the tocItems for the course
            // get only assessments in courseCgsObject
            CourseCGSObject result4 = courseDataService.getCourseTocItemsInStructureByPublisher(publisherId, courseId, "assessment");
            BasicDBList tocItemsContents = ((BasicDBList) ((DBObject) result4.getContentData().get("toc")).get("tocItemsContent"));
            // ignore 2 lessons, and put only 1 element (assessment) in "tocItemsContent" under the course's contentData.
            Assert.assertEquals(tocItemsContents.size(), 1);

            Assert.assertEquals(((DBObject) tocItemsContents.get(0)).get("title"), "Assessment for test");
            Assert.assertEquals(((DBObject) tocItemsContents.get(0)).get("cid"), "2dc39b39-bee3-4fc8-a2b3-5e756770c12a");
            Assert.assertEquals(((DBObject) tocItemsContents.get(0)).get("type"), "assessment");

            // check the api for getting only the tocItems for the course
            // get only lessons in courseCgsObject
            CourseCGSObject result5 = courseDataService.getCourseTocItemsInStructureByPublisher(publisherId, courseId, "lesson");
            tocItemsContents = ((BasicDBList) ((DBObject) result5.getContentData().get("toc")).get("tocItemsContent"));
            // ignore assessment & hidden lesson, and put only 1 element (lesson) in "tocItemsContent" under the course's contentData.
            Assert.assertEquals(tocItemsContents.size(), 1);

            Assert.assertEquals(((DBObject) tocItemsContents.get(0)).get("title"), "Lesson for test");
            Assert.assertEquals(((DBObject) tocItemsContents.get(0)).get("cid"), "b8fecc80-0d90-44a0-80cc-a98919173142");
            Assert.assertEquals(((DBObject) tocItemsContents.get(0)).get("type"), "lesson");

            // check the api for getting only the tocItems for the course
            // get both lessons and assessments in courseCgsObject
            CourseCGSObject result6 = courseDataService.getCourseTocItemsInStructureByPublisher(publisherId, courseId, null);
            tocItemsContents = ((BasicDBList) ((DBObject) result6.getContentData().get("toc")).get("tocItemsContent"));
            // ignore assessment & hidden lesson, and put only 1 element (lesson) in "tocItemsContent" under the course's contentData.
            Assert.assertEquals(tocItemsContents.size(), 2);

            // assert first tocItem is our assessment
            Assert.assertEquals(((DBObject) tocItemsContents.get(0)).get("title"), "Assessment for test");
            Assert.assertEquals(((DBObject) tocItemsContents.get(0)).get("cid"), "2dc39b39-bee3-4fc8-a2b3-5e756770c12a");
            Assert.assertEquals(((DBObject) tocItemsContents.get(0)).get("type"), "assessment");

            // assert second tocItem is our lesson
            Assert.assertEquals(((DBObject) tocItemsContents.get(1)).get("title"), "Lesson for test");
            Assert.assertEquals(((DBObject) tocItemsContents.get(1)).get("cid"), "b8fecc80-0d90-44a0-80cc-a98919173142");
            Assert.assertEquals(((DBObject) tocItemsContents.get(1)).get("type"), "lesson");

        } finally {   // delete data
            tocItemsManager.delete(hiddenLessonObject);
            tocItemsManager.delete(normalLessonObject);
            tocItemsManager.delete(normalAssessmentObject);
            coursesDao.deleteCourse(courseCGSObject.getEntityId(), courseCGSObject.getPublisherId());
        }

    }

    @DataProvider(name = "courseLocales", parallel = true)
    public Object[][] courseLocales() throws JSONException {
        return new Object[][]{
                {new NewCourseDataProviderTest(ContentLocalesTypes.EN_US)},
                {new NewCourseDataProviderTest(ContentLocalesTypes.FR_FR)},
                {new NewCourseDataProviderTest(ContentLocalesTypes.PT_BR)},
                {new NewCourseDataProviderTest(ContentLocalesTypes.IW_IL)},
                {new NewCourseDataProviderTest(ContentLocalesTypes.AR_IL)},
                {new NewCourseDataProviderTest(ContentLocalesTypes.NL_NL)},
        };
    }

    @Test(dataProvider = "courseLocales")
    public void newCourseTests(NewCourseDataProviderTest data) throws Exception {
        createNewCourseTest(data.getCourseLocale());
    }

    private void createNewCourseTest(ContentLocalesTypes contentLocale) throws Exception {

        int publisherId = testUtils.createANewPublisher(contentLocale);
        String courseTitle = "New Test Course";
        String courseId = null;
        Course course = null;

        String userJson = testUtils.readResourcesAsString("jsons/users/userForCourse.json");
        SimpleCgsUserDetails currentCgsUserDetails = new ObjectMapper().readValue(userJson, SimpleCgsUserDetails.class);

        try {
            course = courseDataService.createNewCourse(publisherId, courseTitle, currentCgsUserDetails.toUserDetails(), contentLocale.getName());
            courseId = course.getEntityId();

//            contentValidator.validate(course);

            // serialize the content because that in the controller this is the response sent to client
//            Assert.assertNotNull(course.serializeContentData());

            //check that the course was created with the params from the user ( course format, course content language, course title )
            Assert.assertTrue(course.getContentData().getContentLocales().contains(contentLocale.getName()));
            Assert.assertTrue(course.getTitle().equals(courseTitle));
            Assert.assertEquals(course.getCgsData().getPublisherId(), publisherId);

            //check that the user that created the course is locked on the course
            Lock courseLock = lockService.getLock(courseId);
            Assert.assertNotNull(courseLock);
            Assert.assertTrue(courseLock.getUserName().equals(currentCgsUserDetails.getUsername()));

            //check that a applet manifest was created for the course
            Assert.assertNotNull(appletService.getAppletManifest(courseId, null));

            //check that the customization pack is saved on cms
            CourseCustomizationPack customizationPack = course.getContentData().getCustomizationPack();
            String customizationPackManifestPathInCms = cmsService.getCustomizationPackCmsPath(publisherId, courseId,
                    customizationPack.getName(), customizationPack.getVersion());
            Assert.assertTrue(FileDaoImpl.exists(customizationPackManifestPathInCms));

            //check that the course is saved in mongo
            Assert.assertNotNull(courseDataService.getCourse(publisherId, courseId));

            //check that all the course resources are saved on cms
            List<PublishError> errors = new ArrayList<>();
            CourseCGSObject courseCGSObject = coursesDao.getCourse(publisherId, courseId, course.getLastModified(), false);
            contentItemValidation.doAllAssetsExistOnFileSystem(courseCGSObject, errors, cmsService.getCoursePath(publisherId, courseId));
            Assert.assertEquals(errors.size(), 0);
        } finally {
            //remove the course and publishers created by the test from mongo and from cms
            if (courseId != null) {
                LockUser lockUser = new LockUser(currentCgsUserDetails.toUserDetails());
                lockService.releaseLock(course, lockUser);

                coursesDao.deleteCourse(courseId, publisherId);
                cmsService.deleteCourseContents(courseId, publisherId);

                testUtils.deletePublisher(publisherId);
                appletService.deleteAppletManifest(courseId);
            }
        }
    }
}