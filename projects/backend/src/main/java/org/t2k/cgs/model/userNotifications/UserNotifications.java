package org.t2k.cgs.model.userNotifications;

import org.springframework.data.annotation.Id;

import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 27/10/14
 * Time: 22:11
 * To change this template use File | Settings | File Templates.
 */
public class UserNotifications {

    @Id
    private String id;
    private String username;
    private int publisherId;
    private List<UserNotification> notifications;

    public static final String USERNAME = "username";

    public UserNotifications(String username, int publisherId) {
        this.username = username;
        this.publisherId = publisherId;
        this.notifications = new ArrayList<>();
    }

    public void addNotification(UserNotification userNotification){
        this.notifications.add(userNotification);
    }

    public void hideNotification(String notificationId){
        for (UserNotification u : notifications){
            if (u.getNotificationId().equals(notificationId))
                u.setDisplay(false);
        }
    }

    public String getUsername() {
        return username;
    }

    public int getPublisherId() {
        return publisherId;
    }

    public List<UserNotification> getNotifications() {
        return notifications;
    }
}
