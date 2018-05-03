package org.t2k.cgs.utils;

import org.apache.commons.lang.time.StopWatch;
import org.apache.log4j.Logger;
import org.testng.annotations.Test;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 17/06/14
 * Time: 15:09
 */
@Test(groups = "ignore")
public class LoggingTest {

    private static Logger logger = Logger.getLogger(LoggingTest.class);
    private String stringToAdd = "aaaaaa";

   @Test
    public void bigStringVsMultipleSmallStrings() {
        int N = 100000;
        StringBuilder strList = new StringBuilder();
        StopWatch stopWatch1 = new StopWatch();
        stopWatch1.start();
        for (int i = 0; i < N; i++) {
            strList.append(stringToAdd);
        }
        logger.debug(strList.toString()); //logging of the long string
        stopWatch1.stop();
        String bigStringTime = stopWatch1.toString();

        StopWatch stopWatch2 = new StopWatch();
        stopWatch2.start();

        for (int i = 0; i < N; i++) {
            logger.debug(stringToAdd);  //logging short strings
        }
        stopWatch2.stop();
        String multipleStringsTime = stopWatch2.toString();

        logger.debug("One big string logging time = " + bigStringTime);
        logger.debug("Multiple strings logging time = " + multipleStringsTime);
        String winner = null;
        if (stopWatch1.getTime() > stopWatch2.getTime())
            winner = "Multiple short Strings";
        else
            winner = "One long String";
        logger.debug("The winner is " + winner);


    }
}

