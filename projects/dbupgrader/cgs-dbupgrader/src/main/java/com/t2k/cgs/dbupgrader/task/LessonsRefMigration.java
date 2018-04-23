package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;

import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 09/06/13
 * Time: 19:29
 */
public class LessonsRefMigration extends CommonTask{
    public static final String LESSONS_REF = "lessonsRef";
    public static final String TOC_ITEMS_REF = "tocItemRefs";
    public static final String TYPE = "type";
    public static final String LESSON = "lesson";
    public static final String TOC_ITEMS = "tocItems";
    public static final String CONTENT_DATA = "contentData";
    public static final String TOC = "toc";
    private MigrationDao migrationDao;

    public void changeCoursesDbObjects(DBObject dbObject) {
        Map<String, DBObject> contentDataMap = (Map<String, DBObject>) dbObject.get(CONTENT_DATA);
        Map<String, DBObject> tocMap = (Map<String, DBObject>) contentDataMap.get(TOC);
        if (tocMap != null) {
            changeTocMap(tocMap);
            migrationDao.saveCourse(dbObject);
        }
    }


    private void changeTocMap(Map<String,DBObject> tocMap) {
        //make the necessary change
        DBObject lessonsRefDbObject = tocMap.get(LESSONS_REF);
        if (lessonsRefDbObject != null) {
            tocMap.put(TOC_ITEMS_REF, lessonsRefDbObject);
            tocMap.remove(LESSONS_REF);
            BasicDBList lessonsRefList = (BasicDBList)lessonsRefDbObject;
            for (Object refs : lessonsRefList) {
                Map<String, String> refsMap = (Map<String, String>) refs;
                if (refsMap != null) {
                    refsMap.put(TYPE, LESSON);
                }
            }
        }
         //recursive call for all (sub) toc items
        DBObject tocItemsDbObject = tocMap.get(TOC_ITEMS);
        BasicDBList tocItemsList = (BasicDBList) tocItemsDbObject;
        if (tocItemsList != null) {
            for (Object tocItem : tocItemsList) {
                Map<String, DBObject> tocItemMap = (Map<String, DBObject>) tocItem;
                if (tocItemMap != null) {
                    changeTocMap(tocItemMap);
                }
            }
        }
    }

    public void changeCourses() {
        List<DBObject> coursesObjects = migrationDao.getCoursesDbObjects();
        for (DBObject courseDbObject : coursesObjects) {
            changeCoursesDbObjects(courseDbObject);
        }
    }


    public MigrationDao getMigrationDao() {
        return migrationDao;
    }

    public void setMigrationDao(MigrationDao migrationDao) {
        this.migrationDao = migrationDao;
    }

    @Override
    protected void executeUpInternal() throws Exception {
        changeCourses();
    }

    @Override
    protected void executeDownInternal() throws Exception {
    }
}
