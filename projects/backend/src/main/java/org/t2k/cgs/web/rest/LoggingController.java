package org.t2k.cgs.web.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.t2k.cgs.domain.model.logging.FrontEndLog;
import org.t2k.cgs.domain.model.logging.ServerDate;
import org.t2k.cgs.domain.usecases.LoggingService;

import java.util.ArrayList;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 25/06/13
 * Time: 14:46
 */
@Controller
public class LoggingController {

    @Autowired
    private LoggingService loggingService;

    @RequestMapping(value = "/logFrontEndData", method = RequestMethod.POST)
    public
    @ResponseBody
    void logFrontEndData(@RequestBody FrontEndLogsList frontEndLogs) throws Exception {
        loggingService.logFrontendLogs(frontEndLogs);
    }

    @RequestMapping(value = "/serverDateTime", method = RequestMethod.GET)
    public
    @ResponseBody
    ServerDate getServerDateTime(@RequestParam(value = "timezone", required = true) String timeZone, @RequestParam(value = "dateformat", required = true) String dateFormat) throws Exception {
        return loggingService.getServerDateTime(timeZone, dateFormat);
    }

    private static class FrontEndLogsList extends ArrayList<FrontEndLog> { }
}
