package org.t2k.cgs.security;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/14/12
 * Time: 3:25 PM
 */
public interface ClientConfiguration {

    String getBasePath();

    String getCgsVersion();

    String getLogoutPath();

    String getExternalLogoutPath();

    String getSchemaName();

    PollingIntervals getPollingIntervals();

    String getCmsBasePath();
}