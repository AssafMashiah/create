package com.t2k.cgs.utils.standards.dao;

import com.t2k.cgs.utils.standards.model.PackageDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import static org.testng.Assert.*;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/21/12
 * Time: 1:53 PM
 */
@ContextConfiguration("/applicationContext-dal.xml")
@Test(groups = "ignore")
public class MongoStandardsTargetDaoTest extends AbstractTestNGSpringContextTests {

    private static final String TEST_JSON =
            "{\n" +
                    "    \"publisherId\": 1,\n" +
                    "    \"name\": \"P\",\n" +
                    "    \"subjectArea\": \"SA\",\n" +
                    "    \"country\": \"C\",\n" +
                    "    \"state\": \"ST\",\n" +
                    "    \"version\": 8,\n" +
                    "    \"created\": \"12/12/12\",\n" +
                    "    \"rootId\": \"C\",\n" +
                    "    \"isLatest\": true,\n" +
                    "    \"standards\": [\n" +
                    "        {\n" +
                    "            \"pedagogicalId\": \"A\",\n" +
                    "            \"children\": [\n" +
                    "                \"2P\",\n" +
                    "                \"3P\"\n" +
                    "            ],\n" +
                    "            \"description\": \"\"\n" +
                    "        },\n" +
                    "        {\n" +
                    "            \"pedagogicalId\": \"2P\",\n" +
                    "            \"displayId\": \"2D\",\n" +
                    "            \"gradeLevel\": \"2GL\",\n" +
                    "            \"children\": [],\n" +
                    "            \"description\": \"2DSC\"\n" +
                    "        },\n" +
                    "        {\n" +
                    "            \"pedagogicalId\": \"3P\",\n" +
                    "            \"displayId\": \"3D\",\n" +
                    "            \"gradeLevel\": \"3GL\",\n" +
                    "            \"children\": [],\n" +
                    "            \"description\": \"3Desc\"\n" +
                    "        }\n" +
                    "    ]\n" +
                    "}";

    private PackageDetails details;
    private String jsonString;

    @Autowired
    private StandardsTargetDao targetDao;

    @BeforeMethod
    private void initTests() {
        jsonString = TEST_JSON;
        details = new PackageDetails();
        details.setSubjectArea("SA");
        details.setVersion("8");
        details.setName("P");
        details.setLatest(false);
    }


    @Test
    public void testAutowire() throws Exception {
        assertNotNull(this.targetDao);
    }

    @Test
    public void testSimpleInsertAndGetVersion() throws Exception {
        targetDao.removeStandardsPackage(this.details); // if standard already exists - remove it
        this.targetDao.saveNewVersion(this.jsonString, this.details); // inserting package
        assertEquals(targetDao.getLatestVersion(this.details), "8");
        targetDao.removeStandardsPackage(this.details);                                                                       // removing package
        assertNull(targetDao.getExistingVersionMinor(this.details)); // assert package does not exist

    }


}
