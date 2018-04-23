package org.t2k.ebooks;

import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang3.StringUtils;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.util.ReflectionTestUtils;
import org.t2k.cgs.Application;
import org.t2k.cgs.dao.ebooks.EBooksDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.ebooks.EBookCleanupService;
import org.t2k.cgs.ebooks.EBookService;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.enums.OverlayElementsTypes;
import org.t2k.cgs.model.ebooks.BasicEBookDTO;
import org.t2k.cgs.model.ebooks.EBook;
import org.t2k.cgs.model.ebooks.EBookStructure;
import org.t2k.cgs.model.ebooks.JouveEnrichment;
import org.t2k.cgs.security.CGSUserDetails;
import org.t2k.sample.dao.exceptions.DaoException;
import org.t2k.testUtils.ImportCourseData;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.mock;

/**
 * Created by moshe.avdiel on 10/19/2015.
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
//@WebAppConfiguration
//@IntegrationTest
//@TestExecutionListeners(inheritListeners = false, listeners = {
//        DependencyInjectionTestExecutionListener.class,
//        DirtiesContextTestExecutionListener.class })
public class EBookServiceTest extends AbstractTestNGSpringContextTests {

    public static final int TEST_PUBLISHER_ID = 22222;
    private final int PUBLISHER_ID_WITH_EBOOKS = 200;
    private final int MOCK_PUBLISHER_ID = -100;
    private String coursesFolder = null;
    private List<ImportCourseData> importedCourses = new ArrayList<>();
    private List<EBook> importedEBooks = new ArrayList<>();

    private EBooksDao eBooksDaoMock;

    @Autowired
    private EBookService eBookService;

    @Autowired
    private EBookCleanupService eBookCleanupService;

    @Autowired
    private EBookService eBookServiceWithMock;

    @Autowired
    private TestUtils testUtils;


    @BeforeClass
    public void initialize() throws IOException {
        eBooksDaoMock = mock(EBooksDao.class);
//        ((EBookServiceImpl) this.eBookServiceWithMock).setEBooksDao(eBooksDaoMock);
        ReflectionTestUtils.setField(this.eBookServiceWithMock, "eBooksDao", eBooksDaoMock);

        ClassLoader classLoader = this.getClass().getClassLoader();
        if (classLoader.getResource("courses") == null || classLoader.getResource("courses").getPath() == null) {
            throw new IOException("Cannot find courses folder in class loader: " + classLoader);
        }

        coursesFolder = new File(classLoader.getResource("courses").getPath()).getAbsolutePath() + File.separator;
    }

    @AfterClass
    public void removeAllImportedCoursesAndBooks() throws IOException, DsException {
        for (ImportCourseData course : importedCourses) {      // removing all resources of the imported course
            testUtils.removeAllResourcesFromImportCourse(course);
        }
        for (EBook eBook : importedEBooks) {
            testUtils.removeEBook(eBook);
        }
    }

    @Test
    public void getBasicEbooksInfoPublisherNotExistsTest() throws DsException {
        int nonExistingPublisherId = testUtils.getANonExistingPublisherId();
        List<BasicEBookDTO> basicEBooksInfo = eBookServiceWithMock.getAllPublisherBasicEBooksInfo(nonExistingPublisherId);
        Assert.assertTrue(basicEBooksInfo.isEmpty());
    }

    @Test(expectedExceptions = DsException.class)
    public void getBasicEbooksInfoDbFailureTest() throws DsException, DaoException {
        Mockito.when(eBooksDaoMock.getAllPublisherEBooks(MOCK_PUBLISHER_ID)).thenThrow(new DaoException("failure"));
        eBookServiceWithMock.getAllPublisherBasicEBooksInfo(MOCK_PUBLISHER_ID); // should throw DSException
    }

    @Test
    public void getBasicEbooksInfoDataConversionSuccessTest() throws DsException, DaoException {
        EBook mockEbook = new EBook.Builder("eBookId", PUBLISHER_ID_WITH_EBOOKS, "sha1String")
                .setUsername("test")
                .setOriginalFileName("eBookFileName")
                .setStructure(new EBookStructure("structureTitle", "coverImage"))
                .setConversionLibrary(EBookConversionServiceTypes.EPUB)
                .setConversionLibraryVersion("1.0")
                .setCgsVersion("1")
                .build();

        Mockito.when(eBooksDaoMock.getAllPublisherEBooks(PUBLISHER_ID_WITH_EBOOKS)).thenReturn(Arrays.asList(mockEbook));
        List<BasicEBookDTO> basicEBooksInfo = eBookServiceWithMock.getAllPublisherBasicEBooksInfo(PUBLISHER_ID_WITH_EBOOKS);

        // check expected result
        Assert.assertEquals(basicEBooksInfo.size(), 1);
        Assert.assertEquals(basicEBooksInfo.get(0).getCoverImage(), mockEbook.getStructure().getCoverImage());
        Assert.assertEquals(basicEBooksInfo.get(0).getEBookId(), mockEbook.getEBookId());
        Assert.assertEquals(basicEBooksInfo.get(0).getTitle(), mockEbook.getStructure().getTitle());
        Assert.assertEquals(basicEBooksInfo.get(0).getConversionLibrary(), mockEbook.getConversionLibrary().libraryName());
    }

    @Test
    public void getEBooksInfoByCourseWithoutAdditionalBooksTest() throws Exception {

        String source = String.format("%sebookExportedCourse.cgscrs", coursesFolder);
        ImportCourseData importCourseData = testUtils.importCourseFromFile(source);
        importedCourses.add(importCourseData);

        List<BasicEBookDTO> actualEbooksInCourse = eBookService.getPublisherBasicEBooksInfoByCourseAndAdditionalEBooksId(importCourseData.getPublisherId(), importCourseData.getCourseId(), null);
        String[] expectedCourseEBooks = {"94f6d308-8ea6-4506-a4eb-db20fbd93afa", "a2de847e-4136-4b81-82fa-36690722a473"};

        Assert.assertEquals(actualEbooksInCourse.size(), expectedCourseEBooks.length);
        for (BasicEBookDTO eBook : actualEbooksInCourse) {
            Assert.assertTrue(ArrayUtils.contains(expectedCourseEBooks, eBook.getEBookId()));
        }
    }

    @Test
    public void getEBooksInfoByCourseWithAdditionalEBooksTest() throws Exception {
        EBook eBook1 = addEBookForTest(TestEBookJson.EBOOK_EXAMPLE_1.getFilePath());
        EBook eBook2 = addEBookForTest(TestEBookJson.EBOOK_EXAMPLE_2.getFilePath());

        String source = String.format("%sebookExportedCourse.cgscrs", coursesFolder);
        ImportCourseData importCourseData = testUtils.importCourseFromFile(source);
        importedCourses.add(importCourseData);
        String[] additionalEBooksArray = {eBook1.getEBookId(), eBook2.getEBookId()};
        String additionalEBooks = StringUtils.join(additionalEBooksArray, ",");

        List<BasicEBookDTO> eBooks = eBookService.getPublisherBasicEBooksInfoByCourseAndAdditionalEBooksId(importCourseData.getPublisherId(), importCourseData.getCourseId(), additionalEBooks);
        List expectedEBooks = Arrays.asList("94f6d308-8ea6-4506-a4eb-db20fbd93afa", "a2de847e-4136-4b81-82fa-36690722a473", eBook1.getEBookId(), eBook2.getEBookId());

        Assert.assertEquals(eBooks.size(), expectedEBooks.size());
        for (BasicEBookDTO eBook : eBooks) {
            Assert.assertTrue(ArrayUtils.contains(expectedEBooks.toArray(), eBook.getEBookId()));
        }
    }

    @Test
    public void getEBooksInfoByEmptyCourseWithAdditionalEBooksTest() throws Exception {
        EBook eBook1 = addEBookForTest(TestEBookJson.EBOOK_EXAMPLE_1.getFilePath());
        EBook eBook2 = addEBookForTest(TestEBookJson.EBOOK_EXAMPLE_2.getFilePath());

        String source = String.format("%semptyEbookCourse.cgscrs", coursesFolder);
        ImportCourseData importCourseData = testUtils.importCourseFromFile(source);
        importedCourses.add(importCourseData);
        String[] additionalEBooksArray = {eBook1.getEBookId(), eBook2.getEBookId()};
        String additionalEBooks = StringUtils.join(additionalEBooksArray, ",");

        List<BasicEBookDTO> eBooks = eBookService.getPublisherBasicEBooksInfoByCourseAndAdditionalEBooksId(importCourseData.getPublisherId(), importCourseData.getCourseId(), additionalEBooks);
        String[] expectedEBooks = {eBook1.getEBookId(), eBook2.getEBookId()};

        Assert.assertEquals(eBooks.size(), expectedEBooks.length);
        for (BasicEBookDTO eBook : eBooks) {
            Assert.assertTrue(ArrayUtils.contains(expectedEBooks, eBook.getEBookId()));
        }
    }

    @Test
    public void getEBooksInfoByEmptyCourseWithoutAdditionalEBooksTest() throws Exception {

        String source = String.format("%semptyEbookCourse.cgscrs", coursesFolder);
        ImportCourseData importCourseData = testUtils.importCourseFromFile(source);
        importedCourses.add(importCourseData);

        List<BasicEBookDTO> eBooks = eBookService.getPublisherBasicEBooksInfoByCourseAndAdditionalEBooksId(importCourseData.getPublisherId(), importCourseData.getCourseId(), null);
        String[] expectedEBooks = {};

        Assert.assertEquals(eBooks.size(), expectedEBooks.length);
        for (BasicEBookDTO eBook : eBooks) {
            Assert.assertTrue(ArrayUtils.contains(expectedEBooks, eBook.getEBookId()));
        }
    }

    @Test
    public void getEBooksInfoByEmptyCourseWithNonExistingAdditionalEBookTest() throws Exception {

        String source = String.format("%semptyEbookCourse.cgscrs", coursesFolder);
        ImportCourseData importCourseData = testUtils.importCourseFromFile(source);
        importedCourses.add(importCourseData);

        List<BasicEBookDTO> eBooks = eBookService.getPublisherBasicEBooksInfoByCourseAndAdditionalEBooksId(importCourseData.getPublisherId(), importCourseData.getCourseId(), "123");
        String[] expectedEBooks = {};

        Assert.assertEquals(eBooks.size(), expectedEBooks.length);
        for (BasicEBookDTO eBook : eBooks) {
            Assert.assertTrue(ArrayUtils.contains(expectedEBooks, eBook.getEBookId()));
        }
    }

    private EBook addEBookForTest(String ebookPath) throws Exception {
        File ebookFile = testUtils.readResourceAsFile(ebookPath);
        EBook eBook = eBookService.createEbookFromFile(ebookFile, TEST_PUBLISHER_ID);
        eBookService.saveEBook(eBook);
        String ebookFolder = eBookCleanupService.getEBookFolderById(eBook.getPublisherId(), eBook.getEBookId());
        File eBookFolder = new File(ebookFolder);
        eBookFolder.mkdir();
        importedEBooks.add(eBook);
        return eBook;
    }

    @Test
    public void calculateSha1Hash() throws Exception {
        String originalSha1 = ReflectionTestUtils.invokeMethod(eBookService, "calculateSha1Hash", "original file",
                testUtils.readResourceAsFile(TestEBookFile.EPUB_3_MOBY_DICK.getFilePath()));
        String modifiedSha1 = ReflectionTestUtils.invokeMethod(eBookService, "calculateSha1Hash", "modified file",
                testUtils.readResourceAsFile(TestEBookFile.EPUB_3_MOBY_DICK_MODIFIED.getFilePath()));
        Assert.assertNotEquals(originalSha1, modifiedSha1);
    }

    @Test
    public void updateEBooksReferences() throws Exception {
        EBook original = addEBookForTest(TestEBookJson.EPUB3_ACCESSIBLE.getFilePath());
        EBook modified1 = addEBookForTest(TestEBookJson.EPUB3_ACCESSIBLE_MODIFIED_1.getFilePath());
        EBook modified2 = addEBookForTest(TestEBookJson.EPUB3_ACCESSIBLE_MODIFIED_2.getFilePath());
        CGSUserDetails dummyUser = testUtils.createMockUser();

        ReflectionTestUtils.invokeMethod(eBookService, "updateEBooksReferences", TEST_PUBLISHER_ID, modified1, original);
        EBook originalFromDB = eBookService.getByPublisherAndEBookId(original.getEBookId(), TEST_PUBLISHER_ID);
        EBook modified1FromDB = eBookService.getByPublisherAndEBookId(modified1.getEBookId(), TEST_PUBLISHER_ID);
        Assert.assertEquals(modified1FromDB.getFirstVersionCreationDate(), original.getCreationDate());
        Assert.assertEquals(originalFromDB.getUpdatedEBookId(), modified1.getEBookId());
        Assert.assertNull(modified1FromDB.getUpdatedEBookId());

        ReflectionTestUtils.invokeMethod(eBookService, "updateEBooksReferences", TEST_PUBLISHER_ID, modified2, modified1FromDB);
        originalFromDB = eBookService.getByPublisherAndEBookId(original.getEBookId(), TEST_PUBLISHER_ID);
        modified1FromDB = eBookService.getByPublisherAndEBookId(modified1.getEBookId(), TEST_PUBLISHER_ID);
        EBook modified2FromDB = eBookService.getByPublisherAndEBookId(modified2.getEBookId(), TEST_PUBLISHER_ID);
        Assert.assertEquals(modified1FromDB.getFirstVersionCreationDate(), original.getCreationDate());
        Assert.assertEquals(modified2FromDB.getFirstVersionCreationDate(), original.getCreationDate());
        Assert.assertEquals(originalFromDB.getUpdatedEBookId(), modified2.getEBookId());
        Assert.assertEquals(modified1FromDB.getUpdatedEBookId(), modified2.getEBookId());
        Assert.assertNull(modified2FromDB.getUpdatedEBookId());

        eBookCleanupService.removeEBook(original);
        eBookCleanupService.removeEBook(modified1);
        eBookCleanupService.removeEBook(modified2);
    }

    @Test(expectedExceptions = IllegalArgumentException.class)
    public void updateEBooksReferencesFailure() throws Exception {
        EBook original = addEBookForTest(TestEBookJson.EPUB3_ACCESSIBLE.getFilePath());
        EBook modified1 = addEBookForTest(TestEBookJson.EPUB3_ACCESSIBLE_MODIFIED_1.getFilePath());
        CGSUserDetails dummyUser = testUtils.createMockUser();

        ReflectionTestUtils.invokeMethod(eBookService, "updateEBooksReferences",
                TEST_PUBLISHER_ID, modified1, original);
        EBook originalFromDB = eBookService.getByPublisherAndEBookId(original.getEBookId(), TEST_PUBLISHER_ID);
        EBook modified1FromDB = eBookService.getByPublisherAndEBookId(modified1.getEBookId(), TEST_PUBLISHER_ID);
        ReflectionTestUtils.invokeMethod(eBookService, "updateEBooksReferences",
                TEST_PUBLISHER_ID, originalFromDB, modified1FromDB);
        eBookCleanupService.removeEBook(original);
        eBookCleanupService.removeEBook(modified1);
    }

//    @Test
//    public void updateJouveEnrichments() {
//        JouveEnrichment jouveEnrichment = new JouveEnrichment.Builder()
//                .type(OverlayElementsTypes.AUDIO_FILE.toString())
//                .path()
//                .mediaFilePath()
//    }
}