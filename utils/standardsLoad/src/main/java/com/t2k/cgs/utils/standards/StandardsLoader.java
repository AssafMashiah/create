package com.t2k.cgs.utils.standards;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.FileSystemXmlApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.util.Log4jConfigurer;

import java.io.IOException;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/15/12
 * Time: 2:30 PM
 */
public class StandardsLoader {

    public static void main(String[] args) {

        //Initialize Log4J
        try {
            Resource log4jConfigurationResource = new ClassPathResource("log4j.properties");

            Log4jConfigurer.initLogging(log4jConfigurationResource.getFile().getAbsolutePath());

        } catch (IOException e) {
            System.out.println("ERROR: Unable to find log4j configuration file");
            e.printStackTrace();
            System.exit(1);
        }

        //Initialize Spring IoC container
        ApplicationContext appContext;
        try {
            appContext = new FileSystemXmlApplicationContext("classpath*:applicationContext-*.xml");
        }
        catch (Exception e) {
            e.printStackTrace();
            throw new IllegalStateException("Unable to initialize Spring Context", e);
        }

        Loader loader = (Loader)appContext.getBean("loader");
        loader.loadStandards();
    }

}
