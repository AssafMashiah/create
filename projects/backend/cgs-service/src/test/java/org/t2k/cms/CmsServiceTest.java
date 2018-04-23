package org.t2k.cms;

import atg.taglib.json.util.JSONException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t2k.configurations.Configuration;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItem;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.RandomStringUtils;
import org.apache.http.HttpResponse;
import org.apache.http.ProtocolVersion;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.apache.http.message.BasicHttpResponse;
import org.apache.http.message.BasicStatusLine;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.cms.CmsServiceImpl;
import org.t2k.cgs.dataServices.exceptions.*;
import org.t2k.cgs.model.transcoding.TranscodeProcessData;
import org.t2k.cgs.utils.FilesUtils;
import org.t2k.cgs.utils.ZipHelper;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Arrays;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.spy;
import static org.testng.Assert.assertNotNull;
import static org.testng.Assert.fail;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 08/11/12
 * Time: 10:17
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class CmsServiceTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private CmsServiceImpl cmsService;

    @Autowired
    private Configuration configuration;

    @Autowired
    private FilesUtils filesUtils;

    private List<String> tempFiles = Arrays.asList("/foo.txt", "/bar.txt", "/zoom.txt");

    private String PATH = "publishers/test/courses/test/media/test/";
    private String COURSE_REFERENCES_PATH = "publishers/test/courses/test/cgsdata/test/";
    private String TEMP_FOLDER_FOR_EXTRACTION = "tempFolderForExtraction";
    private String TEMP_ZIP_FILE = "tempZipped.zip";

    @BeforeClass
    public void createSomeFiles() throws IOException {
        String cms = cmsService.getCmsLocation();
        String content = "temp content";
        for (String fileName : tempFiles) {
            FileUtils.writeStringToFile(new File(cms + fileName), content);
        }
    }

    @AfterClass
    public void deleteCreatedFiles() throws IOException {
        String cms = cmsService.getCmsLocation();
        for (String fileName : tempFiles) {
            FileUtils.forceDelete(new File(cms, fileName));   // cleanup for the text files created for this test
        }
        FileUtils.forceDeleteOnExit(new File(TEMP_FOLDER_FOR_EXTRACTION));      //cleanup for extraction folder
        FileUtils.forceDeleteOnExit(new File(TEMP_ZIP_FILE));                  // cleanup for the zip created
    }

    @AfterMethod
    public void removeCreatedFiles() throws IOException {
        if (filesToCreate != null) {
            for (String f : filesToCreate) {
                File file = new File(cmsService.getCoursePath(pid, cid), f);
                if (file.exists()) {
                    FileUtils.forceDelete(file);
                }
            }
        }
    }

    private List getFileItemList(File file, byte[] fileBytes) throws IOException {
        int bufferSize = 1024 * 1024;
        File tmpDir = new File(TEMP_FOLDER_FOR_EXTRACTION);
        if (!tmpDir.exists())
            tmpDir.mkdirs();
        FileItem fileItem = new DiskFileItem("", null, false,
                file.getName(), bufferSize, tmpDir);
        if (fileBytes != null) {
            fileItem.getOutputStream().write(fileBytes);
        }
        List<FileItem> list = new LinkedList<>();
        list.add(fileItem);
        return list;
    }

    private byte[] createDummyByteArray(int size) {
        byte[] byteArray = new byte[size];
        for (int i = 0; i < size; i++) {
            byteArray[i] = 0;
        }
        return byteArray;
    }

    private List getDummyFileAsAFileItemList(String fileName, byte[] byteArray) throws IOException {
        File file = new File(fileName);
        return getFileItemList(file, byteArray);
    }

    @Test
    public void testUploadGetFile() throws DsException, IOException {
        int count = 0;
        File resourcesDir = new File(getClass().getClassLoader().getResource("uploadFiles").getFile());
        File[] files = resourcesDir.listFiles();
        assertNotNull(files);
        for (File file : files) {
            if (file == null || file.isDirectory() || file.length() == 0 || file.getName().equals("dummy.nosuchext")) {
                continue;
            }

            count++;
            byte[] fileBytes = new byte[(int) file.length()];
            try (FileInputStream is = new FileInputStream(file)) {
                is.read(fileBytes);
            }

            List list = getFileItemList(file, fileBytes);
            cmsService.uploadFiles(list, PATH + file.getName(), false, false);
            byte[] downloadedBytes = cmsService.getFile(PATH + file.getName());
            Assert.assertTrue(Arrays.equals(downloadedBytes, fileBytes));
        }

        Assert.assertNotEquals(count, 0, "None of the files was tested");
    }

    @Test
    public void testUploadFileWithTranscoding() throws DsException, IOException, JSONException {
        CmsServiceImpl mockCmsService = spy(cmsService);
        HttpClient defaultHttpClient = Mockito.mock(HttpClient.class);
        String expectedResult = "{\"processId\":\"d4f53171-86e1-4f01-b5a9-1ffefe09722f\"}";
        HttpResponse response = prepareResponse(200, expectedResult);
        doReturn(defaultHttpClient).when(mockCmsService).createHttpClient();
        doReturn(response).when(defaultHttpClient).execute(Mockito.isA(HttpPost.class));
        File fileToUpload = new File(getClass().getClassLoader().getResource("uploadFiles/dummy.mp4").getFile());
        assertNotNull(fileToUpload);

        byte[] fileBytes = new byte[(int) fileToUpload.length()];

        try (FileInputStream is = new FileInputStream(fileToUpload)) {
            is.read(fileBytes);
        }

        List list = getFileItemList(fileToUpload, fileBytes);
        String result = mockCmsService.uploadFiles(list, PATH + fileToUpload.getName(), true, true);
        Assert.assertEquals(result, expectedResult);

        byte[] downloadedBytes = mockCmsService.getFile(PATH + fileToUpload.getName());
        Assert.assertTrue(Arrays.equals(downloadedBytes, fileBytes));
    }

    @Test
    public void testGetTranscodingProcessData() throws DsException, IOException, JSONException {
        CmsServiceImpl mockCmsService = spy(cmsService);
        HttpClient defaultHttpClient = Mockito.mock(HttpClient.class);
        String transcodeProcessDataJson = filesUtils.readResourcesAsString(this.getClass(), "jsons/transcodeProcessData.json");
        TranscodeProcessData processData = new ObjectMapper().readValue(transcodeProcessDataJson, TranscodeProcessData.class);

        HttpResponse response = prepareResponse(200, transcodeProcessDataJson);
        doReturn(defaultHttpClient).when(mockCmsService).createHttpClient();
        doReturn(response).when(defaultHttpClient).execute(Mockito.isA(HttpGet.class));

        TranscodeProcessData result = mockCmsService.getUploadStatus(processData.getId());
        Assert.assertEquals(result.getId(), processData.getId());
        Assert.assertEquals(result.getCreationDate(), processData.getCreationDate());
        Assert.assertEquals(result.getFinishedDate(), processData.getFinishedDate());
        Assert.assertEquals(result.getStatus(), processData.getStatus());
        Assert.assertEquals(result.getProgressPercentage(), processData.getProgressPercentage());
        Assert.assertEquals(result.getNameFormat(), processData.getNameFormat());
        Assert.assertEquals(result.getErrors().size(), 0);
    }

    @Test
    public void testCancellingTranscodingProcess() throws DsException, IOException, JSONException {
        CmsServiceImpl mockCmsService = spy(cmsService);
        HttpClient defaultHttpClient = Mockito.mock(HttpClient.class);
        String processId = "d4f53171-86e1-4f01-b5a9-1ffefe09722f";

        HttpResponse response = prepareResponse(200, "");
        doReturn(defaultHttpClient).when(mockCmsService).createHttpClient();
        doReturn(response).when(defaultHttpClient).execute(Mockito.isA(HttpPut.class));

        mockCmsService.cancelTranscodingProcess(processId);
    }

    private HttpResponse prepareResponse(int expectedResponseStatus, String expectedResponseBody) {
        HttpResponse response = new BasicHttpResponse(new BasicStatusLine(
                new ProtocolVersion("HTTP", 1, 1), expectedResponseStatus, ""));
        response.setStatusCode(expectedResponseStatus);
        try {
            response.setEntity(new StringEntity(expectedResponseBody));
        } catch (UnsupportedEncodingException e) {
            throw new IllegalArgumentException(e);
        }
        return response;
    }

    @Test
    public void testFileTooBig() throws IOException, DsException {
        //Create a big dummy file
        int size = configuration.getIntProperty("cms.ext_limits.default") + 1;
        String fileName = "bigFile.txt";
        byte[] dummyByteArray = createDummyByteArray(size);
        List list = getDummyFileAsAFileItemList(fileName, dummyByteArray);
        try {
            cmsService.uploadFiles(list, PATH + fileName, false, false);
        } catch (FileTooBigException e) {
            return;
        }
        //An exception must be thrown and hence we shouldn't get here
        fail();
    }

    @Test(groups = "ignore")
    public void testFileTooBigButIsCourseReference() throws IOException, DsException {
        int size = configuration.getIntProperty("cms.ext_limits.default") + 1;
        String fileName = "bigFile.txt";
        byte[] byteArray = createDummyByteArray(size);
        List list = getDummyFileAsAFileItemList(fileName, byteArray);
        cmsService.uploadFiles(list, COURSE_REFERENCES_PATH + fileName, false, false);
        byte[] downloadedBytes = cmsService.getFile(COURSE_REFERENCES_PATH + fileName);
        Assert.assertTrue(Arrays.equals(downloadedBytes, byteArray));
    }

    @Test
    public void testFileTypeNotAllowed() throws IOException, DsException {
        try {
            String fileName = "notallowed.exe";
            byte[] byteArray = createDummyByteArray(1000);
            List list = getDummyFileAsAFileItemList(fileName, byteArray);
            cmsService.uploadFiles(list, COURSE_REFERENCES_PATH + fileName, false, false);
        } catch (FileTypeNotAllowedException e) {
            return;
        }
        //A FileTypeNotAllowed exception must be thrown and hence we shouldn't get here
        fail();
    }

    @Test
    public void testFileIsEmpty() throws IOException, DsException {
        File file = new File(getClass().getClassLoader().getResource("uploadFiles/empty.txt").getFile());
        List list = getFileItemList(file, null);
        try {
            cmsService.uploadFiles(list, PATH + file.getName(), false, false);
        } catch (FileIsEmptyOrNoFileInRequestException e) {
            return;
        }
        //An exception must be thrown and hence we shouldn't get here
        fail();
    }

    @Test()
    public void testFileNotExists() throws DsException {
        try {
            cmsService.getFile(String.format("%s%s.jpg", PATH, RandomStringUtils.random(10)));
        } catch (ResourceNotFoundException e) {
            return;
        }
        //An exception must be thrown and hence we shouldn't get here
        fail();
    }

    @Test
    public void deleteExistingFile() throws IOException, DsException {
        File file = new File(getClass().getClassLoader().getResource("uploadFiles/dummy.txt").getFile());
        byte[] fileBytes = new byte[(int) file.length()];
        try (FileInputStream is = new FileInputStream(file)) {
            is.read(fileBytes);
        }
        List list = getFileItemList(file, fileBytes);
        cmsService.uploadFiles(list, PATH + file.getName(), false, false);
        cmsService.deleteFile(PATH + file.getName());
        try {
            cmsService.getFile(PATH + file.getName());
        } catch (DsException e) {
            Assert.assertTrue(e.getClass() == ResourceNotFoundException.class);
            return;
        }
        //An exception must be thrown and hence we shouldn't get here
        fail();
    }

    @Test
    public void deleteNonExistingFile() {
        try {
            cmsService.deleteFile(PATH + new Date());
        } catch (DsException e) {
            Assert.assertTrue(e.getClass() == ResourceNotFoundException.class);
            return;
        }
        //An exception must be thrown and hence we shouldn't get here
        fail();
    }

    @Test
    public void getZippedFilesForExistingFilesTest() throws IOException, DsException {
        byte[] fileBytes = cmsService.getZippedFiles(tempFiles);   // get zipped bytes
        FileUtils.writeByteArrayToFile(new File(TEMP_ZIP_FILE), fileBytes);
        ZipHelper.decompressZipFile(TEMP_ZIP_FILE, TEMP_FOLDER_FOR_EXTRACTION);     // unzip the bytes' file
        File folder = new File(TEMP_FOLDER_FOR_EXTRACTION);
        File[] extractedFiles = folder.listFiles();                           // assert all files are there
        for (String fileToBeInZip : tempFiles) {
            Boolean fileFound = false;
            for (File f : extractedFiles) {
                if (f.getAbsolutePath().contains(fileToBeInZip.replace("/", "")))
                    fileFound = true;
            }
            Assert.assertTrue(fileFound, "File " + fileToBeInZip + " was not found in the unzipped folder");
        }

    }

    @Test
    public void getZippedFilesForNonExistingFilesTest() throws IOException, DsException {
        List<String> nonExistingFile = Arrays.asList("/notExisting1.txt", "/notExisting2.txt");
        try {
            cmsService.getZippedFiles(nonExistingFile);   // get zipped bytes
        } catch (IOException e) {
            Assert.assertTrue(e.getMessage().contains("missing files"), "Exception should contain a message about missing files");
            Assert.assertTrue(e.getMessage().contains("notExisting1.txt"), "Missing file's name should appear in exception message");
            Assert.assertTrue(e.getMessage().contains("notExisting2.txt"), "Missing file's name should appear in exception message");

        }
    }

    int pid = 222222;
    String cid = "mockCourseId";
    List<String> filesToCreate = null;

    @Test
    public void getMissingFilesTest() throws IOException {
        String firstFilename = "a.txt";
        String secondFileName = "b.txt";
        filesToCreate = Arrays.asList(firstFilename, secondFileName, "c.jpeg");
        for (String f : filesToCreate) {
            FileUtils.writeStringToFile(new File(cmsService.getCoursePath(pid, cid), f), "bbb");
        }
        MissingFiles m1 = cmsService.getNonExistingFileNames(pid, cid, filesToCreate);

        //Assert that when all files exist we get an empty object as return value
        Assert.assertTrue(m1.getMissingFiles().isEmpty());

        FileUtils.forceDelete(new File(cmsService.getCoursePath(pid, cid), firstFilename));
        MissingFiles m2 = cmsService.getNonExistingFileNames(pid, cid, filesToCreate);

        // Assert that when a file is missing we get an object with the correct number of objects
        Assert.assertEquals(m2.getMissingFiles().size(), 1);
        boolean deletedFileReturnedFromMethod = false;
        for (String file : m2.getMissingFiles()) {
            if (file.equals(firstFilename))
                deletedFileReturnedFromMethod = true;
        }

        // Assert that when a file is missing we get its name in the return value
        Assert.assertTrue(deletedFileReturnedFromMethod);

        // delete another file - now there are 2 files misisng
        FileUtils.forceDelete(new File(cmsService.getCoursePath(pid, cid), secondFileName));
        MissingFiles m3 = cmsService.getNonExistingFileNames(pid, cid, filesToCreate);

        // Assert that when a file is missing we get an object with the correct number of objects
        Assert.assertEquals(m3.getMissingFiles().size(), 2);
    }
}