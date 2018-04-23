package com.t2k.cgs.dbupgrader.task;

import com.mongodb.DBObject;
import com.mongodb.DBRef;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.springframework.beans.factory.annotation.Required;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 27/08/13
 * Time: 14:10
 */
public class CreateSystemAdmin extends CommonTask {

    private MigrationDao migrationDao;


    @Override
    protected void executeUpInternal() throws Exception {
        setUserAdmin();
    }

    public void setUserAdmin() {
        List<DBObject> users = migrationDao.getAllUsers();
        List<DBObject> roles = migrationDao.getAllRoles();

        HashMap<String, DBObject> _map_roles = new HashMap<String, DBObject>();

        for (DBObject roleDbObject : roles) {
            _map_roles.put(roleDbObject.get("name").toString(), roleDbObject);
        }

        for (DBObject userDBObject : users) {
            Object userIdObject = userDBObject.get("userId");
            if (userIdObject instanceof Double) {
                double userId = (((Double) userIdObject).doubleValue());

                if (userId  == -1) {
                    userDBObject.put("role", new DBRef(migrationDao.getDb(),"roles", _map_roles.get("SYSTEM_ADMIN").get("_id")));
                    migrationDao.saveUser(userDBObject);
                }

                if (userId == -2) {
                    userDBObject.put("role", new DBRef(migrationDao.getDb(),"roles", _map_roles.get("T2K_ADMIN").get("_id")));
                    migrationDao.saveUser(userDBObject);
                }

                userDBObject.removeField("roles");
            } else {
                Object _roles_object = userDBObject.get("roles");
                ArrayList<String> _roles_array = (ArrayList<String>) _roles_object;

                if (_roles_array != null) {
                    userDBObject.removeField("roles");

                    if (_roles_array.get(0).equals("CONTENT_DEVELOPER")) {
                        userDBObject.put("role", new DBRef(migrationDao.getDb(),"roles", _map_roles.get("EDITOR").get("_id")));
                        migrationDao.saveUser(userDBObject);
                    } else if (_roles_array.get(0).equals("PUBLISHER_ADMIN")) {
                        userDBObject.put("role", new DBRef(migrationDao.getDb(),"roles", _map_roles.get("ACCOUNT_ADMIN").get("_id")));
                        migrationDao.saveUser(userDBObject);
                    } else if (_roles_array.get(0).equals("GROUP_ADMIN")) {
                        userDBObject.put("role", new DBRef(migrationDao.getDb(),"roles", _map_roles.get("GROUP_ADMIN").get("_id")));
                        migrationDao.saveUser(userDBObject);
                    }
                }
            }
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
