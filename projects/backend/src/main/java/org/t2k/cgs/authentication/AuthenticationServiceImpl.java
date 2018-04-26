package org.t2k.cgs.authentication;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Service;
import org.t2k.cgs.model.AuthenticationData;
import org.t2k.cgs.publisher.AccountServiceImpl;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 21/05/14
 * Time: 15:45
 */
@Service
@Scope(proxyMode = ScopedProxyMode.TARGET_CLASS)
public class AuthenticationServiceImpl implements AuthenticationService{

    private AuthenticationData authenticationData;

    private AccountServiceImpl accountService;

    @Override
    public void setAuthenticationData(AuthenticationData authenticationData) {
        this.authenticationData = authenticationData;
    }

    @Override
    public AuthenticationData getAuthenticationData() {
        return new AuthenticationData();
    }
}