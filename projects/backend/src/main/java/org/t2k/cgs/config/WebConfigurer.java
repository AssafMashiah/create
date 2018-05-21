package org.t2k.cgs.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.embedded.ConfigurableEmbeddedServletContainer;
import org.springframework.boot.context.embedded.EmbeddedServletContainerCustomizer;
import org.springframework.boot.context.embedded.MimeMappings;
import org.springframework.boot.context.embedded.ServletContextInitializer;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import java.io.File;
import java.nio.file.Paths;
import java.util.Arrays;

/**
 * Configuration of web application with Servlet 3.0 APIs.
 */
@Configuration
public class WebConfigurer implements ServletContextInitializer, EmbeddedServletContainerCustomizer {

    private final Logger log = LoggerFactory.getLogger(WebConfigurer.class);

    @Autowired
    private Environment env;

    @Override
    public void onStartup(ServletContext servletContext) throws ServletException {
        if (env.getActiveProfiles().length != 0) {
            log.info("Web application configuration, using profiles: {}", Arrays.toString(env.getActiveProfiles()));
        }
        log.info("Web application fully configured");
    }

    /**
     * Set up Mime types and, if needed, set the document root.
     */
    @Override
    public void customize(ConfigurableEmbeddedServletContainer container) {
        MimeMappings mappings = new MimeMappings(MimeMappings.DEFAULT);
        // IE issue, see https://github.com/jhipster/generator-jhipster/pull/711
        mappings.add("html", "text/html;charset=utf-8");
        // CloudFoundry issue, see https://github.com/cloudfoundry/gorouter/issues/64
        mappings.add("json", "text/html;charset=utf-8");
        container.setMimeMappings(mappings);

        // root usually exists when spring-boot is started from sources location or IDE, therefore, no need to set by profiles
//        if (Arrays.asList(env.getActiveProfiles()).contains("dev")) {
        setLocationForStaticAssets(container);
//        }
    }

    private void setLocationForStaticAssets(ConfigurableEmbeddedServletContainer container) {
        File root;
        root = new File(getClientSourcesPath());
        if (root.exists() && root.isDirectory()) {
            container.setDocumentRoot(root);
        }
    }

    private String getClientSourcesPath() {
        String rootPath = Paths.get(".").toUri().normalize().getPath();
        if (rootPath.endsWith("projects/backend/cgs-web/")) { //when starting using gradle
            rootPath = rootPath.replace("projects/backend/cgs-web/", "");
        } else if (rootPath.endsWith("projects/backend/")) {
            rootPath = rootPath.replace("projects/backend/", "");
        }
        return rootPath + "projects/frontend/cgs-frontend-war/src/main/webapp";
//        return rootPath + "projects/backend/cgs-web/src/main/webapp/";
    }
}
