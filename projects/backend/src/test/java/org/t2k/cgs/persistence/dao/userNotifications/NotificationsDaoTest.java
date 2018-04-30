package org.t2k.cgs.persistence.dao.userNotifications;

import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 27/10/14
 * Time: 22:43
 * To change this template use File | Settings | File Templates.
 */
@ContextConfiguration("/springContext/applicationContext-MongoDaosTest.xml")
public class NotificationsDaoTest extends AbstractTestNGSpringContextTests {
    /*
    @Autowired
    private NotificationsDao notificationsDao;

    private String username = "NonExistingUser" + Math.random();

    private int publisher = Integer.MAX_VALUE;

    @Test
    public void saveNotification() throws DaoException {
        UserNotifications userNotifications = new UserNotifications(username, publisher);
        userNotifications.addNotification(new UserNotification(NotificationType.PACKAGE, "id", true));
        notificationsDao.saveUserNotifications(userNotifications);
        Assert.assertEquals(notificationsDao.getUserNotifications(username).getNotifications().size(), 1);
        notificationsDao.removeUserNotifications(username);
    }

    @Test
    public void saveModifyAndSaveAgain() throws DaoException, JSONException {
        UserNotifications userNotifications = new UserNotifications(username, publisher);
        userNotifications.addNotification(new UserNotification(NotificationType.PACKAGE, "id_1", true));
        notificationsDao.saveUserNotifications(userNotifications);

        userNotifications = notificationsDao.getUserNotifications(username);
        userNotifications.addNotification(new UserNotification(NotificationType.PACKAGE, "id_2", true));
        notificationsDao.saveUserNotifications(userNotifications);

        Assert.assertEquals(notificationsDao.getUserNotifications(username).getNotifications().size(), 2);
        notificationsDao.removeUserNotifications(username);
    }
    */
}
