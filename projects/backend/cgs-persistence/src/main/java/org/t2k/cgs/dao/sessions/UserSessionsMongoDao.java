package org.t2k.cgs.dao.sessions;

import org.apache.log4j.Logger;
import org.joda.time.DateTime;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;
import org.t2k.cgs.dao.MongoDao;
import org.t2k.cgs.model.session.SessionStatus;
import org.t2k.cgs.model.session.UserSession;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.*;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 06/01/2015
 * Time: 12:10
 */
@Component
public class UserSessionsMongoDao extends MongoDao implements UserSessionsDao {

    //Users sessions collection name in mongoDb
    private final String USERS_SESSIONS_COLLECTION = "usersSessions";

    private final String USERNAME = "username";
    private final String CREATION_DATE = "creationDate";
    private final String DESTRUCTION_DATE = "destructionDate";
    private final String SESSION_ID = "sessionId";
    private final String STATUS = "status";
    private final String USER_ID = "userId";
    private Logger logger = Logger.getLogger(UserSessionsMongoDao.class);

    @Override
    public UserSession getSessionById(String sessionId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(SESSION_ID).is(sessionId));
            return getMongoTemplate().findOne(query, UserSession.class, USERS_SESSIONS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void addSession(UserSession userSession) throws DaoException {
        try {
            getMongoTemplate().save(userSession, USERS_SESSIONS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public int getNumberOfActiveSessionsByUsername(String username) throws DaoException {
        try {
            Query query = new Query(Criteria.where(USERNAME).is(username).and(DESTRUCTION_DATE).exists(false));
            return ((int) getMongoTemplate().count(query, USERS_SESSIONS_COLLECTION));
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public UserSession getActiveSessionBySessionId(String sessionId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(SESSION_ID).is(sessionId).and(DESTRUCTION_DATE).exists(false));
            return getMongoTemplate().findOne(query, UserSession.class, USERS_SESSIONS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    /**
     * Finds all the sessions which their creation date had passed the given number of days and has no destruction date,
     * updates their destruction date with the current date and their status to 'DestroyedOnTimeOutReached'
     * and returns a list of these sessions' usernames.
     * @param xDaysAgo
     * @return a list of usernames which their sessions were updated.
     * @throws DaoException
     */
    @Override
    public List<String> setUndefinedSessionsDestructionTimeWithCurrentTimeAndStatus(int xDaysAgo) throws DaoException {
        try {
            // create the query which will find the sessions that exists more than xDaysAgo and have no destruction date.
            Date xDaysAgoDate = new DateTime().minusDays(xDaysAgo).toDate();
            Query query = new Query(Criteria.where(DESTRUCTION_DATE).exists(false).
                    and(CREATION_DATE).lte(xDaysAgoDate));

            // fetch the sessions that mach the query and create a set of their usernames.
            Set<String> usernames = new HashSet<>();
            List<UserSession> userSessions = getMongoTemplate().find(query, UserSession.class, USERS_SESSIONS_COLLECTION);
            for (UserSession session : userSessions) {
                usernames.add(session.getUsername());
            }

            // update these sessions with the current date as destructionDate and their status.
            Update update = new Update();
            update.set(DESTRUCTION_DATE, new Date());
            update.set(STATUS, SessionStatus.DestroyedOnTimeOutReached);
            getMongoTemplate().updateMulti(query, update, USERS_SESSIONS_COLLECTION);

            logger.debug("setUndefinedSessionsDestructionTimeWithCurrentTimeAndStatus complete");
            // return the list of the usernames.
            return new ArrayList<>(usernames);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void setSessionDestructionDateAndStatus(String sessionId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(SESSION_ID).is(sessionId).and(DESTRUCTION_DATE).exists(false).and(STATUS).is(SessionStatus.Authenticated.name()));
            Update update = new Update();
            update.set(DESTRUCTION_DATE, new Date());
            update.set(STATUS, SessionStatus.DestroyedSuccessfully.name());
            getMongoTemplate().updateMulti(query, update, USERS_SESSIONS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void removeSession(String sessionId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(SESSION_ID).is(sessionId));
            getMongoTemplate().remove(query, USERS_SESSIONS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void saveSession(UserSession userSession) throws DaoException {
        try {
            Query query = new Query(Criteria.where(SESSION_ID).is(userSession.getSessionId())
                    .and(USERNAME).is(userSession.getUsername()));

            Update update = new Update();
            update.set(SESSION_ID, userSession.getSessionId());
            update.set(CREATION_DATE, userSession.getCreationDate());
            update.set(STATUS, userSession.getStatus());
            update.set(USERNAME, userSession.getUsername());
            update.set(USER_ID, userSession.getUserId());
            if (userSession.getDestructionDate() != null) {
                update.set(DESTRUCTION_DATE, userSession.getDestructionDate());
            }

            getMongoTemplate().findAndModify(query, update, UserSession.class, USERS_SESSIONS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }
}