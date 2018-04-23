package com.t2k.cgs.dbupgrader.dao;

import com.mongodb.BasicDBObjectBuilder;
import com.mongodb.DBObject;
import com.t2k.common.dbupgrader.dao.IUpdateLogDao;
import com.t2k.common.dbupgrader.model.OperationEnum;
import com.t2k.common.dbupgrader.model.TaskDescriptor;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 10/24/12
 * Time: 10:42 AM
 */
public class UpdateMongoLogDao implements IUpdateLogDao {

    private MongoTemplate mongoTemplate;

    private static final String MIGRATION_LOG_COLLECTION_NAME = "migrationLog";
    private static final DateFormat DF = new SimpleDateFormat("dd-MM-yyyy hh:mm:ss");

    @Override
    public int readLastExecutedTask(String s) throws Exception {

        /*CommandResult cr = mongoTemplate.executeCommand("db." + MIGRATION_LOG_COLLECTION_NAME +
                                                          ".find({version:\"" + s + "\"})" +
                                                          ".sort({id:-1})" +
                                                          ".limit(1);");
*/

        Query q = Query.query(Criteria.where("version").is(s)).limit(1);

        q.with(new Sort(Sort.Direction.DESC, "id"));

        DBObject obj = mongoTemplate.findOne(q, DBObject.class,MIGRATION_LOG_COLLECTION_NAME);

        if(obj == null){
            return 0;
        }

        return (Integer)obj.get("id");
    }

    @Override
    public void writeLastExecutedTask(String s, TaskDescriptor taskDescriptor, OperationEnum operationEnum) throws Exception {

       /* CommandResult cr = mongoTemplate.executeCommand("db." + MIGRATION_LOG_COLLECTION_NAME +
            ".insert({" +
            "version: \"" + s + "\"" +
            "id: \"" + taskDescriptor.getId() + "\"" +
            "name: \"" + taskDescriptor.getName() + "\"" +
            "type: \"" + taskDescriptor.getType().name() + "\"" +
            "operation: \"" + operationEnum.name() + "\"" +
            "updated: \"" + DF.format(new Date()) + "\"" +
            "});");*/


        DBObject dbObject = BasicDBObjectBuilder.start()
                                .add("version",s)
                                .add("id",taskDescriptor.getId())
                                .add("name",taskDescriptor.getName())
                                .add("type",taskDescriptor.getType().name())
                                .add("operation",operationEnum.name())
                                .add("updated",DF.format(new Date()))
                                .get();

        mongoTemplate.insert(dbObject,MIGRATION_LOG_COLLECTION_NAME);
    }


    ///////////////////////
    // Injection Setters //
    ///////////////////////
    public void setMongoTemplate(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

}
