package org.t2k.cgs.security;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 24/06/14
 * Time: 11:53
 */
@JsonSerialize(include=JsonSerialize.Inclusion.NON_NULL)
public class PartnerAuthSettings {
    private boolean enable;
    private String authenticationMethod;
    private String httpMethod;
    private String urlTemplate;
    private String authPrincipal; //username or account name or ID etc.
    private String secretKey;

    public boolean isEnable() {
        return enable;
    }

    public void setEnable(boolean enable) {
        this.enable = enable;
    }

    public String getAuthenticationMethod() {
        return authenticationMethod;
    }

    public void setAuthenticationMethod(String authenticationMethod) {
        this.authenticationMethod = authenticationMethod;
    }

    public String getHttpMethod() {
        return httpMethod;
    }

    public void setHttpMethod(String httpMethod) {
        this.httpMethod = httpMethod;
    }

    public String getUrlTemplate() {
        return urlTemplate;
    }

    public void setUrlTemplate(String urlTemplate) {
        this.urlTemplate = urlTemplate;
    }

    public String getAuthPrincipal() {
        return authPrincipal;
    }

    public void setAuthPrincipal(String authPrincipal) {
        this.authPrincipal = authPrincipal;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }
}
