package org.t2k.cgs.persistence.dao;

import atg.taglib.json.util.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.usecases.user.notifications.NotificationType;
import org.t2k.cgs.domain.usecases.user.notifications.NotificationsDao;
import org.t2k.cgs.domain.usecases.user.notifications.UserNotification;
import org.t2k.cgs.domain.usecases.user.notifications.UserNotifications;
import org.t2k.sample.dao.exceptions.DaoException;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 27/10/14
 * Time: 22:43
 * To change this template use File | Settings | File Templates.
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
public class NotificationsDaoTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private NotificationsDao notificationsDao;

    private String username = "NonExistingUser" + Math.random();

    private int publisher = Integer.MAX_VALUE;

    @Test
    public void saveNotification() throws DaoException {
        UserNotifications usernotifications = new UserNotifications(username, publisher);
        usernotifications.addNotification(new UserNotification(NotificationType.PACKAGE, "id", true));
        notificationsDao.saveUserNotifications(usernotifications);
        Assert.assertEquals(notificationsDao.getUserNotifications(username).getNotifications().size(), 1);
        notificationsDao.removeUserNotifications(username);
    }

    @Test
    public void saveModifyAndSaveAgain() throws DaoException, JSONException {
        UserNotifications usernotifications = new UserNotifications(username, publisher);
        usernotifications.addNotification(new UserNotification(NotificationType.PACKAGE, "id_1", true));
        notificationsDao.saveUserNotifications(usernotifications);

        usernotifications = notificationsDao.getUserNotifications(username);
        usernotifications.addNotification(new UserNotification(NotificationType.PACKAGE, "id_2", true));
        notificationsDao.saveUserNotifications(usernotifications);

        Assert.assertEquals(notificationsDao.getUserNotifications(username).getNotifications().size(), 2);
        notificationsDao.removeUserNotifications(username);
    }
}
