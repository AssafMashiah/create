package org.t2k.cgs.service.sessionListeners;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.user.UserSession;
import org.t2k.cgs.domain.model.user.CGSUserDetails;
import org.t2k.cgs.domain.usecases.UserSessionService;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 05/01/2015
 * Time: 14:12
 */
@Service
public class SessionAuthenticationListener implements ApplicationListener<AuthenticationSuccessEvent> {

    private static Logger logger = Logger.getLogger(SessionAuthenticationListener.class);

    @Autowired
    private UserSessionService sessionService;

    @Override
    public void onApplicationEvent(AuthenticationSuccessEvent authenticationSuccessEvent) {
        WebAuthenticationDetails details = (WebAuthenticationDetails) authenticationSuccessEvent.getAuthentication().getDetails();
        CGSUserDetails userDetails = (CGSUserDetails) authenticationSuccessEvent.getAuthentication().getPrincipal();
        if (details.getSessionId() == null || userDetails.getUsername() == null || userDetails.getUsername().isEmpty()) { // we have no use of session with no id or user
            logger.warn("onApplicationEvent - authenticationSuccessEvent received invalid session.");
            authenticationSuccessEvent.getAuthentication().setAuthenticated(false);
            return;
            // throw new RuntimeException("onApplicationEvent - authenticationSuccessEvent received invalid session.");
        }

        logger.info(String.format("onApplicationEvent - session authenticated for user: %s, sessionId: %s", userDetails.getUsername(), details.getSessionId()));
        UserSession userSession = new UserSession(details.getSessionId(), userDetails.getUserId(), userDetails.getUsername());
        try {
            sessionService.addSession(userSession);
        } catch (DsException e) {
            String errorMsg = String.format("onApplicationEvent - failed to add session %s for userId: %s, username: %s", details.getSessionId(), userDetails.getUsername(), userDetails.getUsername());
            logger.error(errorMsg, e);
        }
    }
}