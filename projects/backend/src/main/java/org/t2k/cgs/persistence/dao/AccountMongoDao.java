package org.t2k.cgs.persistence.dao;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import org.apache.log4j.Logger;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.t2k.cgs.domain.model.user.AccountDao;
import org.t2k.cgs.persistence.dao.util.IncrementalUniqueIds;
import org.t2k.cgs.domain.model.exceptions.ErrorCodes;
import org.t2k.cgs.domain.model.exceptions.ValidationException;
import org.t2k.cgs.domain.model.user.CGSAccount;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/7/12
 * Time: 2:54 PM
 */
@Component("publisherDao")
public class AccountMongoDao extends MongoDao implements AccountDao {

    private static Logger logger = Logger.getLogger(AccountMongoDao.class);

    public static final String ACCOUNT_ID = "accountId";
    public static final String DB_ID = "_id";
    public static final int DEFAULT_PUBLISHER_ID = 1;

    protected static final String PUBLISHER_NAME = "name";

    private static final String PUBLISHERS_COLLECTION = "publishers";
    private static final String GROUPS_COLLECTION = "groups";
    private static final String ACCOUNTS_COLLECTION = "users";

    @Override
     public String getPublisher(int publisherId) {
        if (logger.isDebugEnabled()) {
            logger.debug("getPublisher publisherId:" + publisherId);
        }

        DBObject result = getPublisherDbObject(publisherId);
        return (result == null) ? (null) : (JSON.serialize(result));
    }

    @Override
    public CGSAccount getAccountAuthenticationData(int publisherId) {
        if (logger.isDebugEnabled()) {
            logger.debug("getPublisher publisherId:" + publisherId);
        }

        return getPublisherCGSAccountObject(publisherId);
    }

    @Override
    public String getPublisherName(int publisherId) {
        if (logger.isDebugEnabled()) {
            logger.debug("getPublisherName publisherId:" + publisherId);
        }

        DBObject result = getPublisherDbObject(publisherId);
        return (result == null) ? (null) : result.get(PUBLISHER_NAME).toString();
    }

    @Override
    public String getPublishers() {
        if (logger.isDebugEnabled()) {
            logger.debug("getPublishers");
        }

        Query q = Query.query(new Criteria());
        q.fields().exclude(DB_ID);
        List<DBObject> result = getMongoTemplate().find(q, DBObject.class, PUBLISHERS_COLLECTION);

        return (result == null) ? (null) : (JSON.serialize(result));
    }

    @Override
    public String getGroups() {
        if (logger.isDebugEnabled()) {
            logger.debug("getGroups");
        }

        Query q = Query.query(new Criteria());
        List<DBObject> result = getMongoTemplate().find(q, DBObject.class, GROUPS_COLLECTION);
        return (result == null) ? (null) : (JSON.serialize(result));
    }

    @Override
    public String getPublishersByRelatesTo(int accountId, String type) {
        if (logger.isDebugEnabled()) {
            logger.debug("getPublishersByRelatesTo accountId=" + accountId + " and type=" + type);
        }

        Query q = Query.query(Criteria.where("relatesTo._id").is(accountId).and("relatesTo.type").is(type));
        List<DBObject> result = getMongoTemplate().find(q, DBObject.class, PUBLISHERS_COLLECTION);
        return (result == null) ? (null) : (JSON.serialize(result));
    }

    @Override
    public String getPublishersByGroupId(int groupId) {
        if (logger.isDebugEnabled()) {
            logger.debug("getPublishersByGroupId groupId=" + groupId);
        }
        Query q = Query.query(Criteria.where("relatesTo._id").is(groupId).and("relatesTo.type").is("GROUP"));
        q.fields().exclude(DB_ID);
        List<DBObject> result = getMongoTemplate().find(q, DBObject.class, PUBLISHERS_COLLECTION);
        return (result == null) ? (null) : (JSON.serialize(result));
    }

    @Override
    public String createPublisher(String publisherJson) throws ValidationException {
        if (logger.isDebugEnabled()) {
            logger.debug("createPublisher");
        }
        DBObject publisherDbObject = (DBObject) JSON.parse(publisherJson);
        if (publisherDbObject.containsField(ACCOUNT_ID)) {
            throw new ValidationException(ErrorCodes.NO_ID_ALLOWED, "Can't create a publisher with a publisherId");
        } else {
            int newId = IncrementalUniqueIds.getNextId(getMongoTemplate().getDb(), PUBLISHERS_COLLECTION);
            publisherDbObject.put(ACCOUNT_ID, newId);
            getMongoTemplate().save(publisherDbObject, PUBLISHERS_COLLECTION);
            return JSON.serialize(publisherDbObject);
        }
    }

    @Override
    public String createGroup(String groupJson) throws ValidationException {
        if (logger.isDebugEnabled()) {
            logger.debug("createGroup");
        }
        DBObject groupDbObject = (DBObject) JSON.parse(groupJson);
        int newId = IncrementalUniqueIds.getNextId(getMongoTemplate().getDb(), GROUPS_COLLECTION);
        groupDbObject.put(ACCOUNT_ID, newId);
        getMongoTemplate().save(groupDbObject, GROUPS_COLLECTION);
        return JSON.serialize(groupDbObject);
    }

    @Override
    public void updatePublisher(String publisherJson) throws ValidationException {
        DBObject publisherDbObject = (DBObject) JSON.parse(publisherJson);
        if (!publisherDbObject.containsField(ACCOUNT_ID)) {
            throw new ValidationException(ErrorCodes.ID_MISSING, "Can't update a publisher without a publisherId");
        } else {
            int id = (Integer) publisherDbObject.get(ACCOUNT_ID);
            DBObject dbPublisher = getPublisherDbObjectWithDbId(id);
            if (dbPublisher == null) {
                throw new ValidationException(ErrorCodes.RESOURCE_NOT_FOUND, "No publisher with id = " + id);
            } else {
                publisherDbObject.put(DB_ID, dbPublisher.get(DB_ID));
                getMongoTemplate().save(publisherDbObject, PUBLISHERS_COLLECTION);
            }
        }
    }

    @Override
    public void updateGroup(String groupJson) throws ValidationException {
        DBObject groupDbObject = (DBObject) JSON.parse(groupJson);
        if (!groupDbObject.containsField(ACCOUNT_ID)) {
            throw new ValidationException(ErrorCodes.ID_MISSING, "Can't update a group without a accountId");
        } else {
            int id = (Integer) groupDbObject.get(ACCOUNT_ID);
            DBObject dbGroup = getGroupDbObjectWithDbId(id);

            if (dbGroup == null) {
                throw new ValidationException(ErrorCodes.RESOURCE_NOT_FOUND, "No group with id = " + id);
            } else {
                groupDbObject.put(DB_ID, dbGroup.get(DB_ID));
                getMongoTemplate().save(groupDbObject, GROUPS_COLLECTION);
            }
        }
    }

    @Override
    public void deletePublisher(int publisherId) throws ValidationException {
        if (getPublisher(publisherId) == null) {
            throw new ValidationException(ErrorCodes.ID_MISSING, "No publisher with id = " + publisherId);
        } else {
            Query q = Query.query(Criteria.where(ACCOUNT_ID).is(publisherId));
            Query accounts = Query.query(Criteria.where("relatesTo._id").is(publisherId).and("relatesTo.type").is("PUBLISHER"));

            getMongoTemplate().remove(accounts, ACCOUNTS_COLLECTION);
            getMongoTemplate().remove(q, PUBLISHERS_COLLECTION);
        }
    }

    @Override
    public void deleteGroup(int groupId) {
        Query q = Query.query(Criteria.where(ACCOUNT_ID).is(groupId));
        Query publishers = Query.query(Criteria.where("relatesTo._id").is(groupId).and("relatesTo.type").is("GROUP"));
        List<DBObject> list_publishers = getMongoTemplate().find(publishers, DBObject.class, PUBLISHERS_COLLECTION);

        Query groupAdmins = Query.query(Criteria.where("relatesTo._id").is(groupId).and("relatesTo.type").is("GROUP"));

        for (DBObject pItem : list_publishers) {
            BasicDBObject relatesTo = (BasicDBObject)pItem.get("relatesTo");
            Object relatesToId = relatesTo.get("_id");
            Query accounts = Query.query(Criteria.where("relatesTo._id").is(relatesToId).and("relatesTo.type").is("PUBLISHER"));

            getMongoTemplate().remove(accounts, ACCOUNTS_COLLECTION);
        }

        getMongoTemplate().remove(publishers, PUBLISHERS_COLLECTION);
        getMongoTemplate().remove(q, GROUPS_COLLECTION);
        getMongoTemplate().remove(groupAdmins, ACCOUNTS_COLLECTION);
    }

    @Override
    public List<Integer> getAllPublisherIds() {
        List<Integer> ids = new ArrayList<>();
        Query q = Query.query(new Criteria());
        List<DBObject> result = getMongoTemplate().find(q, DBObject.class, PUBLISHERS_COLLECTION);
        for (DBObject d : result){
            ids.add(Integer.parseInt(d.get(ACCOUNT_ID).toString()));
        }
        return ids;
    }

    private DBObject getPublisherDbObject(int publisherId) {
        Query q = Query.query(Criteria.where(ACCOUNT_ID).is(publisherId));
        q.fields().exclude(DB_ID);
        DBObject result = getMongoTemplate().findOne(q, DBObject.class, PUBLISHERS_COLLECTION);
        return result;
    }

    private CGSAccount getPublisherCGSAccountObject(int publisherId) {
        Query q = Query.query(Criteria.where(ACCOUNT_ID).is(publisherId));
        q.fields().exclude(DB_ID);
        CGSAccount result = getMongoTemplate().findOne(q, CGSAccount.class, PUBLISHERS_COLLECTION);
        return result;
    }

    private DBObject getPublisherDbObjectWithDbId(int publisherId) {
        Query q = Query.query(Criteria.where(ACCOUNT_ID).is(publisherId));
        DBObject result = getMongoTemplate().findOne(q, DBObject.class, PUBLISHERS_COLLECTION);
        return result;
    }

    private DBObject getGroupDbObjectWithDbId(int groupId) {
        Query q = Query.query(Criteria.where(ACCOUNT_ID).is(groupId));
        DBObject result = getMongoTemplate().findOne(q, DBObject.class, GROUPS_COLLECTION);
        return result;
    }
}