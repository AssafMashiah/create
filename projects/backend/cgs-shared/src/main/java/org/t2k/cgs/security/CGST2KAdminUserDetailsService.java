package org.t2k.cgs.security;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Collections;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 10/30/12
 * Time: 10:21 AM
 */
public class CGST2KAdminUserDetailsService implements UserDetailsService{


    private String userName;
    private String password;
    private SimpleCgsUserRole role;
    private RelatesTo relatesTo;


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        if(this.userName.equals(username)){

            CGSUserDetailsImpl userDetails = new CGSUserDetailsImpl(new User(this.userName,this.password, Collections.<GrantedAuthority>emptyList()));

            userDetails.setFirstName("T2K-admin");
            userDetails.setLastName("T2K-admin");
            userDetails.setEmail("");
            userDetails.setRelatesTo(new RelatesTo(-1,"SUPER_USER"));
            userDetails.setUserId(-1);

            return userDetails;
        }

        throw new UsernameNotFoundException("Not an admin user");
    }


    ///////////////////////
    // Injection Setters //
    ///////////////////////

    @Required
    public void setPassword(String password) {
        this.password = password;
    }

    @Required
    public void setUserName(String userName) {
        this.userName = userName;
    }
}
