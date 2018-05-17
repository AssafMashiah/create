package org.t2k.cgs.security;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.t2k.cgs.domain.model.user.CGSUserDetailsImpl;

import java.util.Collections;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/15/12
 * Time: 3:07 PM
 */
public class CGSTestUserDetailsService implements UserDetailsService {

    private String userNameRegex;
    private String password;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username.matches(userNameRegex)) {
            CGSUserDetailsImpl userDetails = new CGSUserDetailsImpl(new User(username, this.password, Collections.<GrantedAuthority>emptyList()));
            userDetails.setFirstName(username);
            userDetails.setLastName(username);
            userDetails.setEmail(username + "@t2kqa.com");
            return userDetails;
        }
        throw new UsernameNotFoundException("Not a test user");
    }

    ///////////////////////
    // Injection Setters //
    ///////////////////////

    @Required
    public void setUserNameRegex(String userNameRegex) {
        this.userNameRegex = userNameRegex;
    }

    @Required
    public void setPassword(String password) {
        this.password = password;
    }
}
