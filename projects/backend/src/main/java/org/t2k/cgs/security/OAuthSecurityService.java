package org.t2k.cgs.security;

import org.t2k.cgs.domain.model.exceptions.DsException;

import javax.servlet.http.HttpServletRequest;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 07/05/14
 * Time: 15:14
 */
public interface OAuthSecurityService {

    /***
     * This method gets the JWT (json web token) from the controller and tries to authenticate the user according the the data on the token.
     * currently, the JWT is a string with 3 parts separated by dots, each parts is base64 encoded and represents a different part of the token.
     *
     * @param jwtToken - string from oAuth login url, different for each login attempt
     * @param request
     * @return - true if the authentication succeed, false otherwise.
     * @throws DsException
     */
    boolean authenticate(String jwtToken, HttpServletRequest request) throws DsException;

    void invalidateAuthentication();
}
