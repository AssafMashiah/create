package com.t2k.cgs.utils.standards.dao;

import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import com.t2k.cgs.utils.standards.model.PackageDetails;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/21/12
 * Time: 1:32 PM
 */
public class MongoStandardsTargetDao implements StandardsTargetDao {

    private static Logger logger = Logger.getLogger(MongoStandardsTargetDao.class);

    private static final String STANDARDS_COLLECTION_NAME = "standards";
    private static final String NAME_ID_ATTRIBUTE_NAME = "name";
    private static final String SUBJECT_AREA_ATTRIBUTE_NAME = "subjectArea";
    private static final String VERSION_ATTRIBUTE_NAME = "version";
    private static final String IS_LATEST_ATTRIBUTE_NAME = "isLatest";

    private MongoOperations mongoTemplate;


    @Override
    public Integer getExistingVersionMinor(PackageDetails details) {

        if (logger.isDebugEnabled()) {
            logger.debug("getExistingVersionMinor subjectArea: " + details.getSubjectArea() + " name: " + details.getName());
        }

        Query q = Query.query(
                Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(details.getName())
                        .and(SUBJECT_AREA_ATTRIBUTE_NAME).is(details.getSubjectArea())
                        .and(IS_LATEST_ATTRIBUTE_NAME).is(true)
        );
        q.fields().include(VERSION_ATTRIBUTE_NAME);

        DBObject object = this.mongoTemplate.findOne(q, DBObject.class, STANDARDS_COLLECTION_NAME);

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
    public String getLatestVersion(PackageDetails details) {

        if (logger.isDebugEnabled()) {
            logger.debug("getLatestVersion subjectArea: " + details.getSubjectArea() + " name: " + details.getName());
        }

        Query q = Query.query(
                Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(details.getName())
                        .and(SUBJECT_AREA_ATTRIBUTE_NAME).is(details.getSubjectArea())
                        .and(IS_LATEST_ATTRIBUTE_NAME).is(true)
        );
        q.fields().include(VERSION_ATTRIBUTE_NAME);

        DBObject object = this.mongoTemplate.findOne(q, DBObject.class, STANDARDS_COLLECTION_NAME);

        if (object == null) {
            return null;
        }

        if (logger.isDebugEnabled()) {
            logger.debug("version found: ");
            logger.debug(JSON.serialize(object));
        }

        return object.get(VERSION_ATTRIBUTE_NAME).toString();
    }


    public boolean checkIfVersionExists(PackageDetails details) {

        if (logger.isDebugEnabled()) {
            logger.debug("checkExistingVersion subjectArea: " + details.getSubjectArea() + " name: " + details.getName() + " version: " + details.getVersion());
        }

        Query q = Query.query(
                Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(details.getName())
                        .and(SUBJECT_AREA_ATTRIBUTE_NAME).is(details.getSubjectArea())
                        .and(VERSION_ATTRIBUTE_NAME).is(details.getVersion())
        );

        DBObject object = this.mongoTemplate.findOne(q, DBObject.class, STANDARDS_COLLECTION_NAME);

        if (object == null) {
            return false;
        }

        return true;
    }


    @Override
    public void saveNewVersion(String jsonString, PackageDetails details) {

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

        this.mongoTemplate.updateFirst(q, update, STANDARDS_COLLECTION_NAME);

        //inset the new version
        DBObject dbObject = (DBObject) JSON.parse(jsonString);

        this.mongoTemplate.save(dbObject, STANDARDS_COLLECTION_NAME);
    }

    @Override
    public void removeStandardsPackage(PackageDetails details) throws DataAccessException {
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

        this.mongoTemplate.remove(q, STANDARDS_COLLECTION_NAME);
    }

    @Override
    public String getStandardsPackage(String packageName, String subjectArea, String version) throws Exception {
        Query q = null;
        if (version == null) {
            throw new Exception("Version propery cannot be null when querying for a standard package");
        }
        q = Query.query(Criteria.where(NAME_ID_ATTRIBUTE_NAME).is(packageName).and(SUBJECT_AREA_ATTRIBUTE_NAME).is(subjectArea).and(VERSION_ATTRIBUTE_NAME).is(version));

        DBObject result = this.mongoTemplate.findOne(q, DBObject.class, STANDARDS_COLLECTION_NAME);

        return (result == null) ? (null) : (JSON.serialize(result));
    }


    ///////////////////////
    // Injection Setters //
    ///////////////////////

    @Required
    public void setMongoTemplate(MongoOperations mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

}
