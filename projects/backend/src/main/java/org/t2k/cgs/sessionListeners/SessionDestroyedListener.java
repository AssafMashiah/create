package org.t2k.cgs.sessionListeners;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.web.session.HttpSessionDestroyedEvent;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.lock.LockService;
import org.t2k.cgs.lock.TransactionService;
import org.t2k.cgs.model.session.UserSession;
import org.t2k.cgs.security.CGSUserDetails;
import org.t2k.cgs.session.UserSessionService;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 05/01/2015
 * Time: 07:57
 */
@Service
public class SessionDestroyedListener implements ApplicationListener<HttpSessionDestroyedEvent> {

    private static Logger logger = Logger.getLogger(SessionDestroyedListener.class);

    @Autowired
    private UserSessionService sessionService;

    @Autowired
    private LockService lockService;

    @Autowired
    private TransactionService transactionService;

    @Override
    public void onApplicationEvent(HttpSessionDestroyedEvent httpSessionDestroyedEvent) {
        logger.info(String.format("onApplicationEvent. Session %s was destroyed by Tomcat.", httpSessionDestroyedEvent.getId()));
        // first, we need to update the current session that it's destroyed.
        try { // we can set the session by its sessionId and not by the user id because even if the session id already exist in our
              // sessions collection, it belongs to an older session which we already marked as destroyed.
            sessionService.setSessionDestructionDateAndStatus(httpSessionDestroyedEvent.getId());
        } catch (DsException e) {
            logger.error(String.format("onApplicationEvent - failed to get session %s", httpSessionDestroyedEvent.getId()), e);
        }

        // now, we need to check if there are any more active sessions for this user, and if not - release all the user's locks.
        String username;
        // if no user information is available or if more than 1 security context was defined for this session --> use the session id to get the user id
        if (httpSessionDestroyedEvent.getSecurityContexts().size() != 1) {
            logger.debug(String.format("onApplicationEvent. Getting the session by its sessionId: %s", httpSessionDestroyedEvent.getId()));
            try { // we can get the session by its sessionId and not by the user id because even if the session id already exist in our
                  // sessions collection, it belongs to an older session which we already marked as destroyed.
                UserSession session = sessionService.getActiveSessionBySessionId(httpSessionDestroyedEvent.getId());
                if (session == null) {
                    logger.debug(String.format("onApplicationEvent - no session found for session id %s", httpSessionDestroyedEvent.getId()));
                    return;
                }
                username = session.getUsername();
            } catch (DsException e) {
                logger.error(String.format("onApplicationEvent - failed to get session %s", httpSessionDestroyedEvent.getId()), e);
                return;
            }
        }
        else { // user details are available
            CGSUserDetails userDetails = (CGSUserDetails) httpSessionDestroyedEvent.getSecurityContexts().get(0).getAuthentication().getPrincipal();
            username = userDetails.getUsername();
        }

        try {
            int activeSessions = sessionService.getNumberOfActiveSessionsByUsername(username);
            if (activeSessions == 0) { // the user has no active sessions --> remove all of his locks
                logger.debug(String.format("onApplicationEvent - no active sessions were found for user %s. About to remove all of the user's locks.", username));
                lockService.removeAllLocksOfUser(username);
                transactionService.stopAllUserTransactions(username);
            }
        } catch (DsException e) {
            logger.error(String.format("onApplicationEvent - failed to get list of active sessions for username: %s", username), e);
        }
    }
}
