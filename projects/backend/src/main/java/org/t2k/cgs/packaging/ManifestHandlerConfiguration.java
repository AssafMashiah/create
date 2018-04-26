package org.t2k.cgs.packaging;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class to instantiate {@link ManifestHandler} beans
 */
@Configuration
public class ManifestHandlerConfiguration {

    @Bean(name = "catalogueManifestHandler")
    public ManifestHandler catalogueManifestHandler() {
        return new ManifestHandlerImpl(true, false);
    }

    @Bean(name = "standAloneManifestHandler")
    public ManifestHandler standAloneManifestHandler() {
        return new ManifestHandlerImpl(false, false);
    }

    @Bean(name = "blossomManifestHandler")
    public ManifestHandler blossomManifestHandler() {
        return new ManifestHandlerImpl(false, true);
    }

    @Bean(name = "scormManifestHandler")
    public ManifestHandler scormManifestHandler() {
        return new ManifestHandlerImpl(false, true);
    }
}
