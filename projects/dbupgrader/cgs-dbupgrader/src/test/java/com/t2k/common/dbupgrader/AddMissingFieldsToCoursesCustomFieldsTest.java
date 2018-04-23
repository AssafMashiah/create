package com.t2k.common.dbupgrader;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.cgs.dbupgrader.task.AddMissingFieldsToCoursesCustomFields;
import com.t2k.cgs.dbupgrader.utils.GeneralUtils;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import static org.mockito.Mockito.when;

/**
 * Created with IntelliJ IDEA.
 * User: Elad.Avidan
 * Date: 05/11/2014
 * Time: 18:20
 * To change this template use File | Settings | File Templates.
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

@ContextConfiguration("/applicationContext-manager.xml")
@Test(groups = "ignore")
public class AddMissingFieldsToCoursesCustomFieldsTest extends AbstractTestNGSpringContextTests {

    private final String CUSTOM_METADATA = "customMetadata";
    private final String CONTENT_DATA = "contentData";
    private final String CUSTOM_FIELDS = "customFields";
    private final String TYPE = "type";
    private final String FORMAT = "format";
    private final String SEPARATOR = "separator";
    private final String NAME = "name";
    private final String VALUE = "value";

    @Autowired
    private AddMissingFieldsToCoursesCustomFields addMissingFieldsToCoursesCustomFields;

    @Test
    public void addMissingFieldsToCourseCustomFieldsTest() throws Exception {
        MigrationDao mockMigrationDao = Mockito.mock(MigrationDao.class);
        DBObject publisher = createPublisherWithCustomMetadataFields(mockMigrationDao);
        int publisherId = Integer.parseInt(publisher.get("accountId").toString());

        DBObject course = createCourseWithProblematicCustomFields(publisherId, mockMigrationDao);
        addMissingFieldsToCoursesCustomFields.setMigrationDao(mockMigrationDao);

        HashMap<String, String> dateCustomMetadata = new HashMap<>();
        HashMap<String, String> tagsCustomMetadata = new HashMap<>();
        BasicDBList customMetadata = (BasicDBList) publisher.get(CUSTOM_METADATA);
        addMissingFieldsToCoursesCustomFields.fillMetadataNamesAndValues(dateCustomMetadata, tagsCustomMetadata, customMetadata);

        Assert.assertEquals(2, dateCustomMetadata.size());
        Assert.assertEquals(3, tagsCustomMetadata.size());

        addMissingFieldsToCoursesCustomFields.addMissingFieldsToCourseCustomFieldsProperty(dateCustomMetadata, tagsCustomMetadata, course);

        BasicDBList customFields = (BasicDBList) ((DBObject) course.get(CONTENT_DATA)).get(CUSTOM_FIELDS);
        Assert.assertNotNull(customFields);
        for (int i = 0; i < customFields.size(); i++) {
            DBObject customField = (DBObject) customFields.get(i);
            String customFieldName = customField.get(NAME).toString();

            switch (CustomFieldsTypes.forName(customField.get(TYPE).toString())) {
                case DATE:
                    if (customFieldName.equals("date with \"Mon. DD, YYYY\"  format")) {
                        Assert.assertEquals("Mon. DD, YYYY", customField.get(FORMAT));
                    } else {
                        Assert.assertNotNull(customField.get(FORMAT));
                        String format = customField.get(FORMAT).toString();
                        String expectedFormat = dateCustomMetadata.get(customFieldName) != null ? dateCustomMetadata.get(customFieldName) : "mm/dd/yy";
                        Assert.assertEquals(expectedFormat, format);
                    }
                    break;
                case TAGS:
                    if (customFieldName.equals("tags with \"semicolon\" separator")) {
                        Assert.assertEquals("semicolon", customField.get(SEPARATOR));
                    } else {
                        Assert.assertNotNull(customField.get(SEPARATOR));
                        String separator = customField.get(SEPARATOR).toString();
                        String expectedSeparator = tagsCustomMetadata.get(customFieldName) != null ? tagsCustomMetadata.get(customFieldName) : "space";
                        Assert.assertEquals(expectedSeparator, separator);
                    }
                    break;
                case BOOLEAN:
                    Assert.assertNotNull(customField.get(VALUE));
                    if (customFieldName.equals("boolean with true value"))
                        Assert.assertTrue((boolean) customField.get(VALUE) == true);
                    else
                        Assert.assertTrue((boolean)customField.get(VALUE) == false);
                    break;
            }
        }
    }

    private DBObject createPublisherWithCustomMetadataFields(MigrationDao mockMigrationDao) throws IOException {
        String publisherJson = GeneralUtils.readResourcesAsString("publishers/publisher.json", this.getClass());
        DBObject publisher = (DBObject) JSON.parse(publisherJson);
        List<DBObject> publishers = Arrays.asList(publisher);
        when(mockMigrationDao.getAllPublishers()).thenReturn(publishers);
        return publisher;
    }

    private DBObject createCourseWithProblematicCustomFields(int publisherId, MigrationDao mockMigrationDao) throws IOException {
        String courseJson = GeneralUtils.readResourcesAsString("courses/courseWithMissingCustomFieldsProperties.json", this.getClass());
        DBObject course = (DBObject) JSON.parse(courseJson);
        List<DBObject> courses = Arrays.asList(course);
        when(mockMigrationDao.getCoursesDBObjectsByPublisherId(publisherId)).thenReturn(courses);

        Mockito.doNothing().doThrow(new RuntimeException()).when(mockMigrationDao).saveCourse(course);
        return course;
    }
}
