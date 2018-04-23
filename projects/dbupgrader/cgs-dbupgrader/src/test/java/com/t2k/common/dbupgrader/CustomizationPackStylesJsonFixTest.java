package com.t2k.common.dbupgrader;

import atg.taglib.json.util.JSONException;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.cgs.dbupgrader.task.CustomizationPackStylesJsonFix;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;

import static org.mockito.Mockito.when;

@ContextConfiguration("/applicationContext-manager.xml")
@Test(groups = "ignore")
public class CustomizationPackStylesJsonFixTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private CustomizationPackStylesJsonFix customizationPackStylesJsonFix;

    @Test
    public void runTaskTest() throws Exception {
        customizationPackStylesJsonFix.fixJsonsForHebrewCourses();
    }

    @Test
    // This test currently not testing the course upgrade process (!!!) because it doesn't have a directory and a customizationPack folder.
    // Therefore, it returns false when it check if such directory exists.
    public void testUpgradeSpecificCourse() throws IOException, JSONException {
        String courseJson = readResourcesAsString("courses/courseWithWrongFontOfContinue.json"); // We need it for the mock
        MigrationDao mockMigrationDao = Mockito.mock(MigrationDao.class);
        DBObject course = (DBObject) JSON.parse(courseJson);
        String courseId = course.get("_id").toString();
        when(mockMigrationDao.getCourseById(courseId)).thenReturn(course);
        customizationPackStylesJsonFix.setMigrationDao(mockMigrationDao);

        customizationPackStylesJsonFix.upgradeSpecificCourse(courseId);
    }

    private String readResourcesAsString(String localPath) throws IOException {
        InputStream resourceAsStream;
        resourceAsStream = null;
        try {
            resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
            java.util.Scanner s = new java.util.Scanner(resourceAsStream).useDelimiter("\\A");

            return s.hasNext() ? s.next() : "";
        } finally {
            resourceAsStream.close();
        }
    }
}
