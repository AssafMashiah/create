package org.t2k.cgs.lock;

import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.t2k.cgs.dao.applets.AppletDao;
import org.t2k.cgs.dao.courses.CoursesDao;
import org.t2k.cgs.dao.locks.LocksDao;
import org.t2k.cgs.dao.tocItem.TocItemsMongoDao;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.dataServices.exceptions.*;
import org.t2k.cgs.locks.Lock;
import org.t2k.cgs.locks.LockAction;
import org.t2k.cgs.locks.LockUser;
import org.t2k.cgs.model.ContentItemBase;
import org.t2k.cgs.model.SimpleContentItem;
import org.t2k.cgs.model.applet.AppletManifest;
import org.t2k.cgs.model.course.Course;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.model.course.CourseTocItemRef;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.packaging.PackagerUser;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 01/11/12
 * Time: 10:15
 */
@Service
public class LockServiceImpl implements LockService {

    private static Logger logger = Logger.getLogger(LockServiceImpl.class);
    public static final LockUser systemLockUser = new LockUser(PackagerUser.PACKAGE_USERNAME, PackagerUser.PACKAGE_F_NAME,
            PackagerUser.PACKAGE_L_NAME, PackagerUser.PACKAGE_EMAIL, -1);

    private LocksDao locksDao;
    private CoursesDao coursesDao;
    private TocItemsMongoDao lessonsDao;
    private TocItemsMongoDao assessmentsDao;
    private AppletDao appletDao;

    @Inject
    public LockServiceImpl(LocksDao locksDao,
                           CoursesDao coursesDao,
                           TocItemsMongoDao lessonsDao,
                           TocItemsMongoDao assessmentsDao,
                           AppletDao appletDao) {
        Assert.notNull(locksDao);
        Assert.notNull(coursesDao);
        Assert.notNull(lessonsDao);
        Assert.notNull(assessmentsDao);

        this.locksDao = locksDao;
        this.coursesDao = coursesDao;
        this.lessonsDao = lessonsDao;
        this.assessmentsDao = assessmentsDao;
        this.appletDao = appletDao;
    }

    /**
     * An initiation method to setup the manager resources.
     */
    @PostConstruct
    public void init() {
        logger.info("Init Lock Service...");
        try {
            locksDao.removeAllSystemLocks();
        } catch (DataAccessException e) {
            String msg = "init: Problem when removing locks. Some courses and toc items might be locked.";
            logger.error(msg);
            throw new InitServiceException(msg);
        }
    }

    @Override
    public void handleLockRequest(ContentItemBase contentItem, LockUser user, LockAction lockAction, Date lastModifiedDate) throws DsException {
        //TODO: remove condition when client starts to use ....ophir/
        if (lastModifiedDate != null) {
            validateLockContentDates(contentItem, lastModifiedDate);
        }

        switch (lockAction) {
            case ACQUIRE: {
                acquireLock(contentItem, user);
                break;
            }
            case RELEASE: {
                releaseLock(contentItem, user);
                break;
            }
            default:
                throw new DsException(String.format("Unknown locking request. = %s", lockAction));
        }
    }

    private void validateLockContentDates(ContentItemBase contentItem, Date lastModifiedDate) throws DsException {
        Date storedModifiedDate = contentItem.getLastModified();

        if (storedModifiedDate != null && !storedModifiedDate.equals(lastModifiedDate)) {
            throw new ConflictException(contentItem.getContentId(), String.format("The content to lock is not in sync , date: %s", storedModifiedDate));
        }
    }

    @Override
    public List<Lock> getLocks(int publisherId) throws DsException {
        List<Lock> locks = new ArrayList<Lock>();
        try {
            locks = locksDao.getLocks(publisherId);
            assignLocksEntityNames(locks);
        } catch (DataAccessException e) {
            throw new DsException(e);
        }
        return locks;
    }

    @Override
    public List<Lock> getLocks(List<String> entitiesIds) throws DsException {
        List<Lock> locks = locksDao.getLocks(entitiesIds);
        assignLocksEntityNames(locks);
        return locks;
    }

    @Override
    public List<Lock> getAllLocks() throws DsException {
        try {
            return locksDao.getAllLocks();
        } catch (DataAccessException e) {
            throw new DsException(e);
        }
    }

    @Override
    public void assignLocksEntityNames(List<Lock> locks) throws DsException {
        for (Lock lock : locks) {
            ContentItemBase contentItemBase = null;
            if (EntityType.COURSE == lock.getEntityType()) {
                contentItemBase = coursesDao.getContentItemBase(lock.getEntityId());
            } else if (EntityType.LESSON == lock.getEntityType()) {
                contentItemBase = lessonsDao.getContentItemBase(lock.getEntityId());
                contentItemBase = (contentItemBase == null)
                        ? assessmentsDao.getContentItemBase(lock.getEntityId())
                        : contentItemBase;
            }
            if (contentItemBase != null) {
                lock.setEntityName(contentItemBase.getTitle());
            }
        }
    }

    @Override
    public void acquireLock(ContentItemBase contentItem, LockUser user) throws DsException {
        Lock lockRequest = createLockObject(contentItem, user);
        try {
            locksDao.insertLock(lockRequest);
            if (logger.isDebugEnabled()) {
                logger.debug(String.format("acquireLock success. user :%s item: %s cid: %s",
                        user.getUserName(), contentItem.getEntityType(), contentItem.getEntityId()));
            }
        } catch (DuplicateKeyException e) {
            //check if owned by another user
            Lock currentLocker = getLock(contentItem);
            if (currentLocker != null && !currentLocker.equals(lockRequest)) {
                logger.error(String.format("The acquireLock failed. tried to acquireLock BY: %s Owned BY: %s", user.toString(), currentLocker.toString()));
                throw new LockException(ErrorCodes.CONTENT_IS_LOCKED, Arrays.asList(currentLocker));
            } else {
                logger.debug(String.format("duplicate lock by the same user : %s", currentLocker) != null ? currentLocker.toString() : null);
            }
            logger.debug("Lock is already owned by requester. success.");
        } catch (Exception e) {
            if (logger.isDebugEnabled()) {
                logger.error(String.format("acquireLock failed. user: %s item: %s cid: %s",
                        user.getUserName(), contentItem.getEntityType(), contentItem.getContentId()));
            }
            throw new DsException(e);
        }
    }

    @Override
    public void releaseLock(ContentItemBase contentItem, LockUser user) throws DsException {
        Lock lock = createLockObject(contentItem, user);
        try {
            locksDao.removeUserLock(lock);
            if (logger.isDebugEnabled()) {
                logger.debug(String.format("releaseLock success. user: %s item: %s cid: %s",
                        user.getUserName(), contentItem.getEntityType(), contentItem.getEntityId()));
            }
        } catch (DataAccessException e) {
            logger.error(String.format("releaseLock failed. user: %s item: %s cid: %s",
                    user.getUserName(), contentItem.getEntityType(), contentItem.getContentId()), e);
            //handling a dao problem
            throw new DsException(e);
        }
        ///////////////////////////////////////////////////////////////////////
        //Check success logic.
        //object. (THIS LAST USER
        //if after remove, there is a lock; it means that the lock is
        //owned by another user.
        //this scenario should not happen because the unlock should be done
        //by the lock owner. Unless:
        // 1.If the releaseLock happened by admin and another user took the lock.
        // 2.If between the removeUserLock() and getLock()- another user took the lock.
        ////////////////////////////////////////////////////////////////////////
        Lock currentLock = getLock(contentItem);
        if (currentLock != null) {
            logger.warn(String.format("The release lock failed. tried to release BY : %s Owned BY : %s", user.toString(), currentLock.toString()));
            throw new LockException(ErrorCodes.CONTENT_IS_LOCKED, Arrays.asList(lock));
        }
    }

    @Override
    public void forceReleaseLock(String entityId) throws DsException {
        logger.info(String.format("forceReleaseLock: on content: %s", entityId));
        try {
            locksDao.forceRemoveLock(entityId);
        } catch (DataAccessException e) {
            throw new DsException(e);
        }
    }

    @Override
    public boolean isContentItemLocked(ContentItemBase contentItem) {
        Lock lock = null;
        try {
            lock = locksDao.getLock(contentItem.getEntityId());
        } catch (DataAccessException e) {
            return true;
        }

        return (lock != null);
    }

    @Override
    public boolean isCourseLocked(String courseId) {
        Lock lock = null;
        try {
            lock = locksDao.getLock(courseId);
        } catch (DataAccessException e) {
            return true;
        }

        return (lock != null);
    }

    @Override
    public Lock getLock(ContentItemBase contentItem) throws DsException {
        Lock lock = null;
        try {
            lock = locksDao.getLock(contentItem.getEntityId());
        } catch (DataAccessException e) {
            throw new DsException(e);
        }

        return lock;
    }

    @Override
    public Lock getLock(String entityId) throws DsException {
        Lock lock = null;
        try {
            lock = locksDao.getLock(entityId);
        } catch (DataAccessException e) {
            throw new DsException(e);
        }

        return lock;
    }

    @Override
    public void validateLocker(ContentItemBase contentItem, LockUser user) throws DsException {
        if (logger.isDebugEnabled()) {
            logger.debug(String.format("validateLocker: contentItem: %s user: %s", contentItem.getContentId(), user.getUserName()));
        }

        if (contentItem.getEntityId() == null) {
            logger.debug("validateLocker(): the entity Id is NULL, therefor no lock should be validated.");
        }

        Lock currentLocker = getLock(contentItem);
        Lock validatedRequest = createLockObject(contentItem, user);

        //check for new course
        if (contentItem.getLastModified() == null) {
            if (currentLocker == null || currentLocker.equals(validatedRequest)) {
                //valid
                if (logger.isDebugEnabled()) {
                    logger.debug(String.format("validateLocker. OK  -valid NEW content. the request for user: %s\n content item: %s type: %s", user.toString(), contentItem.getContentId(), contentItem.getEntityType().getName()));
                }
            } else {
                //invalid
                logger.info(String.format("validateLocker. FALSE - inValidated NEW content .the request for user: %s\n content item: %s type: %s", user.toString(), contentItem.getContentId(), contentItem.getEntityType().getName()));
                throw new LockException(ErrorCodes.CONTENT_IS_NOT_OWNED_BY_USER, currentLocker != null ? Arrays.asList(currentLocker) : null);
            }
        }
        //check non-new content
        else if (currentLocker == null || !currentLocker.equals(validatedRequest)) {
            //invalid
            logger.info(String.format("validateLocker. FALSE - inValidated the request for user: %s\n content item: %s type: %s", user.toString(), contentItem.getContentId(), contentItem.getEntityType().getName()));
            throw new LockException(ErrorCodes.CONTENT_IS_NOT_OWNED_BY_USER, currentLocker != null ? Arrays.asList(currentLocker) : null);
        }
        //valid
        if (logger.isDebugEnabled()) {
            logger.debug(String.format("validateLocker. OK. the request for user: %s\n content item: %s type: %s", user.toString(), contentItem.getContentId(), contentItem.getEntityType().getName()));
        }
    }

    @Override
    public void removeAllLocksOfUserOnEntities(String userName, List<String> locksEntitiesIds) {
        locksDao.removeAllLocksOfUserOnEntities(userName, locksEntitiesIds);
    }

    @Override
    public void removeAllLocksOfUser(String userName) throws DsException {
        locksDao.removeAllLocksOfUser(userName);
    }

    private Lock createLockObject(ContentItemBase contentItem, LockUser user) {
        return new Lock(contentItem.getEntityId(), contentItem.getContentId(), contentItem.getContentVersionNumber(), contentItem.getEntityType(), user.getUserName(), user.getEmail(), user.getPublisherId(), contentItem.getTitle());
    }

    @Override
    public List<Lock> checkOtherUsersLocksOnCourse(int publisherId, String courseId, LockUser user) throws DsException {
        logger.debug(String.format("checkOtherUsersLocksOnCourse(). courseId:%s", courseId));

        List<ContentItemBase> contentItemBases = getAllCourseContentItemsBases(publisherId, courseId);
        List<String> entitiesIds = new ArrayList<>();
        //add lessons
        for (ContentItemBase contentItemBase : contentItemBases) {
            entitiesIds.add(contentItemBase.getEntityId());
        }

        List<Lock> allLocks = getLocks(entitiesIds);
        List<Lock> otherUsersLocks = new LinkedList<>();
        if (allLocks != null) {
            for (Lock lock : allLocks) {
                if (!lock.getUserName().equals(user.getUserName())) {
                    otherUsersLocks.add(lock);
                }
            }
        }

        if (allLocks != null && !otherUsersLocks.isEmpty()) {
            return otherUsersLocks;
        } else {
            return null;
        }
    }

    @Override
    public List<Lock> checkNonSystemUsersLocksOnCourse(int publisherId, String courseId) throws DsException {
        return checkOtherUsersLocksOnCourse(publisherId, courseId, LockServiceImpl.systemLockUser);
    }

    @Override
    public List<String> checkAndAcquireLocksOnCourse(int publisherId, String courseId, LockUser user) throws DsException {
        logger.debug(String.format("checkAndAcquireLocksOnCourse(). trying to lock courseId: %s", courseId));

        List<ContentItemBase> contentItemBases = getAllCourseContentItemsBases(publisherId, courseId);
        List<String> entitiesIds = new ArrayList<>();
        //add lessons
        for (ContentItemBase contentItemBase : contentItemBases) {
            entitiesIds.add(contentItemBase.getEntityId());
        }

        List<Lock> allLocks = getLocks(entitiesIds);
        List<Lock> otherUsersLocks = new LinkedList<>();
        if (allLocks != null) {
            for (Lock lock : allLocks) {
                if (!lock.getUserName().equals(user.getUserName())) {
                    otherUsersLocks.add(lock);
                }
            }
        }

        if (allLocks != null && !otherUsersLocks.isEmpty()) {
            throw new LockException(ErrorCodes.CONTENT_IS_LOCKED, otherUsersLocks, "Some of the course contents are locked. courseId: " + courseId);
        }

        try {
            lockCourseElements(contentItemBases, user);
        } catch (DsException e) {
            logger.warn("checkAndAcquireLocks: could not lock course entities..  removing the new locks (by system packager)", e);
            removeLocksOnCourse(courseId, publisherId, user);
            throw e;
        }
        logger.debug(String.format("checkAndAcquireLocks(). success. Course %s entity & %d lessons\\assessments are now locked by %s", courseId, contentItemBases.size(), user.getUserName()));
        return entitiesIds;
    }

    @Override
    public void checkAndAcquireLocksOnPublisher(int publisherId, LockUser lockUser) throws DsException {
        logger.debug(String.format("checkAndAcquireLocksOnPublisher(). trying to lock.  .publisherId: %d", publisherId));

        List<CourseCGSObject> courseObjects = coursesDao.getCoursesPropertiesByPublisher(publisherId);
        List<String> entitiesIds = new ArrayList<>();

        //add all course ids to a list
        for (ContentItemBase courseObject : courseObjects) {
            entitiesIds.add(courseObject.getEntityId());
        }

        List<Lock> allLocks = getLocks(entitiesIds);
        List<Lock> otherUsersLocks = new LinkedList<>();

        if (allLocks != null) {
            for (Lock lock : allLocks) {
                if (!lock.getUserName().equals(lockUser.getUserName())) {
                    otherUsersLocks.add(lock);
                }
            }
        }

        if (allLocks != null && !otherUsersLocks.isEmpty()) {
            throw new LockException(ErrorCodes.CONTENT_IS_LOCKED, otherUsersLocks, "Some of the courses are locked. publisherId: " + publisherId);
        }

        try {
            lockCourseElements(courseObjects, lockUser);
        } catch (DsException e) {
            logger.warn("checkAndAcquireLocks: could not lock courses..  removing the new locks (by system packager)", e);
            removeLocks(entitiesIds, lockUser);
            throw e;
        }
        logger.debug(String.format("checkAndAcquireLocks(). success , course entities are locked. publisherId: %d", publisherId));
    }

    private List<ContentItemBase> getAllCourseContentItemsBases(int publisherId, String courseId) {
        List<ContentItemBase> contentItemBases = new ArrayList<>();
        Course course = coursesDao.getCourse(publisherId, courseId);
        List<TocItemCGSObject> tocItemContentItemBases = new LinkedList<>();
        tocItemContentItemBases.addAll(lessonsDao.getContentItemBases(publisherId,
                course.getAllTocItemRefs(EntityType.LESSON).stream()
                        .map(CourseTocItemRef::getCid)
                        .collect(Collectors.toList()),
                courseId));
        tocItemContentItemBases.addAll(assessmentsDao.getContentItemBases(publisherId,
                course.getAllTocItemRefs(EntityType.ASSESSMENT).stream()
                        .map(CourseTocItemRef::getCid)
                        .collect(Collectors.toList()),
                courseId));
        contentItemBases.addAll(tocItemContentItemBases);

        ContentItemBase courseContentItemBase = coursesDao.getContentItemBase(courseId);
        if (courseContentItemBase != null) {    //check for null in case of db inconsistency
            contentItemBases.add(courseContentItemBase);
        }

        AppletManifest appletManifest = appletDao.getAppletsManifestsByCourseId(courseId, null);
        SimpleContentItem appletContentItem = new SimpleContentItem(appletManifest.getCourseId() + "_applet",
                "NA", appletManifest.getCourseId(), EntityType.APPLET_MANIFEST, "Applet Manifest");
        contentItemBases.add(appletContentItem);
        return contentItemBases;
    }

    private void lockCourseElements(List<? extends ContentItemBase> contentItemBases, LockUser user) throws DsException {
        for (ContentItemBase contentItemBase : contentItemBases) {
            acquireLock(contentItemBase, user);
        }
    }

    public void removeLocksOnCourse(String courseId, int publisherId, LockUser lockUser) {
        logger.debug(String.format("removeSystemLocks() courseId:%s", courseId));
        List<String> entitiesIds = new ArrayList<>();
        List<ContentItemBase> allCourseContentItemsBases = getAllCourseContentItemsBases(publisherId, courseId);
        for (ContentItemBase contentItemBase : allCourseContentItemsBases) {
            entitiesIds.add(contentItemBase.getEntityId());
        }
        removeLocks(entitiesIds, lockUser);
    }

    public void removeLocks(List<String> entitiesIds, LockUser lockUser) {
        logger.debug("removeSystemLocks() :");
        removeAllLocksOfUserOnEntities(lockUser.getUserName(), entitiesIds);
    }

    /**
     * Returns a list of all lessonIds and the courseId as entities of the course -- need to change this .
     *
     * @throws DsException
     */
//    private List<String> getAllCourseEntitiesIds(String courseId, String version, int publisherId) throws DsException {
//        List<String> lessonIds = coursesDao.getAllLessonsIdsFromCourse(publisherId, courseId);
//        List<String> entitiesIds = new ArrayList<String>(lessonIds);
//        entitiesIds.add(courseId);
//        return entitiesIds;
//    }
}