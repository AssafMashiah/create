package com.t2k.common.dbupgrader;

import atg.taglib.json.util.JSONObject;
import com.t2k.cgs.dbupgrader.task.RemoveFieldsFromCustomizationConfig;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.File;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 09/06/14
 * Time: 14:22
 */
@ContextConfiguration("/applicationContext-manager.xml")
@Test(groups = "ignore")
public class RemoveFieldsFromCustomizationConfigTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private RemoveFieldsFromCustomizationConfig removeFieldsFromCustomizationConfig;

    @Test
     public void executeTask() throws Exception {
        removeFieldsFromCustomizationConfig.UpdateStandardsPackageConfigJson();
        Assert.assertTrue(removeFieldsFromCustomizationConfig.AllCoursesHaveUpdatedConfigJson());

    }

    @Test
    public void testSpecificCourse() throws Exception {
        String subjectArea = "subjectArea";
        String gradeLevel = "gradeLevel";
        String courseId = "3b2d399c-c0b0-4e76-a253-012aba661027";

        File configJson = new File("c:\\t2k\\cgs-data\\cms\\publishers\\1\\courses\\3b2d399c-c0b0-4e76-a253-012aba661027\\customizationPack\\en_US\\1.7/cgs/config.json");
        Assert.assertTrue(configJson.exists());
        JSONObject config = new JSONObject(FileUtils.readFileToString(configJson));
        Assert.assertTrue(config.has(subjectArea));
        Assert.assertTrue(config.has(gradeLevel));
        removeFieldsFromCustomizationConfig.upgradeSpecificCourse(courseId);
        configJson = new File("c:\\t2k\\cgs-data\\cms\\publishers\\1\\courses\\3b2d399c-c0b0-4e76-a253-012aba661027\\customizationPack\\en_US\\1.7/cgs/config.json");
        Assert.assertTrue(configJson.exists());
        config = new JSONObject(FileUtils.readFileToString(configJson));
        Assert.assertTrue(!config.has(subjectArea));
        Assert.assertTrue(!config.has(gradeLevel));
    }

}
