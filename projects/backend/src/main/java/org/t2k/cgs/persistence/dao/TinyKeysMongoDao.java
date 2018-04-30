package org.t2k.cgs.persistence.dao;

import com.mongodb.DBRef;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.t2k.cgs.domain.usecases.packaging.TinyKeysDao;
import org.t2k.cgs.persistence.dao.MongoDao;
import org.t2k.cgs.domain.usecases.packaging.PublishTarget;
import org.t2k.cgs.domain.usecases.packaging.TinyKey;
import org.t2k.sample.dao.exceptions.DaoException;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 21/10/12
 * Time: 15:16
 */
@Component
public class TinyKeysMongoDao extends MongoDao implements TinyKeysDao {

    @Override
    public void saveTinyKey(TinyKey tinyKey) throws DaoException {
        getMongoTemplate().save(tinyKey, TINY_KEYS);
    }

    @Override
    public TinyKey getTinyKey(int publisherId, String courseId, String lessonId, PublishTarget publishTarget) {

        //Here, null in lessonId means we are COURSE_TO_URL case.  so must specifically refer it in the query
        Criteria criteria = Criteria.where(PUBLISHER_ID).is(publisherId)
                                      .and(COURSE_ID).is(courseId)
                                      .and(LESSON_ID).is(lessonId)
                                      .and(PUBLISH_TARGET).is(publishTarget.getName());

        Query query = new Query(criteria);
        TinyKey tinyKey = getMongoTemplate().findOne(query, TinyKey.class, TINY_KEYS);

        return tinyKey;
    }

    //TODO: Implement if necessary
    @Override
    public void deleteTinyKey(int publisherId, String courseId, String lessonId, PublishTarget publishTarget) throws DaoException {
        Criteria criteria = Criteria.where(PUBLISHER_ID).is(publisherId)
                .and(COURSE_ID).is(courseId)
                .and(LESSON_ID).is(lessonId)
                .and(PUBLISH_TARGET).is(publishTarget.getName());

        Query query = new Query(criteria);

        this.getMongoTemplate().remove(query, TINY_KEYS);
    }

    @Override
    public void deleteById(DBRef dbref) throws DaoException {
    }

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
    }
}
