package org.t2k.cgs.config.app;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.t2k.cgs.domain.usecases.packaging.TocItemsHandler;
import org.t2k.cgs.service.packaging.TocItemsHandlerImpl;

/**
 * Configuration class to instantiate {@link TocItemsHandler} beans
 */
@Configuration
public class TocItemsHandlerConfiguration {

    @Bean(name = "tocItemsHandlerImplWithSha1NameChanges")
    public TocItemsHandler tocItemsHandlerImplWithSha1NameChanges() {
        return new TocItemsHandlerImpl(true);
    }

    @Bean(name = "catalogueTocItemsHandler")
    public TocItemsHandler catalogueTocItemsHandler() {
        return new TocItemsHandlerImpl(true);
    }

    @Bean(name = "blossomTocItemsHandler")
    public TocItemsHandler blossomTocItemsHandler() {
        return new TocItemsHandlerImpl(false);
    }

    @Bean(name = "scormTocItemsHandler")
    public TocItemsHandler scormTocItemsHandler() {
        return new TocItemsHandlerImpl(false);
    }

    @Bean(name = "standAloneTocItemsHandler")
    public TocItemsHandler standAloneTocItemsHandler() {
        return new TocItemsHandlerImpl(false);
    }
}
