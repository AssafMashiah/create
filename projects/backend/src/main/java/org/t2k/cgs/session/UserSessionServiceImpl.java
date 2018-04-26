package org.t2k.cgs.session;

import com.t2k.configurations.Configuration;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dao.sessions.UserSessionsDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.dataServices.exceptions.InitServiceException;
import org.t2k.cgs.lock.LockService;
import org.t2k.cgs.lock.TransactionService;
import org.t2k.cgs.model.session.SessionStatus;
import org.t2k.cgs.model.session.UserSession;
import org.t2k.sample.dao.exceptions.DaoException;

import javax.annotation.PostConstruct;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 06/01/2015
 * Time: 15:14
 */
@Service
public class UserSessionServiceImpl implements UserSessionService {

    private static Logger logger = Logger.getLogger(UserSessionServiceImpl.class);

    @Autowired
    private UserSessionsDao sessionsDao;

    @Autowired
    private LockService lockService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private Configuration configuration;

    @PostConstruct
    public void init() {
        logger.info("Init User Session Service...");
        try {
            logger.debug(String.format("init: About to update all inactive sessions with destruction date and status '%s'", SessionStatus.DestroyedOnTimeOutReached.name()));
            List<String> usernames = setUndefinedSessionsDestructionTimeWithCurrentTimeAndStatus();
            for (String username : usernames) {
                int activeSessions = getNumberOfActiveSessionsByUsername(username);
                if (activeSessions == 0) { // the user has no active sessions --> remove all of his locks
                    logger.debug(String.format("UserSessionServiceImpl init - no active sessions were found for user %s. About to remove all of the user's locks.", username));
                    lockService.removeAllLocksOfUser(username);
                    transactionService.stopAllUserTransactions(username);
                }
            }
        } catch (DsException e) {
            String errorMsg = "UserSessionServiceImpl init: Problem calling DAO functions.";
            logger.error(errorMsg, e);
            throw new InitServiceException(errorMsg, e);
        }
    }

    private int getMaxDaysOfActiveSession() {
        return Integer.parseInt(configuration.getProperty("maxDaysOfActiveSession", "2"));
    }

    @Override
    public List<String> setUndefinedSessionsDestructionTimeWithCurrentTimeAndStatus() throws DsException {
        int maxDaysOfActiveSession = getMaxDaysOfActiveSession();
        logger.debug(String.format("setUndefinedSessionsDestructionTimeWithCurrentTimeAndStatus. About to inactive sessions which are active for more than %s days.", maxDaysOfActiveSession));
        try {
            return sessionsDao.setUndefinedSessionsDestructionTimeWithCurrentTimeAndStatus(maxDaysOfActiveSession);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public void addSession(UserSession userSession) throws DsException {
        logger.debug(String.format("addSession. About to add new user session to DB. Session: %s", userSession));
        try {
            sessionsDao.addSession(userSession);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public int getNumberOfActiveSessionsByUsername(String username) throws DsException {
        logger.debug(String.format("getNumberOfActiveSessionsByUsername. Getting all active sessions for user: %s", username));
        try {
            return sessionsDao.getNumberOfActiveSessionsByUsername(username);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public UserSession getActiveSessionBySessionId(String sessionId) throws DsException {
        logger.debug(String.format("getActiveSessionBySessionId. Getting the active session by id: %s", sessionId));
        try {
            return sessionsDao.getActiveSessionBySessionId(sessionId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public void setSessionDestructionDateAndStatus(String sessionId) throws DsException {
        logger.debug(String.format("setSessionDestructionDateAndStatus. Update session: %s destruction time and status", sessionId));
        try {
            sessionsDao.setSessionDestructionDateAndStatus(sessionId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }
}