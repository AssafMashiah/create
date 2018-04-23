package org.t2k.packaging;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.filefilter.TrueFileFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.dao.tocItem.TocItemDao;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.model.packaging.PackagingLocalContext;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.model.tocItem.TocItemIndicationForScorm;
import org.t2k.cgs.packaging.PackageResourceHandler;
import org.t2k.cgs.tocItem.TocItemDataService;
import org.t2k.testUtils.ImportCourseData;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 29/09/14
 * Time: 09:33
 */
//@ContextConfiguration("/springContext/PackagingServiceTest-context.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class PackageResourceHandlerImplTest extends AbstractTestNGSpringContextTests {

    private static final String SOME_PUBLISHER_NAME = "SOME_PUBLISHER_NAME";
    @Autowired
    private PackageResourceHandler packageResourceHandler;

    @Autowired
    private TestUtils testUtils;

    @Autowired
    @Qualifier("lessonsDataServiceBean")
    private TocItemDataService tocItemDataService;

    @Autowired
    private TocItemDao lessonsDao;

    private String coursesFolder = null;
    private List<ImportCourseData> importedCourses = new ArrayList<>();
    private List<String> tempFolders = new ArrayList<>();
    private String username = "userRand"+Math.random();
    private String cgsCourseVersion = "3.0";
    private String title = "course_name_"+Math.random();
    private List<String> locales = Arrays.asList("en_US");

    @BeforeMethod
    public void initVariables() throws IOException {
        ClassLoader classLoader = this.getClass().getClassLoader();
        if (classLoader.getResource("courses")==null || classLoader.getResource("courses").getPath()==null){
            throw new IOException("Cannot find courses folder in class loader: "+classLoader);
        }
        coursesFolder = new File(classLoader.getResource("courses").getPath()).getAbsolutePath() + File.separator;
    }
    @AfterMethod
    public void removeAllImportedCourses() throws IOException {
        for (ImportCourseData course : importedCourses){      // removing all resources of the imported course
            testUtils.removeAllResourcesFromImportCourse(course);
        }
        for (String tempFolder : tempFolders){
            FileUtils.deleteDirectory(new File(tempFolder));   // removing all resources copied to temp publish directory
        }
    }

    @Test
    public void allResourcesAreCopiedToCorrectFoldersTest() throws Exception {
        String source = String.format("%scourseWithAppletWithNoBundles.cgscrs", coursesFolder);
        ImportCourseData importCourseData = testUtils.importCourseFromFile(source);
        importedCourses.add(importCourseData);
        CGSPackage cgsPackage = new CGSPackage(importCourseData.getCourseId(),
                importCourseData.getCourseCid(),
                importCourseData.getPublisherId(),
                SOME_PUBLISHER_NAME, username, cgsCourseVersion, title, locales);
        packageResourceHandler.copyCourseResourcesForPublish(cgsPackage);
        PackagingLocalContext tempFolder = cgsPackage.getLocalResourcesLocation();
        tempFolders.add(tempFolder.getBasePath());
        validateAllFilesWereCreatedInPackageFolders(cgsPackage, 0, 33, 16, 106);
    }

    @Test
    public void packageCopyForCourseWithPluginsAndHiddenLesson() throws Exception {
        String source = String.format("%scourseWithHiddenLessonAndAppletThatHaveBundles.cgscrs", coursesFolder);
        ImportCourseData importCourseData = testUtils.importCourseFromFile(source);
        importedCourses.add(importCourseData);
        CGSPackage cgsPackage = new CGSPackage(importCourseData.getCourseId(),importCourseData.getCourseCid(), importCourseData.getPublisherId(),username, SOME_PUBLISHER_NAME, cgsCourseVersion,title, locales  );
        packageResourceHandler.copyCourseResourcesForPublish(cgsPackage);
        PackagingLocalContext tempFolder = cgsPackage.getLocalResourcesLocation();
        tempFolders.add(tempFolder.getBasePath());
        validateAllFilesWereCreatedInPackageFolders(cgsPackage, 0, 1, 3, 5);
    }

    @Test
    public void packageCopyForCourseWithPluginsAndHiddenLessonToScorm() throws Exception {
        String source = String.format("%scourseWithHiddenLessonAndAppletThatHaveBundles.cgscrs", coursesFolder);
        ImportCourseData importCourseData = testUtils.importCourseFromFile(source);
        importedCourses.add(importCourseData);
        String courseId = importCourseData.getCourseId();
        int publisherId = importCourseData.getPublisherId();

        CGSPackage cgsPackage = new CGSPackage(courseId,importCourseData.getCourseCid(), publisherId,username, SOME_PUBLISHER_NAME, cgsCourseVersion,title, locales  );
        List<TocItemCGSObject> lessons = lessonsDao.getByCourse(publisherId, courseId, false);
        TocItemCGSObject lesson = lessons.get(0);
        cgsPackage.setScormSelectedTocItems(Arrays.asList(new TocItemIndicationForScorm(lesson.getContentId(),lesson.getTitle(),false)));
        int numberOfSequences = (tocItemDataService.getSequences(lesson.getContentId(),lesson.getCourseId())).size();
        int numberOfLessons = 1 + tocItemDataService.getHiddenTocItemsIdsOfSelectedTocItems(courseId,Arrays.asList(lesson.getContentId())).size();
        packageResourceHandler.copyCourseResourcesForPublish(cgsPackage);

        PackagingLocalContext tempFolder = cgsPackage.getLocalResourcesLocation();
        tempFolders.add(tempFolder.getBasePath());
        validateAllFilesWereCreatedInPackageFolders(cgsPackage, 0, 0, numberOfLessons, numberOfSequences);
    }

    @Test
    public void onlyNecessaryFilesAreCopiedWhenPublishingToScorm() throws Exception {
        String source = String.format("%scourseWithAppletWithNoBundles.cgscrs", coursesFolder);
        ImportCourseData importCourseData = testUtils.importCourseFromFile(source);
        importedCourses.add(importCourseData);
        String courseId = importCourseData.getCourseId();
        int publisherId = importCourseData.getPublisherId();
        CGSPackage cgsPackage = new CGSPackage(courseId,importCourseData.getCourseCid(), publisherId,username,SOME_PUBLISHER_NAME, cgsCourseVersion,title, locales  );
        List<TocItemCGSObject> lessons = lessonsDao.getByCourse(publisherId, courseId, false);
        TocItemCGSObject lesson = null;

        for (TocItemCGSObject l : lessons){   // find the lesson with  "cid=b71c7cd7-5c72-4a9f-818d-9c6a2933403c"
            if (l.getContentData().get("cid").toString().equals("b71c7cd7-5c72-4a9f-818d-9c6a2933403c")){
                lesson = l;
            }
        }
        if (lesson == null){
            throw new Exception("Could not find a lesson with id \"b71c7cd7-5c72-4a9f-818d-9c6a2933403c\"");
        }
        cgsPackage.setScormSelectedTocItems(Arrays.asList(new TocItemIndicationForScorm(lesson.getContentId(),lesson.getTitle(),false)));
        int numberOfSequences = (tocItemDataService.getSequences(lesson.getContentId(),lesson.getCourseId())).size();
        packageResourceHandler.copyCourseResourcesForPublish(cgsPackage);

        PackagingLocalContext tempFolder = cgsPackage.getLocalResourcesLocation();
        tempFolders.add(tempFolder.getBasePath());
        validateAllFilesWereCreatedInPackageFolders(cgsPackage, 0, 0, 1, numberOfSequences);
    }

    private void validateAllFilesWereCreatedInPackageFolders(CGSPackage cgsPackage, int numOfApplets, int numOfAssessments, int numOfLessons, int numOfSequences) {
        HashMap<File,Integer> expectedNumberOfFilesPerFolder = new HashMap<>();
        PackagingLocalContext resourcesLocation = cgsPackage.getLocalResourcesLocation();
        expectedNumberOfFilesPerFolder.put(new File(resourcesLocation.getAppletPath()),numOfApplets);
        expectedNumberOfFilesPerFolder.put(new File(resourcesLocation.getAssessmentsPath()),numOfAssessments);
        expectedNumberOfFilesPerFolder.put(new File(resourcesLocation.getLessonsPath()), numOfLessons);
        expectedNumberOfFilesPerFolder.put(new File(resourcesLocation.getSequencesPath()),numOfSequences);

        for (Map.Entry<File, Integer> fileCountInFolder : expectedNumberOfFilesPerFolder.entrySet()) {
            File path = fileCountInFolder.getKey();
            if (path.exists() && path.isDirectory()) {
                Assert.assertEquals(path.listFiles().length,
                        fileCountInFolder.getValue().intValue(),
                        createFileCountError(path)
                                + "\nFile list in all folders is: \n"
                                + Arrays.toString(FileUtils
                                .listFiles(new File(resourcesLocation.getBasePath()),
                                        TrueFileFilter.INSTANCE,
                                        TrueFileFilter.INSTANCE).toArray()));
            }
        }
    }

    private String createFileCountError(File path){
        if (path!=null)
            return String.format("Number of files in folder %s is not correct.",path.getAbsolutePath());
        return "File not found "+path;
    }
}
