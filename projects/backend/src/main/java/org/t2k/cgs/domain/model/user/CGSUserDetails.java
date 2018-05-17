package org.t2k.cgs.domain.model.user;

import org.springframework.security.core.userdetails.UserDetails;
import org.t2k.cgs.domain.model.Customization;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 10/10/12
 * Time: 4:30 PM
 */
public interface CGSUserDetails extends UserDetails {

    String getFirstName();

    String getLastName();

    int getUserId();

    boolean hasRole(String role);

    SimpleCgsUserRole getRole();

    String getEmail();

    RelatesTo getRelatesTo();

    Customization getCustomization();
}
