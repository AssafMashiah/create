package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.DBRef;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;

import java.io.IOException;
import java.util.List;

/**
 * Created by elad.avidan on 18/08/2014.
 */
public class CreateCleanupJobUser extends CommonTask {

    private Logger logger = Logger.getLogger(CreateCleanupJobUser.class);
    private MigrationDao migrationDao;

    @Override
    protected void executeUpInternal() throws Exception {
        logger.debug("About to add a new cleanup user.");
        DBObject relatesTo = new BasicDBObject();
        relatesTo.put("type", "SUPER_USER");
        relatesTo.put("_id", -1);

        DBObject user = new BasicDBObject();
        user.put("userId", -3);
        user.put("firstName", "cleanup");
        user.put("lastName", "cleanup");
        user.put("email", "cleanup@t2k.com");
        user.put("username", "System.t2k.cleanup");
        user.put("password", "123456");
        user.put("role", new DBRef(migrationDao.getDb(), "roles", getEditorRole()));
        user.put("relatesTo", relatesTo);
        migrationDao.saveUser(user);

        logger.debug(String.format("User %s was added to the DB.", user.get("username")));
    }

    private DBObject getEditorRole() throws IOException {
        List<DBObject> allRoles = migrationDao.getAllRoles();
        for (DBObject role : allRoles) {
            if (role.get("name").equals("EDITOR")) {
                return role;
            }
        }
        return null;
    }

    @Override
    protected void executeDownInternal() throws Exception {
        // To change body of implemented methods use File | Settings | File Templates.
    }

    ///////////////////////
    // Injection Setters //
    ///////////////////////

    @Required
    public void setMigrationDao(MigrationDao migrationDao) {
        this.migrationDao = migrationDao;
    }
}
