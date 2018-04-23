package org.t2k.cgs.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 10/29/12
 * Time: 8:29 AM
 *
 * Factory for current user details. It's purpose is to hide from the other parts of the code
 * the static access to SecurityContextHolder.
 *
 * This will be used in conjunction with springs
 * <aop:scoped-proxy/> to allow injection of current userDetails to interested classes.
 * The scoped proxy will delegate to this factory to get the current user when the scope changes.
 *
 * This approach is cleaner than accessing the static method in every interested class and will allow
 * to easily mock the user details to unit test them.
 *
 */
public final class AuthenticationHolder {

    public static CGSUserDetails getUserDetails() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        if (a == null || !(a.getPrincipal() instanceof CGSUserDetails)) {
            return new CGSUserDetailsImpl();
        } else {
            return (CGSUserDetails) a.getPrincipal();
        }
    }

    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    /**
     * Get the login of the current user.
     */
    public static String getCurrentLogin() {
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Authentication authentication = securityContext.getAuthentication();
        UserDetails springSecurityUser;
        String userName = null;

        if(authentication != null) {
            if (authentication.getPrincipal() instanceof UserDetails) {
                springSecurityUser = (UserDetails) authentication.getPrincipal();
                userName = springSecurityUser.getUsername();
            } else if (authentication.getPrincipal() instanceof String) {
                userName = (String) authentication.getPrincipal();
            }
        }

        return userName;
    }

//    /**
//     * Check if a user is authenticated.
//     *
//     * @return true if the user is authenticated, false otherwise
//     */
//    public static boolean isAuthenticated() {
//        SecurityContext securityContext = SecurityContextHolder.getContext();
//
//        final Collection<? extends GrantedAuthority> authorities = securityContext.getAuthentication().getAuthorities();
//
////        if (authorities != null) {
////            for (GrantedAuthority authority : authorities) {
////                if (authority.getAuthority().equals(AuthoritiesConstants.ANONYMOUS)) {
////                    return false;
////                }
////            }
////        }
//        if (authorities == null || authorities.size() == 0) {
//            return false;
//        }
//
//        return true;
//    }

}
