package org.t2k.cgs.domain.model.lock;

import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.testng.log4testng.Logger;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 04/11/12
 * Time: 13:10
 */
public class LocksDaoDummy implements LocksDao {

    private static Logger logger=Logger.getLogger(LocksDaoDummy.class);

    private Map<String, Lock> store = new HashMap<>();

    @Override
    public List<Lock> getLocks(int publisherId) throws DataAccessException {
        return new ArrayList<>(store.values());
    }

    @Override
    public List<Lock> getAllLocks() throws DataAccessException {
        return new ArrayList<>(store.values());
    }

    @Override
    public void insertLock(Lock lock) throws DataAccessException {
        if (store.containsKey(lock.getEntityId())) {
            throw new DuplicateKeyException("Key exists:" + lock.getEntityId());
        }
        store.put(lock.getEntityId(), lock);
        logger.info("lock inserted "+lock.toString());
    }

    @Override
    public void removeUserLock(Lock lock) throws DataAccessException {
        if (store.containsKey(lock.getEntityId())) {
            if (store.get(lock.getEntityId()).getUserName().equals(lock.getUserName())) {
                store.remove(lock.getEntityId());
            }
        }
    }

    @Override
    public void forceRemoveLock(String entityId) throws DataAccessException {
        store.remove(entityId);
    }

    @Override
    public Lock getLock(String entityId) throws DataAccessException {
        return store.get(entityId);
    }

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
        store.clear();
    }

    @Override
    public List<Lock> getLocks(List<String> entitiesIds) throws DataAccessException {
        return null;
    }

    @Override
    public void removeAllLocksOfUserOnEntities(String userName, List<String> entitiesIds) throws DataAccessException {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void removeAllLocksOfUser(String userName) throws DataAccessException {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void removeAllSystemLocks() throws DataAccessException {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void removeAllLocks() throws DataAccessException {
        //To change body of implemented methods use File | Settings | File Templates.
    }
}