package org.t2k.cgs.dao.util;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;
import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dao.MongoDao;
import org.t2k.sample.dao.exceptions.DaoException;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/3/13
 * Time: 2:42 PM
 * <p/>
 * Generate unique ids
 */
@Service("uniqueIdDao")
public class UniqueIdMongoDao extends MongoDao implements UniqueIdDao {

    private static Logger logger = Logger.getLogger(UniqueIdMongoDao.class);

    private static final String INCREMENTAL_IDS_COLLECTION_NAME = "incrementals";
    private static final String ID_FIELD_NAME = "incrementalId";
    private static final String COLLECTION_NAME_FIELD_NAME = "collectionName";

    @Override
    public synchronized int getNextId(String collectionName) throws DaoException {

        if(logger.isDebugEnabled()) {
            logger.debug("nextId requested for:" + collectionName);
        }

        try {
            DBCollection seq = getMongoTemplate().getDb().getCollection(INCREMENTAL_IDS_COLLECTION_NAME);
            DBObject query = new BasicDBObject();
            query.put(COLLECTION_NAME_FIELD_NAME, collectionName);

            DBObject change = new BasicDBObject(ID_FIELD_NAME, 1);
            DBObject update = new BasicDBObject("$inc", change);

            DBObject res = seq.findAndModify(query, new BasicDBObject(), new BasicDBObject(), false, update, true, true);
            int result =  ((Integer) res.get(ID_FIELD_NAME)).intValue();
            return result;
        } catch (DataAccessException e) {
            throw new DaoException("Unable to generate id", e);
        }
    }

    void reset() throws DaoException {
        try {
            getMongoTemplate().remove(new Query(), INCREMENTAL_IDS_COLLECTION_NAME);
        } catch (DataAccessException e) {
            throw new DaoException();
        }
    }
}
