package org.t2k.cgs.persistence.dao;

import com.mongodb.DBObject;
import com.mongodb.DBRef;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.t2k.cgs.domain.model.applet.AppletDao;
import org.t2k.cgs.persistence.dao.MongoDao;
import org.t2k.cgs.domain.model.ContentItem;
import org.t2k.cgs.domain.model.applet.AppletManifest;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 03/02/13
 * Time: 13:10
 */
@Component
public class AppletMongoDao extends MongoDao implements AppletDao {

    protected static final String APPLETS_COLLECTION = "applets";

    final static String COURSE_ID = "courseId";


    @Override
    public AppletManifest getAppletsManifestsByCourseId(String courseId, Date modifiedSince) {
        Query query = new Query(Criteria.where(COURSE_ID).is(courseId));
        if (modifiedSince != null) {
            query.addCriteria(Criteria.where(ContentItem.HEADER + "." + ContentItem.LAST_MODIFIED).gte(modifiedSince));
        }
        return getMongoTemplate().findOne(query, AppletManifest.class, APPLETS_COLLECTION);
    }


    public DBObject getApplets(String courseId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(COURSE_ID).is(courseId));
            query.fields().exclude("_id");
            return getMongoTemplate().findOne(query, DBObject.class, APPLETS_COLLECTION);

        } catch (DataAccessException e) {
            throw new DaoException(e);
        }

    }

    public DBRef getDBRefOfApplets(String courseId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(COURSE_ID).is(courseId));

            DBObject appletsObj = getMongoTemplate().findOne(query, DBObject.class, APPLETS_COLLECTION);
            DBRef result = null;

            if (appletsObj != null) {
                result = new DBRef(getMongoTemplate().getDb(), APPLETS_COLLECTION, appletsObj.get("_id"));
            }

            return result;

        } catch (DataAccessException e) {
            throw new DaoException(e);
        }

    }

    @Override
    public void deleteAppletManifest(String courseId) {
        Query query = new Query(Criteria.where(COURSE_ID).is(courseId));
        getMongoTemplate().remove(query, APPLETS_COLLECTION);
    }

    public void saveAppletDBObject(DBObject applet) throws DaoException {
        try {

            getMongoTemplate().insert(applet, APPLETS_COLLECTION);

        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }


    @Override
    public void saveAppletManifest(AppletManifest appletManifest) {
        appletManifest.setLastModified(new Date());
        Query query = new Query(Criteria.where(COURSE_ID).is(appletManifest.getCourseId()));
        getMongoTemplate().remove(query, APPLETS_COLLECTION);
        getMongoTemplate().insert(appletManifest, APPLETS_COLLECTION);
    }

}
