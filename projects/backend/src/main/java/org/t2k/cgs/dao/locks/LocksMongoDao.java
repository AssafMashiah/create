package org.t2k.cgs.dao.locks;

import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.t2k.cgs.dao.MongoDao;
import org.t2k.cgs.locks.Lock;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 01/11/12
 * Time: 10:21
 */
@Component
public class LocksMongoDao extends MongoDao implements LocksDao {

    //LOCKS COLLECTION NAME IN MONGODB
    protected static final String LOCKS_COLLECTION = "locks";
    public static final String ENTITY_ID = "entityId";

    @Override
    public List<Lock> getLocks(int publisherId) throws DataAccessException {
        Query query = new Query(Criteria.where(Lock.DB_PUBLISHER_ID).is(publisherId));
        return getMongoTemplate().find(query, Lock.class, LOCKS_COLLECTION);
    }

    @Override
    public List<Lock> getAllLocks() throws DataAccessException {
        return getMongoTemplate().findAll(Lock.class, LOCKS_COLLECTION);
    }

    @Override
    public void insertLock(Lock lock) throws DataAccessException {
        getMongoTemplate().insert(lock, LOCKS_COLLECTION);
    }

    @Override
    public void removeUserLock(Lock lock) throws DataAccessException {
        Query query = new Query(Criteria.where(ENTITY_ID).is(lock.getEntityId()).
                and(Lock.DB_USERNAME).is(lock.getUserName()));

        getMongoTemplate().remove(query, LOCKS_COLLECTION);
    }

    @Override
    public void forceRemoveLock(String entityId) throws DataAccessException {
        Query query = new Query(Criteria.where(ENTITY_ID).is(entityId));
        getMongoTemplate().remove(query, LOCKS_COLLECTION);
    }

    @Override
    public Lock getLock(String entityId) throws DataAccessException {
        Query query = new Query(Criteria.where(ENTITY_ID).is(entityId));
        return getMongoTemplate().findOne(query, Lock.class, LOCKS_COLLECTION);
    }

    @Override
    public List<Lock> getLocks(List<String> entitiesIds) throws DataAccessException {
        Query query = new Query(Criteria.where(ENTITY_ID).in(entitiesIds));
        return getMongoTemplate().find(query, Lock.class, LOCKS_COLLECTION);
    }

    @Override
    public void removeAllLocksOfUserOnEntities(String userName, List<String> entitiesIds) {
        Query query = new Query(Criteria.where(ENTITY_ID).in(entitiesIds).and("userName").is(userName));
        getMongoTemplate().remove(query, LOCKS_COLLECTION);
    }

    @Override
    public void removeAllLocksOfUser(String userName) throws DataAccessException {
        Query query = new Query(Criteria.where("userName").is(userName));
        getMongoTemplate().remove(query, LOCKS_COLLECTION);
    }

    @Override
    public void removeAllSystemLocks() throws DataAccessException {
        Query query = new Query(Criteria.where("userName").regex("^system.*$", "i")); // Case insensitive search regex
        getMongoTemplate().remove(query, LOCKS_COLLECTION);
    }

    @Override
    public void removeAllLocks() throws DataAccessException {
        Query query = new Query();
        getMongoTemplate().remove(query, LOCKS_COLLECTION);
    }

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
        throw new IllegalAccessError();
    }
}
