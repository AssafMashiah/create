package org.t2k.cgs.domain.usecases;

import org.t2k.cgs.security.AuthenticationData;

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