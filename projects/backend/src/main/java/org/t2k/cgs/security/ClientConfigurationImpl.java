package org.t2k.cgs.security;

import java.io.Serializable;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 10/23/12
 * Time: 11:41 AM
 */
public class ClientConfigurationImpl implements ClientConfiguration, Serializable {

    private String restPath = "";
    private String cmsBasePath = "";
    private String logoutPath = "";
    private String cgsVersion = "";
    private String schemaName = "";
    private PollingIntervals pollingIntervals;
    private String externalLogoutPath;

    public ClientConfigurationImpl(String restPath, String cmsBasePath, String logoutPath, String version, String schemaName, PollingIntervals pollingIntervals, String externalLogoutPath) {
        this.restPath = restPath;
        this.cmsBasePath = cmsBasePath;
        this.logoutPath = logoutPath;
        this.cgsVersion = version;
        this.schemaName = schemaName;
        this.pollingIntervals = pollingIntervals;
        this.externalLogoutPath = externalLogoutPath;
    }

    @Override
    public String getBasePath() {
        return restPath;
    }

    public void setBasePath(String basePath) {
        this.restPath = basePath;
    }

    @Override
    public String getCgsVersion() {
        return cgsVersion;
    }

    public void setCgsVersion(String cgsVersion) {
        this.cgsVersion = cgsVersion;
    }

    @Override
    public String getLogoutPath() {
        return logoutPath;
    }

    @Override
    public String getExternalLogoutPath() {
        return externalLogoutPath;  //To change body of implemented methods use File | Settings | File Templates.
    }

    public void setLogoutPath(String logoutPath) {
        this.logoutPath = logoutPath;
    }

    @Override
    public String getSchemaName() {
        return schemaName;
    }

    public void setSchemaName(String schemaName) {
        this.schemaName = schemaName;
    }

    @Override
    public PollingIntervals getPollingIntervals() {
        return this.pollingIntervals;
    }

    @Override
    public String getCmsBasePath() {
        return this.cmsBasePath;
    }
}