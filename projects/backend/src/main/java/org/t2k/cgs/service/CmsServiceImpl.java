package org.t2k.cgs.service;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t2k.configurations.Configuration;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.SystemUtils;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.mime.MultipartEntity;
import org.apache.http.entity.mime.content.InputStreamBody;
import org.apache.http.entity.mime.content.StringBody;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.apache.log4j.Logger;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.CmsService;
import org.t2k.cgs.persistence.dao.FileDaoImpl;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.ErrorCodes;
import org.t2k.cgs.domain.model.exceptions.FileIsEmptyOrNoFileInRequestException;
import org.t2k.cgs.domain.model.exceptions.FileTooBigException;
import org.t2k.cgs.domain.model.exceptions.FileTypeNotAllowedException;
import org.t2k.cgs.domain.model.exceptions.ValidationException;
import org.t2k.cgs.domain.usecases.transcoding.NameFormat;
import org.t2k.cgs.domain.usecases.transcoding.TranscodeProcessData;
import org.t2k.cgs.utils.ZipHelper;
import org.t2k.cms.MissingFiles;
import org.t2k.cms.model.CmsLocations;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 15/10/12
 * Time: 15:15
 */
@Service
public class CmsServiceImpl implements CmsService {
    //TODO: this is a somewhat duplication of the information in CmsController's RequestMapping.

    private static Logger logger = Logger.getLogger(CmsServiceImpl.class);

    //This is where course references are saved. We don't limit the size of files which are saved to it.
    private static final String COURSE_REFERENCES_DIR = "cgsdata";

    @Inject
    private Configuration configuration;

    private static String cmsLocation;
    @Inject
    private FileDaoImpl fileDao;
    private static Map<String, Integer> uploadLimits;
    private static Set<String> forbiddenFileExtensions;
    private int defaultUploadLimit;
    private String tmpLocation;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     Public Methods
     */
    /*
   Init method
    */

    /**
     * This method runs right after Spring initiates this with the right configuration.
     */
    @PostConstruct
    public void init() throws DsException {
        cmsLocation = configuration.getProperty("cmsHome");
        //cmsLocation = FileDaoImpl.appendSlashIfNeeded(cmsLocation);
        tmpLocation = String.format("%s/tmp", cmsLocation);
        Map<String, String> tmpMap = configuration.getProperties("cms.ext_limits.");
        defaultUploadLimit = Integer.parseInt(tmpMap.get("cms.ext_limits.default"));
        tmpMap.remove("default");
        uploadLimits = transformMap(tmpMap);
        String forbiddenFileExtensionsString = configuration.getProperty("cms.forbidden_extensions");
        forbiddenFileExtensions = parseCommaSeparatedList(forbiddenFileExtensionsString);
    }

    private Set<String> parseCommaSeparatedList(String stringToSeperate) {
        Set<String> ret = new HashSet<>();
        if (!StringUtils.isBlank(stringToSeperate)) {
            String[] valuesArray = stringToSeperate.split(",");
            for (int i = 0; i < valuesArray.length; i++) {
                ret.add(valuesArray[i].trim());
            }
        }
        return ret;
    }

    /**
     * @param filenames the paths of the requested file, relative to the cms base dir.
     * @return the bytes of a zip file containing the requested files
     * @throws DsException
     */
    @Override
    public byte[] getZippedFiles(List<String> filenames) throws IOException, DsException {
        String tempZipFile = "out/empZip.zip";
        List<String> fullFileNames = getFullFilesPath(filenames);
        ZipHelper.zipDir(fullFileNames, tempZipFile);

        byte[] zipBytes = fileDao.getFile(tempZipFile);  //To change body of implemented methods use File | Settings | File Templates.
        FileUtils.forceDelete(new File(tempZipFile));
        return zipBytes;
    }

    /**
     * @param filenames the paths of the requested file, relative to the cms base dir.
     * @return the bytes of a zip file containing the requested files
     * @throws DsException
     */
    @Override
    public byte[] getZippedFiles(String path, List<String> filenames) throws IOException, DsException {
        String tempZipFile = String.format("tempZip%s.zip", UUID.randomUUID()); // create a unique zip temp file to download for each call to this method.
        // we do this to prevent a situation where writing\deleting this file
        // affects other users. For example - bug: CREATE-541
        List<String> fullFileNames = getFullFilesPath(filenames);
        ZipHelper.zipDir(path, fullFileNames, tempZipFile);

        if (!new File(tempZipFile).exists()) {
            String msg = String.format("getZippedFiles: Error creating temp zip file %s", new File(tempZipFile).getAbsolutePath());
            logger.error(msg);
            throw new IOException(msg);
        }

        byte[] zipBytes = fileDao.getFile(tempZipFile); //To change body of implemented methods use File | Settings | File Templates.
        FileUtils.forceDelete(new File(tempZipFile)); // delete the temp file
        return zipBytes;
    }

    private List<String> getFullFilesPath(List<String> filenames) {
        List<String> filesPaths = new ArrayList<>();
        for (String filename : filenames) {
            filesPaths.add(getFullFilePath(filename));
        }
        return filesPaths;
    }

    /**
     * @param filePath the path of the requested file, relative to the cms base dir.
     * @return the bytes of the requested file
     * @throws DsException
     */
    public byte[] getFile(String filePath) throws DsException {
        String fullFilePath = getFullFilePath(filePath);
        return fileDao.getFile(fullFilePath);
    }

    /**
     * @param items       List of FileItems, one of which is a file to upload. The list is typically generated by
     *                    ServletFileUpload.parseRequest.
     * @param filePath
     * @param isTranscode
     * @throws DsException
     */

//    this is the function to handle
    public String uploadFiles(List items, String filePath, boolean isSha1, boolean isTranscode) throws DsException {
        Iterator iter = items.iterator();
        while (iter.hasNext()) {
            FileItem item = (FileItem) iter.next();
            if (!item.isFormField()) {
                logger.debug(String.format("uploadFiles. About to upload file %s. isTranscode: %s, isSha1: %s", filePath, isTranscode, isSha1));
                OutputStream outputStream = null;
                InputStream inputStream = null;
                File savedFile = null;
                try {

                    outputStream = item.getOutputStream();
                    validateUploadedFile(item, filePath);

                    String fullPath = getFullFilePath(filePath);
                    inputStream = item.getInputStream();

                    // first flow - is case it's Israel environment we use the external service and return its response
                    if (isTranscode) {
                        File fileToUpload = new File(filePath);
                        String response = sendTranscodeRequestToTranscodingService(inputStream, fileToUpload.getName(), fileToUpload.getParent(), isSha1);
                        return response; // in case of transcoding - the response is a JSON that includes the processId
                    }

                    // second flow - the regular flow, save the asset
                    byte[] byteArray = IOUtils.toByteArray(inputStream);
                    validateFileContent(byteArray, fullPath);

                    if (isSha1) { // keeping the file with its original name is required for CREATE-5078, but we store it in sha1 dir
                        String originalFileName = item.getName();
                        savedFile = saveFileToSha1Dir(byteArray, fullPath, originalFileName);
                        filePath = savedFile.getPath();
                    } else { // in case of no transcoding or SHA1 needed
                        fileDao.saveFile(byteArray, fullPath);
                    }

                } catch (IOException e) {
                    throw new DsException(String.format("uploadFiles. Failed uploading %s", filePath), e);
                } finally {
                    if (outputStream != null) {
                        try {
                            outputStream.close();
                        } catch (IOException e) {
                            throw new DsException("uploadFiles. Failed to close output stream.", e);
                        }
                    }

                    if (inputStream != null) {
                        try {
                            inputStream.close();
                        } catch (IOException e) {
                            throw new DsException("uploadFiles. Failed to close input stream.", e);
                        }
                    }
                }
            }
        }

        return removeCmsLocationPrefixFromPath(filePath);
    }

    private void validateFileContent(byte[] byteArray, String fullPath) throws DsException, IOException {
        if (fullPath.endsWith(".zip")) {
            File tempFile = saveTempCopyOfFile(byteArray, "zip");
            ZipHelper.ZipValidationReport zipValidationReport = ZipHelper.validateZipFile(tempFile);
            if (!zipValidationReport.isValid()) {
                throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, zipValidationReport.getError());
            }
        }
    }

    private void validateUploadedFile(FileItem item, String filePath) throws FileIsEmptyOrNoFileInRequestException, FileTypeNotAllowedException, FileTooBigException {
        // make sure that the file isn't empty
        if (item.getSize() == 0) {
            throw new FileIsEmptyOrNoFileInRequestException(item.getName(), "Uploading empty files is not allowed");
        }
        // make sure that the file type is allowed
        if (fileTypeNotAllowed(filePath)) {
            throw new FileTypeNotAllowedException(filePath, "File Type is not allowed");
        }
        // make sure that the file isn't too big. If the file is a course reference then skip this test.
        if (!fileIsACourseReference(filePath) && fileExtendsLimit(filePath, item.getSize())) {
            throw new FileTooBigException(filePath, "File too big");
        }
    }

    private String sendTranscodeRequestToTranscodingService(InputStream inputStream, String fileName, String outputPath, boolean isSha1) throws DsException {
        String mediaTranscoderServiceUrl = configuration.getProperty("cms.mediaTranscoderServiceUrl") + "/transcode";
        outputPath = outputPath.replace(configuration.getProperty("cmsHome"), "");
        NameFormat nameFormat = isSha1 ? NameFormat.SHA1 : NameFormat.UUID;
        JSONObject responseBody;
        HttpResponse response;
        try {
            logger.debug(String.format("sendTranscodeRequestToTranscodingService. About to upload file %s to the transcoding service. URL: %s, name format: %s", fileName, mediaTranscoderServiceUrl, nameFormat));
            InputStreamBody fileContent = new InputStreamBody(inputStream, "temp");
            HttpPost postRequest = new HttpPost(mediaTranscoderServiceUrl);
            MultipartEntity mpEntity = new MultipartEntity();
            mpEntity.addPart("outputPath", new StringBody(outputPath));
            mpEntity.addPart("fileName", new StringBody(fileName));
            mpEntity.addPart("nameFormat", new StringBody(nameFormat.name()));
            mpEntity.addPart("input", fileContent);
            postRequest.setEntity(mpEntity);

            HttpClient httpClient = createHttpClient();
            response = httpClient.execute(postRequest);
            validateResponseIsOK(response);
            responseBody = new JSONObject(EntityUtils.toString(response.getEntity()));
        } catch (UnsupportedEncodingException e) {
            throw new DsException("Failed to encode request parameters to transcoding service.", e);
        } catch (JSONException e) {
            throw new DsException("Failed to parse response body from transcoding service into JSON object.", e);
        } catch (IOException e) {
            throw new DsException("Failed to execute the http request to transcoding service.", e);
        }
        String responseString = responseBody.toString();
        logger.debug(String.format("sendTranscodeRequestToTranscodingService completed. Process id for transcoding file %s is %s", fileName, responseString));
        return responseString; // the response body holds the process id of the transcoding process
    }

    public HttpClient createHttpClient() {
        return new DefaultHttpClient();
    }

    private void validateResponseIsOK(HttpResponse response) throws IOException, JSONException, DsException {
        int responseStatus = response.getStatusLine().getStatusCode();
        if (responseStatus != 200) {
            String responseBody = EntityUtils.toString(response.getEntity());
            String message = getErrorMessageFromBody(new JSONObject(responseBody));
            String errorMsg = String.format("Filed to send request to media transcoder service. Message: %s Exception: %s", message, responseBody);
            logger.error(errorMsg);
            throw new DsException(errorMsg);
        }
    }

    private TranscodeProcessData sendGetProcessStatusRequestToTranscodingService(String processId) throws DsException {
        String mediaTranscoderServiceUrl = String.format("%s/process/%s", configuration.getProperty("cms.mediaTranscoderServiceUrl"), processId);
        logger.debug(String.format("sendGetProcessStatusRequestToTranscodingService. About to send request to get transcoding process status to the transcoding service. URL: %s", mediaTranscoderServiceUrl));
        HttpResponse response = sendHttpRequest(mediaTranscoderServiceUrl, HttpMethod.GET, true);
        String responseBody = null;
        try {
            validateResponseIsOK(response);
            responseBody = EntityUtils.toString(response.getEntity());
            TranscodeProcessData processData = objectMapper.readValue(responseBody, TranscodeProcessData.class);
            if (processData.getConvertedFilePath() != null) {
                processData.setConvertedFilePath(removeCmsLocationPrefixFromPath(processData.getConvertedFilePath()));
            }
            return processData;
        } catch (JSONException e) {
            String errorMsg = String.format("Failed to parse the GET process status response from media transcode service. response responseBody: %s\nException: %s", responseBody, e.getMessage());
            logger.error(errorMsg, e);
            throw new DsException(errorMsg, e);
        } catch (IOException e) {
            String errorMsg = String.format("Failed to read the GET process status response from media transcode service: %s", e.getMessage());
            logger.error(errorMsg, e);
            throw new DsException(errorMsg, e);
        }
    }

    private String removeCmsLocationPrefixFromPath(String path) {
        if (SystemUtils.IS_OS_WINDOWS) {
            path = path.replace("\\", "/");
        }

        return path.replace(cmsLocation, "");
    }

//    private String sendGetAllProcessesStatusesRequestToTranscodingService() throws DsException {
//        String mediaTranscoderServiceUrl = String.format("%s/process", configuration.getProperty("cms.mediaTranscoderServiceUrl"));
//        HttpResponse response = sendHttpRequest(mediaTranscoderServiceUrl, HttpMethod.GET);
//
//        int status = response.getStatusLine().getStatusCode();
//        try {
//            String body = EntityUtils.toString(response.getEntity());
//            if (status == 200) {
//                JSONArray jsonArray = new JSONArray(body);
//                return jsonArray.toString();
//            } else {
//                String message = getErrorMessageFromBody(new JSONObject(body));
//                switch (status) {   // specific handling for known error codes
//                    case 404:
//                        message = "404 - Not Found";
//                        break;
//                }
//
//                String errorMsg = String.format("Failed to send request to media transcoder service. Message: %s Exception: %s", message, body);
//                logger.error(errorMsg);
//                throw new DsException(errorMsg);
//            }
//        } catch (JSONException e) {
//            String errorMsg = String.format("Failed to parse the GET process status response from media transcode service: %s", e.getMessage());
//            logger.error(errorMsg, e);
//            throw new DsException(errorMsg, e);
//        } catch (IOException e) {
//            String errorMsg = String.format("Failed to read the GET process status response from media transcode service: %s", e.getMessage());
//            logger.error(errorMsg, e);
//            throw new DsException(errorMsg, e);
//        }
//    }

    private HttpResponse sendHttpRequest(String url, HttpMethod httpMethod, boolean shouldReturnData) throws DsException {
        HttpResponse response;
        try {
            switch (httpMethod) {
                case GET:
                    response = createHttpClient().execute(new HttpGet(url));
                    break;
                case PUT:
                    response = createHttpClient().execute(new HttpPut(url));
                    break;
                default:
                    throw new DsException(String.format("The http method %s isn't supported.", httpMethod.name()));
            }
        } catch (IOException e) {
            String errorMsg = String.format("Failed to execute %s request: %s to media transcode service: %s", httpMethod.name(), url, e.getMessage());
            logger.error(errorMsg, e);
            throw new DsException(errorMsg, e);
        }

        if (shouldReturnData && response.getEntity().getContentLength() == 0) {
            throw new DsException("Response didn't return any data.");
        }

        return response;
    }

    /**
     * returns the error from the response.
     * if there is a problem (parsing error) - return the body itself
     *
     * @param body http response body
     * @return - error message string from request
     */
    private String getErrorMessageFromBody(JSONObject body) {
        try {
            String messageKey = "messageDisplayString";
            if (body.has(messageKey))
                return body.get(messageKey).toString();
            else
                return body.toString();
        } catch (Exception e) {
            return body.toString();
        }
    }

    private File saveTempCopyOfFile(byte[] byteArray, String fileExtension) throws DsException {
        // save the byte array to file with UUID as its name
        String tempFilePath = String.format("%s/%s.%s", tmpLocation, UUID.randomUUID().toString(), fileExtension);
        fileDao.saveFile(byteArray, tempFilePath);
        File tempFile = new File(tempFilePath);
        return tempFile;

    }

    private File saveTempFileWithSha1Name(String filePath, byte[] byteArray) throws DsException {
        String fileExtension = FilenameUtils.getExtension(filePath);

        File tempFile = saveTempCopyOfFile(byteArray, fileExtension);
        // get the file's sha1 string using input stream so it won't save the whole file to memory
        String sha1String = getSha1Hash(tempFile);
        // rename the file to its sha1
        File newSha1File = renameFile(tempFile, sha1String);

        logger.debug(String.format("saveTempFileWithSha1Name. Rename file %s to SHA1 at %s succeeded.", tempFile.getAbsolutePath(), newSha1File.getAbsolutePath()));
        return newSha1File;
    }

    private File saveFileToSha1Dir(byte[] byteArray, String filePath, String originalFileName) throws DsException {
        String fileExtension = FilenameUtils.getExtension(filePath);
        File savedFile = saveTempCopyOfFile(byteArray, fileExtension);
        String fileSha1 = getSha1Hash(savedFile);
        savedFile = renameFile(savedFile, originalFileName);
        String newDirPath = String.format("%s/%s/%s/%s",
                new File(filePath).getParent(),
                fileSha1.substring(0, 2),
                fileSha1.substring(2, 4),
                fileSha1);
        filePath = String.format("%s/%s", newDirPath, originalFileName);
        if (!new File(filePath).exists()) {
            try {
                FileUtils.moveFileToDirectory(savedFile, new File(newDirPath), true);
            } catch (IOException e) {
                if (savedFile.exists()) {
                    deleteTempFile(savedFile);
                }
                throw new DsException(String.format("uploadFiles. Failed uploading %s", filePath), e);
            }
        }
        return new File(filePath);
    }

    private File renameFile(File file, String newFileName) throws DsException {
        String fileExtension = FilenameUtils.getExtension(file.getName());
        File newFile = new File(file.getParent(), newFileName);
        if (!newFile.exists()) { // if the sha1 file doesn't exist, rename the file to it.
            boolean isRenameSucceeded = file.renameTo(newFile);
            if (!isRenameSucceeded) {
                String errorMsg = String.format("Failed to rename file %s to %s", file.getName(), newFile.getName());
                logger.error(String.format("renameFile. %s", errorMsg));
                deleteTempFile(file);
                throw new DsException(errorMsg);
            }
        } else { // if the sha1 file for the file already exists, just delete the file.
            deleteTempFile(file);
        }
        return newFile;
    }

    private String getSha1Hash(File file) throws DsException {
        String sha1String;
        FileInputStream fileInputStream = null;
        try {
            fileInputStream = new FileInputStream(file);
            sha1String = DigestUtils.sha1Hex(fileInputStream);
        } catch (Exception e) {
            deleteTempFile(file);
            throw new DsException(String.format("Failed to create sha1 string from file %s - %s", file.getAbsolutePath(), e.getMessage()), e);
        } finally {
            if (fileInputStream != null) {
                try {
                    fileInputStream.close();
                } catch (IOException e) {
                    logger.warn(String.format("Failed to close input stream for file %s", file.getAbsolutePath()));
                }
            }
        }
        return sha1String;
    }

    private void deleteTempFile(File tempFile) {
        try {
            FileUtils.forceDelete(tempFile);
        } catch (IOException ex) {
            logger.warn(String.format("saveTempFileWithSha1Name. Failed to delete temporary file %s on creating sha1 from file.", tempFile), ex);
        }
    }

    @Override
    public String prepareAssetDirectory(String cmsLocationPattern, Object... parameters) {
        String cmsAssetLocation = getCmsLocation() + CmsLocations.resolve(cmsLocationPattern, parameters);
        File appletDir = new File(cmsAssetLocation);
        appletDir.delete();
        appletDir.mkdirs();
        return cmsAssetLocation;
    }

    private boolean fileTypeNotAllowed(String filePath) {
        String ext = FilenameUtils.getExtension(filePath);
        return forbiddenFileExtensions.contains(ext);
    }

    private boolean fileIsACourseReference(String filePath) {
        String pattern = String.format("%s/%s.*", BASE_COURSE_PATH.replace("$s", ".*"), COURSE_REFERENCES_DIR);
        if (filePath.charAt(0) != '/') {
            filePath = String.format("/%s", filePath);
        }
        return filePath.matches(pattern);
    }

    public void deleteFile(String filePath) throws DsException {
        String fullFilePath = getFullFilePath(filePath);
        fileDao.deleteFile(fullFilePath);
    }

    public String getTmpLocation() {
        return tmpLocation;
    }

    public String getCmsLocation() {
        return cmsLocation;
    }

/**
 Private Methods
 */

    /**
     * @param filePath is relative to the cms base dir
     * @return is the full path in the file system
     */
    public String getFullFilePath(String filePath) {
        if (filePath.startsWith("/") || filePath.startsWith("\\")) {
            return String.format("%s%s", cmsLocation, filePath);
        } else {
            return String.format("%s/%s", cmsLocation, filePath);
        }
    }

    @Override
    public MissingFiles getNonExistingFileNames(int publisherId, String courseId, List<String> filenames) {
        MissingFiles getNonExistingFileNames = new MissingFiles();
        List<String> getNonExistingFileNamesList = new ArrayList<>();
        for (String f : filenames) {
            File fileToCheck = new File(getCoursePath(publisherId, courseId), f);
            if (!fileToCheck.exists()) {
                getNonExistingFileNamesList.add(f);
            }
        }
        getNonExistingFileNames.setMissingFiles(getNonExistingFileNamesList);
        return getNonExistingFileNames;
    }

    /**
     * removes all course contents from CMS
     *
     * @param courseId    - courseId to remove
     * @param publisherId - publisher Id relates to this course
     * @throws IOException
     */
    @Override
    public void deleteCourseContents(String courseId, int publisherId) throws IOException {
        String courseDirPath = getCoursePath(publisherId, courseId);
        logger.info(String.format("deleteCourseContents: of publisherId: %d, courseId: %s, cms path: %s", publisherId, courseId, courseDirPath));
        File courseDir = new File(courseDirPath);
        FileUtils.deleteDirectory(courseDir);
    }

    @Override
    public boolean isMediaTranscodingServiceAvailable() {
        String mediaTranscoderServiceUrl = configuration.getProperty("cms.mediaTranscoderServiceUrl");
        if (mediaTranscoderServiceUrl == null || mediaTranscoderServiceUrl.equals("@cms.mediaTranscoderServiceUrl@"))
            return false;
        return true;
    }

    @Override
    public TranscodeProcessData getUploadStatus(String processId) throws DsException {
        return sendGetProcessStatusRequestToTranscodingService(processId);
    }

    @Override
    public void cancelTranscodingProcess(String processId) throws DsException {
        sendCancelUploadRequestToTranscodingService(processId);
    }

    @Override
    public String getCustomizationPackCmsPath(int publisherId, String courseId, String customizationPackLocale, String customizationPackVersion) {
        String BaseCourseCmsPath = getCoursePath(publisherId, courseId);
        return String.format("%s/customizationPack/%s/%s", BaseCourseCmsPath, customizationPackLocale, customizationPackVersion);
    }

    private void sendCancelUploadRequestToTranscodingService(String processId) throws DsException {
        String mediaTranscoderServiceUrl = String.format("%s/process/%s/cancel", configuration.getProperty("cms.mediaTranscoderServiceUrl"), processId);
        logger.debug(String.format("sendCancelUploadRequestToTranscodingService. About to send request to cancel transcoding process status to the transcoding service. URL: %s", mediaTranscoderServiceUrl));
        HttpResponse response = sendHttpRequest(mediaTranscoderServiceUrl, HttpMethod.PUT, false);
        try {
            validateResponseIsOK(response);
        } catch (JSONException e) {
            String errorMsg = String.format("Failed to parse the cancel response from media transcode service: %s", e.getMessage());
            logger.error(errorMsg, e);
            throw new DsException(errorMsg, e);
        } catch (IOException e) {
            String errorMsg = String.format("Failed to read the PUT cancel response from media transcode service: %s", e.getMessage());
            logger.error(errorMsg, e);
            throw new DsException(errorMsg, e);
        }
    }

    @Override
    public String getCoursePath(int publisherId, String courseId) {
        return String.format("%s/courses/%s", getPublisherPath(publisherId), courseId);
    }

    public String getPublisherPath(int publisherId) {
        return String.format("%s/publishers/%d", cmsLocation, publisherId);
    }

    /**
     * @param filePath - file path to save to file in
     * @param size     - file size
     * @return true if the file is too big (each file type might have a different limit)
     */
    private boolean fileExtendsLimit(String filePath, long size) {
        String ext = FilenameUtils.getExtension(filePath);
        Integer maxSize;
        if (uploadLimits.containsKey(ext)) {
            maxSize = uploadLimits.get(ext);
        } else {
            maxSize = defaultUploadLimit;
        }
        return size > maxSize;
    }

    /**
     * @param tmpMap the size limits in a String to String map.
     * @return the size limits in a map whose keys are MediaTypes and values are Integers.
     * @throws DsException
     */
    private Map<String, Integer> transformMap(Map<String, String> tmpMap) throws DsException {
        Map<String, Integer> ret = new HashMap<>();
        for (String ext : tmpMap.keySet()) {
            Integer limit = Integer.parseInt(tmpMap.get(ext));
            ret.put(ext, limit);
        }
        return ret;
    }
}