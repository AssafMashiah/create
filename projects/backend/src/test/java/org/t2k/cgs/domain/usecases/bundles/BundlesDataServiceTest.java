package org.t2k.cgs.domain.usecases.bundles;

import org.apache.commons.compress.archivers.zip.UnsupportedZipFeatureException;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileItemFactory;
import org.apache.commons.fileupload.disk.DiskFileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.io.FileUtils;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.usecases.BundlesDataService;
import org.t2k.cgs.domain.model.bundle.BundlesDao;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.ValidationException;
import org.t2k.cgs.domain.model.bundle.Bundle;
import org.t2k.cgs.domain.usecases.publisher.PublisherService;
import org.t2k.sample.dao.exceptions.DaoException;
import org.t2k.cgs.domain.usecases.TestUtils;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Date;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 07/08/14
 * Time: 15:11
 * To change this template use File | Settings | File Templates.
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
public class BundlesDataServiceTest extends AbstractTestNGSpringContextTests {

    public final String BUNDLES_EXAMPLE_ZIP = "bundles/example.zip";
    public final String BUNDLES_EXAMPLE_VERSION_2_ZIP = "bundles/exampleV2.zip";
    private int publisherId1;
    private int publisherId2;
    private final String bundleId = "example";

    @Autowired
    private PublisherService publisherService;

    @Autowired
    private BundlesDao bundlesDao;

    @Autowired
    private BundlesDataService bundlesDataService;

    @Autowired
    private TestUtils testUtils;

    @BeforeClass
     public void CreatePublishersForTest() throws IOException, DsException {
        publisherId1 = testUtils.createANewPublisher();
        publisherId2 = testUtils.createANewPublisher();
     }

    @AfterClass
    public void removePublishersCreatedForTest() throws DsException {
        testUtils.deletePublisher(publisherId1);
        testUtils.deletePublisher(publisherId2);

    }

    @AfterMethod
    private void cleanUp() throws DsException, IOException {
        bundlesDataService.deleteBundle(publisherId1, bundleId);
        bundlesDataService.deleteBundle(publisherId2, bundleId);
        File publisherDir = new File(publisherService.getPublisherCmsHomeLocation(publisherId1));
        if (publisherDir.exists()) {
            FileUtils.deleteDirectory(publisherDir);
        }

        publisherDir = new File(publisherService.getPublisherCmsHomeLocation(publisherId2));
        if (publisherDir.exists()) {
            FileUtils.deleteDirectory(publisherDir);
        }
    }

    @Test
    public void handleWrongFileItemUpload() throws Exception {
        //create wrong mime type text file
        FileItem firstFile = new DiskFileItem("file", "text/plain", false, "filename.txt", 4000, new File(""));
        Exception expected = null;
        try {
            bundlesDataService.validateUploadedFileMimeTypeAndHasFormField(firstFile);
        } catch (Exception e) {
            expected = e;
        }
        Assert.assertNotNull(expected);
    }

    @Test
    public void validBundleUploadSuccessTest() throws DsException, IOException, DaoException, URISyntaxException {
        URI fileURI = getClass().getClassLoader().getResource(BUNDLES_EXAMPLE_ZIP).toURI();
        File bundleFile = new File(fileURI);
        String version = "1.0";
        bundlesDataService.save(publisherId1, bundleFile);

        File bundleDir = new File(bundlesDataService.getBundleDirectory(publisherId1, bundleId));
        File bundleVersionDir = new File(bundleDir.getPath(), version);
        Assert.assertEquals(bundlesDataService.getByAccountId(publisherId1).size(), 1);
        Assert.assertTrue(bundleDir.exists());
        Assert.assertTrue(bundleVersionDir.exists());
        Assert.assertTrue(bundleVersionDir.listFiles().length > 0);
    }

    @Test
    public void validBundleDeletionDeletesBundleFolderSuccessTest() throws DsException, IOException, DaoException, URISyntaxException {
        URI fileURI = getClass().getClassLoader().getResource(BUNDLES_EXAMPLE_ZIP).toURI();
        File bundleFile = new File(fileURI);
        bundlesDataService.save(publisherId1, bundleFile);

        File bundleDir = new File(bundlesDataService.getBundleDirectory(publisherId1, bundleId));
        Assert.assertEquals(bundlesDataService.getByAccountId(publisherId1).size(), 1);
        Assert.assertTrue(bundleDir.exists());
        Assert.assertTrue(bundleDir.listFiles().length > 0);
        bundlesDataService.deleteBundle(publisherId1, bundleId);
        Assert.assertFalse(bundleDir.exists());
    }

    @Test
    public void savingSameBundleByTwoPublishersSuccessTest() throws DsException, IOException, DaoException, URISyntaxException {
        URI fileURI = getClass().getClassLoader().getResource(BUNDLES_EXAMPLE_ZIP).toURI();
        File bundleFile = new File(fileURI);
        bundlesDataService.save(publisherId1, bundleFile);
        bundlesDataService.save(publisherId2, bundleFile);

        Assert.assertNotNull(bundlesDataService.getByAccountId(publisherId1, bundleId));
        Assert.assertNotNull(bundlesDataService.getByAccountId(publisherId2, bundleId));
    }

    @Test
    public void uploadOf7zippedFileReturnsADetailedException() throws URISyntaxException, DsException, IOException, DaoException {
        URI fileURI = getClass().getClassLoader().getResource("bundles/wordAttack7zip.zip").toURI();
        File bundleFile = new File(fileURI);
        String bundleId = "wordAttack";
        Exception expected = null;
        try {
            bundlesDataService.save(publisherId1, bundleFile);
        } catch (Exception e) {
            expected = e;
        }
        Assert.assertNotNull(expected);
        Assert.assertEquals(expected.getCause().getClass(), UnsupportedZipFeatureException.class);
    }

    @Test
    public void saveSamePluginWithSameVersionTwiceFail() throws DsException, IOException, DaoException, URISyntaxException {
        URI fileURI = getClass().getClassLoader().getResource(BUNDLES_EXAMPLE_ZIP).toURI();
        File bundleFile = new File(fileURI);
        bundlesDataService.save(publisherId1, bundleFile);
        Exception expected = null;
        try {
            bundlesDataService.save(publisherId1, bundleFile);
        } catch (ValidationException e) {
            expected = e;
        }

        Assert.assertNotNull(expected);
        Assert.assertNotNull(bundlesDataService.getByAccountId(publisherId1, bundleId));
        Assert.assertEquals(bundlesDataService.getByAccountId(publisherId1).size(), 1);
    }

    @Test
    public void saveSamePluginWithHigherVersionsSuccess() throws DsException, IOException, DaoException, URISyntaxException {
        URI fileURI1 = getClass().getClassLoader().getResource(BUNDLES_EXAMPLE_ZIP).toURI();
        File bundleFileVersion1 = new File(fileURI1);
        URI fileURI2 = getClass().getClassLoader().getResource(BUNDLES_EXAMPLE_VERSION_2_ZIP).toURI();
        File bundleFileVersion2 = new File(fileURI2);

        bundlesDataService.save(publisherId1, bundleFileVersion1);
        // assert first save updates the version
        Assert.assertEquals(bundlesDataService.getByAccountId(publisherId1, bundleId).getVersion(), "1.0");

        bundlesDataService.save(publisherId1, bundleFileVersion2);
        // assert second save updates the version
        Assert.assertNotNull(bundlesDataService.getByAccountId(publisherId1, bundleId));
        Assert.assertEquals(bundlesDataService.getByAccountId(publisherId1, bundleId).getVersion(), "2.0");
    }

    @Test
    public void saveSamePluginWithLowerVersionsFailure() throws DsException, IOException, DaoException, URISyntaxException {
        URI fileURI1 = getClass().getClassLoader().getResource(BUNDLES_EXAMPLE_ZIP).toURI();
        File bundleFileVersion1 = new File(fileURI1);
        URI fileURI2 = getClass().getClassLoader().getResource(BUNDLES_EXAMPLE_VERSION_2_ZIP).toURI();
        File bundleFileVersion2 = new File(fileURI2);
        bundlesDataService.deleteBundle(publisherId1, bundleId);
        bundlesDataService.save(publisherId1, bundleFileVersion2);

        // assert first save updates the version
        Assert.assertEquals(bundlesDataService.getByAccountId(publisherId1, bundleId).getVersion(), "2.0");
        Exception expected = null;
        try {
            bundlesDataService.save(publisherId1, bundleFileVersion1);
        } catch (ValidationException e) {
            expected = e;
        }
        Assert.assertNotNull(expected);

        // assert second save DIDN'T updates the version
        Assert.assertNotNull(bundlesDataService.getByAccountId(publisherId1, bundleId));
        Assert.assertEquals(bundlesDataService.getByAccountId(publisherId1, bundleId).getVersion(), "2.0");
    }

    @Test
    public void invalidBundleUploadFailureTest() throws DsException, IOException, DaoException, URISyntaxException {
        URI fileURI = getClass().getClassLoader().getResource("bundles/vocabularyInvalid.zip").toURI();
        File bundleFile = new File(fileURI);
        String bundleName = "vocabulary";

        Exception exception = null;
        try {
            bundlesDataService.save(publisherId1, bundleFile);
        } catch (Exception e) {
            exception = e;
        }
        Assert.assertNull(bundlesDataService.getByAccountId(publisherId1, bundleName));
        Assert.assertNotNull(exception);
    }

    @Test
    public void bundleUploadWithAFolderWithoutManifestJsonFailure() throws DsException, IOException, DaoException, URISyntaxException {
        URI fileURI = getClass().getClassLoader().getResource("bundles/exampleMissingManifestInAFolder.zip").toURI();
        File bundleFile = new File(fileURI);
        Assert.assertNull(bundlesDataService.getByAccountId(publisherId1, bundleId));
        Exception exception = null;
        try {
            bundlesDataService.save(publisherId1, bundleFile);
        } catch (Exception e) {
            exception = e;
        }
        Assert.assertNull(bundlesDataService.getByAccountId(publisherId1, bundleId));
        Assert.assertNotNull(exception);
    }

    @Test
    public void fullCycleTest() throws URISyntaxException, DsException, IOException {
        URI fileURI1 = getClass().getClassLoader().getResource(BUNDLES_EXAMPLE_ZIP).toURI();
        File bundleFileVersion1 = new File(fileURI1);
        FileItem f = createFileItem("bundle-file", "application/octet-stream", false, BUNDLES_EXAMPLE_ZIP, FileUtils.readFileToByteArray(bundleFileVersion1));
        try {
            bundlesDataService.validateAndSave(publisherId1, f);
        } finally {
            bundlesDataService.deleteBundle(publisherId1, bundleId);
        }
    }

    @Test
    public void deleteOldBundlesFoldersTest() throws URISyntaxException, DsException, IOException, DaoException {
        int xDaysAgo = 1;
        URI fileURI1 = getClass().getClassLoader().getResource(BUNDLES_EXAMPLE_ZIP).toURI();
        File bundleFileVersion1 = new File(fileURI1);
        URI fileURI2 = getClass().getClassLoader().getResource(BUNDLES_EXAMPLE_VERSION_2_ZIP).toURI();
        File bundleFileVersion2 = new File(fileURI2);

        // save both bundle's versions (lower version first):
        bundlesDataService.save(publisherId1, bundleFileVersion1);
        bundlesDataService.save(publisherId1, bundleFileVersion2);

        // verify both versions has folders:
        File version1Dir = new File(bundlesDataService.getBundleDirectory(publisherId1, bundleId), "1.0");
        File version2Dir = new File(bundlesDataService.getBundleDirectory(publisherId1, bundleId), "2.0");
        Assert.assertTrue(version1Dir.exists());
        Assert.assertTrue(version2Dir.exists());

        // call the deleteOldBundlesFolders and verify it didn't delete the version 1.0 folder:
        bundlesDataService.deleteOldBundlesFolders(xDaysAgo);
        Assert.assertTrue(version1Dir.exists());
        Assert.assertTrue(version2Dir.exists());

        // change the creation date of the bundle so it will be older than xDaysAgo:
        Bundle bundle = bundlesDataService.getByAccountId(publisherId1, bundleId);
        Date date = new DateTime(bundle.getCreationDate()).minusDays(xDaysAgo).toDate();
        bundle.setCreationDate(date);
        bundlesDao.save(bundle);

        // call the deleteOldBundlesFolders again and verify version 1.0 folder was deleted:
        bundlesDataService.deleteOldBundlesFolders(xDaysAgo);
        Assert.assertFalse(version1Dir.exists());
        Assert.assertTrue(version2Dir.exists());
    }

    /**
     * Create a FileItem with the specified content bytes.
     */
    private FileItem createFileItem(String textFieldName, String textContentType, boolean isForm, String filename, byte[] contentBytes) throws IOException {
        FileItemFactory factory = new DiskFileItemFactory(10124, null);

        FileItem item = factory.createItem(
                textFieldName,
                textContentType,
                isForm,
                filename
        );
        OutputStream os = item.getOutputStream();
        os.write(contentBytes);
        os.close();

        return item;
    }
}