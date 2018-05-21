package org.t2k.cgs.domain.usecases.user;

import org.t2k.cgs.domain.model.user.UserSession;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 06/01/2015
 * Time: 12:11
 */
public interface UserSessionsDao {

    UserSession getSessionById(String sessionId) throws DaoException;

    void addSession(UserSession userSession) throws DaoException;

    int getNumberOfActiveSessionsByUsername(String username) throws DaoException;

    UserSession getActiveSessionBySessionId(String sessionId) throws DaoException;

    /**
     * Finds all the sessions which their creation date had passed the given number of days and has no destruction date,
     * updates their destruction date with the current date and their status to 'DestroyedOnTimeOutReached'
     * and returns a list of these sessions' usernames.
     * @param xDaysAgo
     * @return a list of usernames which their sessions were updated.
     * @throws DaoException
     */
    List<String> setUndefinedSessionsDestructionTimeWithCurrentTimeAndStatus(int xDaysAgo) throws DaoException;

    void setSessionDestructionDateAndStatus(String sessionId) throws DaoException;

    void removeSession(String sessionId) throws DaoException;

    void saveSession(UserSession userSession) throws DaoException;
}