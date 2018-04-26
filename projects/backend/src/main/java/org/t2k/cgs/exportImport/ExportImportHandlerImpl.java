package org.t2k.cgs.exportImport;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.BasicDBList;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.DBRef;
import com.mongodb.util.JSON;
import com.t2k.common.utils.VersionUtils;
import com.t2k.common.utils.ZipUtils;
import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;
import org.springframework.util.Assert;
import org.t2k.cgs.course.CourseContentEditor;
import org.t2k.cgs.course.CourseDataService;
import org.t2k.cgs.dao.applets.AppletDao;
import org.t2k.cgs.dao.courses.CoursesDao;
import org.t2k.cgs.dao.publisher.AccountDao;
import org.t2k.cgs.dao.standards.StandardsDao;
import org.t2k.cgs.dao.tocItem.TocItemDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.ebooks.EBookCleanupService;
import org.t2k.cgs.ebooks.EBookService;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.lock.LockService;
import org.t2k.cgs.lock.LockServiceImpl;
import org.t2k.cgs.model.ContentItemBase;
import org.t2k.cgs.model.Header;
import org.t2k.cgs.model.classification.StandardsPackage;
import org.t2k.cgs.model.course.Course;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.model.ebooks.EBook;
import org.t2k.cgs.model.job.Job;
import org.t2k.cgs.model.job.JobComponentDefault;
import org.t2k.cgs.model.job.JobService;
import org.t2k.cgs.model.sequence.Sequence;
import org.t2k.cgs.model.tocItem.Format;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.sequences.SequenceService;
import org.t2k.cgs.tocItem.TocItemDataService;
import org.t2k.cgs.utils.FilesUtils;
import org.t2k.cgs.version.VersionService;

import java.io.*;
import java.util.*;
import java.util.zip.ZipFile;
import java.util.zip.ZipInputStream;

/**
 * Created by IntelliJ IDEA.
 * User: efrat.gur
 * Date: 02/10/13
 * Time: 07:14
 */
public class ExportImportHandlerImpl implements ExportImportHandler {

    public static final String EPUB = "epub";
    private static Logger logger = Logger.getLogger(ExportImportHandlerImpl.class);

    private static final String EXPORT_VERSION = "exportVersion.txt";
    private static final String MAJOR_VER = "versionMajor";
    private static final String MINOR_VER = "versionMinor";
    private static final String BUILD_VER = "versionBuild";

    private static final String NOT_EQUAL_VERSIONS = "NOT_EQUAL_VERSIONS";
    private static final String FAILED_TO_EXPORT = "FAILED_TO_EXPORT";
    private static final String FAILED_TO_VALIDATE = "FAILED_TO_VALIDATE";
    private static final String MISSING_RESOURCES = "MISSING_RESOURCES";
    private static final String FAILED_TO_IMPORT = "FAILED_TO_IMPORT";

    private ExportImportPackage exportImportPackage;

    private CoursesDao coursesDao;

    private CourseDataService courseDataService;

    private TocItemDao lessonsDao;

    private TocItemDao assessmentsDao;

    private SequenceService sequenceService;

    private LockService lockService;

    private Configuration configuration;

    private VersionService versionService;

    private StandardsDao standardsDao;

    private AppletDao appletDao;

    private AccountDao accountDao;

    private JobService jobService;

    private TocItemDataService tocItemDataService;

    private EBookService eBookService;

    private EBookCleanupService eBookCleanupService;

    private FilesUtils filesUtils;

    private ExportImportZipper exportImportZipper;

    private List<DBRef> cleanupList = new ArrayList<>();

    private Set<String> resourcesToPackage = new HashSet<>();

    public ExportImportHandlerImpl(ExportImportPackage exImPackage, CoursesDao coursesDao, CourseDataService courseDataService,
                                   TocItemDao lessonsDao, TocItemDao assessmentsDao, SequenceService sequenceService, LockService lockService,
                                   Configuration configuration, StandardsDao standardsDao, AppletDao appletDao, AccountDao accountDao,
                                   JobService jobService, TocItemDataService tocItemDataService, EBookService eBookService, FilesUtils filesUtils,
                                   VersionService versionService, EBookCleanupService eBookCleanupService) {

        this.exportImportPackage = exImPackage;
        this.coursesDao = coursesDao;
        this.courseDataService = courseDataService;
        this.lessonsDao = lessonsDao;
        this.assessmentsDao = assessmentsDao;
        this.sequenceService = sequenceService;
        this.lockService = lockService;
        this.configuration = configuration;
        this.standardsDao = standardsDao;
        this.appletDao = appletDao;
        this.accountDao = accountDao;
        this.jobService = jobService;
        this.tocItemDataService = tocItemDataService;
        this.eBookService = eBookService;
        this.filesUtils = filesUtils;
        this.exportImportZipper = new ExportImportZipper(exportImportPackage, jobService);
        this.versionService = versionService;
        this.eBookCleanupService = eBookCleanupService;
    }

    public void run() {
        if (exportImportPackage.getType() == ExportImportPackage.Type.EXPORT) {
            exportCourse();
        } else if (exportImportPackage.getType() == ExportImportPackage.Type.VALIDATE) {
            validateImport();
        } else {
            importCourse();
        }
    }

    /**
     * Export - Tries to lock course by System (will fail if other user owns lock)
     * Export full cgs course
     */
    private void exportCourse() {
        Job job = new Job(exportImportPackage.getJobId());
        try {
            logger.info(String.format("--------------- Export STARTED ------------- : %s", exportImportPackage.getPackId()));
            jobService.saveJob(job);

            // todo: uncomment these lines after schema is valid!!!
            // todo: also uncomment its test exportCourseFailureTest
//            CGSValidationReport cgsValidationReport = courseDataService.validateCourseAndSubElements(exportImportPackage.getPublisherId(), exportImportPackage.getCourseId());
//            if (!cgsValidationReport.isSuccess()) {
//                jobService.addError(exportImportPackage.getJobId(), FAILED_TO_EXPORT, cgsValidationReport.getMessages().toString(), Job.Status.FAILED);
//                return;
//            }

            lockService.checkAndAcquireLocksOnCourse(exportImportPackage.getPublisherId(), exportImportPackage.getCourseId(), LockServiceImpl.systemLockUser);
            exportDbAndResources();

            job = jobService.getJob(job.getJobId());
            job.getProperties().setExportedCourseFileName(exportImportPackage.getZipFileRelativeName());
            job.setStatus(Job.Status.COMPLETED);
            jobService.save(job);
            logger.info(String.format("--------------- Export ENDED SUCCESSFULLY ------------- : %s", exportImportPackage.getPackId()));
        } catch (Exception e) {
            try {
                logger.info(String.format("--------------- Export ENDED with Errors ------------- : %s", exportImportPackage.getPackId()));
                jobService.addError(exportImportPackage.getJobId(), FAILED_TO_EXPORT, e.getMessage(), Job.Status.FAILED);
            } catch (Exception e1) {
                logger.error(String.format("Failed to add an error to the job's collection for jobId %s", exportImportPackage.getJobId()), e);
            }
        } finally {
            try {
                lockService.removeLocksOnCourse(exportImportPackage.getCourseId(), exportImportPackage.getPublisherId(), LockServiceImpl.systemLockUser);
            } catch (Exception e1) {
                logger.error(String.format("Failed to remove locks on course %s", exportImportPackage.getCourseId()), e1);
            }
        }
    }

    /**
     * validationBeforeImport
     */
    public void validateImport() {
        Job job = new Job(exportImportPackage.getJobId());
        try {
            logger.info(String.format("--------------- Import Validation STARTED ------------- : %s",
                    exportImportPackage.getPackId()));
            jobService.saveJob(job);

            Assert.notNull(exportImportPackage);

            // Create a new directory under resources for the IMPORT unzipped files
            // TODO: change this string, it assumes that the file name is very specific and contains the courseID
            String zippedFilesDir = exportImportPackage.getZipFileFullPathName()
                    .substring(0, exportImportPackage.getZipFileFullPathName().length() - 7);
            File tempDir = new File(zippedFilesDir);
            if (!tempDir.exists()) {
                logger.info(String.format("creating directory: %s", zippedFilesDir));
                tempDir.mkdirs();
            }

            String relativeZippedFilesDir = tempDir.getName();
            ExportImportLocalContext exportImportLocalContext = new ExportImportLocalContext(zippedFilesDir);
            exportImportPackage.setLocalResourcesLocation(exportImportLocalContext);
            exportImportPackage.setRelativeResourcesLocation(String.format("/resources/%s", relativeZippedFilesDir));

            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.ZIP_FILE_OPEN.getValue(), 0, Job.Status.IN_PROGRESS);
            // unpack zip file
            openZippedFiles(exportImportPackage.getZipFileFullPathName(), zippedFilesDir);

            job = jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.ZIP_FILE_OPEN.getValue(), 100, Job.Status.IN_PROGRESS);

            // Delete the zip File
            FileUtils.deleteQuietly(new File(exportImportPackage.getZipFileFullPathName()));

            boolean versionMatch = compareVersions();

            job = jobService.getJob(job.getJobId());
            job.getProperties().setPassValidation(versionMatch);
            job.getProperties().setExportedCourseResourceFiles(exportImportPackage.getRelativeResourcesLocation());
            jobService.save(job);

            if (versionMatch) {
                jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.VALIDATE.getValue(), 100, Job.Status.COMPLETED);
            } else {
                jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.VALIDATE.getValue(), 100, Job.Status.FAILED);
            }
        } catch (Exception e) {
            try {
                logger.info(String.format("--------------- Import Validation ENDED with Errors ------------- : %s",
                        exportImportPackage.getPackId()));
                jobService.addError(exportImportPackage.getJobId(), FAILED_TO_VALIDATE, e.getMessage(), Job.Status.FAILED);
            } catch (Exception e1) {
                logger.error(String.format("Failed to add an error to the job's collection for jobId %s",
                        exportImportPackage.getJobId()), e);
            }
        }
    }

    /**
     * Import full cgs course
     */
    private void importCourse() {
        logger.info(String.format("--------------- Import STARTED ------------- : %s", exportImportPackage.getPackId()));
        Job job = new Job(exportImportPackage.getJobId());
        try {
            jobService.saveJob(job);

            // Receive the relative resource path for the import from the jobs collection.
            // The jobId is represented by exportImportPackage.getValidationId()

            String validationJobId = exportImportPackage.getValidationId();
            Job validationJob = jobService.getJob(validationJobId);
            if (validationJob == null) {
                jobService.addError(exportImportPackage.getJobId(), MISSING_RESOURCES,
                        String.format("Could not find the import resources location in the job's db for validation jobId: %s", validationJobId),
                        Job.Status.FAILED);
                return;
            }

            String resourcesLocation = validationJob.getProperties().getExportedCourseResourceFiles();
            if (resourcesLocation == null) {
                jobService.addError(exportImportPackage.getJobId(), MISSING_RESOURCES,
                        String.format("Could not find the import resources location in the job's db for validation jobId: %s", validationJobId),
                        Job.Status.FAILED);
                return;
            }

            String outDir = configuration.getProperty("exportedCourseLocation");
            String resourcesDir = outDir + resourcesLocation;
            ExportImportLocalContext exportImportLocalContext = new ExportImportLocalContext(resourcesDir);
            exportImportPackage.setLocalResourcesLocation(exportImportLocalContext);
            importCourseDb();

            // importResourceFiles calls copyFolderRecursively which updates the Job Progress according to the total number of files that should be copied.
            importResourceFiles();

            job = jobService.getJob(exportImportPackage.getJobId());
            job.getProperties().setCourseId(exportImportPackage.getCourseId());
            jobService.save(job);
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.IMPORT.getValue(), 100, Job.Status.COMPLETED);

            logger.info(String.format("--------------- Import ENDED SUCCESSFULLY ------------- : %s", exportImportPackage.getPackId()));
        } catch (Exception e) {
            try {
                logger.info(String.format("--------------- Import ENDED with Errors ------------- : %s, Exception is: %s",
                        exportImportPackage.getPackId(), e.getMessage()));
                cleanup();
                jobService.addError(exportImportPackage.getJobId(), FAILED_TO_IMPORT, e.getMessage(), Job.Status.FAILED);
            } catch (Exception e1) {
                logger.error("Failed to cleanup the DB with items that were already imported ", e);
            }
        }
    }

    private void addResourceToPackage(String resourcePath) {
        resourcesToPackage.add(resourcePath);
    }

    /**
     * Export full cgs course - db and resources
     *
     * @throws Exception
     */
    private void exportDbAndResources() throws Exception {
        Assert.notNull(exportImportPackage);
        logger.info(String.format("exportDbAndResources: packId: %s", exportImportPackage.getPackId()));

        try {
            exportCourseDb(); // prepares json files for all resources for the package
            exportVersionFile();

            // Build the export zip file name
            String outDir = configuration.getProperty("exportedCourseLocation");

            File outPathDir = new File(String.format("%s/export/output", outDir));
            if (!outPathDir.exists()) {
                logger.info(String.format("creating directory: %s", outPathDir));
                outPathDir.mkdirs();
            }

            logger.info(String.format("exportDbAndResources: courseId: %s", exportImportPackage.getCourseId()));

            String exportCourseFileName = String.format("export_CourseId_%s_%s.cgscrs", exportImportPackage.getCourseId(), exportImportPackage.getPackId());

            exportImportPackage.setZipFileFullPathName(String.format("%s/%s", outPathDir, exportCourseFileName));
            exportImportPackage.setZipFileRelativeName(String.format("/export/output/%s", exportCourseFileName));
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.ZIP_FILE_CREATION.getValue(), 0, Job.Status.IN_PROGRESS);
            exportImportZipper.compress(resourcesToPackage);

            // delete the staging area directory
            File localResourcesDir = new File(exportImportPackage.getLocalResourcesLocation().getBasePath());
            FileUtils.deleteDirectory(localResourcesDir);

            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.ZIP_FILE_CREATION.getValue(), 100, Job.Status.IN_PROGRESS);
        } catch (Exception e) {
            logger.error("exportDbAndResources failed for package: " + exportImportPackage, e);
            throw e;
        }
    }

    private void openZippedFiles(String zipFileName, String desLocation) throws Exception {
        try {
            //unzip files
            ZipInputStream zis = ZipUtils.openZipFile(zipFileName);
            int numberOfEntriesInZip = new ZipFile(zipFileName).size();
            int currentElement = 0;
            int currentPercentage = 0;
            String zipElementPath;
            while ((zipElementPath = ZipUtils.nextEntry(zis)) != null) {
                currentElement++;
                if (currentPercentage != calcPercent(currentElement, numberOfEntriesInZip)) {
                    currentPercentage = calcPercent(currentElement, numberOfEntriesInZip); // update progress only when there is a change
                    jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.ZIP_FILE_OPEN.getValue(), currentPercentage, Job.Status.IN_PROGRESS);
                }
                com.t2k.common.utils.FileUtils.copy(zis, desLocation + "/" + zipElementPath, false);
            }
            zis.close();
        } catch (IOException e) {
            throw new DsException("Failure to extract files from zip file + zipFileName ", e);
        }
    }

    private void exportCourseDb() throws Exception {
        try {
            createResourcesDirectories();

            int totalCollectionsForExport = 6;
            int counter = 0;
            exportCourseToTempLocation();
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.EXPORT_DB.getValue(),
                    calcPercent(++counter, totalCollectionsForExport), Job.Status.IN_PROGRESS);

            exportEBooksToTempLocation();
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.EXPORT_DB.getValue(),
                    calcPercent(++counter, totalCollectionsForExport), Job.Status.IN_PROGRESS);

            List<String> lessonIds = courseDataService.getAllTocItemCIdsFromCourse(exportImportPackage.getPublisherId(),
                    exportImportPackage.getCourseId());
            exportTocItemsToTempLocation(lessonIds);  // Courses and assessments
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.EXPORT_DB.getValue(),
                    calcPercent(++counter, totalCollectionsForExport), Job.Status.IN_PROGRESS);

            exportSequencesToTempLocation(lessonIds);
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.EXPORT_DB.getValue(),
                    calcPercent(++counter, totalCollectionsForExport), Job.Status.IN_PROGRESS);

            exportAppletsToTempLocation();
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.EXPORT_DB.getValue(),
                    calcPercent(++counter, totalCollectionsForExport), Job.Status.IN_PROGRESS);

            exportStandardsToTempLocation();
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.EXPORT_DB.getValue(),
                    calcPercent(++counter, totalCollectionsForExport), Job.Status.IN_PROGRESS);
        } catch (Exception e) {
            logger.error("exportCourseDb failed for package: " + exportImportPackage, e);
            throw e;
        }
    }

    private void importCourseDb() throws Exception {
        logger.info(String.format("importCourseDb: course id: %s", exportImportPackage.getCourseId()));
        try {
            int totalCollectionsToImport = 6;
            int counter = 0;
            importCourseManifest();
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.IMPORT_DB.getValue(), calcPercent(++counter, totalCollectionsToImport), Job.Status.IN_PROGRESS);

            importTocItems();
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.IMPORT_DB.getValue(), calcPercent(++counter, totalCollectionsToImport), Job.Status.IN_PROGRESS);

            importSequences();
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.IMPORT_DB.getValue(), calcPercent(++counter, totalCollectionsToImport), Job.Status.IN_PROGRESS);

            importApplets();
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.IMPORT_DB.getValue(), calcPercent(++counter, totalCollectionsToImport), Job.Status.IN_PROGRESS);

            importStandards();
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.IMPORT_DB.getValue(), calcPercent(++counter, totalCollectionsToImport), Job.Status.IN_PROGRESS);

            importEBooks();
            jobService.updateJobProgress(exportImportPackage.getJobId(), JobComponentDefault.IMPORT_DB.getValue(), calcPercent(++counter, totalCollectionsToImport), Job.Status.IN_PROGRESS);
        } catch (Exception e) {
            logger.error("importCourseDb failed for package: " + exportImportPackage, e);
            throw e;
        }
    }

    private void createResourcesDirectories() throws IOException {
        logger.info(String.format("createResourcesDir: courseId :%s", exportImportPackage.getCourseId()));
        String cmPublisherHome = String.format("%s/publishers/%d", configuration.getProperty("cmsHome"), exportImportPackage.getPublisherId());
        String cmsCourseHome = String.format("%s/courses/%s", cmPublisherHome, exportImportPackage.getCourseId());
        exportImportPackage.setCmsPublisherHomeLocation(cmsCourseHome);
        String outDir = configuration.getProperty("exportedCourseLocation");
        String packBaseDir = String.format("%s/resources/%s", outDir, exportImportPackage.getPackId());
        File tempDir = new File(packBaseDir);
        if (!tempDir.exists()) {
            logger.info(String.format("creating directory: %s", packBaseDir));
            tempDir.mkdirs();
        }

        ExportImportLocalContext exportImportLocalContext = new ExportImportLocalContext(packBaseDir);

        File courseDir = new File(exportImportLocalContext.getCoursePath());
        if (!courseDir.exists()) {
            logger.info(String.format("creating directory: %s", courseDir));
            courseDir.mkdirs();
        }

        File sequencesDir = new File(exportImportLocalContext.getSequencesPath());
        if (!sequencesDir.exists()) {
            logger.info(String.format("creating directory: %s", sequencesDir));
            sequencesDir.mkdirs();
        }
        File lessonsDir = new File(exportImportLocalContext.getLessonsPath());
        if (!lessonsDir.exists()) {
            logger.info(String.format("creating directory: %s", lessonsDir));
            lessonsDir.mkdirs();
        }

        File assesmentsDir = new File(exportImportLocalContext.getAssessmentsPath());
        if (!assesmentsDir.exists()) {
            logger.info(String.format("creating directory: %s", assesmentsDir));
            assesmentsDir.mkdirs();
        }

        File standardsDir = new File(exportImportLocalContext.getStandardsPath());
        if (!standardsDir.exists()) {
            logger.info(String.format("creating directory: %s", standardsDir));
            standardsDir.mkdirs();
        }

        File appletsDir = new File(exportImportLocalContext.getAppletsPath());
        if (!appletsDir.exists()) {
            logger.info(String.format("creating directory: %s", appletsDir));
            appletsDir.mkdirs();
        }

        String eBooksBaseFolder = configuration.getProperty("eBooksBaseFolder");
        exportImportPackage.setEBooksBaseFolderLocation(eBooksBaseFolder);
        String cmsEBooksHome = String.format("%s/%s", cmPublisherHome, eBooksBaseFolder);
        exportImportPackage.setCmsEBooksHomeLocation(cmsEBooksHome);
        File eBooksDir = new File(exportImportLocalContext.getEBooksPath());
        if (!eBooksDir.exists()) {
            logger.info(String.format("creating directory: %s", eBooksDir));
            eBooksDir.mkdirs();
        }

        exportImportPackage.setLocalResourcesLocation(exportImportLocalContext);
    }

    /**
     * exporting the course manifest from DB to a tmp location as a file.
     *
     * @throws DsException
     */
    private void exportCourseToTempLocation() throws DsException {
        try {
            logger.debug(String.format("exportCourseToTempLocation: course is about to be saved to file. CourseId: %s", exportImportPackage.getCourseId()));
            DBObject course = coursesDao.getCourse(exportImportPackage.getCourseId());
            File file = new File(String.format("%s/%s", exportImportPackage.getLocalResourcesLocation().getCoursePath(), exportImportPackage.getCourseId()));
            FileUtils.writeStringToFile(file, JSON.serialize(course), "UTF-8");
            addResourceToPackage(file.getAbsolutePath());
            addResourcesToPackageFromRootObject(course);
        } catch (Exception e) {
            logger.error("exportCourseToTempLocation: error while exporting course from db to FS", e);
            throw new DsException(e);
        }
    }

    private void addResourcesToPackageFromRootObject(DBObject course) {
        List<String> relativeResourcesPaths = tocItemDataService.getAssetsPathsFromResource((DBObject) course.get("contentData"));
        for (String relativeResourcePath : relativeResourcesPaths) {
            resourcesToPackage.add(String.format("%s/%s", exportImportPackage.getCmsPublisherHomeLocation(), relativeResourcePath));
        }
    }

    private void exportEBooksToTempLocation() throws DsException {
        logger.debug(String.format("exportEBooksToTempLocation: eBooks are about to be saved to file. CourseId: %s", exportImportPackage.getCourseId()));
        try {
            List<EBook> eBooks = eBookService.getPublisherEBooksByCourse(exportImportPackage.getPublisherId(), exportImportPackage.getCourseId());
            for (EBook eBook : eBooks) {
                String eBookId = eBook.getEBookId();
                File file = new File(String.format("%s/%s", exportImportPackage.getLocalResourcesLocation().getEBooksPath(), eBookId));
                FileUtils.writeStringToFile(file, new ObjectMapper().writeValueAsString(eBook), "UTF-8");
                addResourceToPackage(file.getAbsolutePath());
                addEBookResourcesToPackage(eBook);
            }
        } catch (Exception e) {
            logger.error("exportEBooksToTempLocation: error while exporting eBooks from DB to FS", e);
            throw new DsException(e);
        }
    }

    private void addEBookResourcesToPackage(EBook eBook) {
        String eBookDirPath = eBookCleanupService.getEBookFolderById(exportImportPackage.getPublisherId(), eBook.getEBookId());
        File eBookDir = new File(eBookDirPath);
        List<File> eBookDirFiles = filesUtils.getAllFiles(eBookDir);
        for (File file : eBookDirFiles) {
            resourcesToPackage.add(file.getAbsolutePath());
        }
    }

    /**
     * Import the course manifest from a file to the db.
     *
     * @throws DsException
     */
    private void importCourseManifest() throws DsException {
        logger.debug("importCourse: course is about to be imported");
        try {
            File courseDir = new File(exportImportPackage.getLocalResourcesLocation().getCoursePath());
            if (courseDir.exists()) {
                Collection<File> courseFile = FileUtils.listFiles(courseDir, null, true);
                if (courseFile.size() == 0) {
                    logger.error(String.format("importCourse: Could not find the course data in the directory %s", courseDir));
                    throw new DsException(String.format("importCourse: Could not find the course data in the directory %s", courseDir));
                } else if (courseFile.size() > 1) {
                    logger.error(String.format("importCourse: Found more than one file for the course data in the directory %s", courseDir));
                    throw new DsException(String.format("importCourse: Could not find the course data in the directory %s", courseDir));
                }

                Iterator<File> iterator = courseFile.iterator();
                File course = iterator.next();
                String courseManifest = FileUtils.readFileToString(course, "UTF-8");
                DBObject courseDbObject = (DBObject) JSON.parse(courseManifest);

                // Generate a new courseId for the imported course
                exportImportPackage.setCourseId(UUID.randomUUID().toString());
                exportImportPackage.setCourseCId(UUID.randomUUID().toString());

                logger.info(String.format("exportCourseDb: course id: %s", exportImportPackage.getCourseId()));
                // Create a new directory under publishers + courseId for the applets and media
                String cmsPublisherCourseHome = String.format("%s/publishers/%d/courses/%s", configuration.getProperty("cmsHome"), exportImportPackage.getPublisherId(), exportImportPackage.getCourseId());
                File tempDir = new File(cmsPublisherCourseHome);
                if (!tempDir.exists()) {
                    logger.info(String.format("creating directory: %s", cmsPublisherCourseHome));
                    tempDir.mkdirs();
                }

                exportImportPackage.setCmsPublisherHomeLocation(cmsPublisherCourseHome);

                // Get the publisher name according to the publisher Id
                String publisherName = accountDao.getPublisherName(exportImportPackage.getPublisherId());
                exportImportPackage.setPublisherName(publisherName);
                logger.debug(String.format("importCourse: course is about to be imported. CourseId : %s", exportImportPackage.getCourseId()));

                courseDbObject.put("_id", exportImportPackage.getCourseId());
                DBObject courseDbContent = (DBObject) courseDbObject.get(TocItemCGSObject.CGS_CONTENT);
                courseDbContent.put(TocItemCGSObject.COURSE_ID, exportImportPackage.getCourseId());
                courseDbContent.put(TocItemCGSObject.CID, exportImportPackage.getCourseCId());
                courseDbContent.put(TocItemCGSObject.PUBLISHER, exportImportPackage.getPublisherName());
                courseDbContent.put(TocItemCGSObject.VERSION, "1.0.0");
                // remove format field for older versions of courses.
                courseDbContent.removeField(TocItemCGSObject.FORMAT);
                exportImportPackage.setCmsEBooksHomeLocation(eBookCleanupService.getEBookFolderById(exportImportPackage.getPublisherId(), ""));

                DBObject courseDbData = (DBObject) courseDbObject.get(TocItemCGSObject.CGS_DATA);
                courseDbData.put(TocItemCGSObject.PUBLISHER_ID, exportImportPackage.getPublisherId());
                courseDataService.saveCourseDBObject(courseDbObject);

                // Save the DBRef for cleanup in case of failure
                DBRef courseRef = coursesDao.getDBRefByCourseId(exportImportPackage.getCourseId(), exportImportPackage.getPublisherId());
                cleanupList.add(courseRef);
            }
        } catch (Exception e) {
            logger.error("importCourse: error while importing course from FS to db ", e);
            throw new DsException(e);
        }
    }

    private void cleanup() throws Exception {
        logger.info("Cleanup information from db");
        Iterator<DBRef> iterator = cleanupList.iterator();
        try {
            while (iterator.hasNext()) {
                courseDataService.deleteById(iterator.next());
            }
        } catch (Exception e) {
            logger.error("Failed during cleanup ", e);
        }
    }

    private void exportTocItemsToTempLocation(List<String> lessonIds) throws DsException {
        logger.debug(String.format("exportTocItemsToTempLocation: tocItems are about to be exported. CourseId: %s", exportImportPackage.getCourseId()));
        // export lessons
        try {
            DBCursor dbCursor = lessonsDao.getTocItemsByCidAndCourse(lessonIds, exportImportPackage.getCourseId());
            while (dbCursor != null && dbCursor.hasNext()) {
                DBObject lessonDBObject = dbCursor.next();
                DBObject content = (DBObject) lessonDBObject.get(TocItemCGSObject.CGS_CONTENT);
                String cid = (String) content.get(TocItemCGSObject.CID);
                File file = new File(String.format("%s/%s", exportImportPackage.getLocalResourcesLocation().getLessonsPath(), cid));
                FileUtils.writeStringToFile(file, JSON.serialize(lessonDBObject), "UTF-8");
                addResourceToPackage(file.getAbsolutePath());
                addResourcesToPackageFromRootObject(lessonDBObject);
            }
        } catch (Exception e) {
            logger.error("exportTocItemsToTempLocation: error while exporting lessons from db to FS", e);
            throw new DsException(e);
        }

        // export assessments
        try {
            DBCursor dbCursor = assessmentsDao.getTocItemsByCidAndCourse(lessonIds, exportImportPackage.getCourseId());
            while (dbCursor != null && dbCursor.hasNext()) {
                DBObject assessmentDBObject = dbCursor.next();
                DBObject content = (DBObject) assessmentDBObject.get(TocItemCGSObject.CGS_CONTENT);
                String cid = (String) content.get(TocItemCGSObject.CID);
                File file = new File(String.format("%s/%s", exportImportPackage.getLocalResourcesLocation().getAssessmentsPath(), cid));
                FileUtils.writeStringToFile(file, JSON.serialize(assessmentDBObject), "UTF-8");
                addResourceToPackage(file.getAbsolutePath());
                addResourcesToPackageFromRootObject(assessmentDBObject);
            }
        } catch (Exception e) {
            logger.error("exportTocItemsToTempLocation: error while exporting assessments from db to FS", e);
            throw new DsException(e);
        }
    }

    private void importTocItems() throws DsException {
        logger.debug(String.format("transformTocItems: tocItems are about to be imported. CourseId : %s", exportImportPackage.getCourseId()));
        importLessons();
        //Import  assessments
        importAssessments();
    }

    private void importLessons() throws DsException {
        try {
            File lessonsDir = new File(exportImportPackage.getLocalResourcesLocation().getLessonsPath());
            if (lessonsDir.exists()) {
                Collection<File> lessonsFiles = FileUtils.listFiles(lessonsDir, null, true);
                logger.info(String.format("modifyTocItemsAndHandleStandards: number of lessons in FS: %d", lessonsFiles.size()));
                for (File lessonFile : lessonsFiles) {
                    String lessonJson = FileUtils.readFileToString(lessonFile, "UTF-8");
                    DBObject lessonDbObject = (DBObject) JSON.parse(lessonJson);
                    String newCourseId = exportImportPackage.getCourseId();

                    DBObject lessonDbContent = (DBObject) lessonDbObject.get(TocItemCGSObject.CGS_DATA);
                    lessonDbContent.put(TocItemCGSObject.COURSE_ID, newCourseId);
                    lessonDbContent.put(TocItemCGSObject.PUBLISHER_ID, exportImportPackage.getPublisherId());

                    DBObject content = (DBObject) lessonDbObject.get(TocItemCGSObject.CGS_CONTENT);
                    if (!content.containsField(TocItemCGSObject.FORMAT)) { // add format:NATIVE to lesson that doesn't have type
                        content.put(TocItemCGSObject.FORMAT, Format.NATIVE.name());
                    }

                    removeThumbnailsFromLesson(content);

                    if (parseSchemaVersionToInteger(content) < 7) {
                        lessonDbObject = onLessonSchemaUpgradeToV7(exportImportPackage.getPublisherId(), newCourseId, lessonDbObject);
                    }

                    lessonsDao.saveTocItemDBObject(lessonDbObject);

                    // Save the DBRef for cleanup in case of failure
                    String cid = content.get(TocItemCGSObject.CID).toString();
                    DBRef courseRef = lessonsDao.getDBRefByCId(exportImportPackage.getCourseId(), exportImportPackage.getPublisherId(), cid);
                    cleanupList.add(courseRef);
                }
            }
        } catch (Exception e) {
            logger.error("transformTocItems: error while importing assessments from FS to db", e);
            throw new DsException(e);
        }
    }

    private void importAssessments() throws DsException {
        try {
            File assessmentsDir = new File(exportImportPackage.getLocalResourcesLocation().getAssessmentsPath());
            if (assessmentsDir.exists()) {
                Collection<File> assessmentsFiles = FileUtils.listFiles(assessmentsDir, null, true);
                logger.info(String.format("modifyTocItemsAndHandleStandards: number of assessments in FS: %d", assessmentsFiles.size()));
                for (File assessmentFile : assessmentsFiles) {
                    String assessmentJson = FileUtils.readFileToString(assessmentFile, "UTF-8");
                    DBObject assessmentDbObject = (DBObject) JSON.parse(assessmentJson);

                    String newCourseId = exportImportPackage.getCourseId();

                    DBObject assessmentDbContent = (DBObject) assessmentDbObject.get(TocItemCGSObject.CGS_DATA);
                    assessmentDbContent.put(TocItemCGSObject.COURSE_ID, newCourseId);
                    assessmentDbContent.put(TocItemCGSObject.PUBLISHER_ID, exportImportPackage.getPublisherId());

                    DBObject content = (DBObject) assessmentDbObject.get(TocItemCGSObject.CGS_CONTENT);
                    removeThumbnailsFromAssessment(content);
                    assessmentsDao.saveTocItemDBObject(assessmentDbObject);

                    // Save the DBRef for cleanup in case of failure
                    String cid = content.get(TocItemCGSObject.CID).toString();
                    DBRef courseRef = assessmentsDao.getDBRefByCId(exportImportPackage.getCourseId(), exportImportPackage.getPublisherId(), cid);
                    cleanupList.add(courseRef);
                }
            }
        } catch (Exception e) {
            logger.error("transformTocItems: error while importing assessments from FS to db", e);
            throw new DsException(e);
        }
    }

    private void removeThumbnailsFromAssessment(DBObject assessmentContent) {
        //remove thumbnails from resources array
        BasicDBList resources = (BasicDBList) assessmentContent.get(TocItemCGSObject.RESOURCES);
        removeThumbnailsFromResourcesArray(resources);

        BasicDBList sequences = (BasicDBList) assessmentContent.get(TocItemCGSObject.SEQUENCES_OBJECTS_FIELD);
        removeThumbnailsFromSequences(sequences);
    }

    private void removeThumbnailsFromLesson(DBObject lessonContent) {

        //remove thumbnails from resources array
        BasicDBList resources = (BasicDBList) lessonContent.get(TocItemCGSObject.RESOURCES);
        removeThumbnailsFromResourcesArray(resources);

        //remove thumbnail from sequence resource, they can be under learningObject, or under learningObject->item
        BasicDBList learningObjects = (BasicDBList) lessonContent.get(TocItemCGSObject.LEARNING_OBJECTS_FIELD);

        if (learningObjects != null) {
            Iterator loIterator = learningObjects.iterator();
            while (loIterator.hasNext()) {
                DBObject lo = (DBObject) loIterator.next();

                BasicDBList sequences = (BasicDBList) lo.get(TocItemCGSObject.SEQUENCES_OBJECTS_FIELD);
                if (sequences == null) {
                    DBObject item = (DBObject) lo.get("item");
                    if (item != null) {
                        sequences = (BasicDBList) item.get(TocItemCGSObject.SEQUENCES_OBJECTS_FIELD);
                    }
                }

                if (sequences != null) {
                    removeThumbnailsFromSequences(sequences);
                }
            }
        }
    }

    private void removeThumbnailsFromResourcesArray(BasicDBList resources) {
        if (resources != null) {
            Iterator resourcesIterator = resources.iterator();
            while (resourcesIterator.hasNext()) {
                DBObject resource = (DBObject) resourcesIterator.next();
                String href = (String) resource.get("href");
                if (href != null && href.startsWith("thumb")) {
                    resourcesIterator.remove();
                }
            }
        }
    }

    private void removeThumbnailsFromSequences(BasicDBList sequences) {
        final String THUMBNAIL_REF_KEY = "thumbnailRef";
        final String RESOURCE_REF_ID_KEY = "resourceRefId";

        if (sequences != null) {
            Iterator sequenceIterator = sequences.iterator();
            while (sequenceIterator.hasNext()) {
                DBObject sequence = (DBObject) sequenceIterator.next();
                if (sequence.containsField(THUMBNAIL_REF_KEY)) {
                    String thumbnailId = (String) sequence.get(THUMBNAIL_REF_KEY);
                    sequence.removeField(THUMBNAIL_REF_KEY);

                    BasicDBList resourcesIds = (BasicDBList) sequence.get(RESOURCE_REF_ID_KEY);
                    Iterator resourcesIdIterator = resourcesIds.iterator();
                    while (resourcesIdIterator.hasNext()) {
                        String resourceRefId = (String) resourcesIdIterator.next();
                        if (resourceRefId.equals(thumbnailId)) {
                            resourcesIdIterator.remove();
                            break;
                        }
                    }
                }
            }
        }
    }


    /**
     * exporting all sequences of the given lessons from DB to a tmp location as files.
     *
     * @param tocItemsIds - toc item ids
     * @throws DsException
     */
    private void exportSequencesToTempLocation(List<String> tocItemsIds) throws DsException {
        try {
            DBCursor dbCursor = sequenceService.getSequencesCursor(tocItemsIds, exportImportPackage.getCourseId());
            while (dbCursor != null && dbCursor.hasNext()) {
                DBObject sequencesDbObject = dbCursor.next();

                String seqId = (String) sequencesDbObject.get(Sequence.DB_SEQ_ID_KEY);
                File file = new File(exportImportPackage.getLocalResourcesLocation().getSequencesPath() + seqId);

                FileUtils.writeStringToFile(file, JSON.serialize(sequencesDbObject), "UTF-8");
                addResourceToPackage(file.getAbsolutePath());
            }
        } catch (Exception e) {
            logger.error("exportSequencesToTempLocation: error while exporting seqs from db to FS", e);
            throw new DsException(e);
        }
    }

    /**
     * import all sequences of the given lessons from FS to DB.
     *
     * @throws DsException
     */
    private void importSequences() throws DsException {
        logger.debug(String.format("importSequences: sequences are about to be imported. CourseId: %s", exportImportPackage.getCourseId()));
        try {
            File sequencesDir = new File(exportImportPackage.getLocalResourcesLocation().getSequencesPath());
            if (sequencesDir.exists()) {
                Collection<File> sequencesFiles = FileUtils.listFiles(sequencesDir, null, true);
                logger.info(String.format("handle sequences: number of sequences in FS: %d", sequencesFiles.size()));
                Iterator<File> iterator = sequencesFiles.iterator();
                while (iterator.hasNext()) {
                    File sequenceFile = iterator.next();
                    String sequenceJson = FileUtils.readFileToString(sequenceFile, "UTF-8");
                    DBObject sequenceDbObject = (DBObject) JSON.parse(sequenceJson);

                    String newCourseId = exportImportPackage.getCourseId();

                    sequenceDbObject.put(TocItemCGSObject.COURSE_ID, newCourseId);

                    String seqId = (String) sequenceDbObject.get(Sequence.DB_SEQ_ID_KEY);
                    String lessonCId = (String) sequenceDbObject.get(Sequence.DB_LESSON_CID);

                    if (sequenceDbObject.containsField(Sequence.DB_OBJECT_ID_KEY)) {
                        sequenceDbObject.removeField(Sequence.DB_OBJECT_ID_KEY); //remove _id, to avoid collisions when importing same file twice
                    }
                    sequenceService.saveSequenceDBObject(sequenceDbObject);

                    // Save the DBRef for cleanup in case of failure
                    DBRef courseRef = sequenceService.getDBRefBySeqId(exportImportPackage.getCourseId(), lessonCId, seqId);
                    cleanupList.add(courseRef);
                }
            }
        } catch (Exception e) {
            logger.error("exportSequencesToTempLocation: error while exporting seqs from db to FS", e);
            throw new DsException(e);
        }
    }

    /**
     * exporting the course's standards from DB to a tmp location as a file.
     *
     * @throws DsException
     */
    private void exportStandardsToTempLocation() throws DsException {
        logger.debug(String.format("exportStandardsToTempLocation: the standards of the course is about to be saved to file. CourseId: %s", exportImportPackage.getCourseId()));
        try {
            CourseCGSObject courseObject = this.courseDataService.getCourse(exportImportPackage.getPublisherId(), exportImportPackage.getCourseId(), null, false);
            CourseContentEditor courseEditor = new CourseContentEditor(courseObject);
            Iterator<StandardsPackage> standardsItr = courseEditor.getStandardsPackageIterator();
            while (standardsItr.hasNext()) {
                StandardsPackage standardsPackage = standardsItr.next();

                // export this standard from the standards collection to a file
                DBObject standardPackageObj = this.standardsDao.getStandardsPackageFullInfo(standardsPackage.getName(), standardsPackage.getSubjectArea(), standardsPackage.getVersion());
                if (standardPackageObj == null) {
                    throw new DsException(String.format("Fail to export standard package full information. The Following standard package , used in this course , could not be found in the database: package name: '%s' package subjectArea: '%s' package version: '%s'",
                            standardsPackage.getName(), standardsPackage.getSubjectArea(), standardsPackage.getVersion()));
                }

                // The exported standard package isLatest flag will always be exported with a false value.
                // When importing , for the largest version , the isLatest field will be set to true
                standardPackageObj.put("isLatest", "false");

                String StandardPackageName = String.format("%s_%s_%s", standardsPackage.getName(), standardsPackage.getSubjectArea(), standardsPackage.getVersion());
                File file = new File(String.format("%s/%s", exportImportPackage.getLocalResourcesLocation().getStandardsPath(), StandardPackageName));

                FileUtils.writeStringToFile(file, JSON.serialize(standardPackageObj), "UTF-8");
                addResourceToPackage(file.getAbsolutePath());
            }
        } catch (Exception e) {
            logger.error("exportStandardsToTempLocation: error while exporting standards from db to FS", e);
            throw new DsException(e);
        }
    }

    /**
     * Import the course's standards from a file to the DB.
     *
     * @throws DsException
     */
    private void importStandards() throws DsException {
        logger.debug(String.format("importStandards: the standards of the course is about to be saved to db. CourseId: %s", exportImportPackage.getCourseId()));
        try {
            File standardsDir = new File(exportImportPackage.getLocalResourcesLocation().getStandardsPath());
            if (standardsDir.exists()) {
                Collection<File> standardsFiles = FileUtils.listFiles(standardsDir, null, true);
                logger.info(String.format("handle standards: number of standards in FS: %d", standardsFiles.size()));
                Iterator<File> iterator = standardsFiles.iterator();
                while (iterator.hasNext()) {
                    File standardsFile = iterator.next();
                    String standardsJson = FileUtils.readFileToString(standardsFile, "UTF-8");
                    DBObject standardsDbObject = (DBObject) JSON.parse(standardsJson);

                    boolean isLatest = false;
                    String latestExistingVersion = standardsDao.getLatestVersion(standardsDbObject);
                    String importedStandardVersion = standardsDbObject.get("version").toString();
                    if (latestExistingVersion == null) {
                        //introducing new standard from import to the cgs
                        isLatest = true;
                    } else if (VersionUtils.compare(latestExistingVersion, importedStandardVersion) > 0) {
                        logger.info(String.format("importStandards: importing older version: %s, a newer version: %s of package: %s already exists in the database",
                                importedStandardVersion, latestExistingVersion, standardsDbObject.get("name").toString()));
                    } else {
                        isLatest = true;
                    }

                    // Import the standard only in case the same name subjectArea and version doesn't exist in the db
                    boolean standardWasImported = standardsDao.saveStandardDBObject(standardsDbObject, isLatest);
                    if (standardWasImported) {
                        // Save the DBRef for cleanup in case of failure
                        DBRef courseRef = standardsDao.getDBRefByStandard(standardsDbObject);
                        cleanupList.add(courseRef);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("exportStandardsToTempLocation: error while importing standards FS to db ", e);
            throw new DsException(e);
        }
    }

    /**
     * Import the course's eBooks from a file to the DB.
     *
     * @throws DsException
     */
    private void importEBooks() throws DsException {
//        if (!exportImportPackage.getCourseFormat().equals(Format.EBOOK)) {
//            return;
//        }

        logger.debug(String.format("importEBooks: the eBooks which the course uses is about to be saved to db. CourseId: %s", exportImportPackage.getCourseId()));
        try {
            File eBooksDir = new File(exportImportPackage.getLocalResourcesLocation().getEBooksPath());
            if (eBooksDir.exists()) {
                Collection<File> eBooksFiles = FileUtils.listFiles(eBooksDir, null, true);
                logger.info(String.format("handle eBooks: number of eBooks in FS: %d", eBooksFiles.size()));
                for (File eBookFile : eBooksFiles) {
                    // change the publisherId to be a as the publisherId of the current user
                    EBook eBook = eBookService.createEbookFromFile(eBookFile, exportImportPackage.getPublisherId());

                    // old courses support - add 'conversionLibraryVersion' attribute in case it's not defined
                    String conversionLibraryVersion = eBook.getConversionLibraryVersion();
                    if ((conversionLibraryVersion == null) || (conversionLibraryVersion.isEmpty())) {
                        eBook.setConversionLibraryVersion("1.0");
                    }

                    // old courses support - add 'conversionLibrary' attribute in case it's not defined
                    if (eBook.getConversionLibrary() == null) {
                        String originalFileNameExt = FilenameUtils.getExtension(eBook.getOriginalFileName());
                        if (originalFileNameExt.equals(EPUB)) {
                            eBook.setEBookConversionServiceTypes(EBookConversionServiceTypes.EPUB);
                        } else {
                            eBook.setEBookConversionServiceTypes(EBookConversionServiceTypes.IDR);
                        }
                    }

                    // add the eBook's manifest to DB only if it's a new eBook
                    if (eBookService.getByPublisherAndEBookId(eBook.getEBookId(), eBook.getPublisherId()) == null) {
                        eBookService.saveEBook(eBook);

                        // save the DBRef for cleanup in case of failure
                        DBRef eBookRef = eBookService.getDBRefByEBook(eBook);
                        cleanupList.add(eBookRef);
                    }
                }
            }
        } catch (Exception e) {
            logger.error("importEBooks: error while importing eBooks manifests from FS to DB", e);
            throw new DsException(e);
        }
    }

    /**
     * exporting applets from DB to a tmp location as a file.
     *
     * @throws DsException
     */
    private void exportAppletsToTempLocation() throws DsException {
        logger.debug(String.format("exportAppletsToTempLocation: the applets of the course are about to be saved to file. CourseId: %s", exportImportPackage.getCourseId()));
        try {
            DBObject applets = appletDao.getApplets(exportImportPackage.getCourseId());

            File file = new File(String.format("%s/%s", exportImportPackage.getLocalResourcesLocation().getAppletsPath(), exportImportPackage.getCourseId()));
            FileUtils.writeStringToFile(file, JSON.serialize(applets), "UTF-8");
            addResourceToPackage(file.getAbsolutePath());
        } catch (Exception e) {
            logger.error("exportAppletsToTempLocation:: error while exporting applets from db to filesystem", e);
            throw new DsException(e);
        }
    }

    /**
     * import applets from FS to DB.
     *
     * @throws DsException
     */
    private void importApplets() throws DsException {
        logger.debug(String.format("importApplets: the applets of the course are about to be saved to file. CourseId: %s", exportImportPackage.getCourseId()));
        try {
            File appletsDir = new File(exportImportPackage.getLocalResourcesLocation().getAppletsPath());
            if (appletsDir.exists()) {
                Collection<File> appletsFiles = FileUtils.listFiles(appletsDir, null, true);
                logger.info(String.format("handle applets: number of applets in FS: %d", appletsFiles.size()));

                Iterator<File> iterator = appletsFiles.iterator();
                while (iterator.hasNext()) {
                    File appletFile = iterator.next();
                    String appletJson = FileUtils.readFileToString(appletFile, "UTF-8");
                    DBObject appletDbObject = (DBObject) JSON.parse(appletJson);

                    String newCourseId = exportImportPackage.getCourseId();

                    appletDbObject.put(TocItemCGSObject.COURSE_ID, newCourseId);

                    appletDao.saveAppletDBObject(appletDbObject);

                    // Save the DBRef for cleanup in case of failure
                    DBRef courseRef = appletDao.getDBRefOfApplets(exportImportPackage.getCourseId());
                    cleanupList.add(courseRef);
                }
            }
        } catch (Exception e) {
            logger.error("exportAppletsToTempLocation:: error while importing applets from FS to db ", e);
            throw new DsException(e);
        }
    }

    /**
     * Add the resources of a directory to the package for preparing the zipped file.
     *
     * @param resourcePath - a directory to the package for preparing the zipped file.
     */
    public void addResourcesToPackageRecursively(String resourcePath) {
        File resourceFile = new File(resourcePath);
        if (resourceFile.exists()) {
            String[] listOfFiles = resourceFile.list();
            if (listOfFiles != null) {
                for (String fileS : listOfFiles) {
                    File file = new File(String.format("%s/%s", resourcePath, fileS));
                    if (file.isDirectory()) {
                        addResourcesToPackageRecursively(file.getAbsolutePath());
                    } else {
                        addResourceToPackage(file.getAbsolutePath());
                    }
                }
            }
        }
    }

    /**
     * Add a file that will hold the major , minor and build versions taken from tomcat\webapps\cgs\WEB-INF\classes\config\version.properties to the zip file
     * These values will be used by the import process
     */
    private void exportVersionFile() throws Exception {
        try {
            String destinationPath = String.format("%s/%s", exportImportPackage.getLocalResourcesLocation().getBasePath(), EXPORT_VERSION);
            File destinationFile = new File(destinationPath);
            if (versionService.exportVersionFile(destinationFile)) {
                addResourceToPackage(destinationFile.getAbsolutePath());
            } else {
                logger.error("exportVersionFile: error while exporting version file");
            }
        } catch (IOException e) {
            logger.error("exportVersionFile: error while exporting version file", e);
            throw e;
        }
    }

    /**
     * Compare the major , minor and build versions taken from tomcat\webapps\cgs\WEB-INF\classes\config\version.properties to the exportVersion file
     */
    private boolean compareVersions() throws Exception {
        String versionMajor = versionService.getVersionMajor();
        String versionMinor = versionService.getVersionMinor();
        String versionBuild = versionService.getVersionBuild();
        String exportVersionPath = String.format("%s/%s", exportImportPackage.getLocalResourcesLocation().getBasePath(), EXPORT_VERSION);

        BufferedReader br = new BufferedReader(new FileReader(exportVersionPath));
        String exportVersionMajor = "0";
        String exportVersionMinor = "0";
        String exportVersionBuild = "0";

        String line = br.readLine();
        while (line != null) {
            // Skip comments and empty lines
            if (line.trim().startsWith("#") || line.trim().length() == 0) {
                line = br.readLine();
                continue;
            }
            int delIndex = line.lastIndexOf("=");
            String versionName = line.substring(0, delIndex);
            String versionVal = line.substring(delIndex + 1);

            switch (versionName) {
                case MAJOR_VER:
                    exportVersionMajor = versionVal;
                    break;
                case MINOR_VER:
                    exportVersionMinor = versionVal;
                    break;
                case BUILD_VER:
                    exportVersionBuild = versionVal;
                    break;
            }
            line = br.readLine();
        }

        br.close();

        if ((Integer.parseInt(exportVersionMajor) != Integer.parseInt(versionMajor)) || (Integer.parseInt(exportVersionMinor) != Integer.parseInt(versionMinor)) ||
                (Integer.parseInt(exportVersionBuild) != Integer.parseInt(versionBuild))) {
            logger.info(String.format("The Export version and the import version are not the same. exportVersions: Major=%s Minor=%s Build=%s.importVersions: Major=%s Minor=%s Build=%s",
                    exportVersionMajor, exportVersionMinor, exportVersionBuild, versionMajor, versionMinor, versionBuild));

            jobService.addError(exportImportPackage.getJobId(), NOT_EQUAL_VERSIONS, String.format("The Export version and the import version are not the same. exportVersions: Major=%s Minor=%s Build=%s.importVersions: Major=%s Minor=%s Build=%s",
                    exportVersionMajor, exportVersionMinor, exportVersionBuild, versionMajor, versionMinor, versionBuild), Job.Status.IN_PROGRESS);
            return false;
        }

        return true;
    }

    /**
     * Import the resources (Applets , media) by copying the files from the uncompress export file to publishers\<publishedId>\courses
     */
    public void importResourceFiles() throws Exception {
        logger.info(String.format("start importing resources %s", new Date()));
        try {
            File cmsPublisherCourseHomeDir = new File(String.format("%s/publishers/%d/courses/%s", configuration.getProperty("cmsHome"), exportImportPackage.getPublisherId(), exportImportPackage.getCourseId()));
            if (!cmsPublisherCourseHomeDir.exists()) {
                logger.info(String.format("creating directory: %s", cmsPublisherCourseHomeDir));
                cmsPublisherCourseHomeDir.mkdirs();
            }

            try { // Delete the DB files since this information was already imported to the database. Keep only the Asset files (media , applets)
                File DBFiles = new File(String.format("%s/DB", exportImportPackage.getLocalResourcesLocation().getBasePath()));
                FileUtils.deleteDirectory(DBFiles);
            } catch (FileNotFoundException e) {
            }

            // Delete the exported version file since the validation was done already. Keep only the Asset files (media , applets)
            File versionFile = new File(String.format("%s/%s", exportImportPackage.getLocalResourcesLocation().getBasePath(), EXPORT_VERSION));
            FileUtils.deleteQuietly(versionFile);

            // Copy eBooks assets to publisher's folder
            File eBooksDir = new File(exportImportPackage.getLocalResourcesLocation().getBasePath(), configuration.getProperty("eBooksBaseFolder"));

            if (eBooksDir.listFiles() != null) {
                for (File eBookDirToCopy : eBooksDir.listFiles()) {
                    File eBookDirOfPublisher = new File(exportImportPackage.getCmsEBooksHomeLocation(), eBookDirToCopy.getName());
                    if (!eBookDirOfPublisher.exists()) {
                        eBookDirOfPublisher.mkdirs();
                        filesUtils.copyFolder(eBookDirToCopy, new File(exportImportPackage.getCmsEBooksHomeLocation(), eBookDirToCopy.getName()), exportImportPackage.getJobId());
                    }
                }
            }
            FileUtils.deleteDirectory(eBooksDir);

            // Copy the assets to cmsPublisherCourseHomeDir
            FilesUtils filesUtils = new FilesUtils(jobService);
            File resourcesFile = new File(exportImportPackage.getLocalResourcesLocation().getBasePath());
            filesUtils.copyFolder(resourcesFile, cmsPublisherCourseHomeDir, exportImportPackage.getJobId());

            // Delete the staging area directory
            try {
                filesUtils.deleteDirectory(resourcesFile, exportImportPackage.getJobId());
            } catch (FileNotFoundException e) {
            }
        } catch (Exception e) {
            throw new DsException(e);
        }
    }

    private int calcPercent(int part, int total) {
        if (total > 0) {
            return part * 100 / total;
        }
        return 0;
    }

    private Integer parseSchemaVersionToInteger(DBObject contentData) {
        String schemaVersionString = (String) contentData.get(ContentItemBase.SCHEMA);
        schemaVersionString = schemaVersionString.replaceAll("course_v", "");
        return Integer.parseInt(schemaVersionString);
    }

    private DBObject onLessonSchemaUpgradeToV7(int publisherId, String courseId, DBObject lesson) throws DsException {
        DBObject content = (DBObject) lesson.get(TocItemCGSObject.CGS_CONTENT);
        content.put(ContentItemBase.SCHEMA, "course_v7");
        Course course = courseDataService.getCourse(publisherId, courseId);
        course.getContentData().setSchema("course_v7");
        Map<String, String> eBooks = (Map<String, String>) content.get("eBooks");
        if (eBooks != null) {
            Set<String> eBooksIDs = eBooks.keySet();
            content.removeField("eBooks");
            content.put("eBooksIds", eBooksIDs);
            course.getContentData().addEBookIds(eBooksIDs);
            Header updatedHeader = Header.newInstance(course.getContentData().getHeader(), new Date());
            course.getContentData().setHeader(updatedHeader);
            courseDataService.save(course);
        }
        return lesson;
    }
}