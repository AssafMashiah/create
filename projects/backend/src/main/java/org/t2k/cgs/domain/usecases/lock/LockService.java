package org.t2k.cgs.domain.usecases.lock;

import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.LockException;
import org.t2k.cgs.domain.model.lock.Lock;
import org.t2k.cgs.domain.model.lock.LockAction;
import org.t2k.cgs.domain.model.lock.LockUser;
import org.t2k.cgs.domain.model.ContentItemBase;
import org.t2k.cgs.domain.usecases.packaging.PackagerUser;

import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 30/10/12
 * Time: 16:28
 */
public interface LockService {

    LockUser systemLockUser = new LockUser(PackagerUser.PACKAGE_USERNAME, PackagerUser.PACKAGE_F_NAME,
            PackagerUser.PACKAGE_L_NAME, PackagerUser.PACKAGE_EMAIL, -1);

    /**
     * Returns all active locks on all entities of the given publisher
     *
     * @return locks list
     * @throws DsException
     */
    List<Lock> getLocks(int publisherId) throws DsException;

    void assignLocksEntityNames(List<Lock> locks) throws DsException;

    /**
     * request for a lock on a content by a user
     *
     * @param contentItem
     * @param user        user that registers the lock
     * @throws DsException   , LockException
     * @throws LockException thrown when the lock can not be acquired due to
     *                       an active lock by other user.
     */
    void acquireLock(ContentItemBase contentItem, LockUser user) throws DsException;

    /**
     * Requests to release a lock on a content item.
     *
     * @param contentItem
     * @param user        user that registers the lock
     * @throws DsException
     * @throws LockException thrown when the user is not the locker of the item
     */
    void releaseLock(ContentItemBase contentItem, LockUser user) throws DsException;

    /**
     * Requests to release a lock on a content item. does not check if the item
     * is locked by other user.
     *
     * @param entityId - entity ID to release
     */
    void forceReleaseLock(String entityId) throws DsException;

    /***
     * Returns true if there is a lock concerning the content item
     * @param contentItem
     * @return
     */
    boolean isContentItemLocked(ContentItemBase contentItem);

    /**
     * returns the Lock object on the content item.
     *
     * @param contentItem
     * @return Lock when has a lock object or NULL when non.
     * @throws DsException
     */
    Lock getLock(ContentItemBase contentItem) throws DsException;

    /**
     * returns the Lock object on the content item.
     *
     * @param entityId
     * @return Lock when has a lock object or NULL when non.
     * @throws DsException
     */
    Lock getLock(String entityId) throws DsException;

    /***
     * @param courseId - course ID
     * @return true iff course is locked
     */
    boolean isCourseLocked(String courseId);

    /**
     * Check if the given user is the owner locker of the ContentItem
     *
     * @param contentItem
     * @param user        - user name to check
     * @throws DsException
     * @throws LockException if the user is not the lock owner
     */
    void validateLocker(ContentItemBase contentItem, LockUser user) throws DsException;

    void handleLockRequest(ContentItemBase contentItem, LockUser user, LockAction lockAction, Date lastModifiedDate) throws DsException;

    /**
     * Returns Lock objects by the provided entitiesIds
     *
     * @param entitiesIds
     * @return list of locks
     * @throws DsException
     * @throws LockException
     */
    List<Lock> getLocks(List<String> entitiesIds) throws DsException;

    List<Lock> getAllLocks() throws DsException;

    /**
     * removes the locks that owned by the userName - from a list of locksIds
     *
     * @param userName         - user name to check
     * @param locksEntitiesIds - the collection of which the the owner might have a lock
     * @throws DsException
     */
    void removeAllLocksOfUserOnEntities(String userName, List<String> locksEntitiesIds);

    /**
     * removes all locks of the given user
     *
     * @param userName - user name to check
     * @throws DsException
     */
    void removeAllLocksOfUser(String userName) throws DsException;

    /**
     * check if there is a lock on course or it's lessons , if true- throws an exception (with the locks data),
     * if false - tries to own a lock on all the contents by the system
     *
     * @return a list of content ids (cids) locked
     * @throws DsException
     */
    List<String> checkAndAcquireLocksOnCourse(int publisherId, String courseId, LockUser lockUser) throws DsException;

    List<Lock> checkOtherUsersLocksOnCourse(int publisherId, String courseId, LockUser lockUser) throws DsException;

    List<Lock> checkNonSystemUsersLocksOnCourse(int publisherId, String courseId) throws DsException;

    /**
     * check if there is a lock on courses of a publisher (lesson are ignored) , if true- throws an exception (with the locks data),
     * if false - tries to own a lock on all the courses by the provided user
     *
     * @throws DsException
     */
    void checkAndAcquireLocksOnPublisher(int publisherId, LockUser lockUser) throws DsException;

    void removeLocksOnCourse(String courseId, int publisherId, LockUser lockUser) throws DsException;

    /**
     * Removes the locks for the given entities ids obtained by the given user
     *
     * @param entitiesIds
     * @param lockUser
     */
    void removeLocks(List<String> entitiesIds, LockUser lockUser);
}