package org.t2k.cgs.config;

import org.apache.commons.lang.SystemUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;
import org.t2k.cgs.domain.usecases.CmsService;
import org.t2k.cgs.domain.usecases.packaging.ContentValidator;
import org.t2k.cgs.domain.usecases.ClientConfiguration;
import org.t2k.cgs.security.ClientConfigurationImpl;
import org.t2k.cgs.domain.usecases.PollingIntervals;
import org.t2k.cgs.domain.usecases.VersionService;
import org.t2k.gcr.common.client.GCRClient;
import org.t2k.gcr.common.client.GCRClientImpl;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Alex Burdusel on 2016-06-06.
 */
@Configuration
public class ApplicationConfiguration {

    private Logger logger = Logger.getLogger(this.getClass());

    @Bean(name = "multipartResolver")
    @Inject
    public CommonsMultipartResolver commonsMultipartResolver(com.t2k.configurations.Configuration configuration,
                                                             CmsService cmsService) {
        CommonsMultipartResolver commonsMultipartResolver = new CommonsMultipartResolver();
        commonsMultipartResolver.setDefaultEncoding("utf-8");
        commonsMultipartResolver.setMaxInMemorySize(Integer.parseInt(configuration.getProperty("cms.buffer_size_in_kb")) * 1024);
        try {
            commonsMultipartResolver.setUploadTempDir(new FileSystemResource(cmsService.getTmpLocation()));
        } catch (IOException e) {
            logger.error("IO Exception on setting the temporary directory where uploaded files get stored for CommonsMultipartResolver", e);
        }
        return commonsMultipartResolver;
    }

    @Bean(name = "cgsConfigProps")
    public static PropertyPlaceholderConfigurer cgsConfigProps() {
        final PropertyPlaceholderConfigurer properties = new PropertyPlaceholderConfigurer();
        final List<Resource> resources = new ArrayList<>();
        resources.add(new ClassPathResource("config/t2k.properties"));
        if (SystemUtils.IS_OS_WINDOWS) {
            resources.add(new ClassPathResource("config/t2k-windows.properties"));
        }
        resources.add(new ClassPathResource(("config/version.properties")));
        properties.setLocations(resources.toArray(new Resource[]{}));
        return properties;
    }

    @Bean(name = "t2kConfig")
    public com.t2k.configurations.Configuration t2kConfig() throws Exception {
        List<String> configFiles = new ArrayList<>();
        configFiles.add("config/t2k.properties");
        if (SystemUtils.IS_OS_WINDOWS) {
            configFiles.add("config/t2k-windows.properties");
        }
        com.t2k.configurations.Configuration configuration = new com.t2k.configurations.Configuration(configFiles);
        configuration.loadConfigurations();
        return configuration;
    }

    @Bean(name = "messageSource")
    public ReloadableResourceBundleMessageSource messageSource() throws Exception {
        ReloadableResourceBundleMessageSource messageSource = new ReloadableResourceBundleMessageSource();
        messageSource.setBasename("classpath:/resources/strings");
        messageSource.setUseCodeAsDefaultMessage(true);
        return messageSource;
    }

    @Inject
    @Bean(name = "gcrClient")
    public GCRClient gcrClient(com.t2k.configurations.Configuration configuration) {
        GCRClientImpl gcrClient = new GCRClientImpl();
        gcrClient.setGcrCourseUrl(configuration.getProperty("catalogueUrl"));
        gcrClient.setGcrAppletsUrl(configuration.getProperty("appletsUrl"));
        gcrClient.setGcrUser(configuration.getProperty("catalogueUsername"));
        gcrClient.setGcrPassword(configuration.getProperty("cataloguePassword"));
        gcrClient.setDownloadDir(configuration.getProperty("appletsDownloadDir"));
        gcrClient.init();
        return gcrClient;
    }

    @Inject
    @Bean
    @Scope(value = "session", proxyMode = ScopedProxyMode.TARGET_CLASS)
    public ClientConfiguration getConfiguration(com.t2k.configurations.Configuration configuration,
                                                VersionService versionService,
                                                ContentValidator contentValidator) {
        HttpServletRequest hsrq = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String basePath = String.format("//%s", hsrq.getServerName());
        String cgsPath = basePath + hsrq.getContextPath();
        String restPath = cgsPath + "/rest";
        String cmsBasePath = basePath + "/cms";
        String logoutPath = cgsPath + "/auth/logout";
        String externalLogoutPath = cgsPath + "/auth/external-logout";
        String schemaName = contentValidator.getSchemaName();
        PollingIntervals pollingIntervals =
                new PollingIntervals(
                        configuration.getIntProperty("idlePublishPollingInterval"),
                        configuration.getIntProperty("activePublishPollingInterval"));
        return new ClientConfigurationImpl(restPath, cmsBasePath, logoutPath, versionService.getFullVersion(), schemaName,
                pollingIntervals, externalLogoutPath);
    }
}
