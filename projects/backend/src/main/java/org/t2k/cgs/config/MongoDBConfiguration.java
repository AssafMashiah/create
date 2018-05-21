package org.t2k.cgs.config;

import com.mongodb.*;
import org.apache.commons.lang.StringUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.config.AbstractMongoConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.CustomConversions;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.t2k.cgs.domain.model.tocItem.TocItemSequenceReadConverter;

import javax.inject.Inject;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * @author Alex Burdusel on 2017-01-04.
 */
@Configuration
@EnableMongoRepositories(value = "org.t2k.cgs")
public class MongoDBConfiguration extends AbstractMongoConfiguration {

    @Inject
    private com.t2k.configurations.Configuration configuration;

    @Override
    protected String getDatabaseName() {
        return configuration.getProperty("common.mongo.dbName");
    }

    @Bean
    @Override
    public Mongo mongo() throws Exception {
        MongoCredential credential = MongoCredential.createCredential(
                configuration.getProperty("common.mongo.user"),
                getDatabaseName(),
                configuration.getProperty("common.mongo.password").toCharArray());

        if (configuration.getBooleanProperty("common.mongo.useReplicaSet")) {
            List<ServerAddress> replicaSetSeeds = Arrays.asList(parseReplicaSetSeeds());
            if (replicaSetSeeds.size() < 3) {
                throw new IllegalArgumentException("Replica set must have at least 3 members!");
            }
            return new MongoClient(replicaSetSeeds, Collections.singletonList(credential), parseMongoOptions());
        } else {
            ServerAddress serverAddress = new ServerAddress(configuration.getProperty("common.mongo.host"),
                    configuration.getIntProperty("common.mongo.port"));
            return new MongoClient(serverAddress, Collections.singletonList(credential), parseMongoOptions());
        }
    }

    @Bean
    @Override
    public CustomConversions customConversions() {
        List<Converter<?, ?>> converters = new ArrayList<>();
        converters.add(new TocItemSequenceReadConverter());
        return new CustomConversions(converters);
    }

    @Inject
    @Bean
    public MongoTemplate mongoTemplate(Mongo mongo, MappingMongoConverter mappingMongoConverter) throws Exception {
        // we set a default type mapper with null typeKey, as we want to ignore the _class field mongo creates on hierarchy classes
        // this restricts us to not moving the classes to other packages
        // we will create read converters where we need inheritance
        // see TocItemSequenceReadConverter
        mappingMongoConverter.setTypeMapper(new DefaultMongoTypeMapper(null));
        MongoTemplate mongoTemplate = new MongoTemplate(mongoDbFactory(), mappingMongoConverter);
        mongoTemplate.setWriteConcern(WriteConcern.ACKNOWLEDGED);
        return mongoTemplate;
    }

    private MongoClientOptions parseMongoOptions() {
        WriteConcern writeConcern = new WriteConcern(1, 0, configuration.getBooleanProperty("common.mongo.fsync"));
        return new MongoClientOptions.Builder()
                .connectTimeout(configuration.getIntProperty("common.mongo.connectTimeout"))
                .maxWaitTime(configuration.getIntProperty("common.mongo.maxWaitTime"))
//                .autoConnectRetry(configuration.getBooleanProperty("common.mongo.autoConnectRetry"))
                .socketKeepAlive(configuration.getBooleanProperty("common.mongo.socketKeepAlive"))
                .socketTimeout(configuration.getIntProperty("common.mongo.socketTimeout"))
                .connectionsPerHost(configuration.getIntProperty("common.mongo.connectionsPerHost"))
                .connectTimeout(configuration.getIntProperty("common.mongo.connectTimeout"))
                .threadsAllowedToBlockForConnectionMultiplier(configuration.getIntProperty("common.mongo.threadsAllowedToBlockForConnectionMultiplier"))
                .writeConcern(writeConcern)
                .build();
    }

    private ServerAddress[] parseReplicaSetSeeds() throws UnknownHostException {
        String addresses[] = StringUtils.split(configuration.getProperty("common.mongo.replicaSet"), ",");
        ServerAddress[] serverAddresses = new ServerAddress[addresses.length];
        int i = 0;
        for (String address : addresses) {
            int indexOfSeperator = address.indexOf(":");
            String host = address.substring(0, indexOfSeperator);
            int port = Integer.parseInt(address.substring(indexOfSeperator + 1));
            serverAddresses[i] = new ServerAddress(host, port);
            i++;
        }
        return serverAddresses;
    }
}
