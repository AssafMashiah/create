package org.t2k.cgs.utils;

import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;
import java.util.Scanner;


/**
 * Created by thalie  mukhtar on 02/09/2014.
 */
@ContextConfiguration("/springContext/applicationContext-service.xml")
@Test(groups = "ignore")
public class PackageSchemaConversionUtilTest extends AbstractTestNGSpringContextTests {

    @Test
    public void ConvertTest() throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        String source = readResourcesAsString("jsons/packageConversionSource.json");
        String target = readResourcesAsString("jsons/packageConversionTarget.json");
        JsonNode targetObj = mapper.readTree(target);
        JsonNode dataToConvert = mapper.readTree(source);

        //call the function we want to test
        JsonNode conversionResult  = PackageSchemaConversionUtil.convertPackageData(dataToConvert);
        Assert.assertEquals(conversionResult, targetObj);
    }

    private String readResourcesAsString(String localPath) throws IOException {
        InputStream resourceAsStream;
        resourceAsStream = null;
        try {
            resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
            Scanner s = new Scanner(resourceAsStream).useDelimiter("\\A");

            return s.hasNext() ? s.next() : "";
        } finally {
            if(resourceAsStream!=null)
                resourceAsStream.close();
        }
    }
}