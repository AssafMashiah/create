package org.t2k.cgs.config.app;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.t2k.cgs.persistence.dao.TocItemsMongoDao;

/**
 * Configuration class to instantiate {@link TocItemsMongoDao} beans
 */
@Configuration
public class TocItemsMongoDaoConfiguration {

    @Bean(name = "lessonsDao")
    public TocItemsMongoDao lessonsDao() {
        return new TocItemsMongoDao("lessons");
    }

    @Bean(name = "assessmentsDao")
    public TocItemsMongoDao assessmentsDao() {
        return new TocItemsMongoDao("assessments");
    }
}
