package org.t2k.cgs.dao.user;


import com.mongodb.DBObject;
import com.mongodb.DBRef;
import org.apache.log4j.Logger;
import org.bson.types.ObjectId;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;
import org.t2k.cgs.dao.MongoDao;
import org.t2k.cgs.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.security.SimpleCgsUserRole;
import org.t2k.sample.dao.exceptions.DaoDuplicateKeyException;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 25/06/13
 * Time: 14:57
 */
@Component("usersDao")
public class UsersMongoDao extends MongoDao implements UsersDao {

    private static Logger logger = Logger.getLogger(UsersMongoDao.class);

    private static final String USERS_COLLECTION = "users";
    private static final String ROLES_COLLECTION = "roles";
    private static final String USER_NAME = "username";
    private static final String USER_ID = "userId";
    private static final String EXTERNAL_ID = "externalId";

    private static final List<String> EDITOR_ROLES = Arrays.asList("AUTHOR", "REVIEWER", "EDITOR");

    private static final Map<String, String> INDEX_TO_FIELD_NAME_MAP = new HashMap<String, String>() {{
        put("$users_userNameUniqueIdx", "username");
        put("$users_userIdUniqueIdx", "userId");
        put("$users_emailUniqueIdx", "email");
    }};

    /**
     * Utility that throws the duplicate key exception and extracts from the cause message
     * the exact field the problem occurred in
     *
     * @param cause - original DataAccessException
     * @throws DaoDuplicateKeyException - with extracted field that caused the violation
     */
    private void throwDaoDuplicateKeyException(Throwable cause) throws DaoDuplicateKeyException {
        String violatingField = null;

        for (String key : INDEX_TO_FIELD_NAME_MAP.keySet()) {
            if (cause.getMessage().contains(key)) {
                logger.error(cause.getMessage());
                violatingField = INDEX_TO_FIELD_NAME_MAP.get(key);
                break;
            }
        }

        throw new DaoDuplicateKeyException(violatingField, cause);
    }

    @Override

    public DBRef getRoleIdRefByName(String name) throws DaoException {
        Query q = new Query(Criteria.where("name").is(name));
        SimpleCgsUserRole role = getMongoTemplate().findOne(q, SimpleCgsUserRole.class, ROLES_COLLECTION);
        DBRef result = null;

        if (role != null) {
            result = new DBRef(getMongoTemplate().getDb(), ROLES_COLLECTION, role.getObjectId());
        }

        return result;
    }

    public DBRef getRoleIdRefById(String roleId) throws DaoException {
        Query q = new Query(Criteria.where("_id").is(roleId));
        SimpleCgsUserRole role = getMongoTemplate().findOne(q, SimpleCgsUserRole.class, ROLES_COLLECTION);
        DBRef result = null;

        if (role != null) {
            result = new DBRef(getMongoTemplate().getDb(), ROLES_COLLECTION, role.getObjectId());
        }

        return result;
    }

    @Override
    public void insert(SimpleCgsUserDetails user, DBRef role) throws DaoException {

        if (logger.isDebugEnabled()) {
            logger.debug("inserting user:\n " + user.toString());
        }

        try {
            getMongoTemplate().save(user, USERS_COLLECTION);

            Query _user_query = new Query(Criteria.where("userId").is(user.getUserId()));
            DBObject _user_object = getMongoTemplate().findOne(_user_query, DBObject.class, USERS_COLLECTION);

            _user_object.put("role", role);

            getMongoTemplate().save(_user_object, USERS_COLLECTION);
        } catch (DuplicateKeyException e) {
            throwDaoDuplicateKeyException(e);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void update(SimpleCgsUserDetails user, DBRef role) throws DaoException {

        if (logger.isDebugEnabled()) {
            logger.debug("update userName: " + ((user != null) ? (user.getUsername()) : ("null")));
        }

        try {

            if (user == null || user.getUserId() == null) {
                throw new DaoException("User or its userId is null. User details: " + user);
            }

            Query q = new Query(Criteria.where(USER_ID).is(user.getUserId()));
            Update update = new Update();
            update.set("firstName", user.getFirstName());
            update.set("lastName", user.getLastName());
            update.set("email", user.getEmail());
            update.set("customization", user.getCustomization());
            update.set("role", role);
//            update.set("publisherAccountId", user.getPublisherAccountId());

            if (user.getPassword() != null) {
                update.set("password", user.getPassword());
            }

            getMongoTemplate().upsert(q, update, USERS_COLLECTION);
        } catch (DuplicateKeyException e) {
            throwDaoDuplicateKeyException(e);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public List<SimpleCgsUserRole> getRolesByAccountId(int accountId, String type) throws DaoException {
        List<SimpleCgsUserRole> result;
        Query q;

        try {
            q = new Query(Criteria.where("relatesTo._id").is(accountId).and("relatesTo.type").is(type));
            result = getMongoTemplate().find(q, SimpleCgsUserRole.class, ROLES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }

        return result;
    }

    @Override
    public SimpleCgsUserRole getRoleByRoleId(int roleId) throws DaoException {
        SimpleCgsUserRole result;
        Query q;

        try {
            q = new Query(Criteria.where("id").is(roleId));
            result = getMongoTemplate().findOne(q, SimpleCgsUserRole.class, ROLES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }

        return result;
    }

    public SimpleCgsUserRole getRoleByName(String roleName) throws DaoException {
        SimpleCgsUserRole result;
        Query q;

        try {
            q = new Query(Criteria.where("name").is(roleName));
            result = getMongoTemplate().findOne(q, SimpleCgsUserRole.class, ROLES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }

        return result;
    }

    @Override
    public List<SimpleCgsUserRole> getRolesByAdminUser() throws DaoException {
        Query q;
        try {
            q = new Query(Criteria.where("relatesTo._id").is(-1).and("relatesTo.type").is("SUPER_USER").and("name").in(EDITOR_ROLES));
            return getMongoTemplate().find(q, SimpleCgsUserRole.class, ROLES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }

    }

    @Override
    public SimpleCgsUserDetails getById(int userId) {

        if (logger.isDebugEnabled()) {
            logger.debug("getById userId: " + userId);
        }
        Query q = new Query(Criteria.where(USER_ID).is(userId));
        return getMongoTemplate().findOne(q, SimpleCgsUserDetails.class, USERS_COLLECTION);

    }

    @Override
    public SimpleCgsUserDetails getByAccountAndExternalId(int accountId, String externalId) throws DaoException {
        if (logger.isDebugEnabled()) {
            logger.debug("getByAccountAndExternalId " + "accountId: " + accountId + " externalId: " + externalId);
        }
        try {
            Query q = new Query(Criteria.where("relatesTo._id").is(accountId).
                    and("relatesTo.type").
                    is("PUBLISHER").and(EXTERNAL_ID).is(externalId));

            return getMongoTemplate().findOne(q, SimpleCgsUserDetails.class, USERS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public SimpleCgsUserDetails getByName(String userName) {
        if (logger.isDebugEnabled()) {
            logger.debug("getByName userName: " + userName);
        }

        Query q = new Query(Criteria.where(USER_NAME).is(userName));
        SimpleCgsUserDetails template = getMongoTemplate().findOne(q, SimpleCgsUserDetails.class, USERS_COLLECTION);

        if (template == null) {
            return null;
        }
        com.mongodb.DBRef roleAddress = new com.mongodb.DBRef(getMongoTemplate().getDb(), "roles", template.getRole().getId());

        roleAddress.fetch();

        return template;
    }

    @Override
    public List<SimpleCgsUserDetails> getByPublisherAccountId(int publisherAccountId, String role) throws DaoException {

        if (logger.isDebugEnabled()) {
            logger.debug("getByPublisherAccountId publisherAccountId: " + publisherAccountId);
        }

        try {

            if (role == null) {
                List<SimpleCgsUserRole> _editor_roles = this.getRolesByAdminUser();
                List<ObjectId> objectIds = new ArrayList<>();

                for (SimpleCgsUserRole roleObject : _editor_roles) {
                    if (!roleObject.getName().equals("SYSTEM_ADMIN") &&
                            !roleObject.getName().equals("T2K_ADMIN") &&
                            !roleObject.getName().equals("ACCOUNT_ADMIN")) {
                        objectIds.add(roleObject.getObjectId());
                    }
                }

                Query q = new Query(Criteria.where("relatesTo._id").is(publisherAccountId).
                        and("relatesTo.type").
                        is("PUBLISHER").
                        and("role.$id").in(objectIds));
                return getMongoTemplate().find(q, SimpleCgsUserDetails.class, USERS_COLLECTION);
            } else {
                SimpleCgsUserRole getRole = getRoleByName(role);

                Query q = new Query(Criteria.where("relatesTo._id").
                        is(publisherAccountId).and("relatesTo.type").
                        is("PUBLISHER").and("role.$id").is(getRole.getObjectId()));
                return getMongoTemplate().find(q, SimpleCgsUserDetails.class, USERS_COLLECTION);
            }
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public List<SimpleCgsUserDetails> getByGroupAccountId(int accountId, String role) throws DaoException {
        if (logger.isDebugEnabled()) {
            logger.debug("getByGroupAccountId accountId: " + accountId);
        }

        try {
            if (role == null) {
                List<SimpleCgsUserRole> _editor_roles = this.getRolesByAdminUser();
                List<ObjectId> objectIds = new ArrayList<>();

                for (SimpleCgsUserRole roleObject : _editor_roles) {
                    if (!roleObject.getName().equals("SYSTEM_ADMIN") &&
                            !roleObject.getName().equals("T2K_ADMIN") &&
                            !roleObject.getName().equals("ACCOUNT_ADMIN")) {
                        objectIds.add(roleObject.getObjectId());
                    }
                }

                Query q = new Query(Criteria.where("relatesTo._id").is(accountId).
                        and("relatesTo.type").
                        is("GROUP").
                        and("role.$id").in(objectIds));
                return getMongoTemplate().find(q, SimpleCgsUserDetails.class, USERS_COLLECTION);
            } else {
                SimpleCgsUserRole getRole = getRoleByName(role);

                Query q = new Query(Criteria.where("relatesTo._id").
                        is(accountId).and("relatesTo.type").
                        is("GROUP").and("role.$id").is(getRole.getObjectId()));
                return getMongoTemplate().find(q, SimpleCgsUserDetails.class, USERS_COLLECTION);
            }
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }

    }

    @Override
    public List<SimpleCgsUserDetails> getAllUsers() throws DaoException {
        return getMongoTemplate().findAll(SimpleCgsUserDetails.class, USERS_COLLECTION);
    }

    @Override
    public void deleteByPublisherAccountId(int publisherAccountId) throws DaoException {

        if (logger.isDebugEnabled()) {
            logger.debug(String.format("deleteByPublisherAccountId publisherAccountId: %d", publisherAccountId));
        }

        try {
            Query q = new Query(Criteria.where("relatesTo._id").is(publisherAccountId).and("relatesTo.type").is("PUBLISHER"));
            getMongoTemplate().remove(q, USERS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void delete(int userId) throws DaoException {

        if (logger.isDebugEnabled()) {
            logger.debug("delete userId: " + userId);
        }

        try {
            Query q = new Query(Criteria.where(USER_ID).is(userId));
            getMongoTemplate().remove(q, USERS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

}
