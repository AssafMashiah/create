package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.springframework.beans.factory.annotation.Required;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 27/08/13
 * Time: 14:10
 */
public class FixAccountsAndUsers extends CommonTask {

    private MigrationDao migrationDao;


    @Override
    protected void executeUpInternal() throws Exception {
        fixPublishers();
        fixUsers();
    }


    public void fixPublishers() {
        List<DBObject> publishers = migrationDao.getAllPublishers();
        if (publishers != null) {
            System.out.println("Number of publishers to fix: " + publishers.size());
            for (DBObject publisherDBObject : publishers) {
                Object publisherIdObj = publisherDBObject.get("publisherId");
                System.out.println("start fixing publisher : " + publisherIdObj);


                if (publisherIdObj != null) {

                    int publisherId = 0;
                    if(publisherIdObj instanceof Integer){
                        publisherId=((Integer) publisherIdObj).intValue();
                    }else {
                        publisherId=((Double) publisherIdObj).intValue();
                    }


                    DBObject relatesTo = new BasicDBObject();
                    relatesTo.put("_id", -1);
                    relatesTo.put("type", "SUPER_USER");
                    publisherDBObject.put("relatesTo", relatesTo);
                    publisherDBObject.put("accountId", publisherId);
                    publisherDBObject.removeField("publisherId");
                    System.out.println("saving  fixed publisher : " + publisherId);
                    migrationDao.savePublisher(publisherDBObject);
                }
            }
            System.out.println("publisher fixed.");
        }
    }

    public void fixUsers() {
        List<DBObject> users = migrationDao.getAllUsers();
        if (users != null) {
            System.out.println("Number of users to fix: " + users.size());
            for (DBObject userDBObject : users) {
                Integer publisherAccountIdInt = (Integer) userDBObject.get("publisherAccountId");
                System.out.println("start fixing user  " + userDBObject.get("userId"));
                if (publisherAccountIdInt != null) {
                    System.out.println("publisherId: "+publisherAccountIdInt );
                    DBObject relatesTo = new BasicDBObject();
                    relatesTo.put("_id", publisherAccountIdInt.intValue());
                    relatesTo.put("type", "PUBLISHER");
                    userDBObject.put("relatesTo", relatesTo);
                    userDBObject.removeField("publisherAccountId");
                    System.out.println("saving  fixed user: " + userDBObject.get("userId"));
                    migrationDao.saveUser(userDBObject);
                }else{
                    System.out.println("publisherId is empty ..");
                }

            }
            System.out.println("fixing users  completed..");
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
