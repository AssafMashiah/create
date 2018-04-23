package com.t2k.cgs.utils.standards.dao;

import org.springframework.dao.DataAccessException;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.File;
import java.net.URL;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNotNull;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 4:48 PM
 */
@Test
public class FileStandardsPackageTest {

    private String standardsFolder;

    @BeforeClass
    public void classSetup() throws Exception {
        String standardsFolderName = "standards";
        URL standardsAbsolutePath = this.getClass().getClassLoader().getResource(standardsFolderName);
        if (standardsAbsolutePath == null) {
            throw new Exception(String.format("Standards directory %s does not exist.", standardsAbsolutePath));
        }
        standardsFolder = new File(standardsAbsolutePath.getPath()).getAbsolutePath() + File.separator;
    }

    private File getLocalResourceFile(String fileName){
        return new File(String.format("%s/%s", standardsFolder, fileName));
    }

    @Test(expectedExceptions = DataAccessException.class)
    public void testInvalidFile() throws Exception {
        FileStandardsSource f = new FileStandardsSource("adsfasdf.txt");
        f.getContent();

    }

    @Test
    public void testValidFile() throws Exception {
        String filename = "CCSS_v2.0.txt";
        FileStandardsSource f = new FileStandardsSource(getLocalResourceFile(filename).getAbsolutePath());
        assertEquals(f.getName(),filename);
        assertNotNull(f.getContent());
    }



}
