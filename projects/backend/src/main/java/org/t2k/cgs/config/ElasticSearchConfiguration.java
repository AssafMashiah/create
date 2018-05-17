package org.t2k.cgs.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.elasticsearch.client.Client;
import org.springframework.boot.autoconfigure.data.elasticsearch.ElasticsearchProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.core.EntityMapper;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.io.IOException;
import java.util.Map;

@Configuration
@EnableElasticsearchRepositories(
        basePackages = "org.t2k.cgs",
        excludeFilters = @ComponentScan.Filter( // we exclude mongo classes as they would clash on spring elasticsearch scan
                type = FilterType.ASSIGNABLE_TYPE,
                value = {MongoDBConfiguration.class, MongoRepository.class})
)
public class ElasticSearchConfiguration {

    @Inject
    private com.t2k.configurations.Configuration configuration;

    @Inject
    private ElasticsearchProperties elasticsearchProperties;

    @PostConstruct
    public void init() {
        modifyElasticSearchProperties(configuration, elasticsearchProperties);
    }

    /**
     * Method for modifying the paths set in the application.yml file to use the baseDir in the t2k.properties file
     *
     * @param configuration           configuration object based on t2k.properties file
     * @param elasticsearchProperties es properties from application.yml
     */
    private void modifyElasticSearchProperties(com.t2k.configurations.Configuration configuration,
                                               ElasticsearchProperties elasticsearchProperties) {
        String t2kBaseDir = configuration.getProperty("baseDir");

        Map<String, String> esYmlProperties = elasticsearchProperties.getProperties();

        String dataPath = esYmlProperties.get("path.data");
        dataPath = (dataPath == null)
                ? t2kBaseDir + "/elasticSearch/data"
                : t2kBaseDir + "/" + dataPath;
        esYmlProperties.put("path.data", dataPath);

        String logsPath = esYmlProperties.get("path.logs");
        logsPath = (logsPath == null)
                ? t2kBaseDir + "/elasticSearch/log"
                : t2kBaseDir + "/" + logsPath;
        esYmlProperties.put("path.logs", logsPath);
    }

    @Bean
    public ElasticsearchTemplate elasticsearchTemplate(Client client, Jackson2ObjectMapperBuilder jackson2ObjectMapperBuilder) {
        return new ElasticsearchTemplate(client, new CustomEntityMapper(jackson2ObjectMapperBuilder.createXmlMapper(false).build()));
    }

    public class CustomEntityMapper implements EntityMapper {

        private ObjectMapper objectMapper;

        public CustomEntityMapper(ObjectMapper objectMapper) {
            this.objectMapper = objectMapper;
            objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            objectMapper.configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);
        }

        @Override
        public String mapToString(Object object) throws IOException {
            return objectMapper.writeValueAsString(object);
        }

        @Override
        public <T> T mapToObject(String source, Class<T> clazz) throws IOException {
            return objectMapper.readValue(source, clazz);
        }
    }
}
