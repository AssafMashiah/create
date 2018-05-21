package org.t2k.cgs.domain.usecases.user.notifications;

import org.t2k.cgs.domain.usecases.user.notifications.UserNotifications;
import org.t2k.sample.dao.exceptions.DaoException;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 27/10/14
 * Time: 22:20
 */
public interface NotificationsDao {

     /**
     retrieves all notifications that the user have.
     retrieves both notifications that do and do not need to be displayed
     **/
    public UserNotifications getUserNotifications(String username) throws DaoException;

    /***
     * Saves the userNoficiations object to DB
     * @param userNotifications
     */
    public void saveUserNotifications (UserNotifications userNotifications) throws DaoException;


    void removeUserNotifications(String username) throws DaoException;
}

