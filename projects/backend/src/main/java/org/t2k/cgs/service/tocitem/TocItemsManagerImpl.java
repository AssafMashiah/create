package org.t2k.cgs.service.tocitem;

import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.t2k.cgs.persistence.springrepository.CourseRepository;
import org.t2k.cgs.persistence.springrepository.AssessmentRepository;
import org.t2k.cgs.persistence.springrepository.LessonRepository;
import org.t2k.cgs.domain.usecases.tocitem.TocItemDataService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemsManager;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.LockException;
import org.t2k.cgs.domain.model.exceptions.ResourceNotFoundException;
import org.t2k.cgs.domain.usecases.lock.LockService;
import org.t2k.cgs.domain.model.lock.LockUser;
import org.t2k.cgs.domain.model.ContentItemBase;
import org.t2k.cgs.domain.model.Header;
import org.t2k.cgs.domain.model.cleanup.CleanupJob;
import org.t2k.cgs.domain.model.cleanup.CleanupType;
import org.t2k.cgs.domain.model.course.Course;
import org.t2k.cgs.domain.model.course.CourseTocItemRef;
import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.cgs.domain.model.tocItem.*;
import org.t2k.cgs.domain.model.user.CGSAccount;
import org.t2k.cgs.domain.model.user.CGSUserDetails;

import javax.inject.Inject;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 6/10/13
 * Time: 10:41 AM
 */
@Service
public class TocItemsManagerImpl implements TocItemsManager {

    private static Logger logger = Logger.getLogger(TocItemsManagerImpl.class);

    private TocItemDataService lessonsDataService;
    private TocItemDataService assessmentsDataService;
    private LessonRepository lessonRepository;
    private AssessmentRepository assessmentRepository;
    private CourseRepository courseRepository;
    private LockService lockService;

    @Inject
    public TocItemsManagerImpl(TocItemDataService lessonsDataServiceBean,
                               TocItemDataService assessmentsDataServiceBean,
                               LessonRepository lessonRepository,
                               AssessmentRepository assessmentRepository,
                               CourseRepository courseRepository,
                               LockService lockService) {
        Assert.notNull(lessonsDataServiceBean);
        Assert.notNull(assessmentsDataServiceBean);
        Assert.notNull(lessonRepository);
        Assert.notNull(assessmentRepository);
        Assert.notNull(courseRepository);
        Assert.notNull(lockService);

        this.lessonsDataService = lessonsDataServiceBean;
        this.assessmentsDataService = assessmentsDataServiceBean;
        this.lessonRepository = lessonRepository;
        this.assessmentRepository = assessmentRepository;
        this.courseRepository = courseRepository;
        this.lockService = lockService;
    }

    @Override
    public TocItemDataService getServiceByType(String type) {
        return getServiceByType(EntityType.forName(type));
    }

    public TocItemDataService getServiceByType(EntityType type) {
        if (EntityType.LESSON == type) {
            return this.lessonsDataService;
        } else if (EntityType.ASSESSMENT == type) {
            return this.assessmentsDataService;
        } else {
            throw new RuntimeException("API called with wrong type, must be 'lesson' or 'assessment'");
        }
    }

    @Override
    public List<TocItemCGSObject> getByCourse(int publisherId, String courseId, boolean isPropertiesOnly) throws DsException {
        logger.info(String.format("getByCourse. publisherId: %d, courseId: %s, isPropertiesOnly: %s", publisherId, courseId, isPropertiesOnly));
        List<TocItemCGSObject> combinedList = new LinkedList<>();
        combinedList.addAll(this.lessonsDataService.getByCourse(publisherId, courseId, isPropertiesOnly));
        combinedList.addAll(this.assessmentsDataService.getByCourse(publisherId, courseId, isPropertiesOnly));
        Course course = courseRepository.findByPublisherIdAndCourseId(publisherId, courseId);
        if (course != null) { // course has been removed during the delete process
            List<String> tocItemsOnCourse = course.getTocItemsRefs().stream()
                    .map(CourseTocItemRef::getCid)
                    .collect(Collectors.toList());
            combinedList = combinedList.stream()
                    .filter(tocItem -> tocItemsOnCourse.contains(tocItem.getContentId()))
                    .collect(Collectors.toList());
        }
        return combinedList;
    }

    @Override
    public List<TocItem> getByCourse(int publisherId, String courseId) {
        logger.info(String.format("Retrieving toc items for publisherId: %d, courseId: %s", publisherId, courseId));
        List<TocItem> combinedList = new LinkedList<>();
        List<String> tocItemsOnCourse = courseRepository.findByPublisherIdAndCourseId(publisherId, courseId)
                .getTocItemsRefs().stream()
                .map(CourseTocItemRef::getCid)
                .collect(Collectors.toList());
        combinedList.addAll(this.lessonRepository.findByPublisherIdAndCourseIdAndCidIn(publisherId, courseId, tocItemsOnCourse));
        combinedList.addAll(this.assessmentRepository.findByPublisherIdAndCourseIdAndCidIn(publisherId, courseId, tocItemsOnCourse));
        return combinedList;
    }

    @Override
    public List<TocItemCGSObject> getContentItemBases(int publisherId, List<String> tocItemCIds, String courseId) {
        logger.info(String.format("getContentItemBases publisherId: %d courseId: %s", publisherId, courseId));
        List<TocItemCGSObject> combinedList = new LinkedList<>();
        combinedList.addAll(this.lessonsDataService.getContentItemBases(publisherId, tocItemCIds, courseId));
        combinedList.addAll(this.assessmentsDataService.getContentItemBases(publisherId, tocItemCIds, courseId));
        return combinedList;
    }

    @Override
    public ContentItemBase getContentItemBase(String tocItemId) throws DsException {
        logger.info(String.format("getContentItemBase. tocItemId: %s", tocItemId));
        ContentItemBase foundItem;
        foundItem = this.lessonsDataService.getContentItemBase(tocItemId);
        return foundItem;
    }

    @Override
    public TocItem get(int publisherId, String courseId, String tocItemCid, EntityType type) {
        logger.info(String.format("publisherId: %d, courseId: %s, tocItemCid: %s, type: %s", publisherId, courseId, tocItemCid, type));
        switch (type) {
            case LESSON:
                return lessonsDataService.get(publisherId, tocItemCid, courseId);
            case ASSESSMENT:
                return assessmentsDataService.get(publisherId, tocItemCid, courseId);
            default:
                throw new IllegalArgumentException("Unsupported toc item type: " + type);
        }
    }

    @Override
    public TocItemCGSObject get(int publisherId, String tocItemCid, String courseId, Date lastModified, boolean isPropertiesOnly) throws DsException {
        logger.info(String.format("get. publisherId: %d, tocItemCid: %s, courseId: %s, isPropertiesOnly: %s", publisherId, tocItemCid, courseId, isPropertiesOnly));
        TocItemCGSObject foundItem;
        try {
            foundItem = this.lessonsDataService.get(publisherId, tocItemCid, courseId, lastModified, isPropertiesOnly);
        } catch (ResourceNotFoundException e) {
            //If item not found in lessons, maybe it's an assessment
            foundItem = this.assessmentsDataService.get(publisherId, tocItemCid, courseId, lastModified, isPropertiesOnly);
        }

        return foundItem;
    }

    @Override
    public List<TocItemIndicationForScorm> getTocItemsWithHiddenIndication(String courseId, List<String> tocItemsIds) throws DsException {
        logger.info(String.format("getTocItemsWithHiddenIndication. courseId: %s", courseId));
        List<TocItemIndicationForScorm> tocItemsWithHiddenIndication = lessonsDataService.getTocItemsWithHiddenIndication(courseId, tocItemsIds);
        tocItemsWithHiddenIndication.addAll(assessmentsDataService.getTocItemsWithHiddenIndication(courseId, tocItemsIds));

        if (tocItemsIds.size() != tocItemsWithHiddenIndication.size()) {
            String errorMsg = "Some of the toc items ids weren't found.";
            logger.error(errorMsg);
            throw new DsException(errorMsg);
        }

        return tocItemsWithHiddenIndication;
    }

    @Override
    public void delete(TocItemCGSObject tocItemCGSObject) throws DsException {
        logger.info(String.format("delete tocItemCGSObject. Toc item id: %s", tocItemCGSObject.getEntityId()));
        if (tocItemCGSObject.getEntityType() == EntityType.LESSON) {
            this.lessonsDataService.delete(tocItemCGSObject);
        } else if (tocItemCGSObject.getEntityType() == EntityType.ASSESSMENT) {
            this.assessmentsDataService.delete(tocItemCGSObject);
        } else {
            throw new DsException(String.format("Toc item provided to delete is not a lesson or assessment, real value: %s", tocItemCGSObject.getEntityType()));
        }
    }

    @Override
    public Header saveContents(int publisherId, String courseId, TocItem tocItem, List<Sequence> sequences,
                               CGSUserDetails currentCgsUserDetails, String type) throws Exception {
        TocItemDataService service = getServiceByType(type);
        boolean isSaveCompletedSuccessfully = false;
        String tocItemCid = tocItem.getContentId();

        try {
            if (logger.isDebugEnabled()) {
                logger.debug(String.format("saveContents started. courseId: %s, tocItemCid: %s", courseId, tocItemCid));
            }

            tocItem = service.save(tocItem, new LockUser(currentCgsUserDetails)); //save order matters - if user doesn't own TocItem, the process will throw an Exception.
            service.saveSequences(sequences);
            isSaveCompletedSuccessfully = true;
            logger.debug(String.format("saveContents finished. courseId: %s, tocItemCid: %s", courseId, tocItemCid));
            return tocItem.getContentData().getHeader();
        } catch (LockException e) {
            logger.warn(String.format("saveContents aborted. TocItem with Cid: %s was locked by another user.", tocItemCid), e);
            throw e;
        } catch (Exception e) {
            logger.error(String.format("saveContents error for TocItem with Cid: %s.", tocItemCid), e);
            throw e;
        } finally { // Add cleanup job after toc item was saved successfully in order to perform the cleanup action asynchronously.
            if (isSaveCompletedSuccessfully) {
                try {
                    ContentItemBase contentItemBase = service.getContentItemBase(publisherId, tocItemCid, courseId); // We need the Mongo's id because
                    // the lock we check later for lessons cleanup uses it.
                    CleanupJob cleanupJob = new CleanupJob(publisherId, courseId, tocItemCid, contentItemBase.getEntityId(), CleanupType.LESSON);
                    service.addCleanupJob(cleanupJob);
                } catch (Exception e) {
                    logger.error(String.format("Failed to create a cleanup job for tocItemId: %s, courseId: %s, publisherId: %s.", tocItemCid, courseId, publisherId), e);
                }
            }
        }
    }

    public void tocItemCleanUp(String courseId, TocItemCGSObject tocItem, String type, CGSUserDetails userDetails) throws DsException {
        TocItemDataService service = getServiceByType(type);
        Date deletionDate = new Date();
        String tocItemId = tocItem.getContentId();
        LockUser lockUser = new LockUser(userDetails);
        if (lockService.isContentItemLocked(tocItem)) { // if the tocItem is locked - return and don't proceed with cleanup
            return;
        }

        lockService.acquireLock(tocItem, lockUser);
        try {
            HashSet<String> sequencesThatAreNotConnectedToLessonByManifest = new HashSet<>();
            DBCursor allSequencesConnectedToCourseAndLesson = service.getSequencesCursor(Collections.singletonList(tocItem.getContentId()), courseId);
            logger.debug(String.format("Total number of sequences connected to lesson %s in DB is: %s",
                    tocItem.getContentId(), allSequencesConnectedToCourseAndLesson.size()));
            DBObject lesson = tocItem.getContentData();
            String resources = lesson.get("resources").toString(); // TODO: (in the future) get a hashSet of all resources' IDs and compare with them instead

            while (allSequencesConnectedToCourseAndLesson.hasNext()) {
                String seqId = allSequencesConnectedToCourseAndLesson.next().get("seqId").toString();
                if (!resources.contains(seqId)) {
                    sequencesThatAreNotConnectedToLessonByManifest.add(seqId);
                }
            }

            if (!sequencesThatAreNotConnectedToLessonByManifest.isEmpty()) {
                List<List<String>> partitions = getListOfPartitionedSequencesIdsLists(sequencesThatAreNotConnectedToLessonByManifest);
                for (List<String> listOfSequencesIdsToBeModified : partitions) {
                    service.updateDeletionDateForSequencesByCourseIdLessonIdAndSequencesIds(courseId, tocItemId, listOfSequencesIdsToBeModified, deletionDate);
                }
            }

            logger.debug(String.format("Total number of sequences that were disconnected from %s %s is: %s", type, tocItemId, sequencesThatAreNotConnectedToLessonByManifest.size()));
            logger.debug(String.format("Updated unrelated sequences with a new deletion date: %s", deletionDate));


        } catch (DsException e) {
            logger.error(String.format("Failed to cleanup required sequences for TocItem: %s, type: %s", tocItemId, type));
            throw e;
        } finally {
            lockService.releaseLock(tocItem, lockUser);
        }
    }

    @Override
    public List<TocItemCGSObject> getOnlyNameAndIdsByCourseOfNonHiddenItems(int publisherId, String courseId, String tocItemContentType) throws DsException {
        logger.info(String.format("getOnlyNameAndIdsByCourseOfNonHiddenItems publisherId: %d, courseId: %s", publisherId, courseId));
        String LESSON = "lesson";
        String ASSESSMENT = "assessment";
        // if the tocItemContentType == "lesson", take only lessons. if it is "assessment" take only assessments.
        // if it is null - take both

        List<TocItemCGSObject> combinedList = new LinkedList<>();
        if (tocItemContentType == null) {
            combinedList.addAll(this.lessonsDataService.getOnlyNameAndIdsByCourseOfNonHiddenItems(publisherId, courseId));
            combinedList.addAll(this.assessmentsDataService.getOnlyNameAndIdsByCourseOfNonHiddenItems(publisherId, courseId));

        } else if (tocItemContentType.equals(LESSON)) {
            combinedList.addAll(this.lessonsDataService.getOnlyNameAndIdsByCourseOfNonHiddenItems(publisherId, courseId));
        } else if (tocItemContentType.equals(ASSESSMENT)) {
            combinedList.addAll(this.assessmentsDataService.getOnlyNameAndIdsByCourseOfNonHiddenItems(publisherId, courseId));
        } else {
            throw new DsException("tocItemContentType must be with value: lesson OR assessment");
        }

        return combinedList;
    }

    @Override
    public boolean isPublisherAuthorizedToCreateLesson(CGSAccount publisher, TocItemCGSObject lesson) {
        if (lesson.getEntityType() != EntityType.LESSON) {
            throw new IllegalArgumentException("toc item is not a lesson");
        }
        Format format = Format.valueOf((String) lesson.getContentData().get("format"));
        switch (format) {
            case EBOOK:
                return publisher.getAccountCustomization().isEnableBookAlive();
            case NATIVE:
                return publisher.getAccountCustomization().isEnableBornDigital();
        }
        return false;
    }

    @Override
    public boolean isPublisherAuthorizedToCreateAssessment(CGSAccount publisher, TocItemCGSObject assessment) {
        if (assessment.getEntityType() != EntityType.ASSESSMENT) {
            throw new IllegalArgumentException("toc item is not an assessment");
        }
        return publisher.getAccountCustomization().isEnableAssessment();
    }

    private List<List<String>> getListOfPartitionedSequencesIdsLists(HashSet<String> sequencesThatAreNotConnectedToLessonByManifest) {
        int numOfSequencesThatAreNotConnectedToLesson = sequencesThatAreNotConnectedToLessonByManifest.size();
        List<String> sequencesThatAreNotConnectedToLessonList = Arrays.asList(sequencesThatAreNotConnectedToLessonByManifest.toArray(new String[numOfSequencesThatAreNotConnectedToLesson]));
        int partitionSize = 1000; //TODO: Need to verify that we can use large numbers here for chunks.
        List<List<String>> partitions = new LinkedList<>();
        for (int i = 0; i < sequencesThatAreNotConnectedToLessonByManifest.size(); i += partitionSize) {
            partitions.add(sequencesThatAreNotConnectedToLessonList.subList(i, i + Math.min(partitionSize, numOfSequencesThatAreNotConnectedToLesson - i)));
        }
        return partitions;
    }

    @Override
    public void save(TocItemCGSObject tocItem, LockUser lockUser) throws DsException, IOException {
        logger.info("save");
        if (tocItem.getEntityType() == EntityType.LESSON) {
            this.lessonsDataService.save(tocItem, lockUser);
        } else if (tocItem.getEntityType() == EntityType.ASSESSMENT) {
            this.assessmentsDataService.save(tocItem, lockUser);
        } else {
            throw new DsException(String.format("tocItem provided to save is not a lesson or assessment, real value: %s", tocItem.getEntityType()));
        }
    }
}
