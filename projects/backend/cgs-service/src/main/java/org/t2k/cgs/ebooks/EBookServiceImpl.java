package org.t2k.cgs.ebooks;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.DBRef;
import com.t2k.configurations.Configuration;
import nl.siegmann.epublib.domain.Book;
import nl.siegmann.epublib.domain.TableOfContents;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.fileupload.FileUploadBase;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.t2k.cgs.CompareResult;
import org.t2k.cgs.cms.CmsService;
import org.t2k.cgs.constants.WebsocketTopics;
import org.t2k.cgs.course.CourseDataService;
import org.t2k.cgs.course.CourseRepository;
import org.t2k.cgs.dao.ebooks.EBooksDao;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.dto.ebook.TOCSummaryDTO;
import org.t2k.cgs.dto.websocket.Message;
import org.t2k.cgs.dto.websocket.MessageCode;
import org.t2k.cgs.ebooks.epub.EPubToEBookConversionServiceImpl;
import org.t2k.cgs.ebooks.epub.JouveEpubReader;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.enums.EBookPagesSourceTypes;
import org.t2k.cgs.enums.OverlayElementsTypes;
import org.t2k.cgs.lock.LockService;
import org.t2k.cgs.locks.LockUser;
import org.t2k.cgs.model.course.Course;
import org.t2k.cgs.model.course.CourseTocItemRef;
import org.t2k.cgs.model.ebooks.*;
import org.t2k.cgs.model.ebooks.conversion.EBookToCourseTOC;
import org.t2k.cgs.model.ebooks.conversion.EBookToCourseTocStructure;
import org.t2k.cgs.model.ebooks.conversion.Error;
import org.t2k.cgs.model.ebooks.ebookForClientResponse.EbookForClient;
import org.t2k.cgs.model.job.Job;
import org.t2k.cgs.model.job.Job.Status;
import org.t2k.cgs.model.job.JobComponentProgress;
import org.t2k.cgs.model.job.JobProperties;
import org.t2k.cgs.model.job.JobService;
import org.t2k.cgs.model.tocItem.CourseTocAndLessons;
import org.t2k.cgs.model.tocItem.Lesson;
import org.t2k.cgs.model.utils.ErrorCode;
import org.t2k.cgs.publisher.PublisherService;
import org.t2k.cgs.security.CGSAccount;
import org.t2k.cgs.security.CGSUserDetails;
import org.t2k.cgs.tocItem.LessonRepository;
import org.t2k.cgs.user.UserService;
import org.t2k.cgs.utils.FilesUtils;
import org.t2k.cgs.version.VersionService;
import org.t2k.sample.dao.exceptions.DaoException;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import static org.t2k.cgs.model.job.Job.Type.UploadEBookFile;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 18/10/2015
 * Time: 15:40
 */
@Service("eBookService")
public class EBookServiceImpl implements EBookService {

    private static final String TOC_HTML_PATH_UPPER_CASE = "/OEBPS/TOC.xhtml";
    private static final String TOC_HTML_PATH_LOWER_CASE = "/OEBPS/toc.xhtml";

    private static Logger logger = Logger.getLogger(EBookServiceImpl.class);
    private static final String BLANK_PAGE_TEMPLATE_HTML = "templates/blankPageTemplate.html";

    @Autowired
    private EBooksDao eBooksDao;

    @Autowired
    private EBookRepository eBookRepository;

    @Autowired
    private EBookConversionServiceFactory eBookConversionServiceFactory;

    @Autowired
    private JobService jobService;

    @Autowired
    private Configuration configuration;

    @Autowired
    private CourseDataService courseDataService;

    @Autowired
    private FilesUtils filesUtils;

    @Autowired
    private CmsService cmsService;

    @Autowired
    private HtmlParsingService htmlParsingService;

    @Autowired
    private VersionService versionService;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private LessonRepository lessonRepository;

    @Autowired
    private PublisherService publisherService;

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    private UserService userService;

    @Autowired
    private LockService lockService;

    @Autowired
    private EBookCleanupService eBookCleanupService;

    // Create Job
    @Override
    public String createJobForUploadProcess(int publisherId, String eBookId, String username) {
        String jobId = UUID.randomUUID().toString();
        return createJobForUploadProcess(jobId, publisherId, eBookId, username);
    }

    private String createJobForUploadProcess(String jobId, int publisherId, String eBookId, String username) {
        String eBookDir = eBookCleanupService.getEBookFolderById(publisherId, eBookId);
        // New Job
        Job uploadJob = new Job.Builder(jobId, UploadEBookFile, Status.PENDING)
                .setWebsocketTopic(WebsocketTopics.UPLOAD_AND_CONVERT + jobId)
                .build();
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

    @Override
    public EBook uploadEBookFile(UploadEBookData uploadEBookData, EBookManager eBookManager) {
        if (uploadEBookData.isCancelled()) return null;
        String eBookId = uploadEBookData.getEBookId();
        String jobId = uploadEBookData.getJobId();
        EBookConversionService eBookConversionService;
        File eBookFile = uploadEBookData.getUploadedEBookFile();

        if (eBookFile == null || uploadEBookData.isCancelled()) {
            // Null file will be interpreted as error upon return
            return null;
        }

        try {
            EBookFormat ebookFormat = getEBookFormat(eBookFile);
            eBookConversionService = eBookConversionServiceFactory.getEBookConversionService(ebookFormat, uploadEBookData.getSelectedPdfConverter());

            if (!eBookConversionService.isValid(uploadEBookData)) return null;
            if (uploadEBookData.isCancelled()) {
                logger.debug(String.format("Upload is cancelled for %s", uploadEBookData));
                return null;
            }

            jobService.updateComponentProgress(jobId, EbookJobComponent.CALCULATING_EBOOK_FILE_HASH, 0, Status.IN_PROGRESS);
            String sha1 = calculateSha1Hash(jobId, eBookFile);
            if (sha1 == null) {
                String errMsg = String.format("SHA-1 hash could not be generated for eBook file '%s' on job '%s'",
                        eBookFile.getAbsolutePath(), jobId);
                logger.error(errMsg);
                jobService.addError(jobId, EBookErrorCode.FAILED_TO_CONVERT_EBOOK_FILE.getCode(), errMsg, Status.FAILED);
                return null;
            }
            jobService.updateComponentProgress(jobId, EbookJobComponent.CALCULATING_EBOOK_FILE_HASH, 100, Status.IN_PROGRESS);
            if (uploadEBookData.isCancelled()) return null;

            EBookConversionServiceTypes eBookConversionServiceType = eBookConversionService.getEBookConversionServiceType();
            String eBookConversionServiceVersion = eBookConversionService.getEbookConversionLibraryVersion();
            logger.debug("Checking if EBook already exists");
            EBook eBook = getEBookBySha1PublisherAndConversionLibraryTypeAndVersion(sha1, uploadEBookData.getPublisherId(), eBookConversionServiceType, eBookConversionServiceVersion);

            // hack for the QA -  always upload the ebook, don't check for duplicates
            boolean checkIsEbookAlreadyExistsBeforeSaving = configuration.getBooleanProperty("checkIsEbookAlreadyExistsBeforeSaving");

            if (checkIsEbookAlreadyExistsBeforeSaving && eBook != null) {
                logger.debug(String.format("Ebook already exists in DB, using sha1: %s", sha1));
                // Notify the Client this eBook already exists in db.
                // Override eBookId in the Jobs' properties with the existing eBook Id (from DB).
                Job job = jobService.getJob(jobId);
                job.getProperties().setEBookId(eBook.getEBookId());
                jobService.save(job);

                setProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE, 100);
                setProgress(jobId, EbookJobComponent.GENERATING_PAGE_THUMBNAILS, 100);
                setProgress(jobId, EbookJobComponent.SAVING_EBOOK_DATA_TO_DB, 100);

                deleteTempDir(new File(uploadEBookData.getEBookDir()));
            } else { // Create the eBook
                logger.debug(String.format("Ebook doesn't exists in DB, adding it now... conversion service: %s, sha1: %s", eBookConversionServiceType, sha1));
                eBook = generateEBookAndSaveToDB(uploadEBookData, sha1, eBookConversionService);
            }
            return eBook;
        } catch (Exception e) {
            String errorMsg = String.format("Failed to upload file %s with id %s of job %s", uploadEBookData.getUploadedEBookFile().getName(), eBookId, jobId);
            logger.error(errorMsg, e);
            addErrorToJob(errorMsg, jobId);
        } finally {
            eBookManager.onTaskFinished(uploadEBookData);
        }
        return null;
    }

    private EBook generateEBookAndSaveToDB(UploadEBookData uploadEBookData, String bookSha1, EBookConversionService eBookConversionService) {
        String eBookId = uploadEBookData.getEBookId();
        String jobId = uploadEBookData.getJobId();
        File eBookFile = uploadEBookData.getUploadedEBookFile();
        EBook eBook;
        EBookStructure eBookStructure;
        try {
            eBookStructure = eBookConversionService.generateEBookStructure(uploadEBookData);
        } catch (Throwable t) {
            logger.error("Error occurred while generating eBook structure", t);
            addErrorToJob(String.format("Error occurred while generating eBook structure. Cause: %s", t.getCause()), jobId);
            return null;
        }

        if (uploadEBookData.isCancelled()) {
            return null;
        }

        // Generate Thumbnails.
        try {
            eBookConversionService.generatePageThumbnails(eBookStructure, uploadEBookData);
        } catch (Exception e) {
            String errorMsg = String.format("Error occurred while generating page thumbnails for file %s with id %s of job %s",
                    uploadEBookData.getUploadedEBookFile().getName(), eBookId, jobId);
            logger.error(errorMsg, e);
            addErrorToJob(errorMsg, jobId);
            return null;
        }

        //delete tmp dir with original pdf file, after generation of thumbnails
        deleteTempDir(getEBookTempDir(uploadEBookData));

        if (uploadEBookData.isCancelled()) {
            return null;
        }

        // Jouve support - check is it 'Jouve Studio' eBook. If so, add a 'pagesSource' attribute to the eBook structure in the eBook collection. Needed for affecting the GUI and functionality of the Lesson player (CREATE-4179 - Hide/Show jouve enrichment)
        boolean isJouveEbook = checkIsJouveStudioEbook(eBookStructure, uploadEBookData.getPublisherId());

        // Jouve support - create Jouve enrichment list (CREATE-4179 - view & filter enrichment list for Jouve & T2K)
        if (isJouveEbook) {
            addJouveEnrichmentListToEookStructure(eBookStructure, uploadEBookData.getPublisherId(), uploadEBookData.getEBookDir());
        }

        // Check if manipulation of the eBook pages is needed (add CSS attributes to ePub pages in order to fix the visualization)
        // - fix for resize problem:
        //                           1. ePub pages which contains PDF (with or without Object tag)
        //                           2. scaling problem (because Of adding Absolute to the body by the Dynamic book player)
        //                           3. pages which contain only pictures (because Of adding Absolute to the body by the Dynamic book player)
        // - fix for Jouve studio problem:
        //                           1. some of the Jouve studio ebooks can't be highlight (has transparent text)

        // flag of the resize problem - indicates do we need to add CSS rules to each page
        boolean epubPageRequireCssChange = configuration.getBooleanProperty("checkIsEpubPageRequireCssChange");
        // flag of the Jouve studio problem - indicates do we need to add CSS rules to each page + return a flag is it a Jouve eBook
        boolean jouveStudioEpubPageRequireCssChange = configuration.getBooleanProperty("checkIsJouveStudioEpubPageRequireCssChange");
        String fileExtension = FilenameUtils.getExtension(uploadEBookData.getUploadedEBookFile().getPath());
        boolean epubWhichRequiresManipulation = ((fileExtension.equals("epub")) && ((epubPageRequireCssChange) || (jouveStudioEpubPageRequireCssChange)));
        // Is it an eBook which requires manipulation
        if (epubWhichRequiresManipulation) {
            // get the CSS rules for the resize problem
            String epubPageCssRules = configuration.getProperty("cssRulesForEpubPagesChange");
            // get the CSS rules for the Jouve Studio problem
            String jouveStudioEpubPageCssRules = configuration.getProperty("cssRulesForJouveStudioEpubPagesChange");
            // add the word "!important" to each CSS attribute (must be manipulated here because in configuration the symbol '!' represents the end of the string)
            jouveStudioEpubPageCssRules = jouveStudioEpubPageCssRules.replace(";", " !important;");
            // iterate the eBook pages for adding CSS rules which fix GUI problems
            changePageVisualization(eBookStructure, uploadEBookData.getPublisherId(), isJouveEbook, epubPageRequireCssChange, jouveStudioEpubPageRequireCssChange, epubPageCssRules, jouveStudioEpubPageCssRules);
        }

        // extract text from pages for search text
        eBookStructure = extractTextFromPages(eBookStructure, uploadEBookData.getPublisherId());

        EBook.Builder eBookBuilder = new EBook.Builder(eBookId, uploadEBookData.getPublisherId(), bookSha1)
                .setUsername(uploadEBookData.getUsername())
                .setOriginalFileName(eBookFile.getName())
                .setCreationDate(new Date())
                .setStructure(eBookStructure)
                .setConversionLibrary(eBookConversionService.getEBookConversionServiceType())
                .setConversionLibraryVersion(eBookConversionService.getEbookConversionLibraryVersion())
                .setCgsVersion(versionService.getFullVersion());

        // Jouve support - add flag to this eBook for marking it as  'Jouve eBook'. During the publish we will use this flag in order to affect the GUI and functionality of the Lesson player (CREATE-4179 - Hide/Show jouve enrichment)
        if (isJouveEbook) {
            eBookBuilder.setPagesSource(EBookPagesSourceTypes.JOUVE);
        }
        eBook = eBookBuilder.build();

        // Save eBook to DB
        jobService.updateJobProgress(jobId, EbookJobComponent.SAVING_EBOOK_DATA_TO_DB.getTitle(), 0, Status.IN_PROGRESS);
        if (uploadEBookData.isCancelled()) {
            return null;
        }
        saveEBook(eBook);

        jobService.updateJobProgress(jobId, EbookJobComponent.SAVING_EBOOK_DATA_TO_DB.getTitle(), 100, Status.IN_PROGRESS);
        return eBook;
    }

    @Override
    public void uploadNewEBookVersion(UploadEBookData conversionData, EBookManager eBookManager, EBook oldEBook, Set<String> courseIds) {
        LocalDateTime startTime = LocalDateTime.now();
        logger.info(String.format("---[ Starting uploadNewEBookVersion ]---[Time: %s]", startTime));
        String jobId = conversionData.getJobId();
        String websocketTopic = jobService.getJob(jobId).getWebsocketTopic();

        if (conversionData.isCancelled()) { // CANCEL CHECKPOINT
            onJobCanceled(conversionData, true, websocketTopic);
            return;
        }
        EBook newEBook = convertEBook(conversionData, eBookManager, websocketTopic);

        UpdateEBookData updateEBookData = new UpdateEBookData.Builder(conversionData, newEBook,
                oldEBook, eBookCleanupService.getEBookFolderById(oldEBook.getPublisherId(), oldEBook.getEBookId()))
                .setUploadedOnCurrentJob(true)
                .setCourseIds(courseIds)
                .build();
        updateEBook(updateEBookData, eBookManager);
    }

    @Override
    public boolean updateEBook(UpdateEBookData updateEBookData, EBookManager eBookManager) {
        final LocalDateTime startTime = LocalDateTime.now();
        EBook newEBook = updateEBookData.getNewEBook();
        EBook oldEBook = updateEBookData.getOldEBook();
        logger.info(String.format("[Time: %s] Starting eBook update for eBook %s with new eBook version %s", startTime, oldEBook, newEBook));
        String jobId = updateEBookData.getJobId();
        CGSUserDetails currentUser = userService.getByName(updateEBookData.getUsername()).toUserDetails();

        if (updateEBookData.getCourseIds().size() == 0) {
            jobService.onJobFailure(jobId, EBookErrorCode.NO_COURSE_TO_UPDATE_EBOOK_SPECIFIED,
                    "No course to update the eBook on was specified", null);
            eBookManager.removeJob(jobId);
            if (updateEBookData.isUploadedOnCurrentJob()) eBookCleanupService.removeEBook(newEBook);
            return false;
        }

        Job job = jobService.getJob(jobId);
        String websocketTopic = job.getWebsocketTopic();
        if (updateEBookData.isCancelled()) { // CANCEL CHECKPOINT
            onJobCanceled(updateEBookData, false, websocketTopic);
            if (updateEBookData.isUploadedOnCurrentJob()) eBookCleanupService.removeEBook(newEBook);
            return false;
        }

        logger.info("Validating the structure of the updated eBook");
        job = jobService.getJob(jobId);
        job.setStatus(Status.IN_PROGRESS);
        job.getProperties().setNewEBookId(updateEBookData.getNewEBook().getEBookId());
        job.getProperties().setOldEBookId(updateEBookData.getOldEBook().getEBookId());
        job.updateComponentProgress(EbookJobComponent.EBOOK_STRUCTURE_VALIDATION, 0);
        job = jobService.save(job);

        if (oldEBook.equals(newEBook) || oldEBook.getSha1().equals(newEBook.getSha1())) {
            jobService.onJobFailure(job.getJobId(), EBookErrorCode.SAME_EBOOK_VERSION,
                    "Updated eBook is identical with the existing one", null);
            eBookManager.removeJob(jobId);
            return false;
        } else if (newEBook.getUpdatedEBookId() != null && newEBook.getUpdatedEBookId().equals(oldEBook.getEBookId())) {
            jobService.onJobFailure(job.getJobId(), EBookErrorCode.INVALID_UPDATED_EBOOK,
                    String.format("Update can cause circular reference between eBooks! Trying to set eBook '%s' as updated version for eBook '%s",
                            newEBook, oldEBook),
                    null);
            eBookManager.removeJob(jobId);
            return false;
        }
        job = jobService.updateComponentProgress(jobId, EbookJobComponent.EBOOK_STRUCTURE_VALIDATION.getTitle(), 50, Status.IN_PROGRESS);

        CompareResult compareResult = oldEBook.compareStructureTo(newEBook);
        if (compareResult.getResult() != 0) {
            jobService.onJobFailure(job.getJobId(), EBookErrorCode.INVALID_EBOOK_STRUCTURE,
                    "Updated eBook's structure does not match with the structure of the eBook to replace ", null);
            eBookManager.removeJob(jobId);
            if (updateEBookData.isUploadedOnCurrentJob()) eBookCleanupService.removeEBook(newEBook);
            return false;
        }
        jobService.updateComponentProgress(jobId, EbookJobComponent.EBOOK_STRUCTURE_VALIDATION.getTitle(), 100, Status.IN_PROGRESS);

        if (updateEBookData.isCancelled()) { // CANCEL CHECKPOINT
            onJobCanceled(updateEBookData, false, websocketTopic);
            if (updateEBookData.isUploadedOnCurrentJob()) eBookCleanupService.removeEBook(newEBook);
            return false;
        }

        LockUser lockUser = new LockUser(currentUser);
        if (!lockEBooksForUpdate(updateEBookData, eBookManager, lockUser, newEBook, oldEBook, websocketTopic))
            return false;

        Set<String> coursesToUpdate = updateEBookData.getCourseIds();
        Set<String> updatedCourses = updateEBookOnCourses(updateEBookData, currentUser, coursesToUpdate, newEBook, oldEBook, websocketTopic);
        updateEBooksReferences(updateEBookData.getPublisherId(), newEBook, oldEBook);

        Set<String> coursesUsingEBook = courseDataService.getByPublisherAndEBookId(updateEBookData.getPublisherId(), oldEBook.getEBookId())
                .stream().map(Course::getId).collect(Collectors.toSet());
        coursesUsingEBook.removeAll(updatedCourses);
        if (coursesUsingEBook.size() == 0) {
            logger.info(String.format("EBook %s is no longer used on any course. Removing eBook %s", oldEBook.getEBookId(), oldEBook));
            eBookCleanupService.removeEBook(oldEBook); // race condition - an user may add the book on a course since we retrieved coursesUsingEBook list

            job = jobService.getJob(jobId);
            job.getProperties().setRemovedEBookId(oldEBook.getEBookId());
            jobService.save(job);
        }

        releaseEBooksLocks(updateEBookData, newEBook, oldEBook, lockUser);
        eBookManager.removeJob(jobId);
        job = jobService.getJob(jobId);
        if (job.getErrors().size() > 0) {
            jobService.updateJobStatus(jobId, Status.FAILED);
        } else {
            jobService.updateJobStatus(jobId, Status.COMPLETED);
        }
        logger.info(String.format("Finished updating eBook %s with eBook %s. [Elapsed: %s s]",
                oldEBook, newEBook, ChronoUnit.SECONDS.between(startTime, LocalDateTime.now())));
        return true;
    }

    /**
     * @return set of courses that were updated successfully. List of
     * courses successfully updated is found on updatedCourses property on the Job
     */
    private Set<String> updateEBookOnCourses(UpdateEBookData updateEBookData,
                                             CGSUserDetails currentUser,
                                             Set<String> coursesToUpdate,
                                             EBook newEBook, EBook oldEBook,
                                             String websocketTopic) {
        logger.info(String.format("Updating eBook %s with new eBook version %s on courses %s", oldEBook, newEBook, coursesToUpdate));
        String jobId = updateEBookData.getJobId();
        Job job = jobService.updateComponentProgress(jobId, EbookJobComponent.UPDATING_COURSES.getTitle(), 0, Status.IN_PROGRESS);

        int progressTick = coursesToUpdate.size() / 100;
        Set<String> updatedCourses = new HashSet<>(coursesToUpdate.size());
        Set<String> failedToUpdateCourses = new HashSet<>();
        for (String courseId : coursesToUpdate) {
            if (updateEBookData.isCancelled()) { // CANCEL CHECKPOINT
                onJobCanceled(updateEBookData, false, websocketTopic);
                if (progressTick == 0 && updateEBookData.isUploadedOnCurrentJob())
                    eBookCleanupService.removeEBook(newEBook);
                return updatedCourses;
            }
            if (!updateEBookOnCourse(updateEBookData.getPublisherId(), currentUser, courseId, newEBook, oldEBook)) {
                logger.error(String.format("Error updating eBook %s with eBook %s on course with ID %s",
                        oldEBook, newEBook, courseId));
                failedToUpdateCourses.add(courseId);
                job.addError(EBookErrorCode.FAILED_TO_UPDATE_EBOOK_ON_COURSE,
                        String.format("Failed to update eBook %s (eBookId %s) on course %s",
                                oldEBook.getOriginalFileName(), oldEBook.getEBookId(), courseId));
                job.getProperties().setFailedToUpdateCourses(failedToUpdateCourses);
            } else {
                updatedCourses.add(courseId);
                job.getProperties().setUpdatedCourses(updatedCourses);
                job.updateComponentProgress(EbookJobComponent.UPDATING_COURSES, ++progressTick);
            }
            job = jobService.save(job);
        }
        jobService.updateComponentProgress(jobId, EbookJobComponent.UPDATING_COURSES, 100);
        logger.info(String.format("Successfully updated eBook %s with new eBook version %s on courses %s. ", oldEBook, newEBook, coursesToUpdate));
        return updatedCourses;
    }

    private boolean updateEBookOnCourse(int publisherId, CGSUserDetails currentUser, String courseId, EBook newEBook, EBook oldEBook) {
        logger.info(String.format("Updating eBook %s with new eBook version %s on course %s", oldEBook, newEBook, courseId));
        LockUser lockUser = new LockUser(currentUser);
        try {
            lockService.checkAndAcquireLocksOnCourse(publisherId, courseId, lockUser);
        } catch (DsException e) {
            logger.error(String.format("Unable to acquire lock on course %s using lockUser %s, publisher %s", courseId, lockUser, publisherId));
            return false;
        }

        Course course = courseDataService.getCourse(publisherId, courseId);
        course.updateEBook(newEBook, oldEBook);

        List<String> lessonsIds = course.getTocItemsRefs().stream()
                .filter(courseTocItemRef -> courseTocItemRef.getType().equals(EntityType.LESSON.getName()))
                .map(CourseTocItemRef::getCid)
                .collect(Collectors.toList());
        List<Lesson> lessons = lessonRepository.findByPublisherIdAndCourseIdAndCidIn(publisherId, courseId, lessonsIds);
        lessons.stream()
                .filter(lesson -> lesson.containsEBook(oldEBook))
                .forEach(lesson -> lesson.updateEBook(newEBook, oldEBook));
        // save the course and the lessons.
        // we save now because we had cases when the updated crashed on the lessons and we ended-up with a corrupted course with wrong eBook reference
        logger.debug("Saving course to DB");
        courseRepository.save(course);
        logger.debug("Saving lessons to DB");
        lessonRepository.save(lessons);

        try {
            lockService.removeLocksOnCourse(courseId, publisherId, lockUser);
        } catch (DsException e) {
            logger.error(String.format("Unable to release lock from course %s using lockUser %s, publisher %s", courseId, lockUser, publisherId));
        }
        return true;
    }

    @Override
//    @Async // FIXME: 6/15/16 async not usable due to circular references between services
    public void convertEpubAndGenerateToc(EBookConversionData conversionData, EBookManager eBookManager) {
        LocalDateTime startTime = LocalDateTime.now();
        logger.debug(String.format("---[ Starting convertEpubAndGenerateToc ]---[Time: %s]", startTime));
        String jobId = conversionData.getJobId();
        String websocketTopic = jobService.getJob(jobId).getWebsocketTopic();

        if (conversionData.isCancelled()) { // CANCEL CHECKPOINT
            onJobCanceled(conversionData, true, websocketTopic);
            return;
        }
        EPubToEBookConversionServiceImpl ePubToEBookConversionService = (EPubToEBookConversionServiceImpl) eBookConversionServiceFactory
                .getEBookConversionService(EBookFormat.EPUB, null);

        logger.debug("Parsing epub file and generating original TOC structure");
        Book book = readEBook(conversionData, eBookManager, websocketTopic);
        if (book == null) return;

        conversionData.setUserObject(book);
        if (conversionData.isCancelled()) { // CANCEL CHECKPOINT
            onJobCanceled(conversionData, true, websocketTopic);
            return;
        }

        jobService.updateComponentProgress(jobId, EbookJobComponent.EBOOK_TOC_ANALYSIS.getTitle(), 0, Status.IN_PROGRESS);

        logger.debug("Generating intermediary TOC representation for course creation and sending to user for sanity check");
        // we're mocking the structure to build here, without the actual pages saved in the DB, in order to send to the user for sanity check
        List<Page> pages;
        try {
            pages = ePubToEBookConversionService.getPagesFromSpine(book, false, null, null, null, 0);
        } catch (DsException e) {
            jobService.updateComponentProgress(jobId, EbookJobComponent.EBOOK_TOC_ANALYSIS.getTitle(), 0, Status.FAILED);
            logger.error("Error reading the pages from the EBook spine", e);
            return;
        }
        EBookStructure eBookStructure = new EBookStructure(null, null);
        eBookStructure.addPages(pages);
        EBookToCourseTOC eBookToCourseTOC = generateAndValidateEBookToCourseTOC(conversionData, eBookManager, book.getTableOfContents(),
                eBookStructure, websocketTopic);
        if (eBookToCourseTOC == null) return;

        jobService.updateComponentProgress(jobId, EbookJobComponent.EBOOK_TOC_ANALYSIS.getTitle(), 100, Status.IN_PROGRESS);

        logger.debug("sending TOC summary for sanity check for UI");
        TOCSummaryDTO tocSummaryDTO = tocSanityCheck(conversionData, eBookToCourseTOC, websocketTopic);

        if (conversionData.isCancelled()) { // CANCEL CHECKPOINT
            onJobCanceled(conversionData, true, websocketTopic);
            return;
        } else {
            jobService.updateJobStatus(jobId, Status.IN_PROGRESS);
        }

        EBook eBook = convertEBook(conversionData, eBookManager, websocketTopic);

        Job job = jobService.getJob(jobId);
        if (conversionData.isCancelled() || job.getStatus() == Status.FAILED) { // CANCEL CHECKPOINT
            logger.debug(String.format("Job %s:%s", jobId, job.getStatus()));
            simpMessagingTemplate.convertAndSend(websocketTopic, Message.newInstance(MessageCode.PROGRESS, job));
            return;
        } else if (eBook == null || eBook.getStructure() == null) {
            onJobFailure(conversionData, eBookManager, null, EBookErrorCode.FAILED_TO_CONVERT_EBOOK_FILE, "Error converting the eBook");
            return;
        }

        //we're recreating the structure using the actual pages, as obtained from book conversion.
        eBookToCourseTOC = generateAndValidateEBookToCourseTOC(conversionData, eBookManager, book.getTableOfContents(),
                eBook.getStructure(), websocketTopic);
        if (eBookToCourseTOC == null) return;
        // check if the structure matches with he one sent for sanity check to the client
        if (!isStructureValid(conversionData, eBookManager, eBookToCourseTOC, tocSummaryDTO, websocketTopic))
            return;

        Course course = createCourseAndLessons(conversionData, eBookToCourseTOC, eBook);

        eBookManager.onTaskFinished(conversionData);
        simpMessagingTemplate.convertAndSend(websocketTopic, Message.newInstance(MessageCode.COURSE_CREATED, course.getId()));
        logger.debug(String.format("Course with ID '%s' successfully created from epub [Elapsed: %s s]",
                course.getId(), ChronoUnit.SECONDS.between(startTime, LocalDateTime.now())));
    }

    /**
     * @param websocketTopic the websocket topic to send the updates to
     */
    private void onJobCanceled(EBookManagerData conversionData, boolean removeEbookFromDisk,
                               String websocketTopic) {
        String jobId = conversionData.getJobId();
        logger.debug(String.format("Job '%s' was canceled", jobId));
        if (removeEbookFromDisk) {
            try {
                FileUtils.deleteDirectory(new File(conversionData.getEBookDir()));
            } catch (IOException e) {
                logger.error(String.format("Failed to remove eBook directory %s", conversionData.getEBookDir()));
            }
        }
        jobService.updateJobStatus(jobId, Status.CANCELED);
    }

    private Job onJobFailure(UploadEBookData conversionData, EBookManager eBookManager,
                             JobComponentProgress componentProgress,
                             ErrorCode errorCode, String errorMessage) {
        Job job = jobService.getJob(conversionData.getJobId());
        logger.error(errorMessage);
        job.addError(errorCode, errorMessage);
        job.setStatus(Status.FAILED);
        if (componentProgress != null) {
            job.updateComponentProgress(componentProgress.getComponent(), componentProgress.getProgress());
        }
        job = jobService.save(job);
        eBookManager.onTaskFinished(conversionData);
        return job;
    }

    /**
     * Wrapper method for reading epub EBook and sending progress update to client through websocket
     *
     * @param websocketTopic the websocket topic to send the updates to
     * @return the parsed epub Book as a {@link Book} object, or null if an error was encountered
     */
    private Book readEBook(UploadEBookData conversionData, EBookManager eBookManager, String websocketTopic) {
        String jobId = conversionData.getJobId();
        jobService.updateComponentProgress(jobId, EbookJobComponent.GENERATING_EBOOK_TOC.getTitle(), 0, Status.IN_PROGRESS);
        try {
            Book book = new JouveEpubReader().readEpub(conversionData.getUploadedEBookFile());
            if (book == null
                    || (book.getSpine().size() == 0 && book.getResources().size() == 0 && book.getTableOfContents().size() == 0)) { // book is most likely corrupted and couldn't be converted
                book = null; // in case it is not null, but the file was corrupted and EpubReader returned an empty object
                String errorMessage = String.format("Error reading book and generating TOC from file '%s'.",
                        conversionData.getUploadedEBookFile().getName());
                onJobFailure(conversionData, eBookManager, JobComponentProgress.newInstance(EbookJobComponent.GENERATING_EBOOK_TOC, 0),
                        EBookErrorCode.FAILED_TO_CONVERT_EBOOK_FILE, errorMessage);
            } else {
                jobService.updateComponentProgress(jobId, EbookJobComponent.GENERATING_EBOOK_TOC.getTitle(), 100, Status.IN_PROGRESS);
            }
            return book;
        } catch (Exception e) {
            String errorMessage = String.format("Error reading book and generating TOC from file '%s'. [%s]",
                    conversionData.getUploadedEBookFile().getName(), e.getMessage());
            onJobFailure(conversionData, eBookManager, JobComponentProgress.newInstance(EbookJobComponent.GENERATING_EBOOK_TOC, 0),
                    EBookErrorCode.FAILED_TO_CONVERT_EBOOK_FILE, errorMessage);
            return null;
        }
    }

    /**
     * Wrapper method for ebook conversion and client update on the progress through websocket
     *
     * @param websocketTopic the websocket topic to send the updates to
     * @return the converted EBook as a database representation or null, if the conversion failed
     */
    private EBook convertEBook(UploadEBookData conversionData,
                               EBookManager eBookManager,
                               String websocketTopic) {
        logger.debug("Converting ebook to internal EBook representation");
        String jobId = conversionData.getJobId();
        Thread updateUIThread = new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(1000);
                    simpMessagingTemplate.convertAndSend(websocketTopic, Message.newInstance(MessageCode.PROGRESS, jobService.getJob(jobId)));
                } catch (InterruptedException e) {
                    return;
                }
            }
        });
        updateUIThread.start();
        EBook eBook = uploadEBookFile(conversionData, eBookManager);
        updateUIThread.interrupt();
        return eBook;
    }

    /**
     * @param eBookToCourseTOC intermediary TOC representation for course creation
     * @param websocketTopic   the websocket topic to send the updates to
     * @return TOC summary sent to client for validation
     */
    private TOCSummaryDTO tocSanityCheck(EBookConversionData conversionData,
                                         EBookToCourseTOC eBookToCourseTOC,
                                         String websocketTopic) {
        String jobId = conversionData.getJobId();
        Job job;
        TOCSummaryDTO tocSummaryDTO = TOCSummaryDTO.newInstance(eBookToCourseTOC.getTocItems().size(),
                eBookToCourseTOC.getRefsCount(), eBookToCourseTOC.getPagesCount());
        simpMessagingTemplate.convertAndSend(websocketTopic, Message.newInstance(MessageCode.TOC_SUMMARY, tocSummaryDTO));
        // TOC SANITY CHECKPOINT
        job = jobService.updateJobStatus(jobId, Status.PENDING);
        CGSAccount publisher = publisherService.getAccountAuthenticationData(conversionData.getPublisherId(), true);
        double countdown = (publisher == null) ? 10
                : publisher.getAccountCustomization().getEPubConversionConfDelay();
        int checkStatusIntervalInMillis = 500;
        while (countdown > 0 && job.getStatus().equals(Status.PENDING)) { // frontend can update job status by sending message to the websocket controller
            simpMessagingTemplate.convertAndSend(websocketTopic, Message.newInstance(MessageCode.COUNTDOWN, countdown));
            simpMessagingTemplate.convertAndSend(websocketTopic, Message.newInstance(MessageCode.TOC_SUMMARY, tocSummaryDTO));
            try {
                Thread.sleep(checkStatusIntervalInMillis);
            } catch (InterruptedException e) {
                logger.error("Thread sleep was interrupted", e);
            }
            job = jobService.getJob(jobId);
            countdown -= ((double) checkStatusIntervalInMillis / 1000);
        }
        return tocSummaryDTO;
    }

    /**
     * Generates intermediary TOC representation for course creation and updates the client in case errors were encountered
     *
     * @param tableOfContents the table of contents, as extracted from the epub
     * @param eBookStructure  parameters to structure the course to be created from an EBook, needed for pages contained inside it
     * @param websocketTopic  the websocket topic to send the updates to
     * @return an intermediary representation of the TOC to create a course from
     */
    private EBookToCourseTOC generateAndValidateEBookToCourseTOC(EBookConversionData conversionData,
                                                                 EBookManager eBookManager,
                                                                 TableOfContents tableOfContents,
                                                                 EBookStructure eBookStructure,
                                                                 String websocketTopic) {
        String jobId = conversionData.getJobId();
        int maxPagesPerRef = 100;
        Job job;
        EBookToCourseTocStructure structure = new EBookToCourseTocStructure.Builder(conversionData.hasLearningObject()).setMinDepthThresholdForTocCreation(2).build();
        EBookToCourseTOC eBookToCourseTOC = EBookToCourseTOC.newInstance(eBookStructure, tableOfContents, structure, maxPagesPerRef);
        if (eBookToCourseTOC.getErrors().size() > 0) {
            logger.error("Found inconsistencies in TOC structure. Stopping conversion");
            job = jobService.updateComponentProgress(jobId, EbookJobComponent.EBOOK_TOC_ANALYSIS.getTitle(), 100, Status.FAILED);
            for (Error error : eBookToCourseTOC.getErrors()) {
                job.addError(error.getErrorCode(), error.getErrorMessage());
            }
            job = jobService.save(job);
            eBookManager.onTaskFinished(conversionData);
            simpMessagingTemplate.convertAndSend(websocketTopic, Message.newInstance(MessageCode.PROGRESS, job));
            return null;
        }
        return eBookToCourseTOC;
    }

    /**
     * Wrapper method for creating lessons and course and updating the client on the progress through websockets
     *
     * @param eBookToCourseTOC an intermediary representation of the TOC to create a course and lessons from
     * @param eBook            a converted EBook, saved to DB
     * @return the created Course. References to the lessons can be found inside the TOC of the course
     */
    private Course createCourseAndLessons(EBookConversionData conversionData,
                                          EBookToCourseTOC eBookToCourseTOC, EBook eBook) {
        String jobId = conversionData.getJobId();
        jobService.updateComponentProgress(jobId, EbookJobComponent.CREATING_COURSE.getTitle(), 0, Status.IN_PROGRESS);
        String courseId = UUID.randomUUID().toString();

        logger.debug("Creating lessons and TOC for course");
        CourseTocAndLessons courseTocAndLessons = CourseTocAndLessons.newInstance(courseId, conversionData.getPublisherId(), eBook, eBookToCourseTOC);
        jobService.updateComponentProgress(jobId, EbookJobComponent.CREATING_COURSE.getTitle(), 33, Status.IN_PROGRESS);

        logger.debug("Saving lessons to DB");
        lessonRepository.save(courseTocAndLessons.getLessons());
        Job job = jobService.updateComponentProgress(jobId, EbookJobComponent.CREATING_COURSE.getTitle(), 66, Status.IN_PROGRESS);

        logger.debug("Creating course with TOC and saving to DB");
        Course course = courseDataService.createNewCourseFromEBookTOC(courseId, eBook, conversionData, courseTocAndLessons.getCourseTocItem());
        job.getProperties().setCourseId(courseId);
        job.updateComponentProgress(EbookJobComponent.CREATING_COURSE, 100);
        job.setStatus(Status.COMPLETED);
        jobService.save(job);
        return course;
    }

    /**
     * Validates that the TOC summary sent for sanity check to the client matches the actual TOC structure
     *
     * @param websocketTopic the websocket topic to send the updates to
     */
    private boolean isStructureValid(EBookConversionData conversionData,
                                     EBookManager eBookManager,
                                     EBookToCourseTOC eBookToCourseTOC, TOCSummaryDTO tocSummaryDTO,
                                     String websocketTopic) {
        String structureError = null;
        String jobId = conversionData.getJobId();
        if (tocSummaryDTO.getTocItemsCount() != eBookToCourseTOC.getTocItems().size()) {
            structureError = "Expected TOC items number did not match!";
            jobService.addError(jobId, EBookErrorCode.FAILED_TO_CONVERT_EBOOK_FILE.toString(), structureError, Status.FAILED);
        } else if (tocSummaryDTO.getLessonsCount() != eBookToCourseTOC.getRefsCount()) {
            structureError = "Expected toc item refs number did not match!";
            jobService.addError(jobId, EBookErrorCode.FAILED_TO_CONVERT_EBOOK_FILE.toString(), structureError, Status.FAILED);
        } else if (tocSummaryDTO.getPagesCount() != eBookToCourseTOC.getPagesCount()) {
            structureError = "Expected pages number did not match!";
            jobService.addError(jobId, EBookErrorCode.FAILED_TO_CONVERT_EBOOK_FILE.toString(), structureError, Status.FAILED);
        }
        if (structureError != null) {
            Job job = jobService.getJob(jobId);
            logger.error(String.format("Book conversion failed for job %s! %s", jobId, structureError));
            eBookManager.onTaskFinished(conversionData);
            simpMessagingTemplate.convertAndSend(websocketTopic, Message.newInstance(MessageCode.PROGRESS, job));
            return false;
        }
        return true;
    }

    private File getEBookTempDir(UploadEBookData uploadEBookData) {
        File eBookDir = new File(uploadEBookData.getEBookDir());
        return new File(eBookDir, configuration.getProperty(EBookService.E_BOOKS_TEMP_SUBFOLDER));
    }

    private EBook getEBookBySha1PublisherAndConversionLibraryTypeAndVersion(String sha1, int publisherId, EBookConversionServiceTypes conversionVendor, String conversionLibraryVersion) {
        return this.eBooksDao.getEBookBySha1ConversionLibraryVersionAndPublisherId(sha1, publisherId, conversionVendor, conversionLibraryVersion);
    }

    /**
     * Method to hash a file's bytes using SHA-1 in the form of hexadecimal string.
     *
     * @param jobId     ID of the job to log error to in case an exception is encountered
     * @param eBookFile ebook file to generate hash for
     * @return SHA-1 digest as a hexadecimal string
     */
    private String calculateSha1Hash(String jobId, File eBookFile) {
        try (InputStream inputStream = new FileInputStream(eBookFile)) {
//            return FilesUtils.fastSha1Hash(eBookFile.getAbsolutePath(), 1024 * 1024 * 25); // 25 MB Block; - DO NOT FAST HASH as it can cause collision
            return DigestUtils.sha1Hex(inputStream);
        } catch (IOException e) {
            String errorMsg = String.format("I/O exception while trying to generate SHA-1 checksum for EBook file %s", eBookFile.getName());
            logger.error(errorMsg, e);
            addErrorToJob(errorMsg, jobId);
            return null;
        }
    }

    /**
     * Get EBook file type
     *
     * @param eBookFile the eBook file which we want to get its type, such as: EPUB, PDF, etc.
     * @return the EBook file type
     */
    private EBookFormat getEBookFormat(File eBookFile) {
        String fileExtension = FilenameUtils.getExtension(eBookFile.getName());
        if (!StringUtils.isBlank(fileExtension)) {
            return EBookFormat.valueOf(fileExtension.toUpperCase());
        } else {
            throw new IllegalArgumentException("Unable to detect Ebook Format. The file has no extension (such as epub, pdf, etc.)");
        }
    }

    @Override
    public void saveEBook(EBook eBook) {
        logger.debug(String.format("saveEBook: About to save eBook %s to DB", eBook.getEBookId()));
        eBooksDao.save(eBook);
        logger.debug(String.format("saveEBook: saving eBook %s to DB completed successfully", eBook.getEBookId()));
    }

    @Override
    public void cancelProcess(EBookManagerData uploadEBookData) {
        logger.debug(String.format("cancelProcess: jobId: %s", uploadEBookData.getJobId()));
        uploadEBookData.setCancelled();
    }

    public void addErrorToJob(String massage, String jobId) {
        jobService.addError(jobId, EBookErrorCode.FAILED_TO_UPLOAD_EBOOK_FILE.toString(), massage, Status.FAILED);
    }

    @Override
    public List<BasicEBookDTO> getAllPublisherBasicEBooksInfo(int publisherId) throws DsException {
        logger.debug(String.format("getAllPublisherBasicEBooksInfo. About to get basic information of all the eBooks of publisher %d", publisherId));
        List<BasicEBookDTO> eBooksBasicInfo = new ArrayList<>();
        try {
            List<EBook> eBooks = eBooksDao.getAllPublisherEBooks(publisherId);

            //convert eBooks list to BasicEBookInfo
            eBooksBasicInfo.addAll(eBooks.stream().map(BasicEBookDTO::new).collect(Collectors.toList()));

            return eBooksBasicInfo;
        } catch (DaoException e) {
            String errorMsg = String.format("Failed to get all EBooks of publisher %s from DB", publisherId);
            logger.error(errorMsg, e);
            throw new DsException(e);
        }
    }

    @Override
    public List<BasicEBookDTO> getPublisherBasicEBooksInfoByCourseAndAdditionalEBooksId(int publisherId, String courseId,
                                                                                        String additionalEBooksString) {
        //get all the ebooks used in course
        List<BasicEBookDTO> eBooksInCourseBasicInfo = getPublisherBasicEBooksInfoByCourse(publisherId, courseId);
        List<BasicEBookDTO> additionalEBooksInCourseBasicInfo = new ArrayList<>();

        //get the additional ebooks
        if (additionalEBooksString != null && !additionalEBooksString.trim().isEmpty()) {
            List<EBook> additionalEBooksList = eBooksDao.getEBooksByIds(new ArrayList<>(Arrays.asList(additionalEBooksString.trim().split(","))));
            for (EBook EBook : additionalEBooksList) {
                BasicEBookDTO additionalEBook = new BasicEBookDTO(EBook);
                //add the additional ebook to a different list, to avoid multiple checking if the book is in the original list
                if (!eBooksInCourseBasicInfo.contains(additionalEBook)) {
                    additionalEBooksInCourseBasicInfo.add(additionalEBook);
                }
            }
            eBooksInCourseBasicInfo.addAll(additionalEBooksInCourseBasicInfo);
        }
        return eBooksInCourseBasicInfo;
    }

    private List<BasicEBookDTO> getPublisherBasicEBooksInfoByCourse(int publisherId, String courseId) {
        logger.debug(String.format("getPublisherBasicEBooksInfoByCourse. About to get basic information of all the eBooks of course %s of publisher %d", courseId, publisherId));
        List<BasicEBookDTO> eBooksBasicInfo = new ArrayList<>();
        List<EBook> eBooks = getPublisherEBooksByCourse(publisherId, courseId);
        // convert eBooks list to BasicEBookInfo list
        for (EBook eBook : eBooks) {
            eBooksBasicInfo.add(new BasicEBookDTO(eBook));
        }
        return eBooksBasicInfo;
    }

    @Override
    public List<EBook> getPublisherEBooksByCourse(int publisherId, String courseId) {
        logger.debug(String.format("getPublisherEBooksByCourse. About to get all the eBooks of course %s of publisher %d", courseId, publisherId));
        Set<String> eBooksIds = courseDataService.getCourse(publisherId, courseId).getContentData().getEBooksIds();
        if (eBooksIds == null) {
            return new ArrayList<>(0);
        } else {
            return eBooksDao.getEBooksByIds(new ArrayList<>(eBooksIds)).stream()
                    .map(eBook -> validateAndUpdateEBook(publisherId, eBook))
                    .collect(Collectors.toList());
        }
    }

    @Override
    public HashMap<String, EBook> getPublisherEBooksAndIdsByCourse(int publisherId, String courseId) throws DsException {
        logger.debug(String.format("getPublisherEBooksAndIdsByCourse. About to get all the eBooks of course %s of publisher %d", courseId, publisherId));
        HashMap<String, EBook> eBooksUsedInCourseHashMap = new HashMap<>();
        List<EBook> eBooksUsedInCourse = getPublisherEBooksByCourse(publisherId, courseId);
        if (eBooksUsedInCourse == null || eBooksUsedInCourse.size() == 0) {
            logger.debug("Course " + courseId + ", for publisher: " + publisherId + " contains no eBooks.");
            return eBooksUsedInCourseHashMap;
        }
        for (EBook currentBook : eBooksUsedInCourse) {
            String eBookId = currentBook.getEBookId();
            eBooksUsedInCourseHashMap.put(eBookId, currentBook);
        }
        return eBooksUsedInCourseHashMap;
    }

    @Override
    public DBRef getDBRefByEBook(EBook eBook) throws DsException {
        try {
            return eBooksDao.getDBRefByEBook(eBook);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public String getBlankPageTemplate() throws IOException {
        return filesUtils.readResourcesAsString(this.getClass(), BLANK_PAGE_TEMPLATE_HTML);
    }

    @Override
    public String getPageTextByPageId(EBook eBook, String pageId) {
        List<Page> eBookPages = eBook.getStructure().getPages();
        if (eBookPages == null) {
            logger.debug("Ebook " + eBook.getEBookId() + " contains no pages");
            return "";
        }
        Page relevantPage = (Page) CollectionUtils.find(eBookPages, page -> ((Page) page).getId().equals(pageId));
        if (relevantPage == null) { // if there's a bug and the page is not there - return an empty string text
            String msg = "Could not find page with id " + pageId + " in ebook: " + eBook.getStructure().getTitle() + ", although it should be there.";
            logger.error(msg);
            return "";
        }
        return relevantPage.getText();
    }

    @Override
    public EBookStructure extractTextFromPages(EBookStructure eBookStructure, int publisherId) {
        File input;
        String currentPageText;
        String currentAbsoluteHref;
        List<Page> eBookPages = eBookStructure.getPages();
        String prefixPath = cmsService.getCmsLocation() + "/publishers/" + publisherId + "/";
        for (Page currentPage : eBookPages) {
            currentAbsoluteHref = prefixPath + currentPage.getHref();
            input = new File(currentAbsoluteHref);
            try {
                currentPageText = htmlParsingService.extractText(input);
                currentPage.setText(currentPageText);
            } catch (DsException e) {
                currentPage.setText("");
                logger.error(String.format("extractTextFromPages. Failed to extract text for page: %s", currentAbsoluteHref), e);
            }
        }
        return eBookStructure;
    }


    /**
     * Iterates the eBook pages and checks is it Jouve studio eBook.
     *
     * @param eBookStructure - EBookStructure which contains path to the page content (may be html or xhtml file)
     * @param publisherId    - publisherId (different publishers have their own eBook copy )
     * @return Boolean is it a Jouve Studio eBook
     */
    public boolean checkIsJouveStudioEbook(EBookStructure eBookStructure, int publisherId) {
        List<Page> eBookPages = eBookStructure.getPages();
        String prefixPath = cmsService.getCmsLocation() + "/publishers/" + publisherId + "/";
        for (Page currentPage : eBookPages) {
            String currentAbsoluteHref = prefixPath + currentPage.getHref();
            File input = new File(currentAbsoluteHref);
            try {
                boolean isItJouvePage = htmlParsingService.checkIsJouveStudioPage(input);
                if (isItJouvePage) {
                    //  if one of its pages was identified as Jouve page, it's a Jouve Studio eBook
                    return true;
                }
            } catch (DsException e) {
                logger.error(String.format("Error in checkIsJouveStudioEbook while checking is it Jouve Studio page, in page: %s", currentAbsoluteHref), e);
                return false;
            }
        }
        return false;
    }


    /**
     * Responsible for assigning the Jouve enrichment to their primary pages in the eBook.
     * The Jouve enrichment is defined by the file toc.xhtml which is located in the eBook.
     * When we got the Jouve enrichment List, we need to iterate its primary pages and detect
     * is the current Jouve enrichment is located in this page and add it to the page structure.
     *
     * @param eBookStructure - EBookStructure which contains path to the page content (may be html or xhtml file)
     * @param publisherId    - publisherId (different publishers have their own eBook copy )
     * @param eBookDir       - the eBook path which will be the prefix for the toc.xhtml
     */
    public void addJouveEnrichmentListToEookStructure(EBookStructure eBookStructure, int publisherId, String eBookDir) {
        String tocAbsoluteHrefUpperCase = eBookDir + TOC_HTML_PATH_UPPER_CASE;
        File tocInput = new File(tocAbsoluteHrefUpperCase);

        // check does this eBook contain TOC.xhtml, otherwise look for toc.xhtml (some eBook have toc.xhtml file while other have TOC.xhtml)
        if (!tocInput.exists()) {
            String tocAbsoluteHrefLowerCase = eBookDir + TOC_HTML_PATH_LOWER_CASE;
            tocInput = new File(tocAbsoluteHrefLowerCase);
        }

        try {
            // get the Jouve enrichment list from toc.xhtml
            ArrayList<JouveEnrichment> jouveEnrichmentList = htmlParsingService.createJouveEnrichmentList(tocInput);

            // assign Jouve enrichment to their primary pages with relative path from the primary page (needed for the lesson player, so it won't need to know the eBook structure)
            List<Page> eBookPages = eBookStructure.getPages();
            String prefixPath = cmsService.getPublisherPath(publisherId) + "/";
            // iterate the primary pages of the eBook
            for (Page currentPage : eBookPages) {
                String currentAbsoluteHref = prefixPath + currentPage.getHref();
                File pageInput = new File(currentAbsoluteHref);
                Document doc = Jsoup.parse(pageInput, "UTF-8");
                // get all the 'a href' tags from the html page
                Elements enrichmentElementsInPage = doc.select("a[href]");
                Map<String, String> pathsToReplace = new HashMap<>(jouveEnrichmentList.size());
                // iterate the entire Jouve enrichment list for each primary page (one Jouve enrichment can be assigned to multiple pages)
                for (JouveEnrichment currentJouveEnrichment : jouveEnrichmentList) {
                    // iterate all the 'a href' tags of the current primary page
                    for (Element enrichmentElementFromPage : enrichmentElementsInPage) {
                        String relativePathFromPage = enrichmentElementFromPage.attr("href");
                        // check if the current 'a href' tag contains the current Jouve enrichment
                        // we are using 'contains' because the currentJouveEnrichment is relative to toc.xhtml while relativePathFromPage is relative to the primary page and may have prefix of "/../../media")
                        if (relativePathFromPage.contains(currentJouveEnrichment.getPath())) {
                            // create JouveEnrichment with relative path from its primary page (needed for the lesson player, so it won't need to know the eBook structure)
                            JouveEnrichment.Builder enrichmentBuilder = new JouveEnrichment.Builder()
                                    .title(currentJouveEnrichment.getTitle());
                            // add the JouveEnrichment to its primary page
                            JouveEnrichment enrichmentInCurrentPageContext;
                            // migration from AUDIO_FILE to AUDIO_URL
                            if (currentJouveEnrichment.getType().equals(OverlayElementsTypes.AUDIO_FILE.toString())) {
                                File enrichmentFile = getEnrichmentFile(eBookDir, currentPage.getHref(), relativePathFromPage);
                                String mediaFilePath = getEnrichmentMediaFilePath(enrichmentFile, OverlayElementsTypes.AUDIO_FILE);
                                if (mediaFilePath == null) {
                                    continue;
                                }
                                String[] splitPath = relativePathFromPage.split("/");
                                String enrichmentFileName = splitPath.length > 0
                                        ? splitPath[splitPath.length - 1]
                                        : "";
                                String relativeMediaFilePathFromPage = relativePathFromPage.replaceAll(enrichmentFileName, "") + mediaFilePath;

                                enrichmentInCurrentPageContext = enrichmentBuilder
                                        .type(OverlayElementsTypes.AUDIO_URL.toString())
                                        .path(relativeMediaFilePathFromPage)
                                        .build();

                                pathsToReplace.put(relativePathFromPage, relativeMediaFilePathFromPage);
                            } else {
                                enrichmentInCurrentPageContext = enrichmentBuilder
                                        .type(currentJouveEnrichment.getType())
                                        .path(relativePathFromPage)
                                        .build();
                            }
                            currentPage.addToJouveEnrichmentList(enrichmentInCurrentPageContext);
                        }
                    }
                }
                // migration from AUDIO_FILE to AUDIO_URL. html file will be altered
                if (pathsToReplace.size() > 0) {
                    try {
                        FilesUtils.replaceStringsInFile(pageInput, pathsToReplace);
                    } catch (IOException e) {
                        logger.error("Error replacing enrichment file(s) path(s) with media file path in page file '" + pageInput.getPath()
                                + "'. Replacements map: " + pathsToReplace);
                    }
                }
            }

        } catch (Exception e) {
            String errorMsg = String.format("Error in addJouveEnrichmentListToEookStructure while adding Jouve Enrichment List, file: %s", tocInput.getAbsolutePath());
            logger.error(errorMsg, e);
        }
    }

    /**
     * @param enrichmentFile the enrichment file, using a media
     * @param mediaType      type of the media to extract the path for
     * @return the path to the enrichment media file, used in the given enrichment file, relative to the {@code enrichmentFile}
     * @throws IllegalArgumentException if the media type is not supported
     */
    private String getEnrichmentMediaFilePath(File enrichmentFile, OverlayElementsTypes mediaType) {
        if (mediaType != OverlayElementsTypes.AUDIO_FILE) {
            throw new IllegalArgumentException("Only audio files are currently supported");
        }
        Document enrichmentDocument = null;
        try {
            enrichmentDocument = Jsoup.parse(enrichmentFile, "UTF-8");
        } catch (IOException e) {
            logger.error("Error parsing enrichment file " + enrichmentFile, e);
        }
        return enrichmentDocument == null
                ? null
                : enrichmentDocument.select("body audio source").attr("src");
    }


    /**
     * Function which iterates the eBook pages for fixing the resize problem and the Jouve studio problem.
     * This function uses HtmlParsingService for adding CSS rules which affect each the eBook pages.
     * In the end, the function returns Boolean is it a Jouve eBook for updating the eBook model in the DB
     *
     * @param eBookStructure                      - EBookStructure which contains path to the page content (may be html or xhtml file)
     * @param publisherId                         - publisherId (different publishers have their own eBook copy )
     * @param epubPageRequireCssChange            - flag of the resize problem, comes from the t2k.properties
     * @param jouveStudioEpubPageRequireCssChange - flag of the Jouve studio problem, comes from the t2k.properties
     * @param epubPageCssRules                    - css rules for fixing the resize problem
     * @param jouveStudioEpubPageCssRules         - css rules for fixing the Jouve studio problem
     */
    public void changePageVisualization(EBookStructure eBookStructure, int publisherId, boolean isJouveEbook, boolean epubPageRequireCssChange, boolean jouveStudioEpubPageRequireCssChange, String epubPageCssRules, String jouveStudioEpubPageCssRules) {
        List<Page> eBookPages = eBookStructure.getPages();
        String prefixPath = cmsService.getCmsLocation() + "/publishers/" + publisherId + "/";
        boolean isItJouveEbook = false;
        for (Page currentPage : eBookPages) {
            String currentAbsoluteHref = prefixPath + currentPage.getHref();
            File input = new File(currentAbsoluteHref);
            try {
                if (epubPageRequireCssChange) {
                    // add default CSS rules for fixing the resize problem
                    htmlParsingService.changePageVisualization(input, epubPageCssRules);
                }
                if (jouveStudioEpubPageRequireCssChange && isJouveEbook) {
                    // add CSS rules for fixing 'JOUVE STUDIO' eBooks that can't be highlight, in the end returns flag was it a Jouve page
                    htmlParsingService.fixJouveStudioEbooks(input, jouveStudioEpubPageCssRules);
                }
            } catch (DsException e) {
                logger.error(String.format("changePageVisualization. Failed to add CSS attributes for page: %s", currentAbsoluteHref), e);
            }
        }
    }


    @Override
    public EBook createEbookFromFile(File eBookFile, int publisherId) throws IOException {
        String eBookJson = FileUtils.readFileToString(eBookFile, "UTF-8");
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        EBook eBook = objectMapper.readValue(eBookJson, EBook.class);
        eBook.setPublisherId(publisherId);
        return eBook;
    }

    @Override
    public EbookForClient getEbookForClientResponseByEBookId(String eBookId, int publisherId) throws DsException {
        EBook eBook = getByPublisherAndEBookId(eBookId, publisherId);
        return eBook == null ? null : new EbookForClient(eBook);
    }

    @Override
    public EBook getByPublisherAndEBookId(String eBookId, int publisherId) {
        EBook eBook = eBooksDao.getByPublisherAndEBookId(eBookId, publisherId);
        eBook = validateAndUpdateEBook(publisherId, eBook);
        return eBook;
    }

    /**
     * Updates references between newer and older versions of the same eBook
     */
    private void updateEBooksReferences(int publisherId, EBook newEBook, EBook oldEBook) {
        logger.info(String.format("Updating references between existing eBook %s and new eBook version %s", oldEBook, newEBook));
        if (newEBook.getUpdatedEBookId() != null && newEBook.getUpdatedEBookId().equals(oldEBook.getEBookId())) {
            throw new IllegalArgumentException(
                    String.format("Update can cause circular reference between eBooks! Trying to set eBook '%s' as updated version for '%s",
                            newEBook, oldEBook));
        }
        List<Date> creationDates = Arrays.asList(oldEBook.getCreationDate(), oldEBook.getFirstVersionCreationDate(),
                newEBook.getCreationDate(), newEBook.getFirstVersionCreationDate());
        Optional<Date> firstCreationDate = creationDates.stream().filter(date -> date != null).min(Date::compareTo);
        firstCreationDate.ifPresent(newEBook::setFirstVersionCreationDate);
        oldEBook.setUpdatedEBookId(newEBook.getEBookId());
        eBookRepository.save(Arrays.asList(newEBook, oldEBook));
        // recursively update older ebooks references
        List<EBook> olderEBooks = eBookRepository.findByUpdatedEBookIdAndPublisherId(oldEBook.getEBookId(), publisherId);
        olderEBooks.forEach(ebook -> updateEBooksReferences(publisherId, newEBook, ebook));
    }

    private Optional<Error> acquireEBookLock(EBook eBook, LockUser lockUser) {
        try {
            lockService.acquireLock(eBook, lockUser);
        } catch (DsException e) {
            String error = String.format("Unable to acquire lock on eBook %s using lockUser %s", eBook, lockUser);
            logger.error(error);
            return Optional.of(Error.newInstance(EBookErrorCode.FAILED_TO_LOCK_EBOOKS, error));
        }
        return Optional.empty();
    }

    private Optional<Error> releaseEBookLock(EBook eBook, LockUser lockUser) {
        try {
            lockService.releaseLock(eBook, lockUser);
        } catch (DsException e) {
            String error = String.format("Unable to release lock from eBook %s using lockUser %s", eBook, lockUser);
            logger.error(error);
            return Optional.of(Error.newInstance(EBookErrorCode.FAILED_TO_RELEASE_EBOOK_LOCK, error));
        }
        return Optional.empty();
    }

    private boolean lockEBooksForUpdate(UpdateEBookData updateEBookData, EBookManager eBookManager, LockUser lockUser,
                                        EBook newEBook, EBook oldEBook, String websocketTopic) {
        String jobId = updateEBookData.getJobId();
        Optional<Error> newEBookLockError = acquireEBookLock(newEBook, lockUser);
        Optional<Error> oldEBookLockError = acquireEBookLock(oldEBook, lockUser);
        if (newEBookLockError.isPresent() || oldEBookLockError.isPresent()) {
            Error error = newEBookLockError.isPresent() ? newEBookLockError.get() : oldEBookLockError.get();
            Job job = jobService.onJobFailure(jobId, error.getErrorCode(), error.getErrorMessage(), null);
            simpMessagingTemplate.convertAndSend(websocketTopic, Message.newInstance(MessageCode.PROGRESS, job));
            eBookManager.removeJob(jobId);
            if (newEBookLockError.isPresent()) {
                releaseEBookLock(oldEBook, lockUser);
            } else {
                releaseEBookLock(newEBook, lockUser);
            }
            return false;
        }
        return true;
    }

    private void releaseEBooksLocks(UpdateEBookData updateEBookData, EBook newEBook, EBook oldEBook, LockUser lockUser) {
        releaseEBookLock(newEBook, lockUser);
        releaseEBookLock(oldEBook, lockUser);
    }

    private void setProgress(String jobId, EbookJobComponent jobStatus, int progress) {
        jobService.updateJobProgress(jobId, jobStatus.getTitle(), progress, Status.IN_PROGRESS);
    }

    public void deleteTempDir(File eBookTempDir) {
        try {
            FileUtils.deleteDirectory(eBookTempDir);
        } catch (IOException e) {
            logger.warn("Failed to delete the temp folder from disk.", e);
        }
    }

    public File saveFileItemStreamToDisk(FileItemStream fileItemStream, int publisherId, String jobId, String eBookId) {
        BufferedInputStream bufIn;
        try {
            bufIn = createBufferedInput(fileItemStream);
        } catch (IOException e) {
            logger.error("Exception opening inputstream for file " + fileItemStream.getName(), e);
            return null;
        }
        String eBookOriginalFileName = fileItemStream.getName();

        String contentLength = null;
        if (fileItemStream.getHeaders() != null) {
            contentLength = fileItemStream.getHeaders().getHeader(FileUploadBase.CONTENT_LENGTH);
        }
        // Show upload progress according to File Size.  If not size available, don't crash the app, but rather continue progress according to 10mb file size
        Long fileSize = getFileSize(contentLength, eBookOriginalFileName);

        return saveFileStreamToDisk(bufIn, fileSize, eBookOriginalFileName, publisherId, jobId, eBookId);
    }

    public File saveMultipartFileToDisk(MultipartFile multipartFile, int publisherId, String jobId, String eBookId) {
        try {
            return saveFileStreamToDisk(new BufferedInputStream(multipartFile.getInputStream()),
                    multipartFile.getSize(), multipartFile.getOriginalFilename(), publisherId, jobId, eBookId);
        } catch (IOException e) {
            logger.error("IO exception when saving book file to disk", e);
        }
        return null;
    }

    /**
     * ---[  Save File to Disk  ]---
     *
     * @param bufferedInputStream
     * @param fileSize            Show upload progress according to File Size.  If not size available, don't crash the
     *                            app, but rather continue progress according to 10mb file size
     * @param originalFileName
     * @param publisherId
     * @param jobId
     * @param eBookId
     * @return
     */
    private File saveFileStreamToDisk(BufferedInputStream bufferedInputStream, long fileSize, String originalFileName,
                                      int publisherId, String jobId, String eBookId) {
        String eBookTempFolderName = String.format("%s/%s",
                eBookCleanupService.getEBookFolderById(publisherId, eBookId), configuration.getProperty(EBookService.E_BOOKS_TEMP_SUBFOLDER));
        File eBookFile = new File(eBookTempFolderName, originalFileName);

        Integer uploadBufferSize = Integer.parseInt(configuration.getProperty("eBookUploadBuffer", "4096"));
        byte[] bytes = new byte[uploadBufferSize];

        BufferedOutputStream bufOut = null;
        try {
            createEBookDirectory(eBookFile);
            bufOut = createBufferedOutput(eBookFile);
            copyBytes(bytes, bufOut, bufferedInputStream, fileSize, jobId, originalFileName);
            return eBookFile;
        } catch (Exception e) {
            String errorMsg = String.format("Failed to Save the EBook file: %s to the file system.", eBookFile.getName());
            logger.error(errorMsg, e);
            addErrorToJob(errorMsg, jobId);
        } finally {
            cleanupUpload(bufOut, bufferedInputStream);
        }
        return null;
    }

    private void createEBookDirectory(File eBookFile) throws IOException {
        if (!eBookFile.exists()) {
            Path parent = eBookFile.toPath().getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }

            logger.debug(String.format("Creating EBook File: %s", eBookFile.getAbsolutePath()));
        } else {
            logger.error(String.format("EBOOK FOLDER BY ID ALREADY EXISTS!  EBookFile: %s", eBookFile.getAbsolutePath()));
        }
    }

    private BufferedOutputStream createBufferedOutput(File eBookFile) throws FileNotFoundException {
        FileOutputStream fos = new FileOutputStream(eBookFile);
        return new BufferedOutputStream(fos);
    }

    private BufferedInputStream createBufferedInput(FileItemStream fileItemStream) throws IOException {
        InputStream inputStream = fileItemStream.openStream();
        return new BufferedInputStream(inputStream);
    }

    private void copyBytes(byte[] bytes, BufferedOutputStream bufOut, BufferedInputStream bufIn, Long size,
                           String jobId, String eBookOriginalFileName) throws IOException, DsException {
        long startTime = System.currentTimeMillis();
        logger.debug(String.format("---[ FILE WRITE START - File [%s]", eBookOriginalFileName));
        setSaveFileProgress(jobId, 0);

        EBookSaveProgress restProgress = new EBookSaveProgress(size.intValue(), 7);

        int bytesRead;
        while ((bytesRead = bufIn.read(bytes)) > -1) {
            restProgress.increment();
            if (restProgress.hasProgress()) {
                setSaveFileProgress(jobId, restProgress.getPercentage());
            }

            // Write to the buffer those exact bytes we just read
            bufOut.write(bytes, 0, bytesRead);
        }

        bufOut.flush();
        bufOut.close();

        long endTime = System.currentTimeMillis();
        long totalMillis = endTime - startTime;
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat();
        String timeDisplay = simpleDateFormat.format(new Date(totalMillis));
        logger.debug("---[ FILE WRITE END - File [" + eBookOriginalFileName + "].  TOTAL Stream upload in millis: " + (endTime - startTime) + " Display: " + timeDisplay);
        setSaveFileProgress(jobId, 100);

    }

    private void setSaveFileProgress(String jobId, int progress) throws DsException {
        jobService.updateJobProgress(jobId, "savingFileToDisk", progress, Job.Status.IN_PROGRESS);
    }

    private void cleanupUpload(OutputStream bos, InputStream bis) {
        if (bos != null) {
            try {
                bos.flush();
                bos.close();
            } catch (Exception ex) {
                // If resources left open, then Clearing the Garbage collector will clear them. once is enough for unix.
                logger.error("Unable to close the Output Stream for writing the uploaded ebook file. invoking the GC to discard it.");
                System.gc();
            }
        }

        if (bis != null) {
            try {
                bis.close();
            } catch (IOException e) {
                logger.error("Unable to close the Input Stream of the uploaded ebook. invoking the GC to discard it.");
                System.gc();
            }
        }
    }

    private Long getFileSize(String contentLength, String eBookOriginalFileName) {
        Long fileSize = 1024L * 1024 * 10;  // Default

        if (contentLength != null && !contentLength.isEmpty()) {
            try {
                fileSize = Long.parseLong(contentLength);
            } catch (NumberFormatException ex) {
                logger.error("Unable to calculate File Size for File: " + eBookOriginalFileName + ", Using default (10mb) for upload progress.");
            }
        }
        return fileSize;
    }

    private EBook validateAndUpdateEBook(int publisherId, EBook eBook) {
        if (eBook == null) return null;

        Integer cgsVersionMajor = null;
        Integer cgsVersionMinor = null;
        Integer cgsVersionMilestone = null;
        if (eBook.getCgsVersion() != null) {
            String[] cgsVersion = eBook.getCgsVersion().split("\\.");
            cgsVersionMajor = Integer.parseInt(cgsVersion[0]);
            cgsVersionMinor = Integer.parseInt(cgsVersion[1]);
            cgsVersionMilestone = Integer.parseInt(cgsVersion[2]);
        }
        boolean eBookUpdated = false;
        if ((cgsVersionMajor == null || (cgsVersionMajor < 8 || (cgsVersionMajor == 8 && cgsVersionMinor < 11)))
                && eBook.getConversionLibrary() == EBookConversionServiceTypes.EPUB) {
            eBookUpdated = updateJouveEnrichments(publisherId, eBook);
        }
        if (eBookUpdated) {
            logger.info("Ebook was updated, saving to DB. EBookId: " + eBook.getEBookId());
            eBook.setCgsVersion(versionService.getFullVersion());
            saveEBook(eBook);
        }
        return eBook;
    }

    private boolean updateJouveEnrichments(int publisherId, EBook eBook) {
        logger.info("Verifying if enrichments paths need to be updated on eBook " + eBook.getEBookId());
        String eBookPath = eBookCleanupService.getEBookFolderById(publisherId, eBook.getEBookId());
        boolean eBookUpdated = false;
        for (Page page : eBook.getStructure().getPages()) {
            List<JouveEnrichment> enrichments = page.getJouveEnrichmentList();
            if (enrichments == null) {
                continue;
            }
            Iterator<JouveEnrichment> enrichmentIterator = enrichments.iterator();
            List<JouveEnrichment> enrichmentsToAdd = new ArrayList<>(enrichments.size());
            Map<String, String> pathsToReplace = new HashMap<>(enrichments.size());
            while (enrichmentIterator.hasNext()) {
                JouveEnrichment jouveEnrichment = enrichmentIterator.next();
                if (!jouveEnrichment.getType().equals(OverlayElementsTypes.AUDIO_FILE.toString())) {
                    continue;
                }
                File enrichmentFile = getEnrichmentFile(eBookPath, page.getHref(), jouveEnrichment.getPath());
                String enrichmentMediaFilePath = getEnrichmentMediaFilePath(enrichmentFile, OverlayElementsTypes.AUDIO_FILE);
                String[] splitPath = jouveEnrichment.getPath().split("/");
                String enrichmentFileName = splitPath.length > 0
                        ? splitPath[splitPath.length - 1]
                        : "";
                String relativeMediaFilePath = jouveEnrichment.getPath().replaceAll(enrichmentFileName, "") + enrichmentMediaFilePath;

                JouveEnrichment newJouveEnrichment = new JouveEnrichment.Builder()
                        .title(jouveEnrichment.getTitle())
                        .type(OverlayElementsTypes.AUDIO_URL.toString())
                        .path(relativeMediaFilePath)
                        .build();

                pathsToReplace.put(jouveEnrichment.getPath(), relativeMediaFilePath);
                enrichmentIterator.remove();
                enrichmentsToAdd.add(newJouveEnrichment);
                eBookUpdated = true;
            }
            StringBuilder pageFilePathBuilder = new StringBuilder(eBookPath).append("/");
            String[] pageHrefSplit = page.getHref().split("/");
            for (int i = 0; i < pageHrefSplit.length; i++) {
                if (i > 1) {
                    pageFilePathBuilder
                            .append(pageHrefSplit[i])
                            .append("/");
                }
            }
            if (pathsToReplace.size() > 0) {
                File pageFile = new File(pageFilePathBuilder.toString());
                try {
                    FilesUtils.replaceStringsInFile(pageFile, pathsToReplace);
                } catch (IOException e) {
                    logger.error("Error replacing enrichment file(s) path(s) with media file path in page file '" + pageFile.getPath()
                            + "'. Replacements map: " + pathsToReplace);
                }
            }
            enrichments.addAll(enrichmentsToAdd);
        }
        if (eBookUpdated) {
            logger.info("Updated enrichments paths for eBook " + eBook.getEBookId());
        }
        return eBookUpdated;
    }

    private File getEnrichmentFile(String eBookPath, String pageHref, String enrichmentPath) {
        StringBuilder enrichmentFilePathBuilder = new StringBuilder(eBookPath).append("/");
        String[] pageHrefSplit = pageHref.split("/");
        for (int i = 0; i < pageHrefSplit.length; i++) {
            if (i > 1 && i < (pageHrefSplit.length - 1))
                enrichmentFilePathBuilder
                        .append(pageHrefSplit[i])
                        .append("/");
        }
        return new File(enrichmentFilePathBuilder.toString() + enrichmentPath);
    }
}