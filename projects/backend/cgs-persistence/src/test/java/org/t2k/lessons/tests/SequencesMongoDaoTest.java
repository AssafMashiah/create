package org.t2k.lessons.tests;

import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Query;
import org.t2k.cgs.dao.sequences.SequencesMongoDao;
import org.t2k.cgs.dao.util.GenericDaoOperations;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 05/12/12
 * Time: 16:17
 */
public class SequencesMongoDaoTest  extends SequencesMongoDao implements GenericDaoOperations {

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
        getMongoTemplate().remove(new Query(), SEQUENCES_COLLECTION);
    }


}
