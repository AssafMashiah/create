package org.t2k.cgs.utils;

import com.google.common.io.Files;
import com.t2k.common.utils.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.usecases.TestUtils;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 24/04/14
 * Time: 13:22
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
public class ZipHelperTest extends AbstractTestNGSpringContextTests {

    private File tempFolder = new File("testingTemp");
    private String folderForDecompressedZip = tempFolder.getPath() + "/DecompressedZipped";

    private String zippedFolderName1 = "folderToBeZipped1";
    private String zippedFolderName2 = "folderToBeZipped2";

    @BeforeMethod
    private void CreateTempFolder() {
        if (tempFolder.exists())
            tempFolder.delete();
        tempFolder.mkdir();
    }

    @AfterMethod
    private void DeleteTempFolder() {
        if (tempFolder.exists()) {
            FileUtils.clearDirectory(tempFolder.getPath());
            tempFolder.delete();
        }
    }

    @Test
    public void ZipANestedFolder() throws IOException {

        List<String> foldersToBeZipped = new ArrayList<>();
        foldersToBeZipped.add(tempFolder.getPath() + "/" + zippedFolderName1);
        foldersToBeZipped.add(tempFolder.getPath() + "/" + zippedFolderName2);

        String nestedFolder = tempFolder.getPath() + "/" + zippedFolderName1 + "/" + "NestedFolder";

        for (String folder : foldersToBeZipped)
            CreateNewFolderWithRandomFiles(folder, 3);//(int) Math.random()*1000);
        CreateNewFolderWithRandomFiles(nestedFolder, 2);

        String folderForDecompressedZip = tempFolder.getPath() + "/DecompressedZipped";
        String zipFile = tempFolder.getPath() + "/zipTest.zip";
        ZipHelper.zipDir(foldersToBeZipped, zipFile);

        File zipped = new File(zipFile);
        ZipHelper.decompressZipFile(zipFile, folderForDecompressedZip);

        File decompressedFolder = new File(folderForDecompressedZip);
        File[] listOfFiles = decompressedFolder.listFiles();

        Boolean firstCompressedFound = false;
        Boolean secondCompressedFound = false;
        Boolean nestedFound = false;
        for (File f : listOfFiles) {
            if (f.getAbsolutePath().toLowerCase().contains(zippedFolderName1.toLowerCase())) {
                firstCompressedFound = true;
                File[] listInFirstDir = f.listFiles();
                for (File nested : listInFirstDir)
                    if (nested.getAbsolutePath().toLowerCase().contains("NestedFolder".toLowerCase()))
                        nestedFound = true;
            } else if (f.getAbsolutePath().toLowerCase().contains(zippedFolderName2.toLowerCase()))
                secondCompressedFound = true;
        }


        Assert.assertTrue(zipped.exists()); // file is created
        Assert.assertTrue(firstCompressedFound && secondCompressedFound && nestedFound); //zipped file is found in decompressed folder

    }

    @Test
    public void ZipAFolderAnAddAnotherFolder() throws IOException {

        List<String> foldersToBeZipped = new ArrayList<>();
        foldersToBeZipped.add(tempFolder.getPath() + "/" + zippedFolderName1);
        foldersToBeZipped.add(tempFolder.getPath() + "/" + zippedFolderName2);

        for (String folder : foldersToBeZipped)
            CreateNewFolderWithRandomFiles(folder, 3);//(int) Math.random()*1000);

        String folderForDecompressedZip = tempFolder.getPath() + "/DecompressedZipped";
        String zipFile = tempFolder.getPath() + "/zipTest.zip";
        ZipHelper.zipDir(foldersToBeZipped, zipFile);

        File zipped = new File(zipFile);
        ZipHelper.decompressZipFile(zipFile, folderForDecompressedZip);

        File decompressedFolder = new File(folderForDecompressedZip);
        File[] listOfFiles = decompressedFolder.listFiles();

        Boolean firstCompressedFound = false;
        Boolean secondCompressedFound = false;
        for (File f : listOfFiles) {
            if (f.getAbsolutePath().toLowerCase().contains(zippedFolderName1.toLowerCase()))
                firstCompressedFound = true;
            else if (f.getAbsolutePath().toLowerCase().contains(zippedFolderName2.toLowerCase()))
                secondCompressedFound = true;
        }


        Assert.assertTrue(zipped.exists()); // file is created
        Assert.assertTrue(firstCompressedFound && secondCompressedFound); //zipped file is found in decompressed folder

    }

    @Test
    public void ZipASingleFolder() throws IOException {
        String zipFile = tempFolder.getPath() + "/zipTest.zip";

        String zippedFolderName = "folderToBeZipped";
        CreateNewFolderWithRandomFiles(tempFolder.getPath() + "/" + zippedFolderName, 2);
        List<String> foldersToBeZipped = new ArrayList<>();
        foldersToBeZipped.add(tempFolder.getPath() + "/" + zippedFolderName);
        ZipHelper.zipDir(foldersToBeZipped, zipFile);

        ZipHelper.decompressZipFile(zipFile, folderForDecompressedZip);
        Assert.assertTrue(new File(zipFile).exists()); // file is created
        Assert.assertTrue(FolderExistsInDirectory(folderForDecompressedZip, zippedFolderName) == true); //zipped file is found in decompressed folder

    }


    @Test
    public void ZipAFile() throws IOException {
        String zipFile = tempFolder.getPath() + "/zipTest.zip";
        String zippedfileName = "fileToBeZipped";
        CreateFileWithContent(tempFolder.getPath() + "/" + zippedfileName, "bla bla bla");

        List<String> dataToBeZipped = new ArrayList<>();
        dataToBeZipped.add(tempFolder.getPath() + "/" + zippedfileName);
        ZipHelper.zipDir(dataToBeZipped, zipFile);
        File zipped = new File(zipFile);
        ZipHelper.decompressZipFile(zipFile, folderForDecompressedZip);

        File decompressedFolder = new File(folderForDecompressedZip);
        File[] listOfFiles = decompressedFolder.listFiles();

        Boolean firstCompressedFound = false;
        for (File f : listOfFiles) {
            if (f.getAbsolutePath().toLowerCase().contains(zippedfileName.toLowerCase()))
                firstCompressedFound = true;
        }
        Assert.assertTrue(zipped.exists()); // file is created
        Assert.assertTrue(firstCompressedFound); //zipped file is found in decompressed folder

    }

    @Test
    public void ZipAFolderAndAFile() throws IOException {
        String zipFile = tempFolder.getPath() + "/zipTest.zip";

        String zippedFolderName = "folderToBeZipped";
        String zippedfileName = "fileToBeZipped.txt";
        CreateNewFolderWithRandomFiles(tempFolder.getPath() + "/" + zippedFolderName, 2);
        CreateFileWithContent(tempFolder.getPath() + "/" + zippedfileName, "bla bla bla");

        List<String> dataToBeZipped = new ArrayList<>();
        dataToBeZipped.add(tempFolder.getPath() + "/" + zippedFolderName);
        dataToBeZipped.add(tempFolder.getPath() + "/" + zippedfileName);
        ZipHelper.zipDir(dataToBeZipped, zipFile);
        File zipped = new File(zipFile);
        ZipHelper.decompressZipFile(zipFile, folderForDecompressedZip);

        File decompressedFolder = new File(folderForDecompressedZip);
        File[] listOfFiles = decompressedFolder.listFiles();

        Boolean firstCompressedFound = false;
        Boolean secondCompressedFound = false;
        for (File f : listOfFiles) {
            if (f.getAbsolutePath().toLowerCase().contains(zippedFolderName.toLowerCase()))
                firstCompressedFound = true;
            else if (f.getAbsolutePath().toLowerCase().contains(zippedfileName.toLowerCase()))
                secondCompressedFound = true;
        }
        Assert.assertTrue(zipped.exists()); // file is created
        Assert.assertTrue(firstCompressedFound && secondCompressedFound); //zipped file is found in decompressed folder
    }


    @Autowired
    private TestUtils testUtils;

    @Test
    public void zipWithFolderEndsWithWhiteSpaceValidationFailureTest() throws Exception {
        String path = testUtils.getResourcePath("zipFiles/zipWithSpaces.zip");
        ZipHelper.ZipValidationReport zipValidationReport = ZipHelper.validateZipFile(new File(path));
        Assert.assertEquals(zipValidationReport.isValid(), false);
        Assert.assertNotEquals(zipValidationReport.getError(), "");
    }

    @Test
    public void zipWithEmptyFolderValidationSuccessTest() throws Exception {
        String path = testUtils.getResourcePath("zipFiles/zipWithEmptyFolder.zip");
        ZipHelper.ZipValidationReport zipValidationReport = ZipHelper.validateZipFile(new File(path));
        Assert.assertEquals(zipValidationReport.isValid(), true);
        Assert.assertEquals(zipValidationReport.getError(), "");
    }

    @Test
    public void validZipValidationSuccessTest() throws Exception {
        String path = testUtils.getResourcePath("zipFiles/validZip.zip");
        ZipHelper.ZipValidationReport zipValidationReport = ZipHelper.validateZipFile(new File(path));
        Assert.assertEquals(zipValidationReport.isValid(), true);
        Assert.assertEquals(zipValidationReport.getError(), "");
    }

    private Boolean FolderExistsInDirectory(String dirName, String innerDirName) {
        File[] listOfFiles = new File(dirName).listFiles();
        for (File f : listOfFiles)
            if (f.getAbsolutePath().toLowerCase().contains(innerDirName.toLowerCase()) && f.isDirectory())
                return true;

        return false;

    }


    private void CreateNewFolderWithRandomFiles(String folderName, int numberOfFiles) throws IOException {
        File p = new File(folderName);
        p.mkdir();

        for (int i = 0; i < numberOfFiles; i++) {
            CreateFileWithContent(p.getPath() + "/testToZip" + i + ".txt", "I am the content" + i);
        }
    }

    private void CreateFileWithContent(String fileName, String content) throws IOException {
        File file1 = new File(fileName);
        String fileContent1 = content;
        file1.createNewFile();
        Files.append(fileContent1, file1, Charset.defaultCharset());
    }

}
