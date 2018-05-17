package org.t2k.cgs.domain.usecases.user;

import com.mongodb.DBRef;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.domain.model.user.CGSUserDetails;
import org.t2k.cgs.domain.model.user.SimpleCgsUserRole;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 25/06/13
 * Time: 14:50
 */
public interface UserService {

    SimpleCgsUserDetails add(SimpleCgsUserDetails user, String roleId, Boolean validateUserDetails) throws DsException;

    void update(SimpleCgsUserDetails user, int userId, String roleId) throws DsException;

    void delete(int userId) throws DsException;

    SimpleCgsUserDetails getById(int userId, Boolean isSecured);

    List<SimpleCgsUserRole> getRoles(int accountId, String type) throws DsException;

    List<SimpleCgsUserDetails> getByPublisherAccountIdAndRole(int publisherAccountId, String role) throws DsException;

    void removeUsersByPublisherAccountId(int publisherAccountId) throws DsException;

    List<SimpleCgsUserDetails> getByGroupAccountIdAndRole(int accountId, String role) throws DsException;

    SimpleCgsUserDetails getByAccountAndExternalId(int publisherId, String externalId) throws DsException;

    DBRef getRoleIdRefByName(String roleName) throws DsException;

    SimpleCgsUserDetails getByName(String userName);

    String getBlossomUrl(SimpleCgsUserDetails userDetails);

    boolean isUserRelatedToBlossom(SimpleCgsUserDetails userDetails);

    CGSUserDetails getCurrentUser();
}
