package org.t2k.cgs.domain.model.logging;

import java.util.TimeZone;

/**
 * Created by elad.avidan on 11/08/2014.
 */
public class ServerDate {
    public TimeZone timeZone;
    public String dateFormat;
    public String serverDateTime;

    public ServerDate(TimeZone timeZone, String dateFormat, String serverDateTime) {
        this.timeZone = timeZone;
        this.dateFormat = dateFormat;
        this.serverDateTime = serverDateTime;
    }
}
