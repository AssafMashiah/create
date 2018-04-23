package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.DBRef;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.springframework.beans.factory.annotation.Required;

import java.util.Arrays;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 27/08/13
 * Time: 14:10
 */
public class AddCustomizationToCgsUsers extends CommonTask {

    private MigrationDao migrationDao;
    private String customizationKey = "customization";
    private String cgsShowHintsModeKey="cgsHintsShowMode";
    private String cgsShowHintsModeValue="showAll";
    private List<String> ROLES_FOR_MIGRATION = Arrays.asList("EDITOR","AUTHOR");
    @Override
    protected void executeUpInternal() throws Exception {
        fixUsers();
    }

    public void fixUsers() {
        List<DBObject> users = migrationDao.getAllUsers();
        if (users != null) {
            System.out.println("Number of users to go over: " + users.size());
            for (DBObject userDBObject : users) {
                if (ROLES_FOR_MIGRATION.contains(getRoleName(userDBObject))){
                    System.out.println("start fixing user  " + userDBObject.get("userId")+" with role "+getRoleName(userDBObject));
                    addCustomizationWithShowHintsMode(userDBObject);
                    migrationDao.saveUser(userDBObject);
                    }

            }
            System.out.println("fixing users  completed..");
        }
    }

    private String getRoleName(DBObject userDBObject){
        Object role = userDBObject.get("role");
        String roleName = null;
        if (role instanceof DBRef) {
            DBRef roleRef = (DBRef)role;
            roleName = roleRef.fetch().get("name").toString();
        }
         return roleName;
        }

    private void addCustomizationWithShowHintsMode(DBObject user){

        if (!user.containsField(customizationKey)) // adding "customize" if necessery
            user.put(customizationKey,new BasicDBObject());

       DBObject customization = (DBObject) user.get(customizationKey);
        if (!customization.containsField(cgsShowHintsModeKey))
            customization.put(cgsShowHintsModeKey,cgsShowHintsModeValue);
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
