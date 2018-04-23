package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 6/19/13
 * Time: 8:40 PM
 */
public class FixTaskType extends CommonTask {

    private static final String TASKS = "tasks";
    private static final String TASK = "task";
    private static final String TYPE = "type";

    private MigrationDao migrationDao;

    @Override
    protected void executeUpInternal() throws Exception {
        List<DBObject> lessons = migrationDao.getLessonsDbObjects();

        for (DBObject lesson : lessons) {

            fixTasksTypes(lesson, null);

            migrationDao.saveLesson(lesson);
        }
    }

    private void fixTasksTypes(DBObject object, String parentName) {

        if (TASKS.equals(parentName) && object.containsField(TYPE)) {
            object.put(TYPE, TASK);
        }

        //recursion
        for (String key : object.keySet()) {

            Object value = object.get(key);

            if (value instanceof BasicDBList) {
                BasicDBList list = (BasicDBList) value;

                for (int i = 0; i < list.size(); i++) {
                    if (list.get(i) instanceof DBObject) {
                        fixTasksTypes((DBObject) list.get(i), key);
                    }
                }

            } else if (value instanceof DBObject) {
                fixTasksTypes((DBObject) value, key);
            }
        }
    }

    @Override
    protected void executeDownInternal() throws Exception {
    }

    ///////////////////////
    // Injection Setters //
    ///////////////////////


    public void setMigrationDao(MigrationDao migrationDao) {
        this.migrationDao = migrationDao;
    }
}
