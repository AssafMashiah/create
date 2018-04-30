package org.t2k.cgs.persistence.lock.tests;

import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Query;
import org.t2k.cgs.persistence.dao.LocksMongoDao;
import org.t2k.cgs.domain.model.utils.GenericDaoOperations;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 05/11/12
 * Time: 09:58
 */
public class LocksMongoTestDao extends LocksMongoDao implements GenericDaoOperations {

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
        collectionName = collectionName != null ? collectionName : LOCKS_COLLECTION;
        getMongoTemplate().remove(new Query(), collectionName);
    }
}
