package org.t2k.cgs.persistence.dao;

import atg.taglib.json.util.JSONArray;
import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.standards.StandardsDao;
import org.t2k.sample.dao.exceptions.DaoException;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.List;

import static org.testng.Assert.assertEquals;

/**
 * Created by elad.avidan on 22/07/2014.
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
public class StandardsDaoTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private StandardsDao standardsDao;
    private static final String NAME_ID_ATTRIBUTE_NAME = "name";
    private static final String SUBJECT_AREA_ATTRIBUTE_NAME = "subjectArea";
    private static final String VERSION_ATTRIBUTE_NAME = "version";
    private static final List<String> allFields = Arrays.asList(NAME_ID_ATTRIBUTE_NAME, SUBJECT_AREA_ATTRIBUTE_NAME, VERSION_ATTRIBUTE_NAME);

    private DBObject getMockStandard() throws IOException {
        String standardJson = readResouresAsString("jsons/standards/basicStandard.json");
        return (DBObject) JSON.parse(standardJson);
    }

    @Test
    public void saveAndFetchSimpleStandardTest() throws IOException, DaoException, JSONException {
        DBObject newStandard = getMockStandard();
        standardsDao.saveStandardDBObject(newStandard, true);
        DBObject fetchedStandard = standardsDao.getStandardsPackageFullInfo(newStandard.get(NAME_ID_ATTRIBUTE_NAME).toString(), newStandard.get(SUBJECT_AREA_ATTRIBUTE_NAME).toString(), newStandard.get(VERSION_ATTRIBUTE_NAME).toString());
        for (String field : allFields) {
            assertEquals(newStandard.get(field), fetchedStandard.get(field), String.format("Field %s could not be fetched for standard %s", field, newStandard.get(NAME_ID_ATTRIBUTE_NAME).toString()));
        }
    }

    @Test(groups = "ignore")
    public void getStandardHeadersAndGetPackageTest() throws JSONException, IOException, DaoException, DsException {
        String ccssPackageName = "ccss";
        String standardPackagesHeaders = standardsDao.getStandardPackagesHeaders();
        JSONObject ccssPackage = null;

        JSONArray headersArray = new JSONArray(standardPackagesHeaders);
        for (Object header : headersArray) {
            JSONObject stdHeader = (JSONObject) header;
            if (stdHeader.get(NAME_ID_ATTRIBUTE_NAME).toString().equals(ccssPackageName)) {
                ccssPackage = stdHeader;
            }
        }
        Assert.assertNotNull(ccssPackage, "standardsDao.getStandardPackagesHeaders() didn't return all headers - ccss header is missing");

        String ccssPackageFromDB = standardsDao.getStandardsPackage(
                ccssPackage.get(NAME_ID_ATTRIBUTE_NAME).toString(),
                ccssPackage.get(SUBJECT_AREA_ATTRIBUTE_NAME).toString(),
                ccssPackage.get(VERSION_ATTRIBUTE_NAME).toString());
        Assert.assertNotNull(ccssPackageFromDB);
        Assert.assertEquals(new JSONObject(ccssPackageFromDB).get(NAME_ID_ATTRIBUTE_NAME).toString(), ccssPackageName);
    }

    private String readResouresAsString(String localPath) throws IOException {
        InputStream resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
        StringWriter writer = new StringWriter();
        IOUtils.copy(resourceAsStream, writer);
        resourceAsStream.close();
        return writer.toString();
    }
}