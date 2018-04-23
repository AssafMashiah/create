package org.t2k.testUtils;

import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.custommonkey.xmlunit.Diff;
import org.custommonkey.xmlunit.XMLUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dao.courses.CoursesDao;
import org.t2k.cgs.dao.packaging.PackagingDao;
import org.t2k.cgs.dao.sequences.SequencesDao;
import org.t2k.cgs.dao.tocItem.TocItemDao;
import org.t2k.cgs.dao.user.UsersDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.ebooks.EBookCleanupService;
import org.t2k.cgs.ebooks.EBookService;
import org.t2k.cgs.exportImport.ExportImportImpl;
import org.t2k.cgs.job.JobServiceImpl;
import org.t2k.cgs.lock.LockService;
import org.t2k.cgs.lock.TransactionService;
import org.t2k.cgs.locks.Transaction;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.model.ebooks.EBook;
import org.t2k.cgs.model.job.Job;
import org.t2k.cgs.model.locales.ContentLocalesTypes;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.model.packaging.PackagePhase;
import org.t2k.cgs.model.packaging.PublishTarget;
import org.t2k.cgs.packaging.validators.PublishedScormZipValidator;
import org.t2k.cgs.publisher.ExternalPartnersService;
import org.t2k.cgs.publisher.PublisherService;
import org.t2k.cgs.security.*;
import org.t2k.sample.dao.exceptions.DaoException;
import org.testng.Assert;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.util.*;

import static java.lang.Integer.MAX_VALUE;

/**
 * Created by Elad.Avidan on 22/09/2014.
 */
@Service
public class TestUtils {

    private Logger logger = Logger.getLogger(TestUtils.class);

    @Autowired
    private ExportImportImpl exportImportService;

    @Autowired
    private JobServiceImpl jobService;

    @Autowired
    private CoursesDao coursesDao;

    @Autowired
    private TocItemDao lessonsDao;

    @Autowired
    private TocItemDao assessmentsDao;

    @Autowired
    private SequencesDao sequencesDao;

    @Autowired
    private UsersDao usersDao;

    @Autowired
    private PackagingDao packagingDao;

    @Autowired
    private PublisherService publisherService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private LockService lockService;

    @Autowired
    private ExternalPartnersService externalPartnersService;

    @Autowired
    private PublishedScormZipValidator publishedScormZipValidator;

    @Autowired
    private EBookService eBookService;

    @Autowired
    private EBookCleanupService eBookCleanupService;

    private final String SEQ_ID = "seqId";
    private final String LESSON_CID = "lessonCId";
    private final String blossomURL = "http://www.blossom-kc.com/demo/WebServices/content?Upload_ExtID/";

    public ImportCourseData importCourseFromFile(String fullFilePath) throws Exception {
        if (!new File(fullFilePath).exists()) {
            throw new Exception(String.format("Course file not found: %s", fullFilePath));
        }
        ImportCourseData importCourseData = new ImportCourseData();
        String validateJobId = UUID.randomUUID().toString();
        importCourseData.setValidateJobId(validateJobId);
        String importJobId = UUID.randomUUID().toString();
        importCourseData.setImportJobId(importJobId);
        String packageJobId = UUID.randomUUID().toString();
        importCourseData.setPackageJobId(packageJobId);

        String errorMsg = null;
        try {
            File sourceFile = new File(fullFilePath);
            String packagedOutputLocation = exportImportService.getConfiguration().getProperty("packagedOutputLocation");
            File destFile = new File(String.format("%s/resources/%s", packagedOutputLocation, sourceFile.getName()));
            FileUtils.copyFile(sourceFile, destFile);
            importCourseData.setCourseFolder(destFile);

            exportImportService.validationBeforeImport(destFile.getAbsolutePath(), validateJobId);
            Job validateJob = jobService.getJob(validateJobId);
            while (validateJob == null || (!validateJob.getStatus().equals(Job.Status.COMPLETED) && !validateJob.getStatus().equals(Job.Status.FAILED))) {
                Thread.sleep(1000);
                validateJob = jobService.getJob(validateJobId);
            }

            if (validateJob.getStatus().equals(Job.Status.FAILED)) {
                if (!validateJob.getErrors().containsKey("NOT_EQUAL_VERSIONS")) {  // we don't want to fail on an error regarding versions compare
                    errorMsg = String.format("Failed to validate course: %s", validateJob.getErrors());
                    throw new Exception(errorMsg);
                }
            }

            int publisherId = createANewPublisher();
            importCourseData.setPublisherId(publisherId);

            exportImportService.importCourse(publisherId, importJobId, validateJobId, createMockUser());
            Job job = jobService.getJob(importJobId);
            while (job == null || (!job.getStatus().equals(Job.Status.COMPLETED) && !job.getStatus().equals(Job.Status.FAILED))) {
                Thread.sleep(1000);
                job = jobService.getJob(importJobId);
            }

            if (job.getStatus().equals(Job.Status.FAILED)) {
                errorMsg = String.format("Failed to import course: %s file path: %s", job.getErrors(), fullFilePath);
                throw new Exception(errorMsg);
            }

            String courseId = job.getProperties().getCourseId();
            DBObject course = coursesDao.getCourse(courseId);
            importCourseData.setCourseId(courseId);
            importCourseData.setCourseCid(((DBObject) course.get("contentData")).get("cid").toString());
        } catch (Exception e) {
            if (errorMsg == null) {
                errorMsg = String.format("Failed to import course. Message: %s, stack: %s", e.getMessage(), Arrays.toString(e.getStackTrace()));
                throw e;
            }
        } finally {
            if (errorMsg != null) {
                logger.error(errorMsg);
                removeAllResourcesFromImportCourse(importCourseData);
                throw new Exception(errorMsg);
            }
        }
        return importCourseData;
    }

    public String exportCourse(int publisherId, String courseId) throws Exception {
        String exportJobId = UUID.randomUUID().toString();
        exportImportService.exportCourse(publisherId, courseId, exportJobId, createMockUser());

        Job job = jobService.getJob(exportJobId);
        while (job == null || (!job.getStatus().equals(Job.Status.COMPLETED) && !job.getStatus().equals(Job.Status.FAILED))) {
            Thread.sleep(500);
            job = jobService.getJob(exportJobId);
        }

        if (job.getStatus().equals(Job.Status.FAILED)) {
            String errorMsg = String.format("Failed to export course: %s", job.getErrors());
            throw new Exception(errorMsg);
        }

        jobService.removeJob(job.getJobId());
        return job.getProperties().getExportedCourseFileName();
    }

    private int createNewPublisher(String publisherResource) throws IOException, DsException {
        String json = publisherService.createPublisher(readResourcesAsDBObject(publisherResource).toString());
        int publisherId = Integer.parseInt(((DBObject) JSON.parse(json)).get("accountId").toString());
        logger.debug(String.format("PUBLISHER CREATED: Created publisher %d created for test", publisherId));
        return publisherId;
    }

    public int createANewPublisher() throws IOException, DsException {
        return createNewPublisher("publisher/validPublisherDBObject.json");
    }

    public int createANewPublisher(ContentLocalesTypes contentLocale) throws IOException, DsException {
        switch (contentLocale) {
            case FR_FR:
                return createNewPublisher("publisher/valid_frFR_PublisherDBObject.json");
            case PT_BR:
                return createNewPublisher("publisher/valid_ptBR_PublisherDBObject.json");
            case IW_IL:
                return createNewPublisher("publisher/valid_iwIL_PublisherDBObject.json");
            case AR_IL:
                return createNewPublisher("publisher/valid_arIL_PublisherDBObject.json");
            case NL_NL:
                return createNewPublisher("publisher/valid_nlNL_PublisherDBObject.json");
            case JA_JP:
                return createNewPublisher("publisher/valid_jaJP_PublisherDBObject.json");
            case ZN_CN:
                return createNewPublisher("publisher/valid_znCN_PublisherDBObject.json");
            case ZN_HK:
                return createNewPublisher("publisher/valid_znHK_PublisherDBObject.json");
            case KO_KR:
                return createNewPublisher("publisher/valid_koKR_PublisherDBObject.json");
            case EN_US:
            default:
                return createNewPublisher("publisher/valid_enUS_PublisherDBObject.json");
        }
    }

    public void removeAllResourcesFromImportCourse(ImportCourseData importCourseData) {
        String courseId = importCourseData.getCourseId();
        int publisherId = importCourseData.getPublisherId();

        try {
            logger.debug("Removing jobs used for tests");

            jobService.removeJob(importCourseData.getValidateJobId());
            jobService.removeJob(importCourseData.getImportJobId());
            jobService.removeJob(importCourseData.getPackageJobId());

            packagingDao.removePackageById(importCourseData.getPackId());

            // removing lessons
            logger.debug("Removing lessons used for tests");
            lessonsDao.deleteByCourseIdAndPublisherId(courseId, publisherId);

            // removing assessments
            logger.debug("Removing assessments used for tests");
            assessmentsDao.deleteByCourseIdAndPublisherId(courseId, publisherId);

            // removing sequences by courseId
            sequencesDao.deleteSequenceByCourseId(courseId);

            // removing the course
            coursesDao.deleteCourse(courseId, publisherId);

            // remove the mock publisher
            if (publisherService.getPublisher(publisherId) != null) {
                publisherService.deletePublisher(publisherId);
            }
        } catch (DaoException | DsException e) {
            logger.error("Failed to remove course resource from DB", e);
        }

        File courseFolder = importCourseData.getCourseFolder();
        if (courseFolder != null) {
            try {
                Files.deleteIfExists(courseFolder.toPath());
            } catch (IOException e) {
                logger.error("Failed to delete course zip file " + courseFolder.getName(), e);
            }
        }

        String cmsHome = exportImportService.getConfiguration().getProperty("cmsHome");
        String courseDir = String.format("%s/publishers/%s/courses/%s", cmsHome, publisherId, courseId);
        try {
            org.apache.commons.io.FileUtils.deleteDirectory(new File(courseDir));
        } catch (IOException e) {
            logger.error(String.format("Failed to delete course directory created by import at %s", courseDir), e);
        }

        String packagedOutputFolderLocation = String.format("%s/packages/output", exportImportService.getConfiguration().getProperty("packagedOutputLocation"));
        File packagedOutputFile = new File(String.format("%s/%s.cgs", packagedOutputFolderLocation, importCourseData.getPackIdWithVersion()));
        if (packagedOutputFile != null) {
            try {
                Files.deleteIfExists(packagedOutputFile.toPath());
            } catch (IOException e) {
                logger.error(String.format("Failed to delete course zip file %s", packagedOutputFile.getName()), e);
            }
        }

        File packagedDownloadFile = new File(String.format("%s/download/%s.scorm.zip", packagedOutputFolderLocation, importCourseData.getCourseCid()));
        if (packagedDownloadFile != null) {
            try {
                Files.deleteIfExists(packagedDownloadFile.toPath());
            } catch (IOException e) {
                logger.error("Failed to delete course zip file " + packagedDownloadFile.getName(), e);
            }
        }
    }


    public String getResourcePath(String localPath) throws Exception {
        URL resourceUrl = this.getClass().getClassLoader().getResource(localPath);
        if (resourceUrl == null) {
            throw new Exception(String.format("Directory %s does not exist. localPath sent is: %s", resourceUrl, localPath));
        }

        return new File(resourceUrl.getPath()).getAbsolutePath() + File.separator;
    }

    public File readResourceAsFile(String filePath) throws Exception {
        return new File(this.getResourcePath(filePath));

    }

    public String readResourcesAsString(String localPath) throws IOException {
        InputStream resourceAsStream;
        resourceAsStream = null;
        try {
            resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
            Scanner s = new Scanner(resourceAsStream).useDelimiter("\\A");
            return s.hasNext() ? s.next() : "";
        } finally {
            if (resourceAsStream != null) {
                resourceAsStream.close();
            }
        }
    }

    public CGSUserDetails createMockUser() {
        String username = String.format("dummyUser_%s", UUID.randomUUID().toString()); // genereate a random username
        if (username.length() > 50)
            username = username.substring(0, 49); // take only first 50 chars, that's enough for randomnes
        String password = "dummyPassword";
        CGSUserDetails userDetails = new CGSUserDetailsImpl(new User(username, password, Collections.emptyList()));
        Assert.assertEquals(userDetails.getUsername(), username);
        return userDetails;
    }

    public DBObject readResourcesAsDBObject(String contentItemJsonFileName) throws IOException {
        return (DBObject) JSON.parse(readResourcesAsString(contentItemJsonFileName));
    }

    public CourseCGSObject getCourseWithoutTocItemsAndResources() throws IOException {
        String courseWithoutResources = "courses/courseManifestWithoutResources.json";
        return new CourseCGSObject(readResourcesAsString(courseWithoutResources), MAX_VALUE);
    }

    public CourseCGSObject getCourseWithLessons() throws IOException {
        String courseWithLessons = "courses/courseManifestWithLessonsAndResources.json";
        return new CourseCGSObject(readResourcesAsString(courseWithLessons), MAX_VALUE);
    }

    public CourseCGSObject getCourseManifestWithSequences() throws IOException {
        String courseWithSequences = "courses/courseManifestWithSequence.json";
        return new CourseCGSObject(readResourcesAsString(courseWithSequences), MAX_VALUE);
    }

    public boolean areTransactionAndLockReleased(String courseId) throws DsException {
        List<Transaction> transactionForCourse = transactionService.getTransactionForCourse(courseId);
        return transactionForCourse.isEmpty() && !lockService.isCourseLocked(courseId);
    }

    public void runBaseSuccessfulPublishValidation(CGSPackage cgsPackage) throws Exception {
        logger.debug("zip validation started");
        Assert.assertEquals(cgsPackage.getPackagePhase(), PackagePhase.COMPLETED, String.format("Bad package phase on completion. Errors: %s", Arrays.toString(cgsPackage.getErrors().toArray())));
        Assert.assertTrue(cgsPackage.getWarnings().isEmpty() && cgsPackage.getErrors().isEmpty());
        Assert.assertTrue(areTransactionAndLockReleased(cgsPackage.getCourseId()), "Transaction or lock are not released after publish ended");
        validatePackageZip(cgsPackage);
        logger.debug(String.format(">>>>>> publish validation done %s", cgsPackage));

    }

    private void validatePackageZip(CGSPackage cgsPackage) throws Exception {
        if (cgsPackage.getPublishTarget() == PublishTarget.COURSE_TO_CATALOG) {// no validation for zip is done for catalog
            return;
        }

        File cgsPackageFile = new File(cgsPackage.getZippedFileToDownloadLocation());
        File unzippedPublishesFolder = new File("unzippedPublishesTempFolder/");
        File temp = new File(unzippedPublishesFolder, cgsPackageFile.getName());

        try {
            switch (cgsPackage.getPublishTarget()) {
                case LESSON_TO_FILE:
                case COURSE_TO_FILE:
                    publishedScormZipValidator.validateAndExtractSCORMPackage(cgsPackageFile, temp, cgsPackage);
                    break;
                case COURSE_TO_CATALOG:
                    break;
                default:
                    throw new Exception(String.format("No validator exists for %s publish type", cgsPackage.getPublishTarget()));
            }
        } finally {
            try {
                FileUtils.deleteDirectory(unzippedPublishesFolder);
            } catch (Exception e) {

                logger.error(String.format("Failed to delete unzipped publisher folder %s", unzippedPublishesFolder.getName()), e);
            }
        }
    }

    public int createANewPublisherWithBlossomSSOCredentials() throws IOException, DsException {
        return createANewPublisher();
    }

    public int getANonExistingPublisherId() {
        int possibleId = Integer.MAX_VALUE;
        while (possibleId != 0) {
            if (publisherService.getPublisher(possibleId) == null && externalPartnersService.getExternalPartnersByPublisherId(possibleId).isEmpty())
                return possibleId;
            possibleId--;
        }

        throw new RuntimeException("Could not generate a non-existing publisherId");
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
        Assert.assertTrue(areSimilar, String.format("The expected manifest output is different then actual.\nDifferences: %s\nExpected: %s\nActual: %s", myDiff, expectedOutputXml, actualOutputXmlDoc.getFirstChild()));
    }

    public CGSUserDetails createMockUserWithBlossomIds() throws DaoException {
        Customization customizationWithBlossom = new Customization();
        customizationWithBlossom.setExternalSettings(Arrays.asList(new ExternalSetting("blossom", blossomURL)));

        String username = String.format("dummyBlossomUser_%s", (int) (Math.random() * 1000000)); // genereate a random username
        if (username.length() > 50)
            username = username.substring(0, 49); // take only first 50 chars, that's enough for randomnes

        String password = "dummyPassword";

        CGSUserDetailsImpl userDetails = new CGSUserDetailsImpl(new User(username, password, Collections.<GrantedAuthority>emptyList()));
        userDetails.setCustomization(customizationWithBlossom);
        userDetails.setEmail(String.format("%s@asdfasdfa.com", username));
        userDetails.setFirstName("first-mock");
        userDetails.setLastName("last-mock");
        List<SimpleCgsUserRole> roles = usersDao.getRolesByAccountId(-1, "SUPER_USER");
        SimpleCgsUserRole editorRole = null;
        for (SimpleCgsUserRole role : roles) {
            if (role.getName().equals("EDITOR"))
                editorRole = role;
        }

        userDetails.setRole(editorRole);
        Assert.assertEquals(userDetails.getUsername(), username);
        return userDetails;
    }

    public void deletePublisher(int publisherId) throws DsException {
        logger.debug(String.format("PUBLISHER DELETED: Removing publisher %d created for test", publisherId));
        publisherService.deletePublisher(publisherId);
    }


    public void removeEBook(EBook eBook) throws DsException {
        String eBookFolder = eBookCleanupService.getEBookFolderById(eBook.getPublisherId(), eBook.getEBookId());
        eBookCleanupService.removeEBook(eBookFolder, eBook.getEBookId(), eBook.getPublisherId());
    }
}