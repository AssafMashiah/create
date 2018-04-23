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
 * Time: 7:43 PM
 */
public class RemoveSelectedStandardsFromTasks extends CommonTask {

    private static final String SELECTED_STANDARDS = "selectedStandards";

    private MigrationDao migrationDao;

    @Override
    protected void executeUpInternal() throws Exception {

        List<DBObject> lessons = migrationDao.getLessonsDbObjects();

        for (DBObject lesson : lessons) {

            removeSelectedStandards(lesson);

            migrationDao.saveLesson(lesson);
        }
    }

    private void removeSelectedStandards(DBObject object) {

        if (object.containsField(SELECTED_STANDARDS)) {
            object.removeField(SELECTED_STANDARDS);
        }

        for (String key : object.keySet()) {

            Object value = object.get(key);

            if (value instanceof BasicDBList) {
                BasicDBList list = (BasicDBList) value;

                for (int i = 0; i < list.size(); i++) {
                    if(list.get(i) instanceof DBObject) {
                        removeSelectedStandards((DBObject) list.get(i));
                    }
                }

            } else if (value instanceof DBObject) {
                removeSelectedStandards((DBObject) value);
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
