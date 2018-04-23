package org.t2k.cgs.dao.skills;

import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.t2k.cgs.dao.MongoDao;

/**
 * Created by elad.avidan on 22/07/2014.
 */
@Component("skillsDao")
public class SkillsMongoDao extends MongoDao implements SkillsDao {

    private static Logger logger = Logger.getLogger(SkillsMongoDao.class);

    private static final String SKILLS_COLLECTION = "skills";
    private static final String PUBLISHER_ID = "publisherId";
    private static final String NAME_ID_ATTRIBUTE_NAME = "name";

    @Override
    public String getSkillsPackage(int publisherId, String packageName) throws DataAccessException {
        if(logger.isDebugEnabled()){
            logger.debug("getSkillsPackage publisherId:" + publisherId);
        }

        Query q = Query.query(Criteria.where(PUBLISHER_ID).is(publisherId).and(NAME_ID_ATTRIBUTE_NAME).is(packageName));
        q.fields().exclude("_id").exclude(PUBLISHER_ID);

        DBObject result = getMongoTemplate().findOne(q, DBObject.class, SKILLS_COLLECTION);

        return (result == null) ? (null) : (JSON.serialize(result));
    }
}
