package org.t2k.ebooks;

import com.t2k.configurations.Configuration;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.SystemUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.ebooks.EBookCleanupService;
import org.t2k.cgs.ebooks.EBookManager;
import org.t2k.cgs.ebooks.EBookService;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.model.ebooks.EBook;
import org.t2k.cgs.model.ebooks.UploadEBookResponse;
import org.t2k.cgs.model.job.Job;
import org.t2k.cgs.model.job.Job.Status;
import org.t2k.cgs.model.job.JobProperties;
import org.t2k.cgs.model.job.JobService;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.t2k.cgs.model.ebooks.EBookErrorCode.FAILED_TO_CONVERT_EBOOK_FILE;
import static org.t2k.cgs.model.job.Job.Type.UploadEBookFile;
import static org.testng.Assert.fail;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 22/10/2015
 * Time: 10:25
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class EBookManagerTest extends AbstractTestNGSpringContextTests {

    public static final String MINIFIED_THUMBAIL_SUFFIX = "-minified-thumbail.jpeg";

    public static final String BOOKS_DIR = "books";

    @Autowired
    private EBookManager eBookManager;

    @Autowired
    private EBookService eBookService;

    @Autowired
    private EBookCleanupService eBookCleanupService;

    @Autowired
    private JobService jobService;

    @Autowired
    private TestUtils testUtils;

    @Autowired
    Configuration configuration;

    private Map<String, String> eBooksToBeRemovedAfterTestsFinished = new HashMap<>();

    private int testPublisherId;

    @BeforeClass
    private void doSomething() {
        testPublisherId = testUtils.getANonExistingPublisherId();
    }

    @AfterClass
    private void onTestsFinished() throws DsException {
        for (Map.Entry eBook : eBooksToBeRemovedAfterTestsFinished.entrySet()) {
            String eBooksId = eBook.getKey().toString();
            String eBooksDir = eBook.getValue().toString();
            eBookCleanupService.removeEBook(eBooksDir, eBooksId, testPublisherId);
        }
    }

    @DataProvider(name = "uploadEPubSuccessfulTestCases", parallel = true)
    public Object[][] uploadEPubSuccessfulTestCases() {
        return new Object[][]{
//                {new UploadEBookFileTestData("Valid epub 3 - Moby Dick", EPUB_3_MOBY_DICK, BOOKS_DIR, true)},
                {new UploadEBookFileTestData("Valid epub 3 - Accessible", TestEBookFile.EPUB_3_ACCESSIBLE, true)}
//                {new UploadEBookFileTestData("Valid epub 3 - Quiz Bindings", EPUB_3_QUIZ_BINDINGS, BOOKS_DIR, true)},
//                {new UploadEBookFileTestData("Valid epub 3 - POC per Jouve Ecran", EPUB_3_POC_PER_JOUVE_ECRAN, BOOKS_DIR, true)},
//                {new UploadEBookFileTestData("Valid epub 3 - Children's Literature", EPUB_3_CHILDRENS_LITERATURE, BOOKS_DIR, true)},
//                {new UploadEBookFileTestData("Valid epub 3 - Retz Ecole des Albums Texte Seul", EPUB_3_RETZ_ECOLE_DES_ALBUMS_TEXTE_SEUL, BOOKS_DIR, true)},
//                {new UploadEBookFileTestData("Valid epub 3 - epub with images - ANA_MATH_3E", EPUB_3_ANA_MATH_3E, BOOKS_DIR, true)}
        };
    }

    @DataProvider(name = "uploadPdfSuccessfulTestCases", parallel = true)
    public Object[][] uploadPdfSuccessfulTestCases() {
        return new Object[][]{
//                {new UploadEBookFileTestData("Valid pdf - Beitza", PDF_BEITZA, BOOKS_DIR, false)},
                {new UploadEBookFileTestData("Valid pdf - 6 pages with fonts and 1 blank page",
                        TestEBookFile.PDF_BLANK_PAGE_AND_FONTS, false)},
                {new UploadEBookFileTestData("Valid pdf - 1 page with missing font",
                        TestEBookFile.PDF_PAGE_WITH_MISSING_FONT, false)}
        };
    }

    @DataProvider(name = "uploadPdf_SINGLE", parallel = true)
    public Object[][] uploadPdf_SINGLE() {
        return new Object[][]{
                {new UploadEBookFileTestData("Beitza PDF", TestEBookFile.PDF_BEITZA, false)}
        };
    }

    @Test(dataProvider = "uploadEPubSuccessfulTestCases", threadPoolSize = 6, enabled = true)
    public void uploadEPub3FileTest(UploadEBookFileTestData uploadEBookFileTestData) throws Exception {

        String username = "dummy-user";
        Job job = uploadEBookFile(uploadEBookFileTestData.getEBookFileName(), uploadEBookFileTestData.getEBookRelativePath(), testPublisherId, username);

        // Validate the upload of the eBook finished successfully
        Assert.assertEquals(job.getStatus(), Status.COMPLETED);

        // Validate the file was saved to FS
        String eBooksDir = job.getProperties().getEBooksDir();
        String eBookId = job.getProperties().getEBookId();
        String publisherIdString = String.valueOf(testPublisherId);
        String publisherDir = eBooksDir.substring(0, eBooksDir.indexOf(publisherIdString) + publisherIdString.length());
        eBooksToBeRemovedAfterTestsFinished.put(eBookId, publisherDir);

        File eBookDir = new File(eBooksDir);
        Assert.assertTrue(eBookDir.exists());
        Assert.assertTrue(eBookDir.isDirectory());

        // Validate the eBook's data was successfully saved in DB
        EBook eBook = eBookService.getByPublisherAndEBookId(eBookId, testPublisherId);
        Assert.assertNotNull(eBook);
        Assert.assertEquals(eBook.getUsername(), username);
        Assert.assertEquals(eBook.getEBookId(), eBookId);
        Assert.assertEquals(eBook.getPublisherId(), testPublisherId);
        Assert.assertEquals(eBook.getOriginalFileName(), uploadEBookFileTestData.getEBookFileName());

        // Validate thumbnails were created for each page
        eBook.getStructure().getPages().parallelStream().forEach(page -> {
            Assert.assertNotNull(page.getThumbnailHref());
            Assert.assertFalse(page.getThumbnailHref().isEmpty());
            Assert.assertTrue(new File(publisherDir, page.getThumbnailHref()).exists());
        });

        if (uploadEBookFileTestData.isHasCoverImage()) {
            File coverImage = new File(publisherDir, eBook.getStructure().getCoverImage());
            logger.debug("Image cover href is: " + coverImage.getAbsolutePath());
            Assert.assertTrue(coverImage.exists(), "Cover image should exist for this epub");
            Assert.assertTrue(coverImage.getName().endsWith(MINIFIED_THUMBAIL_SUFFIX), "Cover image should be minified");
        }
    }

    @Test
    public void uploadEPub2FileTest() throws Exception {
        String username = "dummy-user";
        Job job = uploadEBookFile(TestEBookFile.EPUB_2_EXAMPLE.getFileName(), BOOKS_DIR, testPublisherId, username);

        // Validate the process had failed
        Assert.assertEquals(job.getStatus(), Status.FAILED);
        Assert.assertFalse(job.getErrors().isEmpty());
        Assert.assertEquals(job.getErrors().size(), 1);
        Assert.assertTrue(job.getErrors().get(FAILED_TO_CONVERT_EBOOK_FILE.getCode()).contains("Only EPUB 3"));

        validateEPubFileSystemCleanup(job);
        validateEBookWasNotSavedInDb(job, testPublisherId);
    }


    private String createJobForUploadProcess(int publisherId, String eBookId, String username) throws DsException {
        String jobId = UUID.randomUUID().toString();
        String eBookDir = eBookCleanupService.getEBookFolderById(publisherId, eBookId);

        // New Job
        Job uploadJob = new Job(jobId, UploadEBookFile);
        uploadJob.setStatus(Job.Status.PENDING);

        // Job Properties
        JobProperties properties = new JobProperties();
        properties.setEBookId(eBookId);
        properties.setEBooksDir(eBookDir);
        properties.setPublisherId(publisherId);
        properties.setUsername(username);
        uploadJob.setProperties(properties);

        // Save in DB.
        jobService.saveJob(uploadJob);

        return jobId;
    }


    @Test(dataProvider = "uploadPdf_SINGLE", enabled = true)
    public void uploadSinglePdf(UploadEBookFileTestData uploadEBookFileTestData) throws Exception {
        String username = "dummy-user";
        Job job = uploadEBookFile(uploadEBookFileTestData.getEBookFileName(), uploadEBookFileTestData.getEBookRelativePath(), testPublisherId, username);

        // Validate the process is Finished
        Assert.assertEquals(job.getStatus(), Status.COMPLETED);
        Assert.assertTrue(job.getErrors().isEmpty());

        // Validate the upload of the eBook finished successfully
        Assert.assertEquals(job.getStatus(), Status.COMPLETED);

        // Validate the file was saved to FS
        String eBooksDir = job.getProperties().getEBooksDir();
        String eBookId = job.getProperties().getEBookId();
        String publisherIdString = String.valueOf(testPublisherId);
        String publisherDir = eBooksDir.substring(0, eBooksDir.indexOf(publisherIdString) + publisherIdString.length());
        eBooksToBeRemovedAfterTestsFinished.put(eBookId, publisherDir);

        File eBookDir = new File(eBooksDir);
        Assert.assertTrue(eBookDir.exists());
        Assert.assertTrue(eBookDir.isDirectory());

        // Validate the eBook's data was successfully saved in DB
        EBook eBook = eBookService.getByPublisherAndEBookId(eBookId, testPublisherId);
        Assert.assertNotNull(eBook);
        Assert.assertEquals(eBook.getUsername(), username);
        Assert.assertEquals(eBook.getEBookId(), eBookId);
        Assert.assertEquals(eBook.getPublisherId(), testPublisherId);
    }

    @Test(dataProvider = "uploadPdfSuccessfulTestCases" /*, threadPoolSize = 3*/, enabled = true)
    public void uploadSameBook(UploadEBookFileTestData uploadEBookFileTestData) throws Exception {
        String username = "dummy-user";
        Job job = uploadEBookFile(uploadEBookFileTestData.getEBookFileName(), uploadEBookFileTestData.getEBookRelativePath(), testPublisherId, username);

        // Validate the process is Finished
        Assert.assertEquals(job.getStatus(), Status.COMPLETED);
        Assert.assertTrue(job.getErrors().isEmpty());
        // Validate the upload of the eBook finished successfully

        // Validate the file was saved to FS
        String eBooksDir = job.getProperties().getEBooksDir();
        String eBookId = job.getProperties().getEBookId();
        String publisherIdString = String.valueOf(testPublisherId);
        String publisherDir = eBooksDir.substring(0, eBooksDir.indexOf(publisherIdString) + publisherIdString.length());

        File eBookDir = new File(eBooksDir);
        Assert.assertTrue(eBookDir.exists());
        Assert.assertTrue(eBookDir.isDirectory());

        // Validate the eBook's data was successfully saved in DB
        EBook eBook = eBookService.getByPublisherAndEBookId(eBookId, testPublisherId);
        Assert.assertNotNull(eBook);
        Assert.assertEquals(eBook.getUsername(), username);
        Assert.assertEquals(eBook.getEBookId(), eBookId);
        Assert.assertEquals(eBook.getPublisherId(), testPublisherId);

        //---[   SECOND UPLOAD   ]---
        // Upload Again and Read Again the same eBook Id.
        job = uploadEBookFile(uploadEBookFileTestData.getEBookFileName(), uploadEBookFileTestData.getEBookRelativePath(), testPublisherId, username);

        // Validate the file was saved to FS (only if requested by configuration using the isCheckAlreadyBeforeSave property).
        String propSecondEBookDir = job.getProperties().getEBooksDir();
        File secondEBookDir = new File(propSecondEBookDir);
        String propIsCheck = configuration.getProperty(EBookService.PROP_CHECK_EBOOK_EXISTS_BEFORE_SAVING);
        boolean isCheck = Boolean.parseBoolean(propIsCheck);
        String eBookId_2 = job.getProperties().getEBookId();

        // Validate the process is Finished
        Assert.assertEquals(job.getStatus(), Status.COMPLETED);
        Assert.assertTrue(job.getErrors().isEmpty());
        // Verify the second upload created a "Destination Upload" directory, only if the configuration requested to upload again the same book.  meaning, check is "False".
        Assert.assertEquals(secondEBookDir.exists(), !isCheck);
        Assert.assertEquals(eBookId_2, eBookId);

        eBooksToBeRemovedAfterTestsFinished.put(eBookId, publisherDir);

        if (!isCheck) {
            eBooksToBeRemovedAfterTestsFinished.put(eBookId_2, publisherDir);
        }
    }

    @Test(enabled = true)
    public void uploadTextFileWithEPubExtensionTest() throws Exception {
        String username = "dummy-user";
        Job job = uploadEBookFile(TestEBookFile.EPUB_2_EXAMPLE.getFileName(), BOOKS_DIR, testPublisherId, username);

        // Validate the process had failed
        Assert.assertEquals(job.getStatus(), Status.FAILED);
        Assert.assertFalse(job.getErrors().isEmpty());
        Assert.assertEquals(job.getErrors().size(), 1);
        Assert.assertTrue(job.getErrors().get(FAILED_TO_CONVERT_EBOOK_FILE.getCode())
                .contains(String.format("The epub file %s is not valid.", TestEBookFile.EPUB_2_EXAMPLE.getFileName())));

        validateEPubFileSystemCleanup(job);
        validateEBookWasNotSavedInDb(job, testPublisherId);
    }

    private void validateEPubFileSystemCleanup(Job job) {
        if (SystemUtils.IS_OS_WINDOWS) {
            try {
                Thread.sleep(1000); // only in Windows we need to wait here because we call the GC before we try to delete the eBook's folder
            } catch (InterruptedException e) {
                // do nothing...
            }
        }

        String eBooksDir = job.getProperties().getEBooksDir();
        File eBookDir = new File(eBooksDir);
        Assert.assertFalse(eBookDir.exists());
    }

    private void validateEBookWasNotSavedInDb(Job job, int publisherId) throws DsException {
        String eBookId = job.getProperties().getEBookId();
        EBook eBook = eBookService.getByPublisherAndEBookId(eBookId, publisherId);
        Assert.assertNull(eBook);
    }

    private Job uploadEBookFile(String eBookFileName, String eBookRelativePath, int publisherId, String username) throws Exception {
//        String jobId = UUID.randomUUID().toString();
//        UploadEBookResponse response = eBookManager.createJobAndAddToPendingQueue(jobId, testPublisherId, username, new File(epubFilePath), EBookConversionServiceTypes.IDR);

        String eBookFullPath = testUtils.getResourcePath(String.format("%s/%s", eBookRelativePath, eBookFileName));
        File uploadedFile = new File(eBookFullPath);

        String eBookId = UUID.randomUUID().toString();
        String jobId = this.eBookService.createJobForUploadProcess(publisherId, eBookId, "Test1");


        UploadEBookResponse response = this.eBookManager.addJobToPendingQueue(jobId, eBookId, publisherId, username, uploadedFile, EBookConversionServiceTypes.IDR);

        jobId = response.getJobId();
        Job job = jobService.getJob(jobId);
        Assert.assertNotNull(job);
        while (job.getStatus().equals(Status.PENDING) || job.getStatus().equals(Status.IN_PROGRESS)) {
            Thread.sleep(200);
            job = jobService.getJob(jobId);
        }
        return job;
    }

    private FileItem createFileItem(File file) {
        FileItemFactory factory = new DiskFileItemFactory(0, null);
        String textFieldName = "file";

        FileItem item = factory.createItem(textFieldName, "multipart/form-data", true, file.getName());
        try {
            OutputStream os = item.getOutputStream();
            os.write(FileUtils.readFileToByteArray(file));
            os.close();
        } catch (IOException e) {
            fail("Unexpected IOException", e);
        }
        return item;
    }
}