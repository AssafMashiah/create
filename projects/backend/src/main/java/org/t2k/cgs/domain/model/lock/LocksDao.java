package org.t2k.cgs.domain.model.lock;

import org.springframework.dao.DataAccessException;
import org.t2k.cgs.domain.model.utils.GenericDaoOperations;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.lock.Lock;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 01/11/12
 * Time: 10:19
 */
public interface LocksDao extends GenericDaoOperations{

    /**
     * Returns all active locks on all entities of the given publisher
     *
     * @return
     * @throws org.t2k.cgs.domain.model.exceptions.DsException
     */
    List<Lock> getLocks(int publisherId) throws DataAccessException;

    List<Lock> getAllLocks() throws DataAccessException;

    /**
     * insert a new lock on a content
     *
     * @param lock
     * @return
     * @throws DsException , LockException
     * @throws org.t2k.cgs.domain.model.exceptions.LockException thrown when the lock can not be acquired due to
     * an active lock by other user.
     */
    void insertLock(Lock lock) throws DataAccessException;

    /**
     * Requests to release a lock on a content item.
     *
     *
     * @param lock@throws LockException  thrown when the user is not the locker of the item
     */
    void removeUserLock(Lock lock) throws DataAccessException;

    /**
     * Requests to release a lock on a content item. does not check if the item
     * is locked by other user.
     *
     * @param entityId
     */
    void forceRemoveLock(String entityId) throws DataAccessException;

    /**
     * returns the Lock object on the content item.
     *
     *
     * @param entityId
     * @throws DsException
     */
    Lock getLock(String entityId) throws DataAccessException;

    List<Lock> getLocks(List<String> entitiesIds) throws DataAccessException;

    void removeAllLocksOfUserOnEntities(String userName, List<String> entitiesIds);

    void removeAllLocksOfUser(String userName) throws DataAccessException;

    void removeAllSystemLocks() throws DataAccessException;

    void removeAllLocks() throws DataAccessException;
}