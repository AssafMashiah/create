//package org.t2k.cgs.userNotifications;
//
//import org.t2k.cgs.dataServices.exceptions.DsException;
//import org.t2k.cgs.model.userNotifications.UserNotification;
//
//import java.util.List;
//
///**
// * Created with IntelliJ IDEA.
// * User: asaf.shochet
// * Date: 27/10/14
// * Time: 22:27
// * To change this template use File | Settings | File Templates.
// */
//public interface UserNotificationsService {
//
//    /**
//     adds the notification to the user's notifications.
//     creates an entry for the user if it doesn't exist
//     **/
//    public void addNotificationToUser(String username, int publisherId, UserNotification notification) throws DsException;
//
//    /**
//     retrieves all notifications that the user have.
//     retrieves both notifications that do and do not need to be displayed
//     **/
//    public List<UserNotification> getAllNotifications(String username) throws DsException;
//
//    /**
//     retrieves all notifications that are marked to be displayed for user @username
//     **/
//    public List<UserNotification> getNotificationsToShow(String username) throws DsException;
//
//    /**
//     sets the visibility parameter for the notifications for user @user
//     so it will not be visible
//     **/
//    public void hideNotification(String username, String notificationId) throws DsException;
//}
