package org.t2k.cgs.persistence.dao.config;

import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Query;
import org.t2k.cgs.domain.model.utils.GenericDaoOperations;
import org.t2k.cgs.persistence.dao.TocItemsMongoDao;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 09/11/12
 * Time: 16:20
 */
public class LessonMongoTestDao extends TocItemsMongoDao implements GenericDaoOperations {

    public LessonMongoTestDao(String tocItemCollection) {
        super(tocItemCollection);
    }

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
//        collectionName = collectionName != null ? collectionName : getTocItemCollection();
        // fixme be careful! this will delete all toc items in your database
        getMongoTemplate().remove(new Query(), getTocItemCollection());
    }
}
