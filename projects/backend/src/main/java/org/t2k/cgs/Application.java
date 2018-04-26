package org.t2k.cgs;

import com.t2k.configurations.Configuration;
import org.apache.catalina.connector.Connector;
import org.apache.catalina.startup.Tomcat;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.context.embedded.EmbeddedServletContainerException;
import org.springframework.boot.context.embedded.EmbeddedServletContainerFactory;
import org.springframework.boot.context.embedded.FilterRegistrationBean;
import org.springframework.boot.context.embedded.ServletRegistrationBean;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainer;
import org.springframework.boot.context.embedded.tomcat.TomcatEmbeddedServletContainerFactory;
import org.springframework.boot.context.web.SpringBootServletInitializer;
import org.springframework.boot.web.servlet.ServletComponentScan;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import org.springframework.web.context.request.RequestContextListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.web.filter.DelegatingFilterProxy;
import org.springframework.web.servlet.DispatcherServlet;
import org.t2k.cgs.config.SpringProfiles;
import org.t2k.cgs.course.CourseDataService;
import org.t2k.cgs.filters.EtagHeaderFilter;
import org.t2k.cgs.filters.HeadersConfigFilter;

import javax.servlet.ServletException;
import java.io.File;
import java.io.IOException;
import java.net.InetAddress;
import java.net.URL;
import java.util.*;

/**
 * @author Alex Burdusel on 2016-05-27.
 */
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class, HibernateJpaAutoConfiguration.class})
@ComponentScan({"org.t2k"})
//@ImportResource({"classpath*:/springContext/applicationContext-service.xml",
////        "classpath*:applicationContext-manager.xml"
//})
@EnableScheduling
@ServletComponentScan("org.t2k")
public class Application extends SpringBootServletInitializer {

    private static Logger logger = Logger.getLogger(CourseDataService.class);
    private static List<String> webApps = new ArrayList<>();
    @Autowired
    private Environment env;

    public static void main(String[] args) throws Exception {
        SpringApplication app = new SpringApplication(Application.class);
        ApplicationContext ctx = app.run(args);
        Environment env = ctx.getEnvironment();

//        logger.info("Let's inspect the beans provided by Spring Boot:");
//        String[] beanNames = ctx.getBeanDefinitionNames();
//        Arrays.sort(beanNames);
//        for (String beanName : beanNames) {
//            logger.info(beanName);
//        }
        // run upgrade db
//        if (Arrays.asList(env.getActiveProfiles()).contains("dev")) {
//            FlowManager flowManager = new FlowManager();
//            flowManager.execute(false, false, false);
//        }

        logger.info(String.format("\n----------------------------------------------------------\n\t" +
                        "Application '%s' is running! Access URLs:\n\t" +
                        "Local: \t\thttp://localhost:%s%s\n\t" +
                        "External: \thttp://%s:%s%s" +
                        "\n----------------------------------------------------------",
                env.getProperty("spring.application.name"),
                env.getProperty("server.port"),
                env.getProperty("server.contextPath", ""),
                InetAddress.getLocalHost().getHostAddress(),
                env.getProperty("server.port"),
                env.getProperty("server.contextPath", "")));
        if (webApps.size() > 0) {
            logger.info(String.format("\n----------------------------------------------------------\n\t" +
                            "Additional web applications loaded on embedded Tomcat server: \n\t%s" +
                            "\n----------------------------------------------------------",
                    webApps));
        }
    }

    @Bean
    @Profile(SpringProfiles.DEVELOPMENT)
    // we don't instantiate and customize an embedded tomcat for production environment
    @Autowired
    public EmbeddedServletContainerFactory servletContainerFactory(Configuration configuration) {
        TomcatEmbeddedServletContainerFactory tomcat = new TomcatEmbeddedServletContainerFactory() {
            @Override
            protected TomcatEmbeddedServletContainer getTomcatEmbeddedServletContainer(Tomcat tomcat) {
                addWebappToTomcat(tomcat, "/cms", configuration.getProperty("cmsHome"));
                addWebappToTomcat(tomcat, "/WIRISeditor", getWirisEditorWarPath());
                return super.getTomcatEmbeddedServletContainer(tomcat);
            }

            @Override
            protected File createTempDir(String prefix) {
                // we override this method to create the webapps dir, which is not created when tomcat creates the
                // tempDir on dev environment and adding webapp to tomcat fails
                try {
                    File tempDir = File.createTempFile(prefix + ".", "." + getPort());
                    tempDir.delete();
                    tempDir.mkdir();
                    new File((tempDir.getAbsolutePath() + "/webapps")).mkdir();
                    tempDir.deleteOnExit();
                    return tempDir;
                } catch (IOException ex) {
                    throw new EmbeddedServletContainerException("Unable to create tempDir. java.io.tmpdir is set to "
                            + System.getProperty("java.io.tmpdir"), ex);
                }
            }

//            @Override
//            protected void postProcessContext(Context context) {
//                SecurityConstraint securityConstraint = new SecurityConstraint();
//                securityConstraint.setUserConstraint("CONFIDENTIAL");
//                SecurityCollection collection = new SecurityCollection();
//                collection.addPattern("/auth/*");
//                securityConstraint.addCollection(collection);
//                context.addConstraint(securityConstraint);
//            }
        };

        // spring autoconfig for ssl fails to work for embedded tomcat earlier to 7.0.68, as it is unable to read the key from jar
        // we can't use 7.0.68 because production environment uses 7.0.54 and we replicate the environment. when updated, we can switch to spring autoconfig and
        // instantiate only the http connector, which is commented out below
        // we don't handle null pointer exception on connector instantiation, because we want the app to fail if it couldn't be created,
        // otherwise we would be missing https
        tomcat.addAdditionalTomcatConnectors(createSslConnector());
//        Connector httpConnector = createPlainConnector();
//        if (httpConnector != null) {
//            tomcat.addAdditionalTomcatConnectors(httpConnector);
//            logger.info("Additional Tomcat connectors: " + tomcat.getAdditionalTomcatConnectors());
//        }
        return tomcat;
    }

    private Connector createPlainConnector() {
        String httpPort = env.getProperty("server.http.port");
        String httpsPort = env.getProperty("server.port");
        if (httpPort == null) {
            logger.info("No custom HTTP port defined, additional HTTP endpoint will not be created");
            return null;
        }
        Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
        connector.setScheme("http");
        connector.setPort(Integer.parseInt(httpPort));
        connector.setRedirectPort(Integer.parseInt(httpsPort));
        return connector;
    }

    private Connector createSslConnector() {
        String httpsPort = env.getProperty("server.https.port");
        if (httpsPort == null) {
            logger.info("No custom HTTPS port defined, additional HTTPS endpoint will not be created");
            return null;
        }
        Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
        connector.setPort(Integer.parseInt(httpsPort));
        connector.setScheme("https");
        connector.setAttribute("secure", true);
        connector.setAttribute("SSLEnabled", true);
        connector.setAttribute("sslProtocol", env.getProperty("server.https.ssl.protocol"));
        String keyStore = env.getProperty("server.https.ssl.keyStore");
        if (keyStore.contains("classpath:")) {
            URL keyStoreURL = Application.class.getClassLoader().getResource(keyStore.replace("classpath:", ""));
            keyStore = keyStoreURL == null ? null : keyStoreURL.getPath();
        }
        // in case keyStore is null, the app will crash, which it should as it cannot find the key
        connector.setAttribute("keystoreFile", keyStore);
        connector.setAttribute("keystorePass", env.getProperty("server.https.ssl.keyStorePassword"));
        connector.setAttribute("keystoreType", env.getProperty("server.https.ssl.keyStoreType"));
        connector.setAttribute("keyAlias", env.getProperty("server.https.ssl.keyAlias"));
        connector.setAttribute("clientAuth", "false");
        return connector;
    }

    /////////////////////////////////////////////////////////////////
    //                          Dispatchers                        //
    /////////////////////////////////////////////////////////////////

    @Bean
    public ServletRegistrationBean dispatcher() {
        DispatcherServlet dispatcherServlet = new DispatcherServlet();
        AnnotationConfigWebApplicationContext applicationContext = new AnnotationConfigWebApplicationContext();
//        applicationContext.register();
        dispatcherServlet.setApplicationContext(applicationContext);
        ServletRegistrationBean registration = new ServletRegistrationBean(dispatcherServlet,
                "",
                "/",
                "/client/*",
                "/cgs/client/*",
//                "/admin/*",
                "/rest/*",
                "/cgs/rest/*",
                "/cms/*",
                "/cgs/*",
                "/logging/*",
                "/cgs/logging/*",
                "/websocket/*",
                "/cgs/websocket/*");
        registration.setName("dispatcher");
        registration.setLoadOnStartup(2);
        Map<String, String> params = new HashMap<>();
        params.put("contextConfigLocation", "classpath*:springContext/applicationContext-dispatcher.xml");
        registration.setInitParameters(params);
        registration.setAsyncSupported(true);
        return registration;
    }

    /////////////////////////////////////////////////////////////////
    //                          Listeners                          //
    /////////////////////////////////////////////////////////////////

//    @Bean
//    public ContextLoaderListener contextLoaderListener() {
//        return new ContextLoaderListener();
//    }

    @Bean
    public RequestContextListener requestContextListener() {
        return new RequestContextListener();
    }

    @Bean
    public HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher();
    }

    /////////////////////////////////////////////////////////////////
    //                          Filters                            //
    /////////////////////////////////////////////////////////////////

    @Bean
    public FilterRegistrationBean characterEncodingFilter() {
        FilterRegistrationBean registration = new FilterRegistrationBean();
        registration.setFilter(new CharacterEncodingFilter());
        Map<String, String> params = new HashMap<>();
        params.put("encoding", "UTF-8");
        params.put("forceEncoding", "true");
        registration.setInitParameters(params);
        registration.addUrlPatterns("/*");
        registration.setName("CharacterEncodingFilter");
        registration.setAsyncSupported(true);
        return registration;
    }

    @Bean
    public FilterRegistrationBean springSecurityFilterChainRegistration() {
        FilterRegistrationBean registration = new FilterRegistrationBean();
        registration.setFilter(new DelegatingFilterProxy());
        registration.addUrlPatterns("/*");
        registration.setName("springSecurityFilterChain");
        registration.setAsyncSupported(true);
        return registration;
    }

    // CACHE filter
    @Bean
    public FilterRegistrationBean headersConfigFilter() {
        FilterRegistrationBean registration = new FilterRegistrationBean();
        registration.setFilter(new HeadersConfigFilter());
        Map<String, String> params = new HashMap<>();
        params.put("Cache-Control", "no-cache, private");
        registration.setInitParameters(params);
        registration.addUrlPatterns("/rest/*");
        registration.setName("headersConfigFilter");
        registration.setAsyncSupported(true);
        return registration;
    }

    @Bean
    public FilterRegistrationBean codeHeadersConfigFilter() {
        FilterRegistrationBean registration = new FilterRegistrationBean();
        registration.setFilter(new HeadersConfigFilter());
        Map<String, String> params = new HashMap<>();
        params.put("Cache-Control", "maxage=604800, private");
        registration.setInitParameters(params);
        registration.addUrlPatterns("/client/*");
        registration.setName("codeHeadersConfigFilter");
        registration.setAsyncSupported(true);
        return registration;
    }

    /**
     * add no-cache header for player's app cache
     * Added to avoid caching of the player's version
     * Bug: CREATE-439
     **/
    @Bean
    public FilterRegistrationBean cacheFilterForPlayer() {
        FilterRegistrationBean registration = new FilterRegistrationBean();
        registration.setFilter(new HeadersConfigFilter());
        Map<String, String> params = new HashMap<>();
        params.put("overrideExistingHeader", "true");
        params.put("Cache-Control", "no-cache, no-store, must-revalidate");
        params.put("Expires", "0");
        params.put("Pragma", "no-store, no-cache");
        registration.setInitParameters(params);
        registration.addUrlPatterns("/client/player/scp/player/players.appcache",
                "/client/player/scp/index.html");
        registration.setName("cacheFilterForPlayer");
        registration.setAsyncSupported(true);
        return registration;
    }

    @Bean
    public FilterRegistrationBean cacheFilterForPlayerCache() {
        FilterRegistrationBean registration = new FilterRegistrationBean();
        registration.setFilter(new HeadersConfigFilter());
        Map<String, String> params = new HashMap<>();
        params.put("overrideExistingHeader", "true");
        params.put("Cache-Control", "no-cache, no-store, must-revalidate");
        params.put("Expires", "0");
        params.put("Pragma", "no-store, no-cache");
        registration.setInitParameters(params);
        registration.addUrlPatterns("/client/player/scp/player/cache.html");
        registration.setName("cacheFilterForPlayerCache");
        registration.setAsyncSupported(true);
        return registration;
    }

    // ETAG Filter
//    @Bean
//    public FilterRegistrationBean etagHeaderFilter() {
//        FilterRegistrationBean registration = new FilterRegistrationBean();
//        registration.setFilter(new DelegatingFilterProxy());
//        registration.addUrlPatterns("/rest/*");
//        registration.setName("etagHeaderFilter");
//        return registration;
//    }

    @Bean
    public FilterRegistrationBean etagHeaderFilter() {
        FilterRegistrationBean registration = new FilterRegistrationBean();
        EtagHeaderFilter etagHeaderFilter = new EtagHeaderFilter();
        List<String> includeUrls = Collections.singletonList("/rest/**/*");
        etagHeaderFilter.setIncludedUrls(includeUrls);
        List<String> excludeUrls = Arrays.asList(
                "/rest/proxy",
                "/rest/publishers/*/courses/getExportedCourse",
                "/rest/publishers/*/packages/*/download",
                "/rest/narrationService/ivonaService",
                "/rest/publishers/*/ebooks/**");

        etagHeaderFilter.setExcludedUrls(excludeUrls);
        registration.setFilter(etagHeaderFilter);
        registration.addUrlPatterns("/rest/*");
        registration.setName("etagHeaderFilter");
        registration.setAsyncSupported(true);
        return registration;
    }

//    private void onDevProfile() throws Exception {
//        //TODO run on upgradeDB context
//        FlowManager flowManager = new FlowManager();
//        flowManager.execute(false, false, false);
//    }

    private void addWebappToTomcat(Tomcat tomcat, String contextPath, String appBasePath) {
        try {
            tomcat.addWebapp(contextPath, appBasePath);
            logger.info(String.format("Added %s web application to embedded Tomcat", contextPath));
            webApps.add(contextPath);
        } catch (ServletException ex) {
            throw new IllegalStateException(String.format("Failed to add %s web application to embedded Tomcat", contextPath), ex);
        }
    }

    private String getWirisEditorWarPath() {
        return Application.class.getProtectionDomain().getCodeSource().getLocation().toString()
                .replace("file:", "")
                .replaceAll("projects/backend/build/classes/main/", "")
                .replaceAll("projects/backend/out/production/classes/", "")
                + "install/src/main/assembly/files/externalWar/WIRISeditor.war";
    }
}
