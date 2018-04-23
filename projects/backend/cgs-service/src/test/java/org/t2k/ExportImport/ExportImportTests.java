package org.t2k.ExportImport;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.time.StopWatch;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.course.CourseDataService;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.exportImport.ExportImportService;
import org.t2k.cgs.model.utils.CGSValidationReport;
import org.t2k.testUtils.ImportCourseData;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: efrat.gur
 * Date: 29/10/13
 * Time: 14:01
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class ExportImportTests extends AbstractTestNGSpringContextTests {

    @Autowired
    private ExportImportService exportImportService;

    @Autowired
    private CourseDataService courseDataService;

    @Autowired
    private TestUtils testUtils;

    private final String COURSES_RESOURCE_FOLDER = "courses";

    private String coursesFolder;
    private File oldFile = null;
    private File newFile = null;
    private List<File> exportedCoursesFilesPaths = new ArrayList<>();
    private HashMap<String, ImportCourseData> importedCourses = new HashMap<>();

    @BeforeClass
    public void classSetup() throws Exception {
        URL coursesPath = this.getClass().getClassLoader().getResource(COURSES_RESOURCE_FOLDER);
        if (coursesPath == null) {
            throw new Exception(String.format("Courses directory %s does not exist.", coursesPath));
        }
        coursesFolder = new File(coursesPath.getPath()).getAbsolutePath() + File.separator;
    }

    @AfterMethod
    private void finishTest() throws IOException {
        for (ImportCourseData importCourseData : importedCourses.values()) {
            testUtils.removeAllResourcesFromImportCourse(importCourseData);
        }

        for (File exportedCourseFile : exportedCoursesFilesPaths) {
            if (exportedCourseFile.exists()) {
                FileUtils.forceDelete(exportedCourseFile);
            }
        }

        if (newFile != null && newFile.exists()) {
            FileUtils.forceDelete(newFile);
        }

        if (oldFile != null && oldFile.exists()) {
            FileUtils.forceDelete(oldFile);
        }
    }

    @Test
    public void oldExportedFilesCleanupTest() throws DsException, IOException {
        String exportedCoursesFilesLocation = exportImportService.getExportedCoursesLocation();
        File exportedCoursesFilesFolder = new File(exportedCoursesFilesLocation);
        if (!exportedCoursesFilesFolder.exists()) {
            exportedCoursesFilesFolder.mkdirs();
            logger.debug(String.format("Created folder: %s", exportedCoursesFilesLocation));
        }

        oldFile = new File(exportedCoursesFilesFolder, "oldFile.cgs");
        newFile = new File(exportedCoursesFilesFolder, "newFile.cgs");
        if (!oldFile.exists()) {
            Assert.assertTrue(oldFile.createNewFile(), "Created file should exist");
        }
        if (!newFile.exists()) {
            Assert.assertTrue(newFile.createNewFile(), "Created file should exist");
        }

        Assert.assertTrue(oldFile.setLastModified(new DateTime().minusDays(4).toDate().getTime())); // change the file's last modified date
        exportImportService.removeOldExportedCoursesFiles(2);
        Assert.assertFalse(oldFile.exists(), "Created file with old date should not exist after cleanup");
        Assert.assertTrue(newFile.exists(), "Created file with new date should exist after cleanup");
    }

    @DataProvider(name = "exportCourseSuccessfullyTest")
    public Object[][] validCoursesToExport() {
        return new Object[][]{
                {String.format("%semptyCourse.cgscrs", coursesFolder)},
                {String.format("%scourse_with_tocs_and_no_lessons.cgscrs", coursesFolder)},
                {String.format("%scourseWithAppletWithNoBundles.cgscrs", coursesFolder)},
                {String.format("%scourseWithCgsDataFile.cgscrs", coursesFolder)},
                {String.format("%scourseWithHiddenLessonAndAppletThatHaveBundles.cgscrs", coursesFolder)},
                {String.format("%ssmallCourseWithLessonAndQuiz.cgscrs", coursesFolder)},
                {String.format("%slargeCourse.cgscrs", coursesFolder)},
                {String.format("%scourseWithMediaFiles.cgscrs", coursesFolder)},
                // TODO: the eBook test should work. It currently fails because the schema validator thinks the pages' titles are object and it expects strings which they're actually are
//                {String.format("%seBookCourse.cgscrs", coursesFolder)}
        };
    }

    @Test(dataProvider = "exportCourseSuccessfullyTest")
    public void exportCourseSuccessfullyTest(String courseToImportPath) throws Exception {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        logger.debug(String.format("stopwatch testUtils.importCourseFromFile start"));
        ImportCourseData importCourseData = testUtils.importCourseFromFile(courseToImportPath);
        logger.debug(String.format("stopwatch testUtils.importCourseFromFile: %s ms", stopWatch.getTime()));
        importedCourses.put(importCourseData.getCourseId(), importCourseData);
        stopWatch.reset();
        stopWatch.start();
        String relativeExportedCoursePath = testUtils.exportCourse(importCourseData.getPublisherId(), importCourseData.getCourseId());
        logger.debug(String.format("stopwatch testUtils.exportCourse: %s ms", stopWatch.getTime()));
        File exportedCourseFile = new File(exportImportService.getExportedCoursesLocation(), relativeExportedCoursePath.replace("/export/output/", ""));
        exportedCoursesFilesPaths.add(exportedCourseFile);

        stopWatch.reset();
        stopWatch.start();
        importCourseData = testUtils.importCourseFromFile(exportedCourseFile.getAbsolutePath());
        logger.debug(String.format("stopwatch testUtils.import: %s ms", stopWatch.getTime()));
        stopWatch.reset();
        stopWatch.start();
        importedCourses.put(importCourseData.getCourseId(), importCourseData);
        CGSValidationReport cgsValidationReport = courseDataService.validateCourseAndSubElements(importCourseData.getPublisherId(), importCourseData.getCourseId());
        logger.debug(String.format("stopwatch courseDataService.validateCourseAndSubElements: %s ms", stopWatch.getTime()));

        Assert.assertTrue(cgsValidationReport.isSuccess());
        stopWatch.stop();
    }

    @DataProvider(name = "exportCourseFailureTest")
    public Object[][] invalidCoursesToExport() {
        return new Object[][]{
                {String.format("%scourse_with_missing_lesson.cgscrs", coursesFolder)}
        };
    }

//    @Test(dataProvider = "exportCourseFailureTest")
//    public void exportCourseFailureTest(String courseToImportPath) throws Exception {
//        ImportCourseData importCourseData = testUtils.importCourseFromFile(courseToImportPath);
//        importedCourses.put(importCourseData.getCourseId(), importCourseData);
//
//        String errorMsg = null;
//        try {
//            testUtils.exportCourse(importCourseData.getPublisherId(), importCourseData.getCourseId());
//        } catch (Exception e) {
//            errorMsg = e.getMessage();
//        }
//
//        Assert.assertNotNull(errorMsg);
//        Assert.assertTrue(errorMsg.contains("message: Could not find tocItem LESSON : 1d025728-bd21-46d5-b45f-8d22e4d3b22d."));
//    }
}