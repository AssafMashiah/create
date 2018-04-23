package org.t2k.cgs.authentication;

import org.t2k.cgs.model.AuthenticationData;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 21/05/14
 * Time: 15:47
 */
public interface AuthenticationService {

    AuthenticationData getAuthenticationData();

    void setAuthenticationData(AuthenticationData authenticationData);
}