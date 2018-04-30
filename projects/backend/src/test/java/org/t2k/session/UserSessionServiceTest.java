package org.t2k.session;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.usecases.user.UserSessionsDao;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.user.UserSessionStatus;
import org.t2k.cgs.domain.model.user.UserSession;
import org.t2k.cgs.domain.usecases.UserSessionService;
import org.t2k.sample.dao.exceptions.DaoException;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.Calendar;
import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 13/01/2015
 * Time: 13:59
 */
//@ContextConfiguration("/springContext/CourseServiceTest-context.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class UserSessionServiceTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private UserSessionService userSessionService;

    @Autowired
    private UserSessionsDao sessionsDao;

    @Test
    public void addGetAndSetSessionTest() throws DsException, DaoException {
        Calendar calNow = Calendar.getInstance();
        calNow.setTimeInMillis((int) new Date().getTime() - 1000); // we set the time to a second ago so we'll be sure it should occur before the session's creationDate
        Date now = calNow.getTime();
        String sessionId = "A1";
        int userId = 1111111111;
        String username = "username";
        UserSession userSession = new UserSession(sessionId, userId, username);

        try {
            userSessionService.addSession(userSession);
            UserSession activeSession = userSessionService.getActiveSessionBySessionId(sessionId);
            Assert.assertEquals(activeSession.getSessionId(), sessionId);
            Assert.assertEquals(activeSession.getStatus(), UserSessionStatus.Authenticated);
            Assert.assertEquals(activeSession.getUserId(), userId);
            Assert.assertEquals(activeSession.getUsername(), username);
            Assert.assertTrue(now.before(activeSession.getCreationDate()));
            Assert.assertEquals(activeSession.getDestructionDate(), null);

            int numberOfActiveSessions = userSessionService.getNumberOfActiveSessionsByUsername(username);
            Assert.assertEquals(numberOfActiveSessions, 1);

            userSessionService.setSessionDestructionDateAndStatus(sessionId);
            activeSession = userSessionService.getActiveSessionBySessionId(sessionId);
            Assert.assertEquals(activeSession, null);

            UserSession destroyedSession = sessionsDao.getSessionById(sessionId);
            Assert.assertEquals(destroyedSession.getStatus(), UserSessionStatus.DestroyedSuccessfully);
            Assert.assertEquals(destroyedSession.getUserId(), userId);
            Assert.assertEquals(destroyedSession.getUsername(), username);
            Assert.assertTrue(now.before(destroyedSession.getCreationDate()));
            int isCreationDateBeforeDestructionDate = destroyedSession.getCreationDate().compareTo(destroyedSession.getDestructionDate());
            Assert.assertTrue(isCreationDateBeforeDestructionDate == 0 || isCreationDateBeforeDestructionDate == -1);
            numberOfActiveSessions = userSessionService.getNumberOfActiveSessionsByUsername(sessionId);
            Assert.assertEquals(numberOfActiveSessions, 0);
        } finally {
            sessionsDao.removeSession(sessionId);
        }
    }

    @Test
    public void multipleSessionTest() throws DsException, DaoException {
        Calendar calNow = Calendar.getInstance();
        calNow.setTimeInMillis((int) new Date().getTime() - 1000); // we set the time to a second ago so we'll be sure it should occur before the session's creationDate
        Date now = calNow.getTime();

        String sessionId1 = "A1";
        String sessionId2 = "A2";
        int userId1 = 1111111111;
        String username1 = "username1";

        String sessionId3 = "A3";
        int userId3 = 1111111112;
        String username2 = "username2";

        UserSession userSession1 = new UserSession(sessionId1, userId1, username1);
        UserSession userSession2 = new UserSession(sessionId2, userId1, username1);
        UserSession userSession3 = new UserSession(sessionId3, userId3, username2);

        try {
            userSessionService.addSession(userSession1);
            userSessionService.addSession(userSession2);
            userSessionService.addSession(userSession3);
            int numberOfActiveSessions = userSessionService.getNumberOfActiveSessionsByUsername(username1);
            Assert.assertEquals(numberOfActiveSessions, 2);

            numberOfActiveSessions = userSessionService.getNumberOfActiveSessionsByUsername(username2);
            Assert.assertEquals(numberOfActiveSessions, 1);

            userSessionService.setSessionDestructionDateAndStatus(sessionId1);
            numberOfActiveSessions = userSessionService.getNumberOfActiveSessionsByUsername(username1);
            Assert.assertEquals(numberOfActiveSessions, 1);
        } finally {
            sessionsDao.removeSession(sessionId1);
            sessionsDao.removeSession(sessionId2);
            sessionsDao.removeSession(sessionId3);
        }
    }
}