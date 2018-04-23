package org.t2k.cgs.model;

import org.springframework.beans.factory.annotation.Autowired;
import org.t2k.cgs.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.security.CGSAccount;
import org.t2k.cgs.security.ClientConfiguration;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 21/05/14
 * Time: 11:48
 */

public class AuthenticationData {
    @Autowired
    private SimpleCgsUserDetails user;

    private CGSAccount accountData;

    @Autowired
    private ClientConfiguration clientConfiguration;

    public AuthenticationData() {
    }

    public SimpleCgsUserDetails getUser() {
        return user;
    }

    public void setUser(SimpleCgsUserDetails user) {
        this.user = user;
    }

    public CGSAccount getAccountData() {
        return accountData;
    }

    public void setAccountData(CGSAccount accountData) {
        this.accountData = accountData;
    }

    public ClientConfiguration getClientConfiguration() {
        return clientConfiguration;
    }

    public void setClientConfiguration(ClientConfiguration clientConfiguration) {
        this.clientConfiguration = clientConfiguration;
    }

    @Override
    public String toString() {
        return "AuthenticationData{" +
                "user=" + user +
                ", accountData=" + accountData +
                ", clientConfiguration=" + clientConfiguration +
                '}';
    }

}