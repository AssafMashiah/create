package org.t2k.cgs.session;

import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.session.UserSession;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 06/01/2015
 * Time: 15:11
 */
public interface UserSessionService {

    void addSession(UserSession userSession) throws DsException;

    List<String> setUndefinedSessionsDestructionTimeWithCurrentTimeAndStatus() throws DsException;

    int getNumberOfActiveSessionsByUsername(String username) throws DsException;

    UserSession getActiveSessionBySessionId(String sessionId) throws DsException;

    void setSessionDestructionDateAndStatus(String sessionId) throws DsException;
}
