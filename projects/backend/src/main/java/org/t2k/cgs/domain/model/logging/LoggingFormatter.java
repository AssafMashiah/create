package org.t2k.cgs.domain.model.logging;

import org.springframework.stereotype.Service;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 31/07/14
 * Time: 10:20
 */
@Service
public class LoggingFormatter {

    // Creates the line to be logged based on:
    // UTC-time, logLevel, logSource, accountId, username, ip, loggingCategory, [data]
    public String getFinalLogString(String loggingCategory,String data) {
        StringBuilder logStringBuilder = new StringBuilder("");
        logStringBuilder.append(loggingCategory);
        logStringBuilder.append(": ");
        logStringBuilder.append(data);
        return logStringBuilder.toString();
    }

}
