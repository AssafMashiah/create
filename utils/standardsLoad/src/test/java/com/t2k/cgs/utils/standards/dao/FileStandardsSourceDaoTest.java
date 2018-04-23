package com.t2k.cgs.utils.standards.dao;

import org.springframework.dao.DataAccessException;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.File;
import java.net.URL;
import java.util.Collection;

import static org.testng.Assert.*;


/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 4:41 PM
 */
@Test
public class FileStandardsSourceDaoTest {

    private String standardsFolder;

    @BeforeClass
    public void classSetup() throws Exception {
        String standardsFolderName = "standards";
        URL standardsAbsolutePath = this.getClass().getClassLoader().getResource(standardsFolderName);
        if (standardsAbsolutePath == null) {
            throw new Exception(String.format("Courses directory %s does not exist.", standardsAbsolutePath));
        }
        standardsFolder = new File(standardsAbsolutePath.getPath()).getAbsolutePath() + File.separator;
    }

    private File getLocalResourceFile(String fileName){
        return new File(String.format("%s/%s", standardsFolder, fileName));
    }

    private FileStandardsSourceDao standardsSourceDao;

    @BeforeMethod
    private void initTests() {
        standardsSourceDao = new FileStandardsSourceDao();
    }

    @Test(expectedExceptions = DataAccessException.class)
    public void testIllegalDirectory() throws Exception {
        standardsSourceDao.setSourceDirectoryPath("/asdf");
        standardsSourceDao.init();
        standardsSourceDao.getStandardPackages();
    }

    @Test(expectedExceptions = DataAccessException.class)
    public void emptyDirectory() throws Exception {

        standardsSourceDao.setSourceDirectoryPath(getLocalResourceFile("emptyFolder").getAbsolutePath());
        standardsSourceDao.init();

        standardsSourceDao.getStandardPackages();

    }

    @Test
    public void testNothingFails() throws Exception {

        standardsSourceDao.setSourceDirectoryPath(getLocalResourceFile("zips").getAbsolutePath());
        standardsSourceDao.init();

        Collection<FileStandardsSource> standardPackages = standardsSourceDao.getStandardPackages();

        assertEquals(standardPackages.size(), 2);

    }


}
