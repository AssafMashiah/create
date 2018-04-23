//package org.t2k.userNotifications;
//
//import junit.framework.Assert;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.test.context.ContextConfiguration;
//import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
//import org.t2k.cgs.dao.userNotifications.NotificationsDao;
//import org.t2k.cgs.dataServices.exceptions.DsException;
//import org.t2k.cgs.model.userNotifications.NotificationType;
//import org.t2k.cgs.model.userNotifications.UserNotification;
//import org.t2k.cgs.model.userNotifications.UserNotifications;
//import org.t2k.cgs.userNotifications.UserNotificationsService;
//import org.t2k.sample.dao.exceptions.DaoException;
//import org.testng.annotations.Test;
//
//import java.util.List;
//
///**
// * Created with IntelliJ IDEA.
// * User: elad.avidan
// * Date: 29/10/14
// * Time: 08:05
// */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
//public class UserNotificationsServiceImplTest extends AbstractTestNGSpringContextTests {
//
//    private int publisherId = 1;
//    private String packId = "111";
//
//    @Autowired
//    private UserNotificationsService userNotificationsService;
//
//    @Autowired
//    private NotificationsDao notificationsDao;
//
//    @Test
//    public void addNotificationToUserTest() throws DsException, DaoException {
//        String username = "user";
//        UserNotification userNotification = new UserNotification(NotificationType.PACKAGE, packId, true);
//        userNotificationsService.addNotificationToUser(username, publisherId, userNotification);
//
//        try {
//            UserNotifications userNotifications = notificationsDao.getUserNotifications(username);
//            Assert.assertNotNull(userNotifications);
//            Assert.assertEquals(1, userNotifications.getNotifications().size());
//            Assert.assertEquals(username, userNotifications.getUsername());
//            Assert.assertEquals(publisherId, userNotifications.getPublisherId());
//            Assert.assertEquals(userNotification, userNotifications.getNotifications().get(0));
//        } finally {
//            notificationsDao.removeUserNotifications(username);
//        }
//    }
//
//    @Test
//    public void getAllNotificationsTest() throws DsException, DaoException {
//        String username_1 = "user_1";
//        String username_2 = "user_2";
//        UserNotification userNotification_1 = new UserNotification(NotificationType.PACKAGE, "1", true);
//        UserNotification userNotification_2 = new UserNotification(NotificationType.PACKAGE, "2", true);
//        UserNotification userNotification_3 = new UserNotification(NotificationType.PACKAGE, "3", true);
//
//        userNotificationsService.addNotificationToUser(username_1, publisherId, userNotification_1);
//        userNotificationsService.addNotificationToUser(username_1, publisherId, userNotification_2);
//        userNotificationsService.addNotificationToUser(username_1, publisherId, userNotification_3);
//        userNotificationsService.addNotificationToUser(username_2, publisherId, userNotification_1);
//        userNotificationsService.addNotificationToUser(username_2, publisherId, userNotification_2);
//
//        try {
//            List<UserNotification> username_1_notifications = userNotificationsService.getAllNotifications(username_1);
//            List<UserNotification> username_2_notifications = userNotificationsService.getAllNotifications(username_2);
//
//            Assert.assertNotNull(username_1_notifications);
//            Assert.assertEquals(3, username_1_notifications.size());
//            Assert.assertEquals(userNotification_1, username_1_notifications.get(0));
//            Assert.assertEquals(userNotification_2, username_1_notifications.get(1));
//            Assert.assertEquals(userNotification_3, username_1_notifications.get(2));
//
//            Assert.assertNotNull(username_2_notifications);
//            Assert.assertEquals(2, username_2_notifications.size());
//            Assert.assertEquals(userNotification_1, username_2_notifications.get(0));
//            Assert.assertEquals(userNotification_2, username_2_notifications.get(1));
//        } finally {
//            notificationsDao.removeUserNotifications(username_1);
//            notificationsDao.removeUserNotifications(username_2);
//        }
//    }
//
//    @Test
//    public void getNotificationsToShowTest() throws DsException, DaoException {
//        String username = "user";
//        UserNotification userNotification_1 = new UserNotification(NotificationType.PACKAGE, "1", true);
//        UserNotification userNotification_2 = new UserNotification(NotificationType.PACKAGE, "2", false);
//        UserNotification userNotification_3 = new UserNotification(NotificationType.PACKAGE, "3", true);
//
//        userNotificationsService.addNotificationToUser(username, publisherId, userNotification_1);
//        userNotificationsService.addNotificationToUser(username, publisherId, userNotification_2);
//        userNotificationsService.addNotificationToUser(username, publisherId, userNotification_3);
//
//        try {
//            List<UserNotification> allUsernameNotifications = userNotificationsService.getAllNotifications(username);
//            Assert.assertNotNull(allUsernameNotifications);
//            Assert.assertEquals(3, allUsernameNotifications.size());
//            Assert.assertEquals(userNotification_1, allUsernameNotifications.get(0));
//            Assert.assertEquals(userNotification_2, allUsernameNotifications.get(1));
//            Assert.assertEquals(userNotification_3, allUsernameNotifications.get(2));
//
//            List<UserNotification> usernameNotificationsToShow = userNotificationsService.getNotificationsToShow(username);
//            Assert.assertNotNull(usernameNotificationsToShow);
//            Assert.assertEquals(2, usernameNotificationsToShow.size());
//            Assert.assertEquals(userNotification_1, usernameNotificationsToShow.get(0));
//            Assert.assertEquals(userNotification_3, usernameNotificationsToShow.get(1));
//        } finally {
//            notificationsDao.removeUserNotifications(username);
//        }
//    }
//
//    @Test
//    public void hideNotificationTest() throws DsException, DaoException {
//        String username = "user";
//        UserNotification userNotification = new UserNotification(NotificationType.PACKAGE, "1", true);
//
//        userNotificationsService.addNotificationToUser(username, publisherId, userNotification);
//
//        try {
//            List<UserNotification> allNotifications = userNotificationsService.getAllNotifications(username);
//            Assert.assertEquals(1, allNotifications.size());
//            Assert.assertTrue(allNotifications.get(0).getDisplay());
//
//            userNotificationsService.hideNotification(username, allNotifications.get(0).getNotificationId());
//            allNotifications = userNotificationsService.getAllNotifications(username);
//            Assert.assertEquals(1, allNotifications.size());
//            Assert.assertFalse(allNotifications.get(0).getDisplay());
//        } finally {
//            notificationsDao.removeUserNotifications(username);
//        }
//    }
//}
