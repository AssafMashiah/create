package org.t2k.cgs.model.userNotifications;

import java.util.Date;
import java.util.UUID;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 27/10/14
 * Time: 22:03
 * To change this template use File | Settings | File Templates.
 */
public class UserNotification {

    private String notificationId;
    private NotificationType type; // type of notification
    private String objectId; // the id of the actual object in the DB
    private  Boolean display; // true - show this notification to the user, false - don't
    private Date created;    // created date
    private Date modified;   // modified date

    public UserNotification(NotificationType type, String objectId, Boolean display) {
        this.type = type;
        this.objectId = objectId;
        this.display = display;
        this.created = new Date();
        this.notificationId = UUID.randomUUID().toString();
    }

    public void setDisplay(Boolean display) {
        this.display = display;
        this.modified = new Date();
    }

    public String getNotificationId() {
        return notificationId;
    }

    public Boolean getDisplay() {
        return display;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;

        UserNotification other = (UserNotification) obj;

        if (created != null ? !created.equals(other.created) : other.created != null) return false;
        if (display != null ? !display.equals(other.display) : other.display != null) return false;
        if (modified != null ? !modified.equals(other.modified) : other.modified != null) return false;
        if (notificationId != null ? !notificationId.equals(other.notificationId) : other.notificationId != null)
            return false;
        if (objectId != null ? !objectId.equals(other.objectId) : other.objectId != null) return false;
        if (type != other.type) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = notificationId != null ? notificationId.hashCode() : 0;
        result = 31 * result + (type != null ? type.hashCode() : 0);
        result = 31 * result + (objectId != null ? objectId.hashCode() : 0);
        result = 31 * result + (display != null ? display.hashCode() : 0);
        result = 31 * result + (created != null ? created.hashCode() : 0);
        result = 31 * result + (modified != null ? modified.hashCode() : 0);
        return result;
    }
}