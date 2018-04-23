package org.t2k.cgs.security;

import org.springframework.beans.factory.annotation.Required;

/**
 * Created with IntelliJ IDEA.
 * User: elad.avidan
 * Date: 25/11/2014
 * Time: 14:19 PM
 */
public class PollingIntervals {

    // These properties are set by the pollingIntervalsBean defined in the service application context
    int idlePublishPollingInterval = 1000;
    int activePublishPollingInterval = 1000;

    public PollingIntervals(int idlePublishPollingInterval, int activePublishPollingInterval) {
        this.idlePublishPollingInterval = idlePublishPollingInterval;
        this.activePublishPollingInterval = activePublishPollingInterval;
    }

    //////////////////////
    // Injection Setter //
    //////////////////////

    @Required
    public void setIdlePublishPollingInterval(int idlePublishPollingInterval) {
        this.idlePublishPollingInterval = idlePublishPollingInterval;
    }

    @Required
    public void setActivePublishPollingInterval(int activePublishPollingInterval) {
        this.activePublishPollingInterval = activePublishPollingInterval;
    }
}
