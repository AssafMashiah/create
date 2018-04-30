package org.t2k.cgs.security;

import org.springframework.beans.factory.annotation.Required;
import org.springframework.ldap.core.DirContextAdapter;
import org.springframework.ldap.core.DirContextOperations;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.ldap.userdetails.UserDetailsContextMapper;
import org.t2k.cgs.domain.model.user.CGSUserDetailsImpl;

import java.util.Collection;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 10/10/12
 * Time: 4:31 PM
 */
public class CGSUserDetailsMapper implements UserDetailsContextMapper {

    private UserDetailsContextMapper decoratedMapper;
    private String firstNameAttribute;
    private String lastNameAttribute;
    private String emailAttribute;

    @Override
    public UserDetails mapUserFromContext(DirContextOperations ctx, String username, Collection<? extends GrantedAuthority> authorities) {
        UserDetails userDetails = this.decoratedMapper.mapUserFromContext(ctx, username, authorities);
        CGSUserDetailsImpl cgsUserDetails = new CGSUserDetailsImpl(userDetails);
        cgsUserDetails.setFirstName(ctx.getStringAttribute(this.firstNameAttribute));
        cgsUserDetails.setLastName(ctx.getStringAttribute(this.lastNameAttribute));
        cgsUserDetails.setEmail(ctx.getStringAttribute(this.emailAttribute));
        //all active directory users are considered to be content developers
        return cgsUserDetails;
    }

    @Override
    public void mapUserToContext(UserDetails user, DirContextAdapter ctx) {
        this.decoratedMapper.mapUserToContext(user, ctx);
    }

    ///////////////////////
    // Injection Setters //
    ///////////////////////

    @Required
    public void setEmailAttribute(String emailAttribute) {
        this.emailAttribute = emailAttribute;
    }

    @Required
    public void setFirstNameAttribute(String firstNameAttribute) {
        this.firstNameAttribute = firstNameAttribute;
    }

    @Required
    public void setLastNameAttribute(String lastNameAttribute) {
        this.lastNameAttribute = lastNameAttribute;
    }

    @Required
    public void setDecoratedMapper(UserDetailsContextMapper decoratedMapper) {
        this.decoratedMapper = decoratedMapper;
    }

}
