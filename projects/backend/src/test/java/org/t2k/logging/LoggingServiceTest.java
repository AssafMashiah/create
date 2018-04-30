package org.t2k.logging;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.log4j.Logger;
import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.usecases.LoggingService;
import org.t2k.cgs.domain.model.logging.FrontEndLog;
import org.t2k.cgs.domain.model.logging.ServerDate;
import org.t2k.cgs.domain.model.logging.logLevels.AuditLevel;
import org.t2k.cgs.service.scheduling.ValidationScheduler;
import org.t2k.sample.dao.exceptions.DaoException;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.util.Arrays;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 03/08/14
 * Time: 17:00
 */
@ContextConfiguration("/springContext/applicationContext-service.xml")
@Test(groups = "ignore")
public class LoggingServiceTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private ValidationScheduler validationScheduler;

    @Autowired
    private LoggingService loggingService;

    private static Logger logger = Logger.getLogger(LoggingServiceTest.class);

    @Test(groups = "ignore")
    public void scheduleValidationSimpleRun() throws DsException, DaoException {
        validationScheduler.validateNewlySavedCourses();
    }

    private String unavailable ="unavailable";
    private String data="{newCourseName:Ted}";
    private String loggingCategory="saveCourse" ;
    private String logLevel="DEBUG" ;
    private String currentUtcTime="30/01/15 06:11:10:342";
    private String username = "myUser";
    private String accountId = "12";

    private FrontEndLog getSimpleFELogTest() {
        FrontEndLog frontEndLog = new FrontEndLog();
        frontEndLog.setCurrentUtcTime(currentUtcTime);
        frontEndLog.setData(data);
        frontEndLog.setLoggingCategory(loggingCategory);
        frontEndLog.setLogLevel(logLevel);
        frontEndLog.setUsername(username);
        frontEndLog.setAccountId(accountId);
        return frontEndLog;
    }

    private String getSimpleLogDataJson(){
        return "{" +
                "\"data\":"+"\"" + data + "\"" +
                ", \"loggingCategory\":"+"\"" + loggingCategory + "\"" +
                ", \"logLevel\":"+"\"" + logLevel + "\"" +
                ", \"currentUtcTime\":"+"\""+currentUtcTime+"\""+
                ", \"username\": \""+username+"\""+
                ", \"accountId\": \""+accountId+"\""+

                "}";
    }


    @Test
    public void twoClientsGetCorrectUserNameOnLogTest(){
        Assert.assertTrue( MDC.get("frontEndDate") == null);
        Assert.assertTrue( MDC.get("frontEndUser") == null);
        Assert.assertTrue( MDC.get("frontEndAccountId") == null);

        FrontEndLog logData = getSimpleFELogTest();
        loggingService.logFrontendLogs(Arrays.asList(logData));
        Assert.assertTrue( MDC.get("frontEndDate") == null);
        Assert.assertTrue( MDC.get("frontEndUser") == null);
        Assert.assertTrue( MDC.get("frontEndAccountId") == null);
        logData = getSimpleFELogTest();
        logData.setAccountId("134");
        logData.setUsername("FooFee");
        loggingService.logFrontendLogs(Arrays.asList(logData));
        Assert.assertTrue( MDC.get("frontEndDate") == null);
        Assert.assertTrue( MDC.get("frontEndUser") == null);
        Assert.assertTrue( MDC.get("frontEndAccountId") == null);

    }

    @Test
    public void simpleLoggingTest() {
        FrontEndLog logData = getSimpleFELogTest();
        loggingService.logFrontendLogs(Arrays.asList(logData));
    }

    @Test
    public void simpleLoggingForAuditLevelTest() {
        FrontEndLog logData = getSimpleFELogTest();
        logData.setLogLevel("AUDIT");
        loggingService.logFrontendLogs(Arrays.asList(logData));
    }

    @Test
    public void objectMappingTest() throws IOException {
        String logText = getSimpleLogDataJson();
        ObjectMapper objectMapper = new ObjectMapper();
        FrontEndLog log = objectMapper.readValue(logText, FrontEndLog.class);
        Assert.assertEquals(log.getCurrentUtcTime(),currentUtcTime);
        Assert.assertEquals(log.getData(),data);
        Assert.assertEquals(log.getLoggingCategory(),loggingCategory);
        Assert.assertEquals(log.getLogLevel(),logLevel);
        Assert.assertEquals(log.getUsername(),username);
        Assert.assertEquals(log.getAccountId(),accountId);

    }


    @Test
    public void loggingWithMissingAccountIdTest() throws IOException, JSONException {
        String logText = getSimpleLogDataJson();
        JSONObject logJson = new JSONObject(logText);
        logJson.remove("accountId");

        ObjectMapper objectMapper = new ObjectMapper();
        FrontEndLog log = objectMapper.readValue(logJson.toString(), FrontEndLog.class);
        Assert.assertEquals(log.getCurrentUtcTime(),currentUtcTime);
        Assert.assertEquals(log.getData(),data);
        Assert.assertEquals(log.getLoggingCategory(),loggingCategory);
        Assert.assertEquals(log.getLogLevel(),logLevel);

    }
    @Test
    public void loggingWithMissingClientIPTest() throws IOException, JSONException {
        String logText = getSimpleLogDataJson();
        JSONObject logJson = new JSONObject(logText);
        logJson.remove("clientIP");

        ObjectMapper objectMapper = new ObjectMapper();
        FrontEndLog log = objectMapper.readValue(logJson.toString(), FrontEndLog.class);
        Assert.assertEquals(log.getCurrentUtcTime(),currentUtcTime);
        Assert.assertEquals(log.getData(),data);
        Assert.assertEquals(log.getLoggingCategory(),loggingCategory);
        Assert.assertEquals(log.getLogLevel(),logLevel);

    }
    @Test
    public void loggingWithMissingCurrentUtcTime() throws IOException, JSONException {
        String logText = getSimpleLogDataJson();
        JSONObject logJson = new JSONObject(logText);
        logJson.remove("currentUtcTime");

        ObjectMapper objectMapper = new ObjectMapper();
        FrontEndLog log = objectMapper.readValue(logJson.toString(), FrontEndLog.class);
        Assert.assertEquals(log.getCurrentUtcTime(),unavailable);
        Assert.assertEquals(log.getData(),data);
        Assert.assertEquals(log.getLoggingCategory(),loggingCategory);
        Assert.assertEquals(log.getLogLevel(),logLevel);

    }
    @Test
    public void loggingWithMissingData() throws IOException, JSONException {
        String logText = getSimpleLogDataJson();
        JSONObject logJson = new JSONObject(logText);
        logJson.remove("data");

        ObjectMapper objectMapper = new ObjectMapper();
        FrontEndLog log = objectMapper.readValue(logJson.toString(), FrontEndLog.class);
        Assert.assertEquals(log.getCurrentUtcTime(),currentUtcTime);
        Assert.assertEquals(log.getData(),unavailable);
        Assert.assertEquals(log.getLoggingCategory(),loggingCategory);
        Assert.assertEquals(log.getLogLevel(),logLevel);

    }
    @Test
    public void loggingWithMissingLoggingCategoryTest() throws IOException, JSONException {
        String logText = getSimpleLogDataJson();
        JSONObject logJson = new JSONObject(logText);
        logJson.remove("loggingCategory");

        ObjectMapper objectMapper = new ObjectMapper();
        FrontEndLog log = objectMapper.readValue(logJson.toString(), FrontEndLog.class);
        Assert.assertEquals(log.getCurrentUtcTime(),currentUtcTime);
        Assert.assertEquals(log.getData(),data);
        Assert.assertEquals(log.getLoggingCategory(),unavailable);
        Assert.assertEquals(log.getLogLevel(),logLevel);

    }
    @Test
    public void loggingWithMissingLogLevelTest() throws IOException, JSONException {
        String logText = getSimpleLogDataJson();
        JSONObject logJson = new JSONObject(logText);
        logJson.remove("logLevel");

        ObjectMapper objectMapper = new ObjectMapper();
        FrontEndLog log = objectMapper.readValue(logJson.toString(), FrontEndLog.class);
        Assert.assertEquals(log.getCurrentUtcTime(),currentUtcTime);
        Assert.assertEquals(log.getData(),data);
        Assert.assertEquals(log.getLoggingCategory(),loggingCategory);
        Assert.assertEquals(log.getLogLevel(),unavailable);

    }
    @Test
    public void loggingWithMissingLogSourceTest() throws IOException, JSONException {
        String logText = getSimpleLogDataJson();
        JSONObject logJson = new JSONObject(logText);
        logJson.remove("logSource");

        ObjectMapper objectMapper = new ObjectMapper();
        FrontEndLog log = objectMapper.readValue(logJson.toString(), FrontEndLog.class);
        Assert.assertEquals(log.getCurrentUtcTime(),currentUtcTime);
        Assert.assertEquals(log.getData(),data);
        Assert.assertEquals(log.getLoggingCategory(),loggingCategory);
        Assert.assertEquals(log.getLogLevel(),logLevel);

    }

    @Test
    public void getServerDateWithValidArguments(){
        String dateFormat = "dd/MM/YYYY HH:mm:ss";
        String timeZone = "UTC";
        ServerDate result = loggingService.getServerDateTime(timeZone, dateFormat);

        Assert.assertEquals(result.dateFormat, dateFormat);
        Assert.assertEquals(result.timeZone.getID(), timeZone);
        Assert.assertNotNull(result.serverDateTime);
    }

    @Test
    public void getServerDateWithInvalidTimeZone(){
        String dateFormat = "dd/MM/YYYY HH:mm:ss";
        String timeZone = "UTC";
        ServerDate result = loggingService.getServerDateTime("abc", dateFormat);

        Assert.assertEquals(result.dateFormat, dateFormat);
        Assert.assertEquals(result.timeZone.getID(), timeZone);
        Assert.assertNotNull(result.serverDateTime);
    }

    @Test
    public void getServerDateWithInvalidDateFormat(){
        String defaultDateFormat = "dd/mm/yy hh:mm:ss:SSS";
        String timeZone = "UTC";
        ServerDate result = loggingService.getServerDateTime("abc", "yo yo yo");

        Assert.assertEquals(result.dateFormat, defaultDateFormat);
        Assert.assertEquals(result.timeZone.getID(), timeZone);
        Assert.assertNotNull(result.serverDateTime);
    }
    @Test
    public void logForAuditLevel(){
        logger.log(AuditLevel.AUDIT,"message");
    }
    }
