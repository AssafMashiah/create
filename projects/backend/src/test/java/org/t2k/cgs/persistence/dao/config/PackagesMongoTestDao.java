package org.t2k.cgs.persistence.dao.config;

import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Query;
import org.t2k.cgs.domain.model.utils.GenericDaoOperations;
import org.t2k.cgs.persistence.dao.PackagesMongoDao;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 02/12/12
 * Time: 14:43
 */
public class PackagesMongoTestDao extends PackagesMongoDao implements GenericDaoOperations {

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
        collectionName = collectionName != null ? collectionName : PACKAGES_COLLECTION;
        getMongoTemplate().remove(new Query(), collectionName);
    }
}
