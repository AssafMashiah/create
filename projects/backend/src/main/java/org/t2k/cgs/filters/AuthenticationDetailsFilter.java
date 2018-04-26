package org.t2k.cgs.filters;

import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.t2k.cgs.security.CGSUserDetails;

import javax.servlet.*;
import java.io.IOException;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 30/07/14
 * Time: 14:07
 */
@Component(value = "authenticationDetailsFilter") // spring context - we need this in the spring context, otherwise the user is not autowired
//@WebFilter(filterName = "authenticationDetailsFilter", urlPatterns = "/*") servlet context
public class AuthenticationDetailsFilter implements Filter {

    @Autowired
    private CGSUserDetails currentUser;


    public void destroy() {
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws ServletException, IOException {
        try {
            /*
             * This code puts the value "username" to the Mapped Diagnostic
             * context. Since MDc is a static class, we can directly access it
             * with out creating a new object from it. Here, instead of hard
             * coding the user name, the value can be retrieved from a HTTP
             * Request object.
             */

            MDC.put("username", getUserName());
            MDC.put("accountId", getUserAccountID());
            chain.doFilter(req, resp);

        } finally {
            MDC.remove("username");
            MDC.remove("accountId");
        }
    }

    private String getUserAccountID() {
        try {
            if (currentUser != null && currentUser.getUsername() != null && currentUser.getRelatesTo() != null) {
                int publisher = currentUser.getRelatesTo().getId();
                return String.valueOf(publisher);
            }
            return "unavailable";
        } catch (Exception e) {
            return "unavailable";
        }
    }

    private String getUserName() {
        try {
            if (currentUser != null && currentUser.getUsername() != null) {
                return currentUser.getUsername();
            }
            return "unavailable";
        } catch (Exception e) {
            return "unavailable";
        }
    }


}
