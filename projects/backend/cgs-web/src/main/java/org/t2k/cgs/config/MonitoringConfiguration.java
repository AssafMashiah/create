package org.t2k.cgs.config;

import net.bull.javamelody.MonitoringFilter;
import net.bull.javamelody.SessionListener;
import org.springframework.boot.context.embedded.FilterRegistrationBean;
import org.springframework.boot.context.embedded.ServletContextInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportResource;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import java.util.HashMap;
import java.util.Map;

@Configuration
@ImportResource("classpath:net/bull/javamelody/monitoring-spring.xml")
public class MonitoringConfiguration implements ServletContextInitializer {

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        servletContext.addListener(new SessionListener());
    }

//    @Bean
//    public FilterRegistrationBean javaMelody() {
//        final FilterRegistrationBean javaMelody = new FilterRegistrationBean();
//        javaMelody.setFilter(new MonitoringFilter());
//        javaMelody.setAsyncSupported(true);
//        javaMelody.setName("javamelody");
//        javaMelody.setDispatcherTypes(DispatcherType.REQUEST, DispatcherType.ASYNC);
//
//        // see the list of parameters:
//        // https://github.com/javamelody/javamelody/wiki/UserGuide#6-optional-parameters
//        javaMelody.addInitParameter(Parameter.LOG.getCode(), Boolean.toString(true));
//        // to add basic auth:
//        // javaMelody.addInitParameter(Parameter.AUTHORIZED_USERS.getCode(), "admin:pwd");
//        // to change the default storage directory:
//        // javaMelody.addInitParameter(Parameter.STORAGE_DIRECTORY.getCode(), "/tmp/javamelody");
//
//        javaMelody.addUrlPatterns("/*");
//        return javaMelody;
//    }

    @Bean //fixme login configuration for javaMelody monitoring service
    public FilterRegistrationBean monitoringFilter() {
        FilterRegistrationBean registration = new FilterRegistrationBean();
        registration.setFilter(new MonitoringFilter());
        Map<String, String> params = new HashMap<>();
        params.put("system-actions-enabled", "true");
        params.put("no-database", "true");
        registration.setInitParameters(params);
        registration.addUrlPatterns("/*");
        registration.setName("monitoring");
        return registration;
    }
}