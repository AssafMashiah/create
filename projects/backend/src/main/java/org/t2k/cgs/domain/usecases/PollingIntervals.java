package org.t2k.cgs.domain.usecases;

/**
 * Created with IntelliJ IDEA.
 * User: elad.avidan
 * Date: 25/11/2014
 * Time: 14:19 PM
 */
public class PollingIntervals {

    // These properties are set by the pollingIntervalsBean defined in the service application context
    private int idlePublishPollingInterval = 1000;
    private int activePublishPollingInterval = 1000;

    public PollingIntervals(int idlePublishPollingInterval, int activePublishPollingInterval) {
        this.idlePublishPollingInterval = idlePublishPollingInterval;
        this.activePublishPollingInterval = activePublishPollingInterval;
    }

    public int getIdlePublishPollingInterval() {
        return idlePublishPollingInterval;
    }

    public int getActivePublishPollingInterval() {
        return activePublishPollingInterval;
    }
}
