package org.t2k.cgs.persistence.dao.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class TestConfig {

    @Bean
    @Primary
    public PackagesMongoTestDao packageDaoTest() {
        return new PackagesMongoTestDao();
    }

    @Bean
    @Primary
    public PublisherMongoTestDao publisherMongoTestDao() {
        return new PublisherMongoTestDao();
    }

    @Bean
    @Primary
    public LocksMongoTestDao locksMongoTestDao() {
        return new LocksMongoTestDao();
    }
}
