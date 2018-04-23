package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;

import java.util.HashMap;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: Elad.Avidan
 * Date: 05/11/2014
 * Time: 16:45
 */
enum CustomFieldsTypes {
    TAGS("tags"),
    DATE("date"),
    BOOLEAN("boolean");
    private String type;

    CustomFieldsTypes(String type) {
        this.type = type;
    }

    String getType() {
        return this.type;
    }

    public static CustomFieldsTypes forName(String name) {
        for (CustomFieldsTypes type : values()) {
            if (type.getType().equals(name)) {
                return type;
            }
        }
        return null;
    }
}

public class AddMissingFieldsToCoursesCustomFields extends CommonTask {

    private static Logger logger = Logger.getLogger(AddMissingFieldsToCoursesCustomFields.class);

    private MigrationDao migrationDao;

    private final String CUSTOM_METADATA = "customMetadata";
    private final String ACCOUNT_ID = "accountId";
    private final String TYPE = "type";
    private final String NAME = "name";
    private final String VALUE = "value";
    private final String CONTENT_DATA = "contentData";
    private final String CUSTOM_FIELDS = "customFields";
    private final String FORMAT = "format";
    private final String SEPARATOR = "separator";

    @Override
    protected void executeUpInternal() throws Exception {
        addMissingFieldsToCoursesCustomFields();
    }

    private void addMissingFieldsToCoursesCustomFields() {
        logger.debug("addMissingFieldsToCoursesCustomFields. About to fix some invalid courses' customFields properties that missing necessary fields.");
        List<DBObject> allPublishers = migrationDao.getAllPublishers();
        for (DBObject publisher : allPublishers) {
            if (!publisher.containsField(CUSTOM_METADATA))
                continue;

            int publisherId = Integer.parseInt(publisher.get(ACCOUNT_ID).toString());
            HashMap<String, String> dateCustomMetadata = new HashMap<>();
            HashMap<String, String> tagsCustomMetadata = new HashMap<>();
            BasicDBList customMetadata = (BasicDBList) publisher.get(CUSTOM_METADATA);

            fillMetadataNamesAndValues(dateCustomMetadata, tagsCustomMetadata, customMetadata);

            List<DBObject> courses = migrationDao.getCoursesDBObjectsByPublisherId(publisherId);
            for (DBObject course : courses) {
                addMissingFieldsToCourseCustomFieldsProperty(dateCustomMetadata, tagsCustomMetadata, course);
            }
        }
    }

    public void addMissingFieldsToCourseCustomFieldsProperty(HashMap<String, String> dateCustomMetadata, HashMap<String, String> tagsCustomMetadata, DBObject course) {
        BasicDBList customFields = (BasicDBList) ((DBObject) course.get(CONTENT_DATA)).get(CUSTOM_FIELDS);
        if (customFields == null || customFields.isEmpty())
            return;

        boolean isCourseModified = false;
        for (int i = 0; i < customFields.size(); i++) {
            DBObject customField = (DBObject) customFields.get(i);
            CustomFieldsTypes customFieldsType = CustomFieldsTypes.forName(customField.get(TYPE).toString());
            if (customFieldsType == null) { // there are types of custom fields we don't need to check like those of Taltal, so just continue.
                continue;
            }

            switch (customFieldsType) {
                case BOOLEAN:
                    if (!customField.containsField(VALUE)) {
                        customField.put(VALUE, false);
                        isCourseModified = true;
                    }
                    break;
                case DATE:
                    if (!customField.containsField(FORMAT)) {
                        String name = customField.get(NAME).toString();
                        String format = dateCustomMetadata.get(name);
                        if (format == null) { // in case this customMetadata doesn't exists anymore in publisher
                            customField.put(FORMAT, "mm/dd/yy");
                        } else {
                            customField.put(FORMAT, format);
                        }
                        isCourseModified = true;
                    }
                    break;
                case TAGS:
                    if (!customField.containsField(SEPARATOR)) {
                        String separator = tagsCustomMetadata.get(customField.get(NAME).toString());
                        if (separator == null) { // in case this customMetadata doesn't exists anymore in publisher
                            customField.put(SEPARATOR, "space");
                        } else {
                            customField.put(SEPARATOR, separator);
                        }
                        isCourseModified = true;
                    }
                    break;
            }
        }

        if (isCourseModified) {
            migrationDao.saveCourse(course);
        }
    }

    public void fillMetadataNamesAndValues(HashMap<String, String> dateCustomMetadata, HashMap<String, String> tagsCustomMetadata, BasicDBList customMetadata) {
        for (int i = 0; i < customMetadata.size(); i++) {
            DBObject metadataObj = (DBObject) customMetadata.get(i);
            CustomFieldsTypes customFieldType = CustomFieldsTypes.forName(metadataObj.get(TYPE).toString());
            if (customFieldType == null)
                continue;

            switch (customFieldType) {
                case DATE:
                    String dateName = metadataObj.get(NAME).toString();
                    dateCustomMetadata.put(dateName, metadataObj.get(VALUE).toString());
                    break;
                case TAGS:
                    String tagsName = metadataObj.get(NAME).toString();
                    tagsCustomMetadata.put(tagsName, metadataObj.get(VALUE).toString());
                    break;
            }
        }
    }

    @Override
    protected void executeDownInternal() throws Exception {
        // To change body of implemented methods use File | Settings | File Templates.
    }

    @Required
    public void setMigrationDao(MigrationDao migrationDao) {
        this.migrationDao = migrationDao;
    }
}
