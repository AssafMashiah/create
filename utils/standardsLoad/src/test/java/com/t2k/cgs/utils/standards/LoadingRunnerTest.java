package com.t2k.cgs.utils.standards;

import atg.taglib.json.util.JSONObject;
import com.t2k.cgs.utils.standards.dao.FileStandardsSourceDao;
import com.t2k.cgs.utils.standards.dao.StandardsTargetDao;
import com.t2k.cgs.utils.standards.interaction.StdUserInteraction;
import com.t2k.cgs.utils.standards.interaction.UserInteraction;
import com.t2k.cgs.utils.standards.model.PackageDetails;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.FileSystemXmlApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.Assert;
import org.testng.annotations.AfterTest;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.File;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.Matchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/19/12
 * Time: 8:42 AM
 */
@ContextConfiguration("/applicationContext-bl.xml")
@Test(groups = "ignore")
public class LoadingRunnerTest extends AbstractTestNGSpringContextTests {

    private String standardsFolder;

    @Autowired
    private StandardsTargetDao standardsTargetDao;

    private List<PackageDetails> importedPacksDetails = new ArrayList<PackageDetails>();

    private Loader loader;

    @BeforeClass
    public void classSetup() throws Exception {
        // setting up the standards folder where all the test data is
        String standardsFolderName = "standards";
        URL standardsAbsolutePath = this.getClass().getClassLoader().getResource(standardsFolderName);
        if (standardsAbsolutePath == null) {
            throw new Exception(String.format("Standards directory %s does not exist.", standardsAbsolutePath));
        }
        standardsFolder = new File(standardsAbsolutePath.getPath()).getAbsolutePath() + File.separator;

        // making the fileStandardsSourceDao (the class that gets the standard files and starts parsing them)
        // have the test folder as the files source
        FileSystemXmlApplicationContext appContext = new FileSystemXmlApplicationContext("classpath*:applicationContext-*.xml");
        FileStandardsSourceDao fileStandardsSourceDao = (FileStandardsSourceDao) appContext.getBean("standardsSourceDao");
        fileStandardsSourceDao.setSourceDirectoryPath(getLocalResourceFile("zips").getAbsolutePath());
        fileStandardsSourceDao.setSourceDirectory(getLocalResourceFile("zips"));
        loader = (Loader) appContext.getBean("loader");
        loader.setStandardsSourceDao(fileStandardsSourceDao);

        // setting up a mock userInteractions object, because currently the process waits for the user to press "y/n"
        // and say if he wants to continue the upload.
        //it stuck and waits for the answer.

        UserInteraction mockUserInteraction = Mockito.mock(StdUserInteraction.class);
        when(mockUserInteraction.askYesOrNoQuestion(anyString())).thenReturn(true); // always return true to this question
        loader.setUserInteraction(mockUserInteraction);

    }

    private File getLocalResourceFile(String fileName) {
        return new File(String.format("%s/%s", standardsFolder, fileName));
    }

    @AfterTest
    public void testCleanup() {
        if (importedPacksDetails != null) {
            for (PackageDetails addedStandard : importedPacksDetails) {
                standardsTargetDao.removeStandardsPackage(addedStandard);
            }
        }
    }

    @Test // test that the standards loader does no have any exceptions/errors while running
    public void fullCycleStandardUnzipAndUpload() throws Exception {

        // load standards puts this standard package into DB:
        // {"name":"mockStandardWithoutPurpose","subjectArea":"math","version":"2.0","purpose":"Make the world a better place"}

        PackageDetails mockStandardWithoutPurpose = new PackageDetails();

        mockStandardWithoutPurpose.setName("mockstandardwithoutpurpose");
        mockStandardWithoutPurpose.setVersion("2.0");
        mockStandardWithoutPurpose.setSubjectArea("math");
        mockStandardWithoutPurpose.setPurpose(null);

        importedPacksDetails.add(mockStandardWithoutPurpose);  // added the standards to the list, so it will be removed after test

        PackageDetails mockStandardWithPurpose = new PackageDetails();

        mockStandardWithPurpose.setName("mockstandardwithpurpose");
        mockStandardWithPurpose.setVersion("2.0");
        mockStandardWithPurpose.setSubjectArea("math");
        mockStandardWithPurpose.setPurpose("make the world a better place");

        importedPacksDetails.add(mockStandardWithPurpose);  // added the standards to the list, so it will be removed after test

        loader.loadStandards(); // load the standards from the folder into DB

        // assert that the package is in db, and that it's purpose is updated
        String mockStandardWithoutPurposePackageFromDb = standardsTargetDao.getStandardsPackage(mockStandardWithoutPurpose.getName(), mockStandardWithoutPurpose.getSubjectArea(), mockStandardWithoutPurpose.getVersion());
        String mockStandardWithPurposePackageFromDb = standardsTargetDao.getStandardsPackage(mockStandardWithPurpose.getName(), mockStandardWithPurpose.getSubjectArea(), mockStandardWithPurpose.getVersion());

        // asserting the package without a purpose
        Assert.assertNotNull(mockStandardWithoutPurposePackageFromDb);
        JSONObject mockStandardWithoutPurposePackageJson = new JSONObject(mockStandardWithoutPurposePackageFromDb);
        Assert.assertEquals(mockStandardWithoutPurposePackageJson.getString("name"), mockStandardWithoutPurpose.getName());
        Assert.assertEquals(mockStandardWithoutPurposePackageJson.getString("subjectArea"), mockStandardWithoutPurpose.getSubjectArea());
        Assert.assertEquals(mockStandardWithoutPurposePackageJson.getString("version"), mockStandardWithoutPurpose.getVersion());

        // asserting the package with a purpose
        Assert.assertNotNull(mockStandardWithPurposePackageFromDb);
        JSONObject packageJson = new JSONObject(mockStandardWithPurposePackageFromDb);
        Assert.assertEquals(packageJson.getString("name"), mockStandardWithPurpose.getName());
        Assert.assertEquals(packageJson.getString("subjectArea"), mockStandardWithPurpose.getSubjectArea());
        Assert.assertEquals(packageJson.getString("version"), mockStandardWithPurpose.getVersion());
        Assert.assertEquals(packageJson.getString("purpose"), mockStandardWithPurpose.getPurpose());
    }


}
