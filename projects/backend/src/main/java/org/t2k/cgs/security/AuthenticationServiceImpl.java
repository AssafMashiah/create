package org.t2k.cgs.security;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.AuthenticationService;
import org.t2k.cgs.service.AccountServiceImpl;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 21/05/14
 * Time: 15:45
 */
@Service
@Scope(proxyMode = ScopedProxyMode.TARGET_CLASS)
public class AuthenticationServiceImpl implements AuthenticationService {

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