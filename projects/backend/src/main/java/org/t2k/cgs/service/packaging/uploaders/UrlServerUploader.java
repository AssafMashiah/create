package org.t2k.cgs.service.packaging.uploaders;

import org.apache.commons.httpclient.DefaultHttpMethodRetryHandler;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.RequestEntity;
import org.apache.commons.httpclient.methods.multipart.FilePart;
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
import org.apache.commons.httpclient.methods.multipart.Part;
import org.apache.commons.httpclient.methods.multipart.StringPart;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.user.CGSAccount;
import org.t2k.cgs.domain.usecases.packaging.CGSPackage;
import org.t2k.cgs.domain.usecases.packaging.PackageStepsUpdater;
import org.t2k.cgs.domain.usecases.packaging.PackageUtil;
import org.t2k.cgs.domain.usecases.packaging.PackageUploader;
import org.t2k.cgs.domain.usecases.publisher.PublisherService;
import org.t2k.cgs.service.packaging.PackageHandlerImpl;
import org.t2k.cgs.domain.model.user.PublishSettings;
import org.t2k.cgs.utils.CountingMultipartRequestEntity;
import org.t2k.cgs.utils.UploadProgressListener;

import javax.inject.Inject;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;

/**
 * Publishes to zip file made for scorm to a third party via post method
 * <p>
 * User: Moshe Avdiel
 * Date: Apr 2016.
 */
@Service
public class UrlServerUploader implements PackageUploader {

    private static Logger logger = Logger.getLogger(UrlServerUploader.class);

    private PackageStepsUpdater packageStepsUpdater;
    private PublisherService publisherService;

    @Inject
    public UrlServerUploader(PackageStepsUpdater packageStepsUpdater, PublisherService publisherService) {
        this.packageStepsUpdater = packageStepsUpdater;
        this.publisherService = publisherService;
    }

    @Override
    public String uploadPackage(PackageHandlerImpl packageHandler) throws Exception {

        CGSPackage cgsPackage = packageHandler.getCGSPackage();

        String uploadUrl = getUploadUrlFromAccount(cgsPackage.getPublisherId());

        HttpClient httpClient = getHttpClient();

        PostMethod httpFileUploadPost = new PostMethod(uploadUrl);

        File fileToUpload = getFileToUpload(packageHandler);

        Part[] partsArr = createMultiPartsArray(cgsPackage, fileToUpload);

        httpFileUploadPost.setRequestEntity(createMultipartRequestEntity(packageHandler, httpFileUploadPost, partsArr));

        String response = executeUploadPost(uploadUrl, httpClient, httpFileUploadPost);

        logger.debug(String.format("Publish to URL on ShareServer at [%s] Completed Successfully. Response: %s", uploadUrl, response));
        return response;
    }

    private String executeUploadPost(String uploadUrl, HttpClient httpClient, PostMethod httpFileUploadPost) throws Exception {
        int httpStatus = 0;
        String response = null;
        try {
            httpClient.getParams().setParameter(HttpMethodParams.RETRY_HANDLER, new DefaultHttpMethodRetryHandler(0, false)); // disable retries for upload
            httpStatus = httpClient.executeMethod(httpFileUploadPost);
            response = httpFileUploadPost.getResponseBodyAsString();
            logger.debug(String.format("response: %s", response));
        } catch (UnknownHostException e) {
            throw new Exception(String.format("Could not upload SCORM zip file to Share Server. - UnknownHostException, upload url: %s", uploadUrl), e);
        } catch (Exception e) {
            String msg = String.format("Could not upload file to 3rd party using url:%s\nServer's response status %d, Message: %s", uploadUrl, httpStatus, response);
            logger.error(msg, e);
            throw new Exception(msg, e);
        } finally {
            httpFileUploadPost.releaseConnection();
        }

        if (httpStatus != 200) {
            String errorMsg = String.format("Error uploading to the ShareServer. HTTP status: %d, Error from the ShareServer: %s", httpStatus, response);
            logger.error(errorMsg);
            throw new Exception(errorMsg);
        }
        return response;
    }

    private RequestEntity createMultipartRequestEntity(PackageHandlerImpl packageHandler, PostMethod fileUploadPost, Part[] partsArr) {
        MultipartRequestEntity reqEntity = new MultipartRequestEntity(partsArr, fileUploadPost.getParams());
        long bytesNumberOfHttpRequest = reqEntity.getContentLength();
        return new CountingMultipartRequestEntity(reqEntity, new UploadProgressListener(bytesNumberOfHttpRequest, packageHandler, packageStepsUpdater));
    }

    private Part[] createMultiPartsArray(CGSPackage cgsPackage, File fileToUpload) throws FileNotFoundException {
        String publishTarget = cgsPackage.getPublishTarget().getName();

        List<Part> parts = new ArrayList<>();
        parts.add(new FilePart("file", fileToUpload));
        parts.add(new StringPart("publisherId", String.valueOf(cgsPackage.getPublisherId())));

        String publisherName = cgsPackage.getPublisherName();
        if (publisherName != null && !publisherName.trim().isEmpty()) {
            parts.add(new StringPart("publisherName", publisherName));
        }

        parts.add(new StringPart("publishTarget", publishTarget));
        parts.add(new StringPart("courseId", cgsPackage.getCourseCId()));

        final String firstLessonId = PackageUtil.getFirstLessonId(cgsPackage);
        if (firstLessonId != null) {
            parts.add(new StringPart("lessonId", firstLessonId));
        }

        parts.add(new StringPart("username", cgsPackage.getUserName()));
        parts.add(new StringPart("createHost", cgsPackage.getHostName()));

        Part[] partsArr = parts.toArray(new Part[0]);

        if (logger.isDebugEnabled()) {
            logger.debug(String.format("Uploading Parameters to ShareServer. File: %s, PublisherId: %d, Publisher Name: %s, PublishTarget: %s, CourseId: %s, LessonId: %s,  Username: %s, CreateHost: %s",
                    fileToUpload.getAbsolutePath(),
                    cgsPackage.getPublisherId(),
                    publisherName,
                    publishTarget,
                    cgsPackage.getCourseId(),
                    firstLessonId,
                    cgsPackage.getUserName(),
                    cgsPackage.getHostName()));
        }

        return partsArr;
    }

    private File getFileToUpload(PackageHandlerImpl packageHandler) throws IOException {
        String zipFilePath = packageHandler.getZippedFileForScorm();
        File fileToUpload = new File(zipFilePath);
        if (!fileToUpload.exists()) {
            String errorMsg = String.format("File %s does not exist.", zipFilePath);
            logger.error(errorMsg);
            throw new IOException(errorMsg);
        }
        return fileToUpload;
    }

    // Examples:
    // http://play.timetoknow.com/upload   (production url)
    // http://tm-lt571:8080/upload
    // http://52.2.208.195/upload
    private String getUploadUrlFromAccount(int publisherId) throws DsException {
        CGSAccount cgsAccount = this.publisherService.getAccountAuthenticationData(publisherId, true);
        PublishSettings publishSettings = cgsAccount.getAccountCustomization().getPublishSettings();
        String uploadUrl = publishSettings.getPublishUploadServerUrl();
        logger.debug(String.format("Upload URL: %s", uploadUrl));
        return uploadUrl;
    }

    /**
     * inits the http client as a non-buffered request and sets the
     * request header for the basic auth.
     */
    private HttpClient getHttpClient() throws Exception {
        HttpClient httpClient = new HttpClient();
        httpClient.getParams().setSoTimeout(7200 * 1000); // set socket time out to be 2 hours
        return httpClient;
    }

}