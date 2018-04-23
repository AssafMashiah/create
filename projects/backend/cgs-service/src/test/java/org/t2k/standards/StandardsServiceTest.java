package org.t2k.standards;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.course.CourseDataService;
import org.t2k.cgs.dao.standards.StandardsDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.lock.LockService;
import org.t2k.cgs.locks.LockUser;
import org.t2k.cgs.model.classification.StandardsChange;
import org.t2k.cgs.model.classification.StandardsDiff;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.standards.StandardsServiceImpl;
import org.t2k.cgs.tocItem.TocItemsManager;
import org.t2k.cgs.tocItem.TocItemsManagerImpl;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.Arrays;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 5/2/13
 * Time: 8:36 AM
 */
@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@Test(groups = {"ignore"})
public class StandardsServiceTest extends AbstractTestNGSpringContextTests {

    private StandardsServiceImpl standardsService;

    @Autowired
    private TocItemsManager tocItemsManager;

    @Autowired
    private StandardsDao standardsDao;

    private int publisherId = 1;
    private String courseId = "eb75ffe4-efeb-461c-872d-2f271bcb5c17";

    @BeforeMethod
    public void init() throws Exception {
        //Set up mock dao
        String standardsString10 = readResourcesAsString("standards/standards-1.0.json");
        String standardsString11 = readResourcesAsString("standards/standards-1.1.json");
        String standardsString12 = readResourcesAsString("standards/standards-1.2.json");
        String standardsString13 = readResourcesAsString("standards/standards-1.3.json");
        String standardsString14 = readResourcesAsString("standards/standards-1.4.json");
        String standardsString15 = readResourcesAsString("standards/standards-1.5.json");
        String standardsString16 = readResourcesAsString("standards/standards-1.6.json");
        String standardsString17 = readResourcesAsString("standards/standards-1.7.json");

        StandardsDao mockDao = mock(StandardsDao.class);
        when(mockDao.getStandardsPackage("nysls", "math", "1.0")).thenReturn(standardsString10);
        when(mockDao.getStandardsPackage("nysls", "math", "1.1")).thenReturn(standardsString11);
        when(mockDao.getStandardsPackage("nysls", "math", "1.2")).thenReturn(standardsString12);
        when(mockDao.getStandardsPackage("nysls", "math", "1.3")).thenReturn(standardsString13);
        when(mockDao.getStandardsPackage("nysls", "math", "1.4")).thenReturn(standardsString14);
        when(mockDao.getStandardsPackage("nysls", "math", "1.5")).thenReturn(standardsString15);
        when(mockDao.getStandardsPackage("nysls", "math", "1.6")).thenReturn(standardsString16);
        when(mockDao.getStandardsPackage("nysls", "math", "1.7")).thenReturn(standardsString17);

        standardsService = new StandardsServiceImpl(standardsDao,
                getMockLockService(),
                getMockCourseDataService(),
                tocItemsManager,
                null,
                null);
    }

    public LockService getMockLockService() throws DsException {
        LockService mockLockService = mock(LockService.class);
        return mockLockService;
    }

    private CourseDataService getMockCourseDataService() throws IOException, DsException {
        String courseAsString = readResourcesAsString("courses/eb75ffe4-efeb-461c-872d-2f271bcb5c17.json");
        CourseDataService mockCourseDataService = mock(CourseDataService.class);
        when(mockCourseDataService.getCourse(publisherId, courseId, null, false)).thenReturn(new CourseCGSObject(courseAsString, publisherId));
        when(mockCourseDataService.getAllTocItemCIdsFromCourse(publisherId, courseId)).thenReturn(Arrays.asList("4f2f8046-b79b-4e06-a3f4-e4caab435e85", "855a4d71-c4bc-4938-a410-17f8b144efba"));
        return mockCourseDataService;
    }

    private TocItemsManager getMockTocItemsManager() throws DsException {
        TocItemsManagerImpl mockTocItemsManager = mock(TocItemsManagerImpl.class);
//        when(mockTocItemsManager.get(publisherId, String tocItemCid, change.getCourseId(), null, false);
        return mockTocItemsManager;
    }

    @Test
    public void testNoChange() throws Exception {
        StandardsDiff diff = standardsService.getDiff("nysls", "math", "1.1", "1.2");
        assertEquals(diff.getNewStandards().size(), 0);
        assertEquals(diff.getDeletedStandards().size(), 0);
        assertEquals(diff.getUpdatedStandards().size(), 0);
    }

    @Test
    public void testSimpleUpdatedStandard() throws Exception {
        StandardsDiff diff = standardsService.getDiff("nysls", "math", "1.0", "1.1");
        assertEquals(diff.getNewStandards().size(), 0);
        assertEquals(diff.getDeletedStandards().size(), 0);
        assertEquals(diff.getUpdatedStandards().size(), 1);
        assertTrue(diff.getUpdatedStandards().contains("M.1"));
    }

    @Test
    public void testSimpleNewStandard() throws Exception {
        StandardsDiff diff = standardsService.getDiff("nysls", "math", "1.2", "1.3");
        assertEquals(diff.getNewStandards().size(), 1);
        assertTrue(diff.getNewStandards().contains("M.1.1.1"));
        assertEquals(diff.getDeletedStandards().size(), 0);
        assertEquals(diff.getUpdatedStandards().size(), 0);
    }

    @Test
    public void testSimpleDeletedStandard() throws Exception {
        StandardsDiff diff = standardsService.getDiff("nysls", "math", "1.3", "1.4");
        assertEquals(diff.getNewStandards().size(), 0);
        assertEquals(diff.getDeletedStandards().size(), 1);
        assertTrue(diff.getDeletedStandards().contains("M.1.1.1"));
        assertEquals(diff.getUpdatedStandards().size(), 0);
    }

    @Test
    public void testSimpleChange() throws Exception {
        StandardsDiff diff = standardsService.getDiff("nysls", "math", "1.0", "1.4");
        assertEquals(diff.getNewStandards().size(), 0);
        assertEquals(diff.getDeletedStandards().size(), 0);
        assertEquals(diff.getUpdatedStandards().size(), 1);
        assertTrue(diff.getUpdatedStandards().contains("M.1"));
    }

    @Test
    public void testMultipleNewStandards() throws Exception {
        StandardsDiff diff = standardsService.getDiff("nysls", "math", "1.4", "1.5");
        assertEquals(diff.getNewStandards().size(), 4);
        assertTrue(diff.getNewStandards().contains("M.1.2"));
        assertTrue(diff.getNewStandards().contains("M.1.3"));
        assertTrue(diff.getNewStandards().contains("M.1.3.1"));
        assertTrue(diff.getNewStandards().contains("M.1.3.2"));
        assertEquals(diff.getDeletedStandards().size(), 0);
        assertEquals(diff.getUpdatedStandards().size(), 0);
    }

    @Test
    public void testMultipleDeletedStandards() throws Exception {
        StandardsDiff diff = standardsService.getDiff("nysls", "math", "1.6", "1.7");
        assertEquals(diff.getNewStandards().size(), 0);
        assertEquals(diff.getDeletedStandards().size(), 4);
        assertTrue(diff.getDeletedStandards().contains("M.1.1"));
        assertTrue(diff.getDeletedStandards().contains("M.1.3"));
        assertTrue(diff.getDeletedStandards().contains("M.1.3.1"));
        assertTrue(diff.getDeletedStandards().contains("M.1.3.2"));
        assertEquals(diff.getUpdatedStandards().size(), 0);
    }

    @Test
    public void testMultipleUpdatedStandards() throws Exception {
        StandardsDiff diff = standardsService.getDiff("nysls", "math", "1.5", "1.6");
        assertEquals(diff.getNewStandards().size(), 0);
        assertEquals(diff.getDeletedStandards().size(), 0);
        assertEquals(diff.getUpdatedStandards().size(), 3);
        assertTrue(diff.getUpdatedStandards().contains("M.1.1"));
        assertTrue(diff.getUpdatedStandards().contains("M.1.3"));
        assertTrue(diff.getUpdatedStandards().contains("M.1.3.2"));
    }

    @Test
    public void testMultipleChangedStandards() throws Exception {
        StandardsDiff diff = standardsService.getDiff("nysls", "math", "1.2", "1.7");
        assertEquals(diff.getNewStandards().size(), 1);
        assertTrue(diff.getNewStandards().contains("M.1.2"));
        assertEquals(diff.getDeletedStandards().size(), 1);
        assertTrue(diff.getDeletedStandards().contains("M.1.1"));
        assertEquals(diff.getUpdatedStandards().size(), 0);

        diff = standardsService.getDiff("nysls", "math", "1.2", "1.6");
        assertEquals(diff.getNewStandards().size(), 4);
        assertTrue(diff.getNewStandards().contains("M.1.2"));
        assertTrue(diff.getNewStandards().contains("M.1.3"));
        assertTrue(diff.getNewStandards().contains("M.1.3.1"));
        assertTrue(diff.getNewStandards().contains("M.1.3.2"));
        assertEquals(diff.getDeletedStandards().size(), 0);
        assertEquals(diff.getUpdatedStandards().size(), 1);
        assertTrue(diff.getUpdatedStandards().contains("M.1.1"));
    }

    private String readResourcesAsString(String localPath) throws IOException {
        InputStream resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
        StringWriter writer = new StringWriter();
        IOUtils.copy(resourceAsStream, writer);
        resourceAsStream.close();
        return writer.toString();
    }

    private LockUser getLockingUser() {
        int publisherId = 1;
        String userEmail = "asdfas@123.com";
        String userLastName = "qqqq";
        String userFirstName = "qqqq";
        String userName = "qqqq";

        return new LockUser(userName, userFirstName, userLastName, userEmail, publisherId);
    }

    @Test
    public void prepareForDeletion() throws DsException {
        String packageName = "teks";
        String subjectArea = "math";
        int publisherId = 1;
        StandardsChange change = standardsService.prepareForStandardsPackageDelete(getLockingUser(), publisherId, courseId, packageName, subjectArea);
    }

    @Test
    public void prepareForUpdate() throws DsException {
        String newVersion = "2.6";
        String currentVersion = "2.0";
        String packageName = "ccss";
        String subjectArea = "math";
        int publisherId = 1;
        StandardsChange change = standardsService.prepareForStandardsPackageUpdate(getLockingUser(), publisherId, courseId, packageName, subjectArea, newVersion);
    }

    @Test
    public void simpleUpdate() throws DsException, IOException {
        String newVersion = "2.6";
        String currentVersion = "2.0";
        String courseId = "eb75ffe4-efeb-461c-872d-2f271bcb5c17";
        String packageName = "ccss";
        String subjectArea = "math";
//        this.standardsService.setStandardsDao(standardsDao);
        standardsService.updateStandardsPackage(getLockingUser(), publisherId, courseId, packageName, subjectArea, newVersion);
    }
}