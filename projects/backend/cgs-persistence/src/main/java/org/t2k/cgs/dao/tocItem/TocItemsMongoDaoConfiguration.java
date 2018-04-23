package org.t2k.cgs.dao.tocItem;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
