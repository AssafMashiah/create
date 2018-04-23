package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.springframework.beans.factory.annotation.Required;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 16/09/13
 * Time: 16:17
 */
public class PublisherRelatesToFieldId extends CommonTask {
    private MigrationDao migrationDao;

    @Override
    protected void executeUpInternal() throws Exception {
        fixField();
    }


    public void fixField() {
        List<DBObject> publishers = migrationDao.getAllPublishers();

        for (DBObject publisherObject : publishers) {
            Object relatesTo = publisherObject.get("relatesTo");

            if (relatesTo instanceof BasicDBObject) {
                BasicDBObject relatesToDb = (BasicDBObject)relatesTo;

                if (relatesToDb.containsField("id")) {
                    Object id = relatesToDb.get("id");

                    relatesToDb.removeField("id");
                    relatesToDb.put("_id", id);

                    migrationDao.savePublisher(publisherObject);
                }
            }
           // publisherObject.removeField("relatesTo.id");
            //publisherObject.put("relatesTo._id", id);
        }
    }

    @Override
    protected void executeDownInternal() throws Exception {
        //To change body of implemented methods use File | Settings | File Templates.
    }


    ///////////////////////
    // Injection Setters //
    ///////////////////////
    @Required
    public void setMigrationDao(MigrationDao migrationDao) {
        this.migrationDao = migrationDao;
    }



}
