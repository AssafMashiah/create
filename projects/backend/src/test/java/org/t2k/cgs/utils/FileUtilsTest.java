package org.t2k.cgs.utils;

import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 15/10/12
 * Time: 08:36
 */
public class FileUtilsTest {
    @BeforeMethod
    public void setUp() throws Exception {

    }

/*    @Test(groups = {"dummyTests"})
    public void someTest() {
        Integer a = new Integer(1);
        Integer b = a;
        Assert.assertEquals(a,b);
    }

    @Test(groups = {"dummyTests"})
    public void someTest2() {
        Integer a = new Integer(1);
        Integer b = new Integer(1);
        Assert.assertEquals(a,b);
    }*/

    @Test(dataProvider = "dummyFolder")
    public void getFileTest(String path) {

    }

    @DataProvider(name="dummyFolder")
    public Object[][] getDummyFolderPath() {
        Object[][] ret;
        ret = new Object[1][1];
        ret[0][0] = "resources";
        return ret;
    }

    @AfterMethod
    public void tearDown() throws Exception {

    }
}
