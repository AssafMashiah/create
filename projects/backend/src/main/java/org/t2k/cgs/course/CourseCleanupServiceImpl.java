package org.t2k.cgs.course;

import org.apache.log4j.Logger;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.t2k.cgs.applet.AppletService;
import org.t2k.cgs.cms.CmsService;
import org.t2k.cgs.course.elasticsearch.CourseSearchService;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.dataServices.exceptions.ErrorCodes;
import org.t2k.cgs.dataServices.exceptions.TransactionException;
import org.t2k.cgs.ebooks.EBookCleanupService;
import org.t2k.cgs.lock.LockService;
import org.t2k.cgs.lock.LockServiceImpl;
import org.t2k.cgs.lock.TransactionService;
import org.t2k.cgs.locks.LockUser;
import org.t2k.cgs.model.ContentItemImpl;
import org.t2k.cgs.model.course.Course;
import org.t2k.cgs.model.course.CourseTocItemRef;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.security.CGSUserDetails;
import org.t2k.cgs.sequences.SequenceService;
import org.t2k.cgs.tocItem.TocItemContentEditor;
import org.t2k.cgs.tocItem.TocItemDataService;
import org.t2k.cgs.tocItem.TocItemsManager;

import javax.inject.Inject;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author Alex Burdusel on 2016-10-13.
 */
@Service(value = "courseCleanupService")
public class CourseCleanupServiceImpl implements CourseCleanupService {

    private static final Logger logger = Logger.getLogger(CourseCleanupServiceImpl.class);

    private final CourseRepository courseRepository;
    private final CourseSearchService courseSearchService;

    private final SequenceService sequenceService;
    private final TocItemsManager tocItemsManager;
    private final AppletService appletService;

    private final EBookCleanupService eBookCleanupService;

    private final CmsService cmsService;

    private final TransactionService transactionService;
    private final LockService lockService;

    @Inject
    public CourseCleanupServiceImpl(CourseRepository courseRepository,
                                    CourseSearchService courseSearchService,
                                    SequenceService sequenceService,
                                    TocItemsManager tocItemsManager,
                                    AppletService appletService,
                                    EBookCleanupService eBookCleanupService,
                                    CmsService cmsService,
                                    TransactionService transactionService,
                                    LockService lockService) {
        Assert.notNull(courseRepository);
        Assert.notNull(courseSearchService);
        Assert.notNull(sequenceService);
        Assert.notNull(tocItemsManager);
        Assert.notNull(appletService);
        Assert.notNull(eBookCleanupService);
        Assert.notNull(cmsService);
        Assert.notNull(transactionService);
        Assert.notNull(lockService);

        this.courseRepository = courseRepository;
        this.courseSearchService = courseSearchService;
        this.sequenceService = sequenceService;
        this.tocItemsManager = tocItemsManager;
        this.appletService = appletService;
        this.eBookCleanupService = eBookCleanupService;
        this.cmsService = cmsService;
        this.transactionService = transactionService;
        this.lockService = lockService;
    }

    @Override
    public void deleteCourse(int publisherId, String courseId) throws DsException {
        if (transactionService.doesCourseHaveTransactions(courseId)) {
            throw new TransactionException(ErrorCodes.CONTENT_IS_TRANSACTION_LOCKED, "");
        }

        logger.debug(String.format("deleteCourse started: publisherId: %d courseId: %s", publisherId, courseId));
        //check and lock
        Course course = courseRepository.findByPublisherIdAndCourseId(publisherId, courseId);
        List<String> lockedEntities = lockService.checkAndAcquireLocksOnCourse(publisherId, courseId, LockServiceImpl.systemLockUser);
        try {
            //first remove the course itself . this will affect the user view of the available courses
            logger.debug(String.format("deleting course doc. courseId: %s", courseId));
            courseRepository.delete(course);
            courseSearchService.delete(courseId);

            List<TocItemCGSObject> tocItems = tocItemsManager.getByCourse(publisherId, courseId, false);
            for (TocItemCGSObject tocItem : tocItems) {
                TocItemContentEditor tocItemEditor = new TocItemContentEditor(tocItem);
                Collection<String> sequencesIdsFromLesson = tocItemEditor.getSequenceCids();
                sequenceService.deleteSequences(new ArrayList(sequencesIdsFromLesson), tocItem.getContentId(), courseId);

                logger.debug(String.format("Deleting tocItem doc. cid: %s", tocItem.getContentId()));
                tocItemsManager.delete(tocItem);
            }
            logger.info(String.format("deleting cms-course assets. courseId: %s", courseId));
            cmsService.deleteCourseContents(courseId, publisherId);
        } catch (Exception e) {
            logger.error("deleteCourse. error: ", e);
            throw new DsException(e);
        }

        lockService.removeLocks(lockedEntities, LockServiceImpl.systemLockUser);
        appletService.deleteAppletManifest(courseId);
        Set<String> ebookIds = course.getEBooksIds();
        if (ebookIds != null && ebookIds.size() > 0) {
            logger.info("Checking if eBooks used on course are needed by other courses");
            ebookIds.forEach(eBookId -> {
                if (courseRepository.findByPublisherIdAndEBookId(publisherId, eBookId).size() == 0) {
                    logger.info(String.format("Ebook %s is no longer used on any course. Removing...", eBookId));
                    eBookCleanupService.removeEBook(eBookId, publisherId);
                }
            });
        }
        logger.info(String.format(" deleteCourse completed. courseId: %s", courseId));
    }

    @Scheduled(cron = "0 0 1 * * 0") // every Sunday at 1:00
    public void removeEmptyCourses() {
        List<CourseLite> emptyCourses = courseRepository.findByLastModified(new Date(0));
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, -7);
        Date oneWeekAgo = calendar.getTime();
        emptyCourses.forEach(course -> {
            if (course.getCreationDate() == null || course.getCreationDate().before(oneWeekAgo)) {
                try {
                    deleteCourse(course.getPublisherId(), course.getCourseId());
                } catch (DsException e) {
                    logger.error(String.format("Failed to delete course %s from publisher %s",
                            course.getCourseId(), course.getPublisherId()), e);
                }
            }
        });
    }

    public void cleanupTocItemsOnCourse(int publisherId, String courseId, CGSUserDetails userDetails) throws DsException {
        if (transactionService.doesCourseHaveTransactions(courseId))
            throw new TransactionException(ErrorCodes.CONTENT_IS_TRANSACTION_LOCKED, "");

        Date deletionDate = new Date();
        LockUser lockUser = new LockUser(userDetails);
        Course course = courseRepository.findByPublisherIdAndCourseId(publisherId, courseId);
        lockService.acquireLock(course, lockUser);

        TocItemDataService lessonService = tocItemsManager.getServiceByType(EntityType.LESSON);
        TocItemDataService assessmentService = tocItemsManager.getServiceByType(EntityType.ASSESSMENT);

        try {
            List<CourseTocItemRef> tocItemRefs = course.getTocItemsRefs();
            Set<String> tocItemsConnectedToCourse = tocItemRefs.stream().map(CourseTocItemRef::getCid).collect(Collectors.toSet());

            List<TocItemCGSObject> allCourseLessons = lessonService.getByCourse(publisherId, courseId, false);
            List<TocItemCGSObject> allCourseAssessments = assessmentService.getByCourse(publisherId, courseId, false);

            List<String> lessonsIdsNotActuallyConnectedToCourse = allCourseLessons.stream()
                    .map(ContentItemImpl::getContentId)
                    .filter(tocItemCid -> !tocItemsConnectedToCourse.contains(tocItemCid))
                    .collect(Collectors.toList());
            List<String> assessmentsIdsNotActuallyConnectedToCourse = allCourseAssessments.stream()
                    .map(ContentItemImpl::getContentId)
                    .filter(tocItemCid -> !tocItemsConnectedToCourse.contains(tocItemCid))
                    .collect(Collectors.toList());

            lessonService.updateDeletionDateOnTocItems(courseId, lessonsIdsNotActuallyConnectedToCourse, deletionDate);
            assessmentService.updateDeletionDateOnTocItems(courseId, lessonsIdsNotActuallyConnectedToCourse, deletionDate);

            updateAllSequencesWithDeletionDate(courseId, deletionDate, lessonsIdsNotActuallyConnectedToCourse);
            updateAllSequencesWithDeletionDate(courseId, deletionDate, assessmentsIdsNotActuallyConnectedToCourse);

            logger.debug(String.format("Total number of lessons that were updated with deletion date is: %s",
                    lessonsIdsNotActuallyConnectedToCourse.size()));
            logger.debug(String.format("Total number of assessments that were updated with deletion date is: %s",
                    assessmentsIdsNotActuallyConnectedToCourse.size()));
            logger.debug(String.format("Updated lessons and assessments with a new deletion date: %s", deletionDate));
        } finally {
            lockService.releaseLock(course, lockUser);
        }
    }

    private void updateAllSequencesWithDeletionDate(String courseId, Date deletionDate, List<String> tocItemsIdsToUpdateWithDeletionDate) throws DsException {
        for (String tocItemId : tocItemsIdsToUpdateWithDeletionDate) {
            sequenceService.updateDeletionDateForSequencesByCourseIdTocItemIdAndSequencesIds(courseId, tocItemId, null, deletionDate);
        }
    }
}
