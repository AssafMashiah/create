//package org.t2k.cgs.userNotifications;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.t2k.cgs.dao.userNotifications.NotificationsDao;
//import org.t2k.cgs.dataServices.exceptions.DsException;
//import org.t2k.cgs.model.userNotifications.UserNotification;
//import org.t2k.cgs.model.userNotifications.UserNotifications;
//import org.t2k.sample.dao.exceptions.DaoException;
//
//import java.util.ArrayList;
//import java.util.List;
//
///**
// * Created with IntelliJ IDEA.
// * User: asaf.shochet
// * Date: 27/10/14
// * Time: 23:08
// * To change this template use File | Settings | File Templates.
// */
//public class UserNotificationsServiceImpl implements UserNotificationsService {
//
//    @Autowired
//    private NotificationsDao notificationsDao;
//
//    @Override
//    public void addNotificationToUser(String username, int publisherId, UserNotification notification) throws DsException {
//        UserNotifications userNotifications = null;
//        try {
//            userNotifications = notificationsDao.getUserNotifications(username);
//        } catch (DaoException e) {
//            throw new DsException(e);
//        }
//
//        if (userNotifications == null){
//            userNotifications = new UserNotifications(username, publisherId);
//        }
//
//        userNotifications.addNotification(notification);
//        try {
//            notificationsDao.saveUserNotifications(userNotifications);
//        } catch (DaoException e) {
//            throw new DsException(e);
//        }
//    }
//
//    @Override
//    public List<UserNotification> getAllNotifications(String username) throws DsException {
//        UserNotifications userNotifications = null;
//        try {
//            userNotifications = notificationsDao.getUserNotifications(username);
//        } catch (DaoException e) {
//            throw new DsException(e);
//        }
//        if (userNotifications == null)
//            return null;
//        return userNotifications.getNotifications();
//    }
//
//    @Override
//    public List<UserNotification> getNotificationsToShow(String username) throws DsException {
//        List<UserNotification> all = getAllNotifications(username);
//        if (all == null)
//            return null;
//        List<UserNotification> displayOnly = new ArrayList<>();
//        for (UserNotification notification : all){
//            if (notification.getDisplay()){
//                displayOnly.add(notification);
//            }
//        }
//        return displayOnly;  //To change body of implemented methods use File | Settings | File Templates.
//    }
//
//    @Override
//    public void hideNotification(String username, String notificationId) throws DsException {
//        UserNotifications userNotifications = null;
//        try {
//            userNotifications = notificationsDao.getUserNotifications(username);
//        } catch (DaoException e) {
//            throw new DsException(e);
//        }
//        if (userNotifications == null){
//            return;
//        }
//        userNotifications.hideNotification(notificationId);
//        try {
//            notificationsDao.saveUserNotifications(userNotifications);
//        } catch (DaoException e) {
//            throw new DsException(e);
//        }
//    }
//}
