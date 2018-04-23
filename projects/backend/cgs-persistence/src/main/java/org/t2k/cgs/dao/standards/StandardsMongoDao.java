package org.t2k.cgs.dao.standards;

import com.mongodb.DBObject;
import com.mongodb.DBRef;
import com.mongodb.WriteResult;
import com.mongodb.util.JSON;
import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dao.MongoDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.classification.StandardPackage;
import org.t2k.cgs.model.standards.StandardPackageDetails;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.List;

/**
 * Created by elad.avidan on 22/07/2014.
 *
 */
@Component
public class StandardsMongoDao extends MongoDao implements StandardsDao {

    private Logger logger = Logger.getLogger(StandardsMongoDao.class);

    private static final String STANDARDS_COLLECTION = "standards";
    private static final String NAME_ID_ATTRIBUTE_NAME = "name";
    private static final String SUBJECT_AREA_ATTRIBUTE_NAME = "subjectArea";
    private static final String VERSION_ATTRIBUTE_NAME = "version";
    private static final String IS_LATEST_ATTRIBUTE_NAME = "isLatest";

    /**
     * @author Moshe.
     */
    @Override
    public void deleteStandardPackageAllVersions(String packName, String subjectArea) {
        Query q = Query.query(Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(packName).and(SUBJECT_AREA_ATTRIBUTE_NAME).is(subjectArea));
        WriteResult writeResult = getMongoTemplate().remove(q, STANDARDS_COLLECTION);
        logger.debug(String.format("Total Standards Deleted: %s", writeResult.getN()));
    }

    @Override
    public String getStandardsPackage(String packageName, String subjectArea, String version) throws DataAccessException, DsException {
        if (logger.isDebugEnabled()) {
            logger.debug(String.format("getStandardsPackage  packageName:%s subjectArea:%s version:%s", packageName, subjectArea, version));
        }

        Query q = null;
        if (version == null) {
            throw new DsException("Version propery cannot be null when querying for a standard package");
        }
        q = Query.query(Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(packageName).and(SUBJECT_AREA_ATTRIBUTE_NAME).is(subjectArea).and(VERSION_ATTRIBUTE_NAME).is(version));
        q.fields().exclude("_id").exclude(IS_LATEST_ATTRIBUTE_NAME).exclude("_class");

        DBObject result = getMongoTemplate().findOne(q, DBObject.class, STANDARDS_COLLECTION);

        return (result == null) ? (null) : (JSON.serialize(result));
    }

    @Override
    public String getStandardPackagesHeaders() throws DataAccessException {
        if (logger.isDebugEnabled()) {
            logger.debug("getStandardPackagesHeaders");
        }

        Query q = Query.query(Criteria.where(IS_LATEST_ATTRIBUTE_NAME).is(true));
        q.fields().exclude("_id").exclude(IS_LATEST_ATTRIBUTE_NAME).exclude("_class").exclude("standards");

        List<DBObject> result = getMongoTemplate().find(q, DBObject.class, STANDARDS_COLLECTION);

        return (result == null) ? (null) : (JSON.serialize(result));
    }

    @Override
    public DBObject getStandardsPackageFullInfo(String packageName, String subjectArea, String version) throws DaoException {
        if (logger.isDebugEnabled()) {
            logger.debug(String.format("getStandardsPackageFullInfo  packageName:%s subjectArea:%s version:%s", packageName, subjectArea, version));
        }

        try {
            Query q = null;

            q = Query.query(Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(packageName).and(SUBJECT_AREA_ATTRIBUTE_NAME).is(subjectArea).and(VERSION_ATTRIBUTE_NAME).is(version));
            q.fields().exclude("_id");

            DBObject result = getMongoTemplate().findOne(q, DBObject.class, STANDARDS_COLLECTION);

            return result;
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public boolean saveStandardDBObject(DBObject standard, boolean isLatest) throws DaoException {
        if (logger.isDebugEnabled()) {
            logger.debug(String.format("saveStandardDBObject  subjectArea: %s name: %s isLatest: %s", standard.get(SUBJECT_AREA_ATTRIBUTE_NAME), standard.get(NAME_ID_ATTRIBUTE_NAME), isLatest));
        }

        try {
            Query q = Query.query(Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(standard.get(NAME_ID_ATTRIBUTE_NAME).toString()).and(SUBJECT_AREA_ATTRIBUTE_NAME).is(standard.get(SUBJECT_AREA_ATTRIBUTE_NAME).toString()).and(VERSION_ATTRIBUTE_NAME).is(standard.get(VERSION_ATTRIBUTE_NAME).toString()));
            DBObject result = getMongoTemplate().findOne(q, DBObject.class, STANDARDS_COLLECTION);

            if (result == null) { // import this standard package
                if (isLatest) {
                    standard.put(IS_LATEST_ATTRIBUTE_NAME, true);
                }
                getMongoTemplate().insert(standard, STANDARDS_COLLECTION);
                return true;
            } else {
                return false;
            }

        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public DBRef getDBRefByStandard(DBObject standard) throws DaoException {
        if (logger.isDebugEnabled()) {
            logger.debug(String.format("getDBRefByStandard. subjectArea: %s name: %s", standard.get(SUBJECT_AREA_ATTRIBUTE_NAME), standard.get(NAME_ID_ATTRIBUTE_NAME)));
        }

        try {
            Query query = Query.query(Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(standard.get(NAME_ID_ATTRIBUTE_NAME).toString()).and(SUBJECT_AREA_ATTRIBUTE_NAME).is(standard.get(SUBJECT_AREA_ATTRIBUTE_NAME).toString()).and(VERSION_ATTRIBUTE_NAME).is(standard.get(VERSION_ATTRIBUTE_NAME).toString()));
            DBObject standardObj = getMongoTemplate().findOne(query, DBObject.class, STANDARDS_COLLECTION);
            DBRef result = null;

            if (standardObj != null) {
                result = new DBRef(getMongoTemplate().getDb(), STANDARDS_COLLECTION, standardObj.get("_id"));
            }

            return result;
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public String getLatestVersion(DBObject standardPackage) throws DaoException {
        if (logger.isDebugEnabled()) {
            logger.debug(String.format("getLatestVersion  subjectArea: %s name: %s", standardPackage.get(SUBJECT_AREA_ATTRIBUTE_NAME), standardPackage.get(NAME_ID_ATTRIBUTE_NAME)));
        }

        Query q = Query.query(
                Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(standardPackage.get(NAME_ID_ATTRIBUTE_NAME))
                        .and(SUBJECT_AREA_ATTRIBUTE_NAME).is(standardPackage.get(SUBJECT_AREA_ATTRIBUTE_NAME))
                        .and(IS_LATEST_ATTRIBUTE_NAME).is(true)
        );
        q.fields().include(VERSION_ATTRIBUTE_NAME);

        DBObject object = getMongoTemplate().findOne(q, DBObject.class, STANDARDS_COLLECTION);

        if (object == null) {
            return null;
        }

        if (logger.isDebugEnabled()) {
            logger.debug("version found: ");
            logger.debug(JSON.serialize(object));
        }

        String fullVersion = object.get(VERSION_ATTRIBUTE_NAME).toString();

        return fullVersion;
    }

    @Override
    public StandardPackage getStandardsPackageObject(String packageName, String subjectArea, String version) throws DsException {
        if (logger.isDebugEnabled()) {
            logger.debug(String.format("getStandardsPackage  packageName:%s subjectArea:%s version:%s", packageName, subjectArea, version));
        }
        if (version == null) {
            throw new DsException("Version propery cannot be null when querying for a standard package");
        }
        Query q = Query.query(Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(packageName).and(SUBJECT_AREA_ATTRIBUTE_NAME).is(subjectArea).and(VERSION_ATTRIBUTE_NAME).is(version));
        StandardPackage result = getMongoTemplate().findOne(q, StandardPackage.class, STANDARDS_COLLECTION);
        return result;
    }

    @Override
    public Integer getExistingVersionMinor(StandardPackageDetails details) {
        if (logger.isDebugEnabled()) {
            logger.debug("getExistingVersionMinor subjectArea: " + details.getSubjectArea() + " name: " + details.getName());
        }

        Query q = Query.query(
                Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(details.getName())
                        .and(SUBJECT_AREA_ATTRIBUTE_NAME).is(details.getSubjectArea())
                        .and(IS_LATEST_ATTRIBUTE_NAME).is(true)
        );
        q.fields().include(VERSION_ATTRIBUTE_NAME);

        DBObject object = getMongoTemplate().findOne(q, DBObject.class, STANDARDS_COLLECTION);

        if (object == null) {
            return null;
        }

        if (logger.isDebugEnabled()) {
            logger.debug("version found: ");
            logger.debug(JSON.serialize(object));
        }

        String fullVersion = object.get(VERSION_ATTRIBUTE_NAME).toString();
        String[] versionParts = fullVersion.split("\\.");

        return Integer.parseInt(versionParts[1]);
    }

    @Override
    public String getLatestVersion(StandardPackageDetails details) {
        if (logger.isDebugEnabled()) {
            logger.debug("getLatestVersion subjectArea: " + details.getSubjectArea() + " name: " + details.getName());
        }

        Query q = Query.query(
                Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(details.getName())
                        .and(SUBJECT_AREA_ATTRIBUTE_NAME).is(details.getSubjectArea())
                        .and(IS_LATEST_ATTRIBUTE_NAME).is(true)
        );
        q.fields().include(VERSION_ATTRIBUTE_NAME);

        DBObject object = getMongoTemplate().findOne(q, DBObject.class, STANDARDS_COLLECTION);

        if (object == null) {
            return null;
        }

        if (logger.isDebugEnabled()) {
            logger.debug("version found: ");
            logger.debug(JSON.serialize(object));
        }

        return object.get(VERSION_ATTRIBUTE_NAME).toString();
    }

    public boolean checkIfVersionExists(StandardPackageDetails details) {

        if (logger.isDebugEnabled()) {
            logger.debug("checkExistingVersion subjectArea: " + details.getSubjectArea() + " name: " + details.getName() + " version: " + details.getVersion());
        }

        Query q = Query.query(
                Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(details.getName())
                        .and(SUBJECT_AREA_ATTRIBUTE_NAME).is(details.getSubjectArea())
                        .and(VERSION_ATTRIBUTE_NAME).is(details.getVersion())
        );

        DBObject object = getMongoTemplate().findOne(q, DBObject.class, STANDARDS_COLLECTION);

        if (object == null) {
            return false;
        }

        return true;
    }

    @Override
    public void saveNewVersion(String jsonString, StandardPackageDetails details) {
        if (logger.isDebugEnabled()) {
            logger.debug("saveNewVersion subjectArea: " + details.getSubjectArea() + " name: " + details.getName() + " version:" + details.getVersion());
        }

        //Set latest version as no longer latest
        Query q = Query.query(
                Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(details.getName())
                        .and(SUBJECT_AREA_ATTRIBUTE_NAME).is(details.getSubjectArea())
                        .and(IS_LATEST_ATTRIBUTE_NAME).is(true)
        );

        Update update = Update.update(IS_LATEST_ATTRIBUTE_NAME, false);

        getMongoTemplate().updateFirst(q, update, STANDARDS_COLLECTION);

        //inset the new version
        DBObject dbObject = (DBObject) JSON.parse(jsonString);

        getMongoTemplate().save(dbObject, STANDARDS_COLLECTION);
    }

    @Override
    public void removeStandardsPackage(StandardPackageDetails details) throws DataAccessException {
        if (logger.isDebugEnabled()) {
            logger.debug("removeStandardsPackage subjectArea: " + details.getSubjectArea() + " name: " + details.getName() + " version: " + details.getVersion());
        }

        Criteria criteria = Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(details.getName())
                .and(SUBJECT_AREA_ATTRIBUTE_NAME).is(details.getSubjectArea());
        String version = details.getVersion();
        if (version.contains(".")) {
            criteria = criteria.and(VERSION_ATTRIBUTE_NAME).is(version);
        } else {
            criteria = criteria.and(VERSION_ATTRIBUTE_NAME).is(Integer.parseInt(version));
        }
        Query q = Query.query(criteria);

        getMongoTemplate().remove(q, STANDARDS_COLLECTION);
    }
}

