package org.t2k.cgs.persistence.dao.util;

import com.mongodb.BasicDBObject;
import com.mongodb.DB;
import com.mongodb.DBCollection;
import com.mongodb.DBObject;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 24/06/13
 * Time: 15:19
 */
public class IncrementalUniqueIds {
    private static final String INCREMENTAL_IDS_COLLECTION_NAME = "incrementals";
    private static final String ID_FIELD_NAME = "incrementalId";
    private static final String COLLECTION_NAME_FIELD_NAME = "collectionName";

    public synchronized static int getNextId(DB db, String collectionName) {
        DBCollection seq = db.getCollection(INCREMENTAL_IDS_COLLECTION_NAME);
        DBObject query = new BasicDBObject();
        query.put(COLLECTION_NAME_FIELD_NAME, collectionName);
        DBObject change = new BasicDBObject(ID_FIELD_NAME, 1);
        DBObject update = new BasicDBObject("$inc", change);
        DBObject res = seq.findAndModify(
                query,
                new BasicDBObject(),
                new BasicDBObject(),
                false,
                update,
                true,
                true);
        return (Integer) res.get(ID_FIELD_NAME);
    }
}
