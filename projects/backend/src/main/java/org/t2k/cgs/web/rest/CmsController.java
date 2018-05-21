package org.t2k.cgs.web.rest;

import atg.taglib.json.util.JSONArray;
import atg.taglib.json.util.JSONObject;
import com.t2k.configurations.Configuration;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadBase;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.FileIsEmptyOrNoFileInRequestException;
import org.t2k.cgs.domain.model.exceptions.FileTooBigException;
import org.t2k.cgs.domain.model.exceptions.ResourceNotFoundException;
import org.t2k.cgs.domain.usecases.transcoding.TranscodeProcessData;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;
import org.t2k.cgs.domain.usecases.CmsService;
import org.t2k.cms.MissingFiles;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 23/10/12
 * Time: 10:13
 */
@RestController
@AllowedForAllUsers
@RequestMapping(value = {
        "/publishers/{pid}/courses/{cid}/skills/**",
        "/publishers/{pid}/courses/{cid}/css/**",
        "/publishers/{pid}/courses/{cid}/scheme/**",
        "/publishers/{pid}/courses/{cid}/standards/**",
        "/publishers/{pid}/courses/{cid}/media/**",
        "/publishers/{pid}/courses/{cid}/src/**",
        "/publishers/{pid}/courses/{cid}/customizationPack/**",
        "/publishers/{pid}/courses/{cid}/zip/**",
        "/publishers/{pid}/courses/{cid}/resources/**",
        "/publishers/{pid}/courses/{cid}/processUpload",
        "/publishers/{pid}/courses/{cid}/cgsData/**",
        "/publishers/{pid}/courses/{cid}/cgsdata/**",
        "/publishers/{pid}/plugins/**",
        "/publishers/{pid}/ebooks/**"
})
public class CmsController {

    private Logger logger = Logger.getLogger(CmsController.class);

    @Autowired
    private CmsService cmsService;

    @Autowired
    private Configuration configuration;

    /**
     * uploads a file into cms, under the publisher & course folder.
     * makes sub directories if necessary
     *
     * @param request        - http request
     * @param multipartFiles multipart files attached to the request
     * @param isSha1         - flag stating whether to rename the uploaded file to its SHA1 or not
     * @param isTranscode    - flag stating whether to transcode the uploaded file or not
     * @return if isTranscode is true, it returns a json with the process id related to the transcoding process
     * otherwise it returns the relative path of the uploaded file in the file system
     * @throws DsException
     */
    @RequestMapping(method = RequestMethod.POST, headers = "Accept=*/*", produces = "application/json; text/plain; charset=utf-8")
    // added the "produces" part to handle uploads of files with hebrew names that have a different encoding (ISO-...)
    public ResponseEntity<String> uploadAsset(HttpServletRequest request,
                                              @RequestParam(name = "file") CommonsMultipartFile[] multipartFiles,
                                              @RequestParam(defaultValue = "false") boolean isSha1,
                                              @RequestParam(defaultValue = "false") boolean isTranscode) throws DsException {
        //This is the the path of the file to be uploaded (relative to the cms base path)
        String path = request.getPathInfo();
        File tmpDir = new File(cmsService.getTmpLocation());
        tmpDir.mkdirs();
        List<FileItem> items;
        try {
            // extract FileItems from CommonsMultipartFile[] to keep the existing implementation of file save, after adding CommonsMultipartResolver bean to spring context
            items = Arrays.stream(multipartFiles).map(CommonsMultipartFile::getFileItem).collect(Collectors.toList());
            if (items.isEmpty()) {
                String message = String.format("Error extracting the file from the POST url: %s", request.getRequestURI());
                logger.error(message);
                throw new FileUploadBase.InvalidContentTypeException(message);
            }

            String result = cmsService.uploadFiles(items, path, isSha1, isTranscode);

            HttpHeaders responseHeaders = new HttpHeaders();
            responseHeaders.add("Content-Type", "text/html; charset=utf-8");
            return new ResponseEntity<>(result, responseHeaders, HttpStatus.OK);

        } catch (FileUploadBase.InvalidContentTypeException e) {
            logger.error(String.format("The request doesn't attach a file in a multipart form item. path: %s", path), e);
            throw new FileIsEmptyOrNoFileInRequestException(path, String.format("The upload request for %s doesn't attach a file, or attach a file in a wrong format", path), e);
        } catch (FileTooBigException e) {
            logger.error(String.format("The uploaded file is too big (according to the limit configuration). path: %s", path), e);
            throw e;
        } catch (FileIsEmptyOrNoFileInRequestException e) {
            logger.error(String.format("The uploaded file is empty). path: %s", path), e);
            throw e;
        } catch (DsException e) {
            logger.error(String.format("uploadAsset Failed. path: %s", path), e);
            throw e;
        }
    }

    @RequestMapping(value = "/{processId}", method = RequestMethod.GET)
    public TranscodeProcessData getAssetUploadStatus(@PathVariable String processId) throws DsException {
        return cmsService.getUploadStatus(processId);
    }

    @RequestMapping(value = "/{processId}/cancel", method = RequestMethod.PUT)
    public void cancelTranscodingProcess(@PathVariable String processId) throws DsException {
        cmsService.cancelTranscodingProcess(processId);
    }

    /**
     * @param request - http request from client
     * @throws DsException
     */
    @RequestMapping(method = RequestMethod.DELETE)
    public void deleteAsset(HttpServletRequest request) throws DsException {
        //This is the the path of the file to be deleted (relative to the cms base path
        String path = request.getPathInfo();
        try {
            cmsService.deleteFile(path);
        } catch (DsException e) {
            logger.error("Deletion Failed", e);
            throw e;
        }
    }

    /**
     * @param request - HTTP request from client
     * @return A full response, including the requested file in the body, and a proper mime type in the headers.
     * @throws DsException
     */
    @RequestMapping(value = "/asset", method = RequestMethod.POST)
    public ResponseEntity<byte[]> getAssets(HttpServletRequest request) throws Exception {

        String path = null;
        try {
            // This is the the path of the file to be retrieved (relative to the cms base path)
            path = request.getPathInfo().replace("zip/asset", "");

            // Convert the request's body inputStream to array
            String requestBody = IOUtils.toString(request.getInputStream());

            if (logger.isDebugEnabled()) {
                logger.debug(String.format("getAsset(): %s", path));
            }

            byte[] byteArray;
            if (path.isEmpty() && (requestBody == null || requestBody.isEmpty())) { // an empty path says that there is a list in the request body
                throw new Exception("getAsset URL must contains a path or a list of files to download.");
            }

            if (requestBody != null && !requestBody.isEmpty()) { // If request's body isn't empty, get zipped files for list of files.
                List<String> filesToDownload = new ArrayList<>();

                JSONArray filesArray = new JSONObject(requestBody).getJSONArray("files");
                for (int i = 0; i < filesArray.length(); i++) {
                    String file = path.concat(filesArray.get(i).toString());
                    filesToDownload.add(file);
                }

                Set<String> filesPaths = new HashSet<>(filesToDownload);

                filesToDownload.clear();
                filesToDownload.addAll(filesPaths);

                byteArray = cmsService.getZippedFiles(path, filesToDownload);
            } else { // Request's body is empty -> get a single file specified in path.
                byteArray = cmsService.getFile(path);
            }

            return getResponseEntity(path, byteArray, request);
        } catch (ResourceNotFoundException | IOException e) {
            logger.error(String.format("The file doesn't exist. path: %s", path), e);
            throw e;
        } catch (DsException e) {
            logger.error(String.format("getAsset Failed. path: %s", path), e);
            throw e;
        }
    }

    /**
     * @param path
     * @param byteArray
     * @param request
     * @return a response entity with the proper mime type header
     */
    private ResponseEntity<byte[]> getResponseEntity(String path, byte[] byteArray, HttpServletRequest request) throws DsException {
        HttpHeaders responseHeaders = new HttpHeaders();
        MediaType mediaType = getMediaType(path.toLowerCase(), request);
        responseHeaders.setContentType(mediaType);
        String simpleFileName = new File(path).getName();
        responseHeaders.add("Content-Disposition", "inline; filename=\"" + simpleFileName + "\"");
        return new ResponseEntity<>(byteArray, responseHeaders, HttpStatus.OK);
    }

    /**
     * Adds the asset to cache on client's browser by adding "Cache-Control" and "Expires" keys to response's header
     *
     * @param response
     */
    private void addAssetToCache(HttpServletResponse response) {
        response.setHeader("Cache-Control", "maxage=604800, private");

        DateTime expiresDate = new DateTime().plusYears(2);
        String expires = new SimpleDateFormat("EEE, d MMM yyyy HH:mm:ss zzz", Locale.ENGLISH).format(expiresDate.toDate()); // HTTP header date format: Thu, 01 Dec 1994 16:00:00 GMT
        response.setHeader("Expires", expires);
    }

    private MediaType getMediaType(String path, HttpServletRequest request) throws DsException {
        String mimeType = request.getSession().getServletContext().getMimeType(path);
        if (StringUtils.isBlank(mimeType)) {
            String ext = FilenameUtils.getExtension(path);
            mimeType = configuration.getProperty(String.format("cms.additional_mime_types.%s", ext));
        }
        if (StringUtils.isBlank(mimeType)) {
            mimeType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
        return MediaType.parseMediaType(mimeType);
    }

    @RequestMapping(value = "/nonExistingFileNames", method = RequestMethod.POST)
    public MissingFiles getNonExistingFileNames(@PathVariable int pid,
                                                @PathVariable String cid,
                                                HttpServletRequest request) throws Exception {
        // Convert the request body inputStream to array
        String requestBody = IOUtils.toString(request.getInputStream());
        if (requestBody == null || requestBody.isEmpty()) { // an empty path says that there is a list in the request body
            String m = "nonExistingFileNames post forms empty. request must contain a json with a list of files to check.";
            logger.error(m);
            throw new Exception(m);
        }
        JSONArray filesArray = new JSONObject(requestBody).getJSONArray("files");
        return cmsService.getNonExistingFileNames(pid, cid, filesArray);
    }
}