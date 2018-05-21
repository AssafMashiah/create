package org.t2k.cgs.persistence.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;

public class MongoDao {

    @Autowired
    private MongoTemplate mongoTemplate;

    public MongoDao() {
    }

    protected MongoTemplate getMongoTemplate() {
        return mongoTemplate;
    }
}
