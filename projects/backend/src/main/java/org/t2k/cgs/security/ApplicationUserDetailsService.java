package org.t2k.cgs.security;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.t2k.cgs.domain.model.user.UsersDao;
import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/2/13
 * Time: 5:42 PM
 */
public class ApplicationUserDetailsService implements UserDetailsService {

    private final Logger logger = Logger.getLogger(this.getClass());

    private UsersDao usersDao;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        SimpleCgsUserDetails simpleUser;
        simpleUser = usersDao.getByName(username);
        if (simpleUser == null) {
            logger.debug("User '" + username + "' not found");
            throw new UsernameNotFoundException("User not found in application");
        }
        return simpleUser.toUserDetails();
    }


    ///////////////////////
    // Injection Setters //
    ///////////////////////

    @Required
    public void setUsersDao(UsersDao usersDao) {
        this.usersDao = usersDao;
    }
}
