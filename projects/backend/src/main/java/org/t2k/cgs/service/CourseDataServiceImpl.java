package org.t2k.cgs.service;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.DBRef;
import com.mongodb.util.JSON;
import com.t2k.common.utils.VersionUtils;
import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.time.StopWatch;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.FacetedPage;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.AppletService;
import org.t2k.cgs.domain.usecases.CmsService;
import org.t2k.cgs.domain.usecases.course.CourseContentEditor;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.persistence.springrepository.CourseRepository;
import org.t2k.cgs.domain.usecases.course.search.CourseES;
import org.t2k.cgs.domain.usecases.course.search.CourseSearchService;
import org.t2k.cgs.domain.usecases.course.utils.RemoveLocale;
import org.t2k.cgs.domain.model.course.PublisherCustomIconsPack;
import org.t2k.cgs.domain.model.applet.AppletDao;
import org.t2k.cgs.domain.model.cleanup.CleanupsDao;
import org.t2k.cgs.domain.model.course.CoursesDao;
import org.t2k.cgs.domain.usecases.packaging.TinyKeysDao;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.domain.model.exceptions.ConflictException;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.ErrorCodes;
import org.t2k.cgs.domain.model.exceptions.TransactionException;
import org.t2k.cgs.domain.usecases.lock.LockService;
import org.t2k.cgs.domain.usecases.lock.TransactionService;
import org.t2k.cgs.domain.model.lock.LockUser;
import org.t2k.cgs.domain.model.lock.Transaction;
import org.t2k.cgs.domain.model.CGSResource;
import org.t2k.cgs.domain.model.ContentItem;
import org.t2k.cgs.domain.model.ContentItemBase;
import org.t2k.cgs.domain.model.Header;
import org.t2k.cgs.domain.model.applet.AppletManifest;
import org.t2k.cgs.domain.model.cleanup.CleanupJob;
import org.t2k.cgs.domain.model.cleanup.CleanupType;
import org.t2k.cgs.domain.model.course.*;
import org.t2k.cgs.domain.model.ebooks.EBook;
import org.t2k.cgs.domain.usecases.ebooks.EBookConversionData;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.domain.usecases.packaging.PublishTarget;
import org.t2k.cgs.domain.usecases.publisher.PublishError;
import org.t2k.cgs.domain.usecases.publisher.PublishErrors;
import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.model.utils.CGSValidationReport;
import org.t2k.cgs.domain.usecases.packaging.ContentValidator;
import org.t2k.cgs.domain.usecases.publisher.PublisherService;
import org.t2k.cgs.domain.model.user.CGSAccount;
import org.t2k.cgs.domain.model.user.CGSUserDetails;
import org.t2k.cgs.domain.usecases.packaging.TinyKey;
import org.t2k.cgs.domain.usecases.SequenceService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemDataService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemsManager;
import org.t2k.cgs.utils.FilesUtils;
import org.t2k.cgs.utils.ZipHelper;
import org.t2k.cgs.service.validation.ContentItemValidation;
import org.t2k.cgs.domain.usecases.VersionService;
import org.t2k.sample.dao.exceptions.DaoException;

import javax.annotation.PostConstruct;
import javax.validation.constraints.NotNull;
import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 21/10/12
 * Time: 14:27
 */
@Service("courseDataService")
public class CourseDataServiceImpl implements CourseDataService {

    private static final String INITIAL_COURSE_VERSION = "1.0.0";
    private static final String CUSTOMIZATION_PACK_DIR_NAME = "customizationPack";

    private static Logger logger = Logger.getLogger(CourseDataService.class);

    private final Date dateForNewCourseSaveUponCreation = new Date(0);

    @Autowired
    private CoursesDao coursesDao;

    @Autowired
    private LockService lockService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private ContentValidator contentValidator;

    @Autowired
    private AppletService appletService;

    @Autowired
    private SequenceService sequenceService;

    @Autowired
    @Qualifier(value = "lessonsDataServiceBean")
    private TocItemDataService tocItemDataService;

    @Autowired
    private ContentItemValidation contentItemValidation;

    @Autowired
    private ApplicationContext appContext;

    @Autowired
    private AppletDao appletDao;

    @Autowired
    private PublisherService publisherService;

    @Autowired
    private CmsService cmsService;

    @Autowired
    private TocItemsManager tocItemsManager;

    @Autowired
    private CleanupsDao cleanupsDao;

    @Autowired
    private JobService jobService;

    @Autowired
    private Configuration configuration;

    @Autowired
    private VersionService versionService;

    @Autowired
    private TinyKeysDao tinyKeysDao;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseSearchService courseSearchService;

    private List<Resource> locales;

    public CourseDataServiceImpl() {
        locales = Arrays.asList(
                new ClassPathResource("locales/en_US.zip"),
                new ClassPathResource("locales/fr_FR.zip"),
                new ClassPathResource("locales/pt_BR.zip"),
                new ClassPathResource("locales/iw_IL.zip"),
                new ClassPathResource("locales/ar_IL.zip"),
                new ClassPathResource("locales/nl_NL.zip"),
                new ClassPathResource("locales/ja_JP.zip"),
                new ClassPathResource("locales/zn_CN.zip"),
                new ClassPathResource("locales/zn_HK.zip"),
                new ClassPathResource("locales/ko_KR.zip"));
    }

    @PostConstruct
    private void init() throws Exception {
        for (Resource locale : locales) {
            if (!locale.exists()) {
                throw new Exception(String.format("locale file %s does not exist.", locale.getFilename()));
            }
        }

        File customizationPackFolderBaseDir = new File(configuration.getProperty(CUSTOMIZATION_PACK_DIR_NAME + "FolderBaseDir"));
        if (customizationPackFolderBaseDir.exists()) {
            FileUtils.cleanDirectory(customizationPackFolderBaseDir);
        } else {
            customizationPackFolderBaseDir.mkdirs();
        }

        for (Resource locale : locales) {
            try {
                ZipHelper.decompressInputStream(locale.getInputStream(), customizationPackFolderBaseDir.getAbsolutePath() + "/" + FilenameUtils.getBaseName(locale.getFilename())); // decompressing the locales zip
            } catch (Exception e) {
                logger.error(String.format("Error decompressing locale %s", locale.getURL()), e);
                throw e;
            }
        }
    }

    @Override
    public Course getCourse(int publisherId, String courseId) {
        return coursesDao.getCourse(publisherId, courseId);
    }

    public Course getCourse(int publisherId, String courseId, boolean updateCustomIcons) {
        Course course = getCourse(publisherId, courseId);
        if (course == null) {
            return null;
        }
        if (updateCustomIcons) {
            Header existingHeader = course.getContentData().getHeader();
            course = updateCourseCustomIcons(course, publisherId, true);
            if (existingHeader.compareTo(course.getContentData().getHeader()) != 0) {
                course = courseRepository.save(course);
            }
        }
        return course;
    }

    /**
     * NOTE: This method removes existing custom icons files on disk when it does the update, therefore, the course
     * should be persisted after the update, in order to maintain consistency between the database info and the resources
     * existing on disk
     */
    private Course updateCourseCustomIcons(@NotNull Course course, int publisherId, boolean updateHeader) {
        CGSAccount publisher = publisherService.getPublisherById(publisherId);
        if (publisher == null || course == null) {
            return null;
        }

        CourseCustomizationPack courseCustomizationPack = course.getContentData().getCustomizationPack();
        List<PublisherCustomIconsPack> publisherCustomIconsPacks = new ArrayList<>(publisher.getAccountCustomization().getCustomIconsPacks());

        Date lastUpdate = null;
        for (PublisherCustomIconsPack publisherIconsPack : publisherCustomIconsPacks) {
            CourseCustomIconsPack courseCustomIconsPack = courseCustomizationPack.getCustomIconsPackByType(publisherIconsPack.getType());
            if (courseCustomIconsPack == null || courseCustomIconsPack.getVersion() != publisherIconsPack.getVersion()) {
                // if the course does not contain the icons pack or does not have the same version
                if (courseCustomIconsPack != null) {
                    // remove old resource
                    String courseLocationOnDisk = publisherService.getPublisherCourseCmsHomeLocation(publisherId, course.getId());
                    try {
                        course.getContentData().removeResourceById(courseCustomIconsPack.getResourceId(), courseLocationOnDisk);
                        courseCustomizationPack.getCustomIconsPacks().remove(courseCustomIconsPack);
                    } catch (IOException e) {
                        logger.error(String.format("Failed to remove resource %s from course %s. Custom icons pack %s will not be updated",
                                courseCustomIconsPack.getResourceId(), course.getId(), courseCustomIconsPack.getType()));
                        continue;
                    }
                }
                CourseCustomIconsPack customIconsPack = copyCustomIconsPackToCourseFromPublisher(publisherIconsPack, publisherId, course);
                if (customIconsPack != null) {
                    logger.debug(String.format("Updated custom icons pack %s on course %s", publisherIconsPack.getType(), course.getId()));
                    lastUpdate = customIconsPack.getCreationDate();
                }
            }
        }
        if (updateHeader && lastUpdate != null) {
            Header newHeader = Header.newInstance(course.getContentData().getHeader(), lastUpdate);
            course.getContentData().setHeader(newHeader);
        }
        return course;
    }

    private Course saveCourse(Course course) throws DsException {
        boolean isSaveCompletedSuccessfully = false;
        try {
            course.getContentData().setHeader(Header.newInstance(course.getContentData().getHeader(), new Date()));
            save(course);
            isSaveCompletedSuccessfully = true;
            return course;
        } finally {
            if (isSaveCompletedSuccessfully) {
                try {
                    CleanupJob cleanupJob = new CleanupJob(course.getCgsData().getPublisherId(), course.getId(), null, null, CleanupType.COURSE);
                    cleanupsDao.insertOrUpdateCleanup(cleanupJob);
                } catch (Exception e) {
                    logger.error(String.format("course cleanup error occurred for courseId: %s, publisherId: %s.", course.getId(), course.getCgsData().getPublisherId()), e);
                }
            }
        }
    }

    /**
     * Method for updating a course in the database
     *
     * @param existing       existing course in the database
     * @param newContentData new content for the course
     * @param lockUser       user locking the course before save
     * @return the updated course
     * @throws DsException in case the course is locked
     */
    public Course saveCourse(Course existing, CourseContentData newContentData, LockUser lockUser) throws DsException {
        String courseId = existing.getId();
        List<Transaction> courseTransactions = transactionService.getTransactionForCourse(courseId);
        if (courseTransactions != null && !courseTransactions.isEmpty()) {
            String data = transactionService.createValidationErrorMessage(courseId, courseTransactions.get(0).getUserName());
            String m = String.format("Course %s (%s) is locked by %s and cannot be saved.", existing.getTitle(),
                    courseId, courseTransactions.get(0).getUserName());
            logger.warn(m);
            throw new TransactionException(ErrorCodes.CONTENT_IS_TRANSACTION_LOCKED, data);
        }
        handleLockings(existing, lockUser);
        Header updatedHeader = Header.newInstance(existing.getContentData().getHeader(), new Date());
        newContentData.setHeader(updatedHeader);
        Course course = Course.newInstance(existing.getId(), existing.getCgsData().getPublisherId(), newContentData);
        return save(course);
    }

    @Override
    public Course save(Course course) {
        course = courseRepository.save(course);
        courseSearchService.index(course);
        return course;
    }

    @Override
    public Course saveCourseCGSObject(CourseCGSObject courseCGSObject) {
        coursesDao.saveCourseCGSObject(courseCGSObject);
        Course course = courseRepository.findByPublisherIdAndCourseId(courseCGSObject.getPublisherId(), courseCGSObject.getEntityId());
        courseSearchService.index(course);
        return course;
    }

    @Override
    public Course saveCourseDBObject(DBObject courseDbObject) {
        coursesDao.saveCourseDBObject(courseDbObject);
        String courseId = (String) courseDbObject.get("_id");
        DBObject courseDbData = (DBObject) courseDbObject.get(TocItemCGSObject.CGS_DATA);
        int publisherId = (int) courseDbData.get(TocItemCGSObject.PUBLISHER_ID);
        Course course = courseRepository.findByPublisherIdAndCourseId(publisherId, courseId);
        courseSearchService.index(course);
        return course;
    }

    @Override
    public void deleteById(DBRef dbref) {
        coursesDao.deleteById(dbref);
        courseSearchService.delete((String) dbref.getId());
    }

    @Override
    public CourseCGSObject saveCourse(CourseCGSObject course, LockUser cgsUserDetails, boolean isNewCourse) throws DsException {
        boolean isSaveCompletedSuccessfully = false;
        try {
            //validates course json format against schema
            contentValidator.validate(course);

            // if there is a transaction on this course - throw an exception
            if (!isNewCourse) {
                String courseId = course.getEntityId();
                List<Transaction> courseTransactions = transactionService.getTransactionForCourse(courseId);
                if (courseTransactions != null && !courseTransactions.isEmpty()) {
                    String data = transactionService.createValidationErrorMessage(courseId, courseTransactions.get(0).getUserName());

                    String m = String.format("Course %s (%s) is being published by %s and cannot be saved.", course.getTitle(), courseId, courseTransactions.get(0).getUserName());
                    logger.warn(m);
                    throw new TransactionException(ErrorCodes.CONTENT_IS_TRANSACTION_LOCKED, data);
                }
            }
            //handles the locking on the Course
            //will throw an error on conflicts
            handleLockings(course, cgsUserDetails);
            Date modificationDate;
            if (isNewCourse) {
                modificationDate = dateForNewCourseSaveUponCreation; //if this is a new course, set the last modified date to be Thu Jan 01 02:00:00 IST 1970, so we could query it..
            } else {
                modificationDate = new Date();  // if this course already exists - the last modified date will be the present time
            }
            course.setLastModified(modificationDate);
            saveCourseCGSObject(course);
            isSaveCompletedSuccessfully = true;
            //generate new applet manifest only for new course
            if (isNewCourse)
                appletService.createAppletManifest(course.getEntityId(), course.getCgsCourseVersion());
            return course;
        } finally {
            if (isSaveCompletedSuccessfully) {
                try {
                    CleanupJob cleanupJob = new CleanupJob(course.getPublisherId(), course.getEntityId(), null, null, CleanupType.COURSE);
                    cleanupsDao.insertOrUpdateCleanup(cleanupJob);
                } catch (Exception e) {
                    logger.error(String.format("Error adding course to cleanups DB for courseId: %s, publisherId: %s.", course.getEntityId(), course.getPublisherId()), e);
                }
            }
        }
    }

    /**
     * holds the locking logics on a course entity.
     * 1. validateLocker on a course
     * 2. ...
     *
     * @param course         - course object
     * @param cgsUserDetails - details of the locking user
     * @throws DsException
     */
    private void handleLockings(ContentItemBase course, LockUser cgsUserDetails) throws DsException {
        ContentItemBase contentItemBase = getContentItemBase(course.getContentId());
        if (contentItemBase == null) return;
        Date lastModified = contentItemBase.getLastModified();//getLastModified(course.getContentId(), VersionUtils.getEdition(course.getContentVersionNumber()));

        if (lastModified != null && !lastModified.equals(course.getLastModified())) {
            throw new ConflictException(course.getContentId(), String.format("The course date is not in sync with storage. date:%s", lastModified));
        }

        lockService.validateLocker(contentItemBase, cgsUserDetails);
    }

    @Override
    public CourseCGSObject getCourse(int publisherId, String courseId, Date lastModified, boolean isPropertiesOnly) {
        if (logger.isDebugEnabled()) {
            logger.debug(" getCourse. courseId:" + courseId);
        }

        CourseCGSObject course = coursesDao.getCourse(publisherId, courseId, null, isPropertiesOnly);
        // return null if courses has the same date
        if (course == null
                || (lastModified != null && course.getLastModified().equals(lastModified))) {
            return null;
        }

        return course;
    }

    @Override
    public List<CourseCGSObject> getCoursesByStandardPackage(String packageName, String subjectArea) {

        List<CourseCGSObject> coursesByStandardPackage = this.coursesDao.getCoursesByStandardPackage(packageName, subjectArea);

        return coursesByStandardPackage;
    }

    @Override
    public TinyKey getTinyKey(Integer publisherId, String courseId, String lessonId, PublishTarget publishTarget) {
        TinyKey tinyKey = this.tinyKeysDao.getTinyKey(publisherId, courseId, lessonId, publishTarget);
        return tinyKey;
    }


    @Override
    public List<CourseCGSObject> getCoursesPropertiesByPublisher(int publisherAccountId) throws DsException {
        return coursesDao.getCoursesPropertiesByPublisher(publisherAccountId);
    }

    @Override
    public List<TocItemCGSObject> getTocItemsBasicDataForCourseLessonsMenu(int publisherId, String courseId) throws DsException {
        List<String> allTocItemCIdsFromCourse = this.getAllTocItemCIdsFromCourse(publisherId, courseId);
        List<TocItemCGSObject> tocItemCGSObjects = tocItemsManager.getContentItemBases(publisherId, allTocItemCIdsFromCourse, courseId);

        for (TocItemCGSObject item : tocItemCGSObjects) {
            item.setResources(null);
            item.setCustomFields(null);
        }
        return tocItemCGSObjects;
    }

    @Override
    public CourseCGSObject getCourseTocItemsInStructureByPublisher(int publisherAccountId, String courseId, String tocItemContentType) throws DsException {
        logger.info(String.format("started getCourseTocItemsInStructureByPublisher publisherId%d", publisherAccountId));

        try {
            CourseCGSObject course = coursesDao.getCoursesWithOnlyTocHierarchyByPublisher(publisherAccountId, courseId);
            CourseContentEditor editor = new CourseContentEditor(course);
            List<TocItemCGSObject> tocItems = tocItemsManager.getOnlyNameAndIdsByCourseOfNonHiddenItems(publisherAccountId, courseId, tocItemContentType);

            editor.replaceTocItemRefsWithTocItemsHeadersAndKeepOnlyMinimalDataInCourse(tocItems); //push lessons into course object
            return course;
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    public HashMap<String, EntityType> getAllTocItemCIdsAndEntityTypeFromCourse(int publisherId, String courseId) {
        CourseCGSObject course = coursesDao.getCourse(publisherId, courseId, null, false);

        //sometimes locks are asking for a deleted course
        if (course == null) {
            return new HashMap<>();
        }

        CourseContentEditor editor = new CourseContentEditor(course);
        HashMap<String, EntityType> cids = new HashMap<>();
        for (CourseContentEditor.TocItemRef ref : editor.getAllTocItemRefs()) {
            cids.put(ref.getCid(), ref.getType());
        }

        return cids;
    }

    @Override
    public List<String> getAllTocItemCIdsFromCourse(int publisherId, String courseId) {
        return new ArrayList<>(getAllTocItemCIdsAndEntityTypeFromCourse(publisherId, courseId).keySet());
    }

    @Override
    public ContentItemBase getContentItemBase(String courseId) {
        return coursesDao.getContentItemBase(courseId);
    }

    @Override
    public String createNewCourseEdition(int publisherId, String courseId, String jobId) throws DsException {
        logger.info(String.format("createNewCourseEdition. courseId: %s", courseId));
        return fullCourseCopy(publisherId, courseId, null, false, null, false, jobId);
    }

    @Override
    public void removeLocale(int publisherId, String courseId, String locale, LockUser cgsUserDetails) throws DsException {
        if (transactionService.doesCourseHaveTransactions(courseId))
            throw new TransactionException(ErrorCodes.CONTENT_IS_TRANSACTION_LOCKED, "");

        lockService.checkAndAcquireLocksOnCourse(publisherId, courseId, cgsUserDetails);
        try {
            RemoveLocale removeLocale = new RemoveLocale(publisherId, courseId, locale, appContext);
            removeLocale.execute();
        } catch (Exception e) {
            throw new DsException(e);
        } finally {
            lockService.removeLocksOnCourse(courseId, publisherId, cgsUserDetails);
        }
    }

    @Override
    public List<CourseCGSObject> getSavedCoursesPropertiesByPublisher(int publisherId) throws DsException {
        try {
            return coursesDao.getSavedCoursesPropertiesByPublisher(publisherId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    private String getTocItemId(Object contentData) {
        if (contentData == null) {   // object is null
            return null;
        }
        DBObject contentDataObject = ((DBObject) contentData);
        if (!contentDataObject.containsField("cid")) { // object doesnt have a field named "cid"
            return null;
        }
        return contentDataObject.get("cid").toString();
    }

    /**
     * Validates entire course DB objects and sequences, and also their data in file system.
     * returns an empty errors list is everything went well.
     *
     * @param publisherId - course's publisher ID
     * @param courseId    - course ID
     * @return a validation report about the course's validity including all its resources (media, pdfs, fonts) and elements (lesson, sequence, etc..)
     */
    @Override
    public CGSValidationReport validateCourseAndSubElements(int publisherId, String courseId) throws DsException {
        CGSValidationReport cgsValidationReport = new CGSValidationReport();
        cgsValidationReport.setDescription(String.format("Validation report for course ID: %s, publisher ID: %d", courseId, publisherId));
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        List<PublishError> errors = new ArrayList<>();

        validateCourseNode(publisherId, courseId, errors);
        if (!errors.isEmpty()) {
            stopWatch.stop();
            cgsValidationReport.addMessages(getStringListFromPublisherErrorsList(errors));
            cgsValidationReport.setDuration(stopWatch.getTime());
            cgsValidationReport.setSuccess(false);
            return cgsValidationReport;
        }

        validateCourseTocItems(publisherId, courseId, errors);

        if (errors.isEmpty()) {
            cgsValidationReport.setSuccess(true);
            logger.info(String.format("Validation for course resources and it's tocItems (DB & FS) - passed. courseId: %s, publisherId: %d.", courseId, publisherId));
        } else {
            cgsValidationReport.setSuccess(false);
            String message = String.format("Validation for course resources and it's tocItems (DB & FS) - failed. courseId: %s, publisherId: %d.\nErrors: %s", courseId, publisherId, Arrays.toString(errors.toArray()));
            logger.error(message);
        }
        stopWatch.stop();
        cgsValidationReport.addMessages(getStringListFromPublisherErrorsList(errors));
        cgsValidationReport.setDuration(stopWatch.getTime());
        return cgsValidationReport;
    }

    private List<String> getStringListFromPublisherErrorsList(List<PublishError> errors) {
        List<String> result = new ArrayList<>();
        for (PublishError p : errors) {
            result.add(p.toString());
        }
        return result;
    }

    private void validateCourseTocItems(int publisherId, String courseId, List<PublishError> errors) throws DsException {
        HashMap<String, EntityType> courseTocItems = getAllTocItemCIdsAndEntityTypeFromCourse(publisherId, courseId);
        String cmsCourseHomeLocation = publisherService.getPublisherCourseCmsHomeLocation(publisherId, courseId);

        for (String tocItemId : courseTocItems.keySet()) {
            EntityType type = courseTocItems.get(tocItemId);
            if (type.equals(EntityType.ASSESSMENT) || type.equals(EntityType.LESSON)) {

                // ---------- validate that tocItem exists on DB ---------- //
                ContentItem tocItemData;
                try {
                    tocItemData = tocItemsManager.get(publisherId, tocItemId, courseId, null, false);
                } catch (DsException e) {
                    String message = String.format("Could not find tocItem %s : %s.", type, tocItemId);
                    logger.error(message);
                    PublishErrors errorType;
                    if (type.equals(EntityType.ASSESSMENT))
                        errorType = PublishErrors.MissingLessonReference;
                    else
                        errorType = PublishErrors.MissingLessonReference;

                    errors.add(new PublishError(errorType, message));
                    continue;    // could not find the toc item, so no further validation could be done
                }

                // ---------- content validation ---------- //
                boolean isContentValid = true;
                try {
                    contentValidator.validate(tocItemData);
                } catch (Exception e) {
                    isContentValid = false;
                    String message = String.format("Validation error in %s json on DB. tocItemId: %s, courseId %s, publisher %d", type, tocItemId, courseId, publisherId);
                    logger.error(message, e);  //To change body of catch statement use File | Settings | File Templates.
                    errors.add(new PublishError(PublishErrors.InvalidContent, String.format("%s\ndetails: %s", message, e.getMessage()), e.getMessage()));
                }

                if (!isContentValid) { // if the content is invalid there is no point in trying to get data from the json, so we'll go to the next toc item
                    continue;
                }
                // ---------- end of content validation ---------- //

                //-- validation of all db resources (sequences ) and file system resources (media, pdf, customization pack, etc..)
                if (!contentItemValidation.doesAllDBResourcesAndFSAssetsExist(tocItemData, errors, cmsCourseHomeLocation)) {
                    String message = String.format("Resources And Assets Validation failed for %s with id: %s", type.getName(), tocItemId);
                    logger.error(message);
                }
            }
        }
    }

    private void validateCourseNode(int publisherId, String courseId, List<PublishError> errors) throws DsException {
        CourseCGSObject courseNode = getCourse(publisherId, courseId, null, false);
        if (courseNode == null) {
            String message = String.format("Could not find course %s for publisher %d", courseId, publisherId);
            logger.error(message);
            errors.add(new PublishError(PublishErrors.MissingCourse, message));
            return;
        }
        CGSValidationReport courseValidationReport = null;
        try {
            String courseJson = courseNode.getContentData().toString();
            courseValidationReport = contentValidator.validateCourseJson(courseJson);
        } catch (Exception e) {
            String message = String.format("Error in course %s manifest json on DB, for publisher %d", courseId, publisherId);
            logger.error(message, e);  //To change body of catch statement use File | Settings | File Templates.
            errors.add(new PublishError(PublishErrors.InvalidContent, message));
        }
        if (courseValidationReport != null && !courseValidationReport.isSuccess()) {
            String message = String.format("Error in course %s manifest json on DB, for publisher %d. details: %s", courseId, publisherId, Arrays.toString(courseValidationReport.getMessages().toArray()));
            logger.error(message);  //To change body of catch statement use File | Settings | File Templates.
            errors.add(new PublishError(PublishErrors.InvalidContent, message));
        }
        String cmsCourseHomeLocation = publisherService.getPublisherCourseCmsHomeLocation(publisherId, courseId);

        if (!contentItemValidation.doesAllDBResourcesAndFSAssetsExist(courseNode, errors, cmsCourseHomeLocation)) { //courseNode validation
            String message = String.format("Resources And Assets Validation failed for course Id: %s.", courseId);
            logger.error(message);
        }
    }

    @Override
    public List<CGSValidationReport> validateAllCourses() throws DsException {
        List<CGSValidationReport> result = new ArrayList<>();
        List<Integer> allPublishers = publisherService.getAllPublisherIds();
        for (Integer publisherId : allPublishers) {
            List<String> courseIds = getAllCourses(publisherId);
            for (String courseId : courseIds) {
                result.add(validateCourseAndSubElements(publisherId, courseId));
            }
        }
        return result;
    }

    @Override
    public List<String> getAllCourses(Integer publisherId) {
        List<String> courseIds = new ArrayList<>();
        List<CourseCGSObject> courses;
        courses = coursesDao.getCoursesPropertiesByPublisher(publisherId);
        for (CourseCGSObject course : courses) {
            courseIds.add(course.getEntityId());
        }
        return courseIds;
    }

    @Override
    public List<Course> getAllNotHidden(Integer publisherId) {
//        return courseRepository.findByPublisherIdAndLastModifiedGreaterThan(publisherId, new Date(0)); // out of memory when too many courses
        return coursesDao.getCoursesTitlesIdVersionsAndCoverPicturesByPublisherId(publisherId);
    }

    @Override
    public List<Course> getCourses(int publisherId, List<String> courseIds) {
        return courseRepository.findByPublisherIdAndCourseIdIn(publisherId, courseIds);
    }

    @Override
    public Page<Course> getPagedCourses(int publisherId, Pageable pageRequest) {
        return courseRepository.findByPublisherId(publisherId, pageRequest);
    }

    @Override
    public Page<Course> getCourses(int publisherId, List<String> courseIds, Pageable pageRequest) {
        return courseRepository.findByPublisherIdAndCourseIdIn(publisherId, courseIds, pageRequest);
    }

    @Override
    public Page<Course> searchCoursesByText(int publisherId, String searchText, Pageable pageRequest) {
        FacetedPage<CourseES> courseESFacetedPage = courseSearchService.searchCoursesByText(publisherId, searchText, pageRequest);

        List<String> courseIds = courseESFacetedPage.getContent().stream()
                .map(CourseES::getId)
                .collect(Collectors.toList());

        return new PageImpl<>(
                courseRepository.findByPublisherIdAndCourseIdIn(publisherId, courseIds),
                pageRequest,
                courseESFacetedPage.getTotalElements());
    }

    @Override
    public Page<Course> searchCoursesByTitle(int publisherId, String searchText, Pageable pageRequest) {
        FacetedPage<CourseES> courseESFacetedPage = courseSearchService.searchCoursesByTitle(publisherId, searchText, pageRequest);

        List<String> courseIds = courseESFacetedPage.getContent().stream()
                .map(CourseES::getId)
                .collect(Collectors.toList());

        return new PageImpl<>(
                courseRepository.findByPublisherIdAndCourseIdIn(publisherId, courseIds),
                pageRequest,
                courseESFacetedPage.getTotalElements());
    }

    @Override
    public List<Course> getByPublisherAndEBookId(Integer publisherId, String eBookId) {
        return courseRepository.findByPublisherIdAndEBookId(publisherId, eBookId);
    }

    @Override
    public void updateDifferentiationLevels(int publisherId, String courseId, String diffLevels, CGSUserDetails currentCgsUserDetails) throws DsException, JSONException, IOException {
        if (transactionService.doesCourseHaveTransactions(courseId))
            throw new TransactionException(ErrorCodes.CONTENT_IS_TRANSACTION_LOCKED, "");

        if (diffLevels == null) return;

        CourseDifferentiation diffLevelsObj = new ObjectMapper().readValue(diffLevels, CourseDifferentiation.class);
        //convert the user differentiated to list of objects
        List<DifferentiationLevel> diffLevelsList = diffLevelsObj.getLevels();
        //prepare array list of toc item for later save
        List<TocItemCGSObject> lessonsForSave = new ArrayList<>();
        //boolean for make save only for differentiation sequences
        boolean hasDiffLevels;

        //CourseObject
        Course course = getCourse(publisherId, courseId);
        //all tocs in course
        List<TocItemCGSObject> tocs = tocItemDataService.getByCourse(publisherId, courseId, false);

        // iterate through the tocs
        for (TocItemCGSObject tocObj : tocs) {
            // initialize the flag to false
            hasDiffLevels = false;
            // get the sequences from toc
            List<DBObject> sequencesList = tocObj.getSequences();

            for (DBObject sequence : sequencesList) {
                // if sequence is differentiated type then get the levels of it
                if (sequence.get("type").equals("differentiatedSequenceParent")) {
                    List<DBObject> levels = (List<DBObject>) sequence.get("levels");
                    // map the new levels to the sequence current level
                    for (DifferentiationLevel level : diffLevelsList) {
                        for (DBObject sequenceLevel : levels) {
                            if (sequenceLevel.get("levelId").toString().equals(String.valueOf(level.getLevelId()))) {
                                DBObject levelSeq = (DBObject) sequenceLevel.get("sequence");

                                levelSeq.put("title", level.getName());
                                hasDiffLevels = true;
                            }
                        }
                    }
                }
            }
            // if has changes acquire lock on the lesson and add it to lessons for save  else end execute of method
            if (hasDiffLevels) {
                try {
                    lockService.acquireLock(tocObj, new LockUser(currentCgsUserDetails));
                } catch (DuplicateKeyException e) {
                    logger.info("User has lock already");
                } catch (Exception e) {
                    logger.info("Content is not owned by the user");
                    for (TocItemCGSObject lesson : lessonsForSave) {
                        lockService.releaseLock(lesson, new LockUser(currentCgsUserDetails));
                    }
                    throw e;
                }
                lessonsForSave.add(tocObj);
            }
        }
        // save the course diff levels data
        CourseContentData courseContentData = course.getContentData();

        // set course new differentiation
        courseContentData.setDifferentiation(diffLevelsObj);
        // set the new content data
        course.setContentData(courseContentData);
        // save the course
        saveCourse(course);

        // update all lessons with the current diff levels
        for (TocItemCGSObject lesson : lessonsForSave) {
            tocItemDataService.save(lesson, new LockUser(currentCgsUserDetails));
        }

        //release lock
        for (TocItemCGSObject lesson : lessonsForSave) {
            lockService.releaseLock(lesson, new LockUser(currentCgsUserDetails));
        }

        //update sequences manifest
        for (TocItemCGSObject lesson : lessonsForSave) {
            //get all sequences from toc item
            List<Sequence> sequences = tocItemDataService.getSequences((String) lesson.getContentData().get("cid"), lesson.getCourseId());

            //run over the sequences
            for (Sequence sequence : sequences) {
                //get the contentData
                JSONObject parseContent = new JSONObject(sequence.getContent());
                //get the first element in the content ({id: {content}});
                JSONObject sequenceObj = parseContent.getJSONObject(sequence.getSeqId());
                //get the repo data property
                JSONObject sequenceData = sequenceObj.getJSONObject("data");

                //check if we have a diffLevel property
                if (sequenceData.has("diffLevel")) {
                    //get this property
                    JSONObject seqDiffLevel = sequenceData.getJSONObject("diffLevel");
                    //is sequence mark as default?
                    String isDefaultSeqLevel = seqDiffLevel.get("isDefault").toString();

                    //if the sequence isDefault and not equal to the new set of levels update the sequence to false;
                    if (Boolean.parseBoolean(isDefaultSeqLevel) && !diffLevelsObj.getDefaultLevelId().equals(seqDiffLevel.get("id").toString())) {
                        seqDiffLevel.put("isDefault", false);
                    } else if (!Boolean.parseBoolean(isDefaultSeqLevel) && diffLevelsObj.getDefaultLevelId().equals(seqDiffLevel.get("id").toString())) {
                        seqDiffLevel.put("isDefault", true);
                    }

                    //itreate through the new diff level and update the sequence title and the level
                    for (DifferentiationLevel level : diffLevelsList) {
                        if (seqDiffLevel.get("id").toString().equals(String.valueOf(level.getLevelId()))) {
                            sequenceData.put("title", level.getName());
                            seqDiffLevel.put("name", level.getName());
                            seqDiffLevel.put("acronym", level.getAcronym());
                        }
                    }

                    //save the sequence content
                    sequenceData.put("diffLevel", seqDiffLevel);
                    sequenceObj.put("data", sequenceData);

                    parseContent.put(sequence.getSeqId(), sequenceObj);

                    sequence.setContent(parseContent.toString());
                }

                tocItemDataService.saveSequences(sequences);
            }
        }
    }

    @Override
    public CGSValidationReport validateAllTocItemsWithSchema() throws DsException {
        CGSValidationReport cgsValidationReport = new CGSValidationReport();
        List<String> errors = new ArrayList<>();
        List<Integer> publisherIds = publisherService.getAllPublisherIds();
        for (int publisherId : publisherIds) {
            List<String> allCourses = this.getAllCourses(publisherId);
            for (String courseId : allCourses) {
                errors.addAll(tocItemDataService.validateTocItemAgainstSchema(publisherId, courseId));
            }
        }

        if (errors.isEmpty()) {
            cgsValidationReport.setSuccess(true);
        } else {
            cgsValidationReport.setSuccess(false);
            cgsValidationReport.addMessages(errors);
        }
        return cgsValidationReport;
    }

    @Override
    public Course createNewCourse(int publisherId, String courseTitle, CGSUserDetails cgsUserDetails, String contentLocale) {
        String courseId = UUID.randomUUID().toString();
        String customizationPackResourceId = "resource_1";
        CGSAccount publisherData = publisherService.getAccountAuthenticationData(publisherId, false);

        DBObject customizationPackManifest;
        try {
            customizationPackManifest = copyCustomizationPackToCourseAndGetManifest(contentLocale, publisherId, courseId);
        } catch (Exception e) {
            logger.error("Exception while trying to copy customization pack to course", e);
            return null;
        }
        CourseCustomizationPack customizationPack = CourseCustomizationPack.newInstance(customizationPackResourceId, customizationPackManifest);
        CGSResource customizationPackResource = CGSResource.newInstance(customizationPackResourceId, customizationPackManifest);

        CourseContentData contentData = new CourseContentData.Builder(courseId, cgsUserDetails.getUsername(), courseTitle)
                .publisherName(publisherService.getPublisherName(publisherId))
                .cgsVersion(versionService.getFullVersion())
                .schema(contentValidator.getSchemaName())
                .addContentLocale(contentLocale)
                .customizationPack(customizationPack)
                .addResource(customizationPackResource)
                .includeLearningObject(publisherData.getAccountCustomization().isEnableLearningObjects())
                .tableOfContents(CourseToc.newInstance(courseTitle))
                .build();

        Course course = Course.newInstance(courseId, publisherId, contentData);
        course = updateCourseCustomIcons(course, publisherId, false);
        course = save(course);
        appletService.createAppletManifest(course.getEntityId(), course.getContentData().getVersion());
        try {
            lockService.acquireLock(course, new LockUser(cgsUserDetails));
        } catch (DsException e) {
            logger.error("Unable to acquire lock on course object: " + course, e);
        }
        return course;
    }

    public Course createNewCourseFromEBookTOC(String courseId, EBook eBook, EBookConversionData conversionData, CourseToc courseToc) {
        int publisherId = conversionData.getPublisherId();
        String customizationPackResourceId = "resource_1";
        DBObject customizationPackManifest;
        try {
            customizationPackManifest = copyCustomizationPackToCourseAndGetManifest(conversionData.getContentLanguage(),
                    conversionData.getPublisherId(), courseId);
        } catch (Exception e) {
            logger.error("Exception while trying to copy customization pack to course", e);
            return null;
        }
        CourseCustomizationPack customizationPack = CourseCustomizationPack.newInstance(customizationPackResourceId, customizationPackManifest);
        CGSResource customizationPackResource = CGSResource.newInstance(customizationPackResourceId, customizationPackManifest);
        CourseContentData contentData = new CourseContentData.Builder(courseId,
                conversionData.getUsername(), conversionData.getCourseName())
                .publisherName(publisherService.getPublisherName(publisherId))
                .cgsVersion(versionService.getFullVersion())
                .schema(contentValidator.getSchemaName())
                .addContentLocale(conversionData.getContentLanguage())
                .customizationPack(customizationPack)
                .addResource(customizationPackResource)
                .includeLearningObject(conversionData.hasLearningObject())
                .tableOfContents(courseToc)
                .header(Header.newInstance(new Date()))
                .setEBooksRefs(new HashSet<>(Collections.singletonList(eBook.getEBookId())))
                .setCover(copyCoverFromEBook(publisherId, courseId, eBook))
                .build();
        Course course = Course.newInstance(courseId, conversionData.getPublisherId(), contentData);
        course = updateCourseCustomIcons(course, conversionData.getPublisherId(), false);
        course = save(course);
        appletService.createAppletManifest(course.getEntityId(), course.getContentData().getVersion());
        return course;
    }

    /**
     * Copies the cover image from the eBook to the course folder and returns a resource for it
     *
     * @param courseId id of the course to copy the cover to
     * @param eBook    {@link EBook} to copy cover from
     * @return the resource pointing to the cover copied to the course dir
     */
    private CGSResource copyCoverFromEBook(int publisherId, String courseId, EBook eBook) {
        if (courseId == null || eBook == null || eBook.getStructure().getCoverImage() == null) return null;
        String coverImageResourceId = "resource_2";
        String coursePath = publisherService.getPublisherCourseCmsHomeLocation(publisherId, courseId);
        File eBookCoverFile = new File(cmsService.getPublisherPath(publisherId)
                + "/" + eBook.getStructure().getCoverImage());
        String coverPathInCourse = "media/" + eBookCoverFile.getName();
        File courseCoverFile = new File(coursePath + "/" + coverPathInCourse);
        try {
            FileUtils.copyFile(eBookCoverFile, courseCoverFile);
        } catch (IOException e) {
            logger.error(String.format("Failed to copy eBook cover %s to course at %s", eBookCoverFile.getAbsolutePath(),
                    courseCoverFile.getAbsolutePath()));
        }
        return CGSResource.newInstance(coverImageResourceId, coverPathInCourse, "media");
    }

    private DBObject copyCustomizationPackToCourseAndGetManifest(String customizationPackLocale, int publisherId, String courseId) throws Exception {

        String customizationPackFolderBasePath = configuration.getProperty("customizationPackFolderBaseDir");
        String customizationPackManifestPath = String.format("%s/%s/manifest.json", customizationPackFolderBasePath, customizationPackLocale);
        DBObject manifest = getCustomizationPackManifest(customizationPackManifestPath);

        String version = (String) manifest.get("version");

        String customizationPackFolderLocation = String.format("%s/%s", customizationPackFolderBasePath, customizationPackLocale);
        String destinationBasePath = String.format("%s/%s/%s/%s",
                publisherService.getPublisherCourseCmsHomeLocation(publisherId, courseId),
                CUSTOMIZATION_PACK_DIR_NAME,
                customizationPackLocale,
                version);
        FileUtils.copyDirectory(new File(customizationPackFolderLocation), new File(destinationBasePath));

        return manifest;

    }

    /**
     * This method will also add a new resource to the course object
     *
     * @return a {@link CourseCustomIconsPack} object containing the info of the copied files to the course or null if
     * they couldn't be copied. The course object will also be updated with the CourseCustomIconsPack
     */
    private CourseCustomIconsPack copyCustomIconsPackToCourseFromPublisher(PublisherCustomIconsPack publisherIconsPack,
                                                                           int publisherId,
                                                                           Course course) {
        String sourcePath = String.format("%s/%s",
                publisherService.getPublisherCmsHomeLocation(publisherId),
                publisherIconsPack.getBaseDir());
        File publisherIconsPackDir = new File(sourcePath);

        String customIconsBaseDir = CUSTOMIZATION_PACK_DIR_NAME + "/customIcons/" + publisherIconsPack.getType().getFontFamily();
        String destinationPath = String.format("%s/%s",
                publisherService.getPublisherCourseCmsHomeLocation(publisherId, course.getId()),
                customIconsBaseDir);
        File destinationDir = new File(destinationPath);

//        String courseUrl = "/cms/publishers/" + publisherId + "/courses/" + course.getGuid();
        CGSResource resource = CGSResource.newInstance(customIconsBaseDir, publisherIconsPack.getHrefs(), "customIcon");
        CourseCustomIconsPack customIconsPack = CourseCustomIconsPack.newInstance(publisherIconsPack, resource, destinationPath);
        if (customIconsPack == null) {
            return null;
        }

        if (!publisherIconsPackDir.exists()) {
            logger.error(String.format("Publisher customization pack directory %s does not exist", publisherIconsPackDir));
            return null;
        } else if (destinationDir.exists()) {
            destinationDir.delete();
        }
        try {
            FileUtils.copyDirectory(publisherIconsPackDir, destinationDir);
        } catch (IOException e) {
            logger.error(String.format("Unable to copy custom icons pack from publisher %s to course %s", publisherId, course.getId()), e);
            return null;
        }
        // update the course object
        course.getContentData().addResource(resource);
        course.getContentData().getCustomizationPack().addCustomIconsPack(customIconsPack);
        return customIconsPack;
    }

    private DBObject getCustomizationPackManifest(String sourcePath) throws IOException {
        String manifestString = FileUtils.readFileToString(new File(sourcePath));
        return (DBObject) JSON.parse(manifestString);
    }

    @Override
    public String cloneCourse(int publisherId, String courseId, String newName, String jobId) throws DsException {
        logger.info(String.format("cloneCourse. courseId: %s", courseId));
        return fullCourseCopy(publisherId, courseId, INITIAL_COURSE_VERSION, true, newName, true, jobId);
    }

    private String fullCourseCopy(int publisherId, String courseId, String forceVersion, boolean generateNewCid,
                                  String newName, boolean isCopy, String jobId) throws DsException {
        String newVersion;
        String newCourseId = null;
        CourseCGSObject course;
        try {
            course = coursesDao.getCourse(courseId, false);
        } catch (Exception e) {
            throw new DsException(e);
        }
        lockService.acquireLock(course, LockServiceImpl.systemLockUser);

        boolean rc = transactionService.checkNStartTransaction(courseId, LockServiceImpl.systemLockUser.getUserName(), new Date());
        if (!rc) {
            transactionService.getTransactionForCourse(courseId);
            throw new TransactionException(ErrorCodes.CONTENT_IS_TRANSACTION_LOCKED, "");
        }

        Job job = new Job(jobId);

        try {
            jobService.saveJob(job);
            //get all contents
            CourseCGSObject courseCGSObject = getCourse(publisherId, courseId, null, false);
            String coursePrevVersion = courseCGSObject.getContentVersionNumber();
            String coursePrevTitle = courseCGSObject.getTitle();
            if (forceVersion != null) {
                newVersion = forceVersion;
            } else {
                newVersion = VersionUtils.increaseEditionNumberAndReset(coursePrevVersion);
            }

            // a new title for the course, default to adding '-copy' if new name not provided
            String courseNewTitle = null;
            if (isCopy) {
                if (newName == null) {
                    courseNewTitle = String.format("%s-copy", coursePrevTitle);
                } else {
                    courseNewTitle = newName;
                }
            }

            newCourseId = UUID.randomUUID().toString();
            while (courseRepository.findOne(newCourseId) != null) { //check if the id already exists
                newCourseId = UUID.randomUUID().toString();
            }
            job.setRefEntityId(newCourseId);
            jobService.saveJob(job);
            Date lastModified = new Date();
            logger.info(String.format("fullCourseCopy. create a new course. courseId: %s, version: %s", courseId, newVersion));

            //toc items
            HashMap<String, EntityType> tocItemIds = this.getAllTocItemCIdsAndEntityTypeFromCourse(publisherId, courseId);
            jobService.updateJobProgress(jobId, "tocItemData", 0, Job.Status.IN_PROGRESS);
            logger.info(String.format("fullCourseCopy. number of lessons in course : %s", tocItemIds) != null ? tocItemIds.size() : 0);
            int tocItemsCount = 0;
            int tocItemsSize = tocItemIds.size();

            for (String existingTocItemId : tocItemIds.keySet()) {
                logger.info(String.format("fullCourseCopy. lessonCid: %s", existingTocItemId));
                ContentItem existingTocItem = tocItemsManager.get(publisherId, existingTocItemId, courseId, null, false); // todo: use cursor
//                List<String> sequenceIds = tocItemDataService.getSequencesListFromResource(existingTocItem.getContentData()); //-> BUG CREATE-4363
//                List<String> sequenceIds = tocItemDataService.getSequencesListFromContentItem(existingTocItem); // BUG CREATE-4486
                List<String> sequenceIds = tocItemDataService.getAllSequencesList(existingTocItem);
                DBCursor lessonSequences = tocItemDataService.getSequencesCursor(existingTocItemId, courseId, sequenceIds);

                logger.info(String.format("fullCourseCopy. number of sequences in lessonCid: %s is %d", existingTocItemId, sequenceIds.size()));
                int seqSize = lessonSequences.size();
                ++tocItemsCount;

                int totalLessonData = seqSize;
                int lessonDataCount = 0;

                logger.info(String.format("Start copying sequences %s", new Date()));
                if (lessonSequences != null) {
                    while (lessonSequences.hasNext()) {
                        BasicDBObject basicDBObject = (BasicDBObject) lessonSequences.next();
                        Sequence sequence = new Sequence(basicDBObject.getString("seqId"), existingTocItemId, newCourseId,
                                basicDBObject.getString("content"), lastModified);
                        sequenceService.saveSequence(sequence);
                        jobService.updateJobProgress(jobId, "tocItemData", calcProgress(tocItemsCount, tocItemsSize,
                                ++lessonDataCount, totalLessonData), Job.Status.IN_PROGRESS);
                    }
                }
                logger.info(String.format("End copying sequences %s", new Date()));

                TocItemCGSObject newTocItemCGSObject = new TocItemCGSObject(existingTocItem.serializeContentData(),
                        publisherId, newCourseId, existingTocItem.getEntityType());
                newTocItemCGSObject.setLastModified(lastModified);
                tocItemsManager.save(newTocItemCGSObject, null);
            }

            //applets
            logger.info("fullCourseCopy. Copy course applet");
            AppletManifest appletManifest = appletService.getAppletManifest(courseId, null);
            if (appletManifest != null) {
                appletManifest.setCourseId(newCourseId);
                appletDao.saveAppletManifest(appletManifest);
            } else {
                logger.warn(String.format("Could not find manifest for course: %s", courseId));
            }
            //course
            String origCmsPath = String.format(CmsService.BASE_COURSE_PATH, publisherId, courseId);
            String duplicatedCmsPath = String.format(CmsService.BASE_COURSE_PATH, publisherId, newCourseId);
            String cmsLocation = cmsService.getCmsLocation();
            logger.info(String.format("fullCourseCopy. copy cms contents. from: %s to:  %s", origCmsPath, duplicatedCmsPath));
            //check if the cms course exists.
            logger.info("start copying resources " + new Date());

            if (new File(String.format("%s/%s", cmsLocation, origCmsPath)).exists()) {
                FilesUtils filesUtils = new FilesUtils(jobService);
                filesUtils.copyFolder(new File(String.format("%s/%s", cmsLocation, origCmsPath)),
                        new File(String.format("%s/%s", cmsLocation, duplicatedCmsPath)), jobId);
            }

            logger.info(String.format("End copying resources %s", new Date()));
            CourseCGSObject newCourseCGSObject = new CourseCGSObject(courseCGSObject.serializeContentData(), publisherId);

            logger.info("FullCourseCopy. saves the new course ..");

            newCourseCGSObject.setCgsCourseVersion(newVersion);
            newCourseCGSObject.setEntityId(newCourseId);
            newCourseCGSObject.setLastModified(lastModified);
            newCourseCGSObject.setCourseId(newCourseId);
            if (courseNewTitle != null) {
                newCourseCGSObject.setTitle(courseNewTitle);
            }
            if (generateNewCid) {
                newCourseCGSObject.setContentId(UUID.randomUUID().toString());
            }
            //set new header
            newCourseCGSObject.createNewHeader();


            //saves the new course
            saveCourseCGSObject(newCourseCGSObject);
            courseCGSObject.setEditioned(lastModified);
            //saves the source course .
            saveCourseCGSObject(courseCGSObject);
            jobService.updateJobProgress(jobId, "course", 100, Job.Status.COMPLETED);
        } catch (TransactionException e) {
            throw e;
            //don't EVER!!! override TransactionException exceptions
        } catch (Exception e) {
            logger.error(e);
            throw new DsException(String.format("Failed doing fullCourseCopy for the course: %s", courseId), e);
        } finally {
            lockService.removeLocksOnCourse(courseId, publisherId, LockServiceImpl.systemLockUser);
            if (rc) {
                transactionService.stopTransaction(courseId, LockServiceImpl.systemLockUser.getUserName());
            }
        }
        return newCourseId;
    }

    private int calcProgress(int tocItemsCount, int tocItemsSize, int lessonDataCount, int totalLessonData) {
        int finishedTocItemsPercentage;
        int finishedDataInCurrentTocItem;
        int finishedDataPartInCalculation;
        if (tocItemsCount == tocItemsSize && lessonDataCount == totalLessonData)
            return 100;
        finishedTocItemsPercentage = calcPercent(tocItemsCount - 1, tocItemsSize);
        finishedDataInCurrentTocItem = calcPercent(lessonDataCount, totalLessonData);
        finishedDataPartInCalculation = finishedDataInCurrentTocItem / tocItemsSize;
        return (finishedTocItemsPercentage + finishedDataPartInCalculation);
    }

    private int calcPercent(int part, int total) {
        if (total > 0) {
            return part * 100 / total;
        }
        return 0;
    }
}
