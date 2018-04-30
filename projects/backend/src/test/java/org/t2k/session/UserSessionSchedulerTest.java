package org.t2k.session;

import com.t2k.configurations.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.lock.LocksDao;
import org.t2k.cgs.domain.model.lock.TransactionsDao;
import org.t2k.cgs.domain.usecases.user.UserSessionsDao;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.domain.model.lock.Lock;
import org.t2k.cgs.domain.model.user.UserSession;
import org.t2k.cgs.service.scheduling.SessionsScheduler;
import org.t2k.testUtils.ImportCourseData;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.File;
import java.net.URL;
import java.util.Calendar;
import java.util.Date;
import java.util.concurrent.TimeUnit;

/**
 * Created by IntelliJ IDEA.
 * User: Elad.Avidan
 * Date: 21/01/2015
 * Time: 15:10
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class UserSessionSchedulerTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private SessionsScheduler sessionsScheduler;

    @Autowired
    private LocksDao locksDao;

    @Autowired
    private TransactionsDao transactionsDao;

    @Autowired
    private UserSessionsDao sessionsDao;

    @Autowired
    private TestUtils testUtils;

    @Autowired
    private Configuration configuration;

    private String coursesFolder;
    private final String coursesResource = "courses";

    @BeforeClass
    public void classSetup() throws Exception {
        URL coursesPath = this.getClass().getClassLoader().getResource(coursesResource);
        if (coursesPath == null) {
            throw new Exception(String.format("Courses directory %s does not exist.", coursesPath));
        }
        coursesFolder = new File(coursesPath.getPath()).getAbsolutePath() + File.separator;
    }

    @Test
    public void sessionActiveMoreThanTheConfiguredMaxDaysOfActiveSessionTest() throws Exception {
        String sessionId = "SCHEDULER_123456_TEST";
        int userId = 123456;
        String username = "scheduler.test";
        UserSession session = new UserSession(sessionId, userId, username);

        Lock lock = null;
        ImportCourseData importCourseData = null;
        try {
            // import the course and take lock and transaction:
            String source = String.format("%ssmallCourseWithLessonAndQuiz.cgscrs", coursesFolder);
            importCourseData = testUtils.importCourseFromFile(source);
            lock = new Lock(importCourseData.getCourseId(), importCourseData.getCourseCid(), "contentVersion", EntityType.COURSE, username, "email@test.com" , userId, "course");
            locksDao.insertLock(lock);
            transactionsDao.addTransaction(username, importCourseData.getCourseId(), new Date());

            // add a session of the user who took the lock and transaction and call the sessions scheduler:
            sessionsDao.addSession(session);
            sessionsScheduler.clearLocksAndTransactionOfInactiveUsersSessions();

            // validate the session is still active and that the lock and transaction still exists:
            Assert.assertEquals(1, sessionsDao.getNumberOfActiveSessionsByUsername(username));
            Assert.assertNotNull(locksDao.getLock(importCourseData.getCourseId()));
            Assert.assertEquals(1, transactionsDao.findByCourse(importCourseData.getCourseId()).size());

            // destroy the session and call the sessions scheduler:
            sessionsDao.setSessionDestructionDateAndStatus(session.getSessionId());
            sessionsScheduler.clearLocksAndTransactionOfInactiveUsersSessions();

            // validate the session is inactive and that the lock and transaction were removed:
            Assert.assertEquals(0, sessionsDao.getNumberOfActiveSessionsByUsername(username));
            Assert.assertNull(locksDao.getLock(importCourseData.getCourseId()));
            Assert.assertEquals(0, transactionsDao.findByCourse(importCourseData.getCourseId()).size());
        } finally {
            sessionsDao.removeSession(sessionId);
            if (lock != null) {
                locksDao.removeUserLock(lock);
            }
            transactionsDao.removeTransactionOnCourse(username, importCourseData.getCourseId());
            if (importCourseData != null) {
                testUtils.removeAllResourcesFromImportCourse(importCourseData);
            }
        }
    }

    @Test
    public void userWithNoActiveSessionsTest() throws Exception {
        String sessionId = "SCHEDULER_123456_TEST";
        int userId = 123456;
        String username = "scheduler.test";
        UserSession session = new UserSession(sessionId, userId, username);

        Lock lock = null;
        ImportCourseData importCourseData = null;
        try {
            // import the course and take lock and transaction:
            String source = String.format("%ssmallCourseWithLessonAndQuiz.cgscrs", coursesFolder);
            importCourseData = testUtils.importCourseFromFile(source);
            lock = new Lock(importCourseData.getCourseId(), importCourseData.getCourseCid(), "contentVersion", EntityType.COURSE, username, "email@test.com" , userId, "course");
            locksDao.insertLock(lock);
            transactionsDao.addTransaction(username, importCourseData.getCourseId(), new Date());

            // add a session of the user who took the lock and transaction and call the sessions scheduler:
            sessionsDao.addSession(session);
            sessionsScheduler.clearLocksAndTransactionOfInactiveUsersSessions();

            // validate the session is still active and that the lock and transaction still exists:
            Assert.assertEquals(1, sessionsDao.getNumberOfActiveSessionsByUsername(username));
            Assert.assertNotNull(locksDao.getLock(importCourseData.getCourseId()));
            Assert.assertEquals(1, transactionsDao.findByCourse(importCourseData.getCourseId()).size());

            // set the session creation date back as the configured number of days, save it and call the sessions scheduler:
            setSessionCreationDateMinusTheConfiguredDays(session);
            sessionsDao.saveSession(session);
            sessionsScheduler.clearLocksAndTransactionOfInactiveUsersSessions();

            // validate the session is inactive and that the lock and transaction were removed:
            Assert.assertEquals(0, sessionsDao.getNumberOfActiveSessionsByUsername(username));
            Assert.assertNull(locksDao.getLock(importCourseData.getCourseId()));
            Assert.assertEquals(0, transactionsDao.findByCourse(importCourseData.getCourseId()).size());
        } finally {
            sessionsDao.removeSession(sessionId);
            if (lock != null) {
                locksDao.removeUserLock(lock);
            }
            transactionsDao.removeTransactionOnCourse(username, importCourseData.getCourseId());
            if (importCourseData != null) {
                testUtils.removeAllResourcesFromImportCourse(importCourseData);
            }
        }
    }

    private void setSessionCreationDateMinusTheConfiguredDays(UserSession session) {
        int maxDaysOfActiveSession = Integer.parseInt(configuration.getProperty("maxDaysOfActiveSession"));
        long maxMillisOfActiveSession = TimeUnit.DAYS.toMillis(maxDaysOfActiveSession) + TimeUnit.HOURS.toMillis(1); // added 1 hour to work on light saving hour changes
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(session.getCreationDate().getTime() - maxMillisOfActiveSession);
        session.setCreationDate(calendar.getTime());
    }
}