package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 17/11/13
 * Time: 15:58
 */
public class FixHebrewLocale extends CommonTask {
    private static Logger logger = Logger.getLogger(FixHebrewLocale.class);

    private final static String LOCALES_ATTR = "locales";
    private final static String CONTENT_LOCALES_ATTR = "contentLocales";
    private final static String INTERFACELOCALES_OPTIONS_ATTR = "options";
    private final static String INTERFACELOCALES_SELECTED_ATTR = "selected";

    private MigrationDao migrationDao;

    @Override
    protected void executeUpInternal() throws Exception {
        fixPublishers();
        fixCourses();
        fixGroups();
    }

    public void fixPublishers() {

        List<DBObject> publishers = migrationDao.getAllPublishers();
        for (DBObject publisherObject : publishers) {
            //fix "locales" attribute
            BasicDBList locales = (BasicDBList) publisherObject.get(LOCALES_ATTR);
            BasicDBList fixedLocales = new BasicDBList();
            for (Object locale : locales) {
                fixedLocales.add(fixLocaleString(locale));
            }
            publisherObject.put(LOCALES_ATTR, fixedLocales);

            //fix "interfaceLocales.options" and "interfaceLocales.selected"  attribute
            DBObject interfaceLocales = (DBObject) publisherObject.get("interfaceLocales");
            BasicDBList interfaceLocalesOptions = (BasicDBList) interfaceLocales.get(INTERFACELOCALES_OPTIONS_ATTR);
            fixedLocales = new BasicDBList();
            for (Object locale : interfaceLocalesOptions) {
                fixedLocales.add(fixLocaleString(locale));
            }
            interfaceLocales.put(INTERFACELOCALES_OPTIONS_ATTR, fixedLocales);
            interfaceLocales.put(INTERFACELOCALES_SELECTED_ATTR, fixLocaleString(interfaceLocales.get(INTERFACELOCALES_SELECTED_ATTR)));

            migrationDao.savePublisher(publisherObject);
        }
    }

    public void fixCourses() {
        List<DBObject> courses = migrationDao.getCoursesDbObjects();
        for (DBObject courseObject : courses) {
            DBObject contentData = (DBObject) courseObject.get("contentData");
            BasicDBList locales = (BasicDBList) contentData.get(CONTENT_LOCALES_ATTR);
            BasicDBList fixedLocales = new BasicDBList();
            if (locales == null){
                //old courses, does not have content locale, fix it to en_US
                fixedLocales.add("en_US");
            } else {
                for (Object locale : locales) {
                    fixedLocales.add(fixLocaleString(locale));
                }
            }
            contentData.put(CONTENT_LOCALES_ATTR, fixedLocales);
            migrationDao.saveCourse(courseObject);
        }
    }

    public void fixGroups() {
        List<DBObject> groups = migrationDao.getAllGroups();
        for (DBObject groupObject : groups) {
            BasicDBList locales = (BasicDBList) groupObject.get(LOCALES_ATTR);
            BasicDBList fixedLocales = new BasicDBList();
            for (Object locale : locales) {
                fixedLocales.add(fixLocaleString(locale));
            }
            groupObject.put(LOCALES_ATTR, fixedLocales);
            migrationDao.saveGroup(groupObject);
        }
    }

    private Object fixLocaleString(Object locale) {
        if (locale.equals("he_IL")) {
            return "iw_IL";
        }
        return locale;
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
