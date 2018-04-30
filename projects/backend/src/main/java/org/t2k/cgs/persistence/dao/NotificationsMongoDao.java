package org.t2k.cgs.persistence.dao;

import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.t2k.cgs.domain.usecases.user.notifications.NotificationsDao;
import org.t2k.cgs.persistence.dao.MongoDao;
import org.t2k.cgs.domain.usecases.user.notifications.UserNotifications;
import org.t2k.sample.dao.exceptions.DaoException;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 27/10/14
 * Time: 22:30
 * To change this template use File | Settings | File Templates.
 */
@Component
public class NotificationsMongoDao  extends MongoDao implements NotificationsDao {

    private static final String NOTIFICATIONS_COLLECTION = "notifications";

    @Override
    public UserNotifications getUserNotifications(String username) throws DaoException {
        try {
            Query query = new Query(Criteria.where(UserNotifications.USERNAME).is(username));
            return getMongoTemplate().findOne(query, UserNotifications.class, NOTIFICATIONS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void saveUserNotifications(UserNotifications userNotifications) throws DaoException {
        try {
            getMongoTemplate().save(userNotifications, NOTIFICATIONS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void removeUserNotifications(String username) throws DaoException {
        try {
            Query query = new Query(Criteria.where(UserNotifications.USERNAME).is(username));
            getMongoTemplate().remove(query, NOTIFICATIONS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }
}
