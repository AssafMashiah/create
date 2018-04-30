package org.t2k.cgs.domain.usecases.exportImport;

import atg.taglib.json.util.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.domain.model.utils.CGSValidationReport;
import org.t2k.packaging.PublishTestData;
import org.t2k.testUtils.ImportCourseData;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.io.File;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 2/23/15
 * Time: 9:59 AM
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class ImportTests extends AbstractTestNGSpringContextTests {

    @Autowired
    private CourseDataService courseDataService;

    @Autowired
    private JobService jobService;

    @Autowired
    private TestUtils testUtils;

    private String coursesFolder;
    private List<ImportCourseData> importedCourses = new ArrayList<>();

    @BeforeClass
    public void classSetup() throws Exception {
        String coursesResource = "courses";
        URL coursesPath = this.getClass().getClassLoader().getResource(coursesResource);
        if (coursesPath == null) {
            throw new Exception(String.format("Courses directory %s does not exist.", coursesPath));
        }

        coursesFolder = new File(coursesPath.getPath()).getAbsolutePath() + File.separator;
    }

    @AfterClass
    public void tearDown() {
        for (ImportCourseData importCourseData : importedCourses) {
            testUtils.removeAllResourcesFromImportCourse(importCourseData);
        }
    }

    @Test(dataProvider = "validCourses")
    public void importAndValidateValidCourses(PublishTestData testData) throws Exception {
        ImportCourseData importedCourse = testUtils.importCourseFromFile(testData.getCoursePath());
        importedCourses.add(importedCourse);
        CGSValidationReport validationReport = courseDataService.validateCourseAndSubElements(importedCourse.getPublisherId(), importedCourse.getCourseId());
        Assert.assertTrue(validationReport.isSuccess(), String.format("Course validation after import failed, errors: %s", validationReport.toString()));

        Job job = jobService.getJob(importedCourse.getImportJobId());
        Assert.assertEquals(job.getStatus(), Job.Status.COMPLETED);
    }

    // This test requires that the import process will validate that the course is valid and missing no resources, which doesn't occur as to this point - that's why it's commented
//    @Test(dataProvider = "invalidCourses")
//    public void importAndValidateInvalidCoursesFailure(PublishTestData testData) throws Exception {
//        ImportCourseData importedCourse = testUtils.importCourseFromFile(testData.getCoursePath());
//        importedCourses.add(importedCourse);
//        CGSValidationReport validationReport = courseDataService.validateCourseAndSubElements(importedCourse.getPublisherId(), importedCourse.getCourseId());
//        Assert.assertFalse(validationReport.isSuccess(), String.format("Course validation after import failed, errors: %s", validationReport.toString()));
//        Assert.assertTrue(validationErrorsContainMessage(validationReport.getMessages(), "1d025728-bd21-46d5-b45f-8d22e4d3b22d"));
//        Assert.assertTrue(validationErrorsContainMessage(validationReport.getMessages(), "MissingLessonReference"));
//
//        Job job = jobService.getJob(importedCourse.getImportJobId());
//        Assert.assertEquals(job.getStatus(), Job.Status.FAILED);
//    }

    private boolean validationErrorsContainMessage(List<String> messages, String messageToFind) {
        for (String message : messages) {
            if (message.contains(messageToFind))
                return true;
        }
        return false;
    }

    @DataProvider(name = "validCourses")
    public Object[][] validCourses() throws JSONException {
        return new Object[][]{
                {new PublishTestData("CourseWithStandardTags", String.format("%scourse_with_tags_in_all_levels.cgscrs", coursesFolder))},
                {new PublishTestData("SmallCourse", String.format("%ssmallCourseWithLessonAndQuiz.cgscrs", coursesFolder))},
                {new PublishTestData("CourseWithCgsDataFile", String.format("%scourseWithCgsDataFile.cgscrs", coursesFolder))},
                {new PublishTestData("LargeCourse", String.format("%slargeCourse.cgscrs", coursesFolder))},
                {new PublishTestData("CourseWithEmptyLessons", String.format("%scourseWithEmptyLessons.cgscrs", coursesFolder))},
                {new PublishTestData("CourseWithLessonsAndAssessmentWithEmptySequences", String.format("%scourseWithLessonsAndAssessmentWithEmptySequences.cgscrs", coursesFolder))},
        };
    }

    // This test requires that the import process will validate that the course is valid and missing no resources, which doesn't occur as to this point - that's why it's commented
//    @DataProvider(name = "invalidCourses")
//    public Object[][] invalidCourses() throws JSONException {
//        return new Object[][]{
//                {new PublishTestData("courseWithMissingLesson", String.format("%scourse_with_missing_lesson.cgscrs", coursesFolder))},
//        };
//    }
}