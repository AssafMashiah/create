package org.t2k.cgs.dao.user;

import com.mongodb.DBRef;
import org.t2k.cgs.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.security.SimpleCgsUserRole;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 25/06/13
 * Time: 14:56
 */
public interface UsersDao {

    void insert(SimpleCgsUserDetails user, DBRef role) throws DaoException;

    void update(SimpleCgsUserDetails user, DBRef role) throws DaoException;

    SimpleCgsUserDetails getById(int userId);
    SimpleCgsUserDetails getByAccountAndExternalId(int accountId, String externalId) throws DaoException;

    SimpleCgsUserDetails getByName(String userName);

    List<SimpleCgsUserRole> getRolesByAccountId(int accountId, String type) throws DaoException;
    List<SimpleCgsUserRole> getRolesByAdminUser() throws DaoException;

    List<SimpleCgsUserDetails> getByPublisherAccountId(int publisherAccountId, String role) throws DaoException;

    SimpleCgsUserRole getRoleByRoleId(int roleId) throws DaoException;

    public void deleteByPublisherAccountId(int publisherAccountId) throws DaoException;

    public DBRef getRoleIdRefByName(String name) throws  DaoException;

    public DBRef getRoleIdRefById(String roleId) throws DaoException;

    void delete(int userId) throws DaoException;

    List<SimpleCgsUserDetails> getByGroupAccountId(int accountId, String role) throws DaoException;

    List<SimpleCgsUserDetails> getAllUsers() throws DaoException;
}
