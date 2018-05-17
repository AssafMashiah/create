package org.t2k.cgs.service.packaging.uploaders;

import org.apache.commons.httpclient.*;
import org.apache.commons.httpclient.auth.AuthScope;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.RequestEntity;
import org.apache.commons.httpclient.methods.multipart.FilePart;
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
import org.apache.commons.httpclient.methods.multipart.Part;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.apache.http.HttpHost;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.usecases.packaging.CGSPackage;
import org.t2k.cgs.domain.usecases.packaging.PackageUploader;
import org.t2k.cgs.domain.usecases.packaging.PublishTarget;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.model.tocItem.TocItemIndicationForScorm;
import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.service.packaging.PackageHandlerImpl;
import org.t2k.cgs.domain.usecases.packaging.PackageStepsUpdater;
import org.t2k.cgs.domain.usecases.publisher.ExternalPartnersService;
import org.t2k.cgs.domain.usecases.publisher.ExternalPartnerSettings;
import org.t2k.cgs.domain.usecases.tocitem.TocItemDataService;
import org.t2k.cgs.domain.usecases.user.UserService;
import org.t2k.cgs.utils.CountingMultipartRequestEntity;
import org.t2k.cgs.utils.UploadProgressListener;

import java.io.File;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.InetAddress;
import java.net.URI;
import java.net.URLEncoder;
import java.net.UnknownHostException;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 22/05/14
 * Time: 10:32
 */

/*
   Publishes to zip file made for scorm to a third party via post method
 */
@Service
public class BlossomUploader implements PackageUploader {

    public static final String DESCRIPTION = "description";
    public static final String LESSONFILE_POST_PARAM = "lessonfile";

    private static Logger logger = Logger.getLogger(BlossomUploader.class);

    @Autowired
    @Qualifier("lessonsDataServiceBean")
    private TocItemDataService tocItemDataService;

    @Autowired
    private UserService userService;

    @Autowired
    private PackageStepsUpdater packageStepsUpdater;

    @Autowired
    private ExternalPartnersService externalPartnersService;

    private HttpClient injectedHttpClient = null;

    @Override
    public String uploadPackage(PackageHandlerImpl packageHandler) throws Exception {
        CGSPackage cgsPackage = packageHandler.getCGSPackage();

        ExternalPartnerSettings blossomUploadSettings = null;
        // We use the externalPartner's secretKey + externalAccountId to perform digest authentication with the external catalog
        // The key is from the publisher, and the catalog url is taken from the user (this is the url passed by SSO)
        for (ExternalPartnerSettings externalPartnerSettings : externalPartnersService.getExternalPartnersByPublisherId(cgsPackage.getPublisherId())) {
            if (externalPartnerSettings.getSecretKey() != null) { // currently we have only 1 externalPartner setting per account
                blossomUploadSettings = externalPartnerSettings;
                break;
            }
        }

        // validation
        if (blossomUploadSettings == null || blossomUploadSettings.getSecretKey() == null) {
            String errorMsg = String.format("Could not upload to blossom - no secretKey was found for publisher %d", cgsPackage.getPublisherId());
            logger.error(errorMsg);
            throw new Exception(errorMsg);
        }

        SimpleCgsUserDetails publishingUser = userService.getByName(cgsPackage.getUserName());
        validateUserForBlossomPublishing(publishingUser, cgsPackage);
        String uploadUrl = userService.getBlossomUrl(publishingUser);
        String blossomUrlWithIpAddress;
        try {
            blossomUrlWithIpAddress = getBlossomAddressWithIpInsteadOfDomainName(uploadUrl);
        } catch (UnknownHostException e) {
            String msg = String.format("Cannot resolve the IP for blossom's catalog in url: %s", uploadUrl);
            logger.error(msg, e);
            throw new Exception(msg, e);
        }
        HttpClient httpClient = initClient(blossomUrlWithIpAddress, blossomUploadSettings);

        String fullBlossomUrl = getBlossomFullPublishUrlWithParameters(cgsPackage, blossomUrlWithIpAddress, publishingUser);
        PostMethod blossomAuthenticationPost = new PostMethod(fullBlossomUrl);
        PostMethod blossomFileUploadPost = new PostMethod(fullBlossomUrl);

        String zipFilePath = packageHandler.getZippedFileForScorm();
        File fileToUpload = new File(zipFilePath);
        if (!fileToUpload.exists()) {
            String errorMsg = String.format("File %s does not exist.", zipFilePath);
            logger.error(errorMsg);
            throw new IOException(errorMsg);
        }

        Part parts = new FilePart(LESSONFILE_POST_PARAM, fileToUpload);
        MultipartRequestEntity reqEntity = new MultipartRequestEntity(new Part[]{parts}, blossomFileUploadPost.getParams());
        long bytesNumberOfHttpRequest = reqEntity.getContentLength();
        RequestEntity requestEntity = new CountingMultipartRequestEntity(reqEntity, new UploadProgressListener(bytesNumberOfHttpRequest, packageHandler, packageStepsUpdater));
        blossomFileUploadPost.setRequestEntity(requestEntity);
        int httpStatus = 0;
        String response = null;
        try {
            // uploading the file
            logger.info(String.format("publish: to %s (%s) started.", blossomUrlWithIpAddress, uploadUrl));
            httpStatus = httpClient.executeMethod(blossomAuthenticationPost);
            logger.debug(String.format("Blossom server returned : %d", httpStatus));
            response = blossomAuthenticationPost.getResponseBodyAsString();
            if (httpStatus == 401) {
                throw new Exception("Unauthorised user.");
            }

            // we use the response header for authentication in the upload request
            Header blossomAuthorizationHeader = blossomAuthenticationPost.getRequestHeader("Authorization");
            logger.debug(String.format("Uploading file using authentication header: %s=%s", blossomAuthorizationHeader.getName(), blossomAuthorizationHeader.getValue()));

            blossomFileUploadPost.setRequestHeader(blossomAuthorizationHeader.getName(), blossomAuthorizationHeader.getValue());
            httpClient.getParams().setParameter(HttpMethodParams.RETRY_HANDLER, new DefaultHttpMethodRetryHandler(0, false)); // disable retries for upload
            httpStatus = httpClient.executeMethod(blossomFileUploadPost);
            response = blossomFileUploadPost.getResponseBodyAsString();
            logger.debug(String.format("response: %s", response));
        } catch (UnknownHostException e) {
            throw new Exception(String.format("Could not upload SCORM zip file to blossom. - UnknownHostException, upload url: %s", fullBlossomUrl), e);
        } catch (Exception e) {
            logger.error("Exception digesting Authentication", e);
            logger.error(String.format("Could not upload file to 3rd party using url:%s\nServer's response status %d, Message: %s", fullBlossomUrl, httpStatus, response));
            throw new Exception(String.format("Could not upload file to 3rd party.\nServer's response status %d, Message: %s", httpStatus, response), e);
        } finally {
            blossomFileUploadPost.releaseConnection();
            blossomAuthenticationPost.releaseConnection();
        }

        if (httpStatus != 200) {
            String errorMsg = String.format("Error uploading to blossom. HTTP status : %d, Error from catalog : %s", httpStatus, response);
            logger.error(errorMsg);
            throw new Exception(errorMsg);
        }

        logger.debug(String.format("publish: publish to %s completed. Response body: %s", fullBlossomUrl, response));
        return response;
    }

    public String getBlossomAddressWithIpInsteadOfDomainName(String uploadUrl) throws UnknownHostException {   // get blossom's IP address to avoid DNS caching - fix bug: CREATE-1439
        URI uploadURI = URI.create(uploadUrl);
        String host = uploadURI.getHost();
        String ip = InetAddress.getByName(host).getHostAddress();
        return uploadUrl.replace(host, ip);
    }

    /**
     * inits the http client as a non-buffered request and sets the
     * request header for the basic auth.
     *
     * @param blossomUrl                     - catalog ip
     * @param publisherUploadSettings - Blossom settings for the accounts
     */
    private HttpClient initClient(String blossomUrl, ExternalPartnerSettings publisherUploadSettings) {
        String protocol = "http";
        URI hostUri = URI.create(blossomUrl);
        String host = hostUri.getHost();
        int uploadPort = 80;
        HttpHost targetHost = new HttpHost(host, uploadPort, protocol);
        Credentials defaultCredentials = new UsernamePasswordCredentials(publisherUploadSettings.getExternalAccountId(), publisherUploadSettings.getSecretKey());
        HttpClient httpClient = new HttpClient();
        httpClient.getParams().setAuthenticationPreemptive(true); // to perform digest authentication
        httpClient.getState().setCredentials(new AuthScope(targetHost.getHostName(), targetHost.getPort(), AuthScope.ANY_REALM), defaultCredentials);
        httpClient.getParams().setSoTimeout(7200 * 1000); // set socket time out to be 2 hours
        if (this.injectedHttpClient != null) {
            return injectedHttpClient;
        }
        return httpClient;
    }

    private void validateUserForBlossomPublishing(SimpleCgsUserDetails publishingUser, CGSPackage cgsPackage) throws DsException {
        if (publishingUser == null) {
            String errorMsg = String.format("Could not get user details from mongo for user: %s", cgsPackage.getUserName());
            logger.error(errorMsg);
            throw new DsException(errorMsg);
        }

        if (publishingUser.getExternalId() == null || publishingUser.getExternalId().isEmpty()) {
            String errorMsg = String.format("Error publishing to blossom: external catalog is not configured. Could not get ExternalId for user: %s", cgsPackage.getUserName());
            logger.error(errorMsg);
            throw new DsException(errorMsg);
        }

        if (userService.getBlossomUrl(publishingUser) == null || userService.getBlossomUrl(publishingUser).isEmpty()) {
            throw new DsException("Error publishing to blossom: external catalog is not configured. The user does not have a valid catalog URL");
        }
    }

    /**
     * /// blossom's path need to be in the following structure (correct to 21/01/2015):
     * // <host>/path/WebServices/content?Upload_ExtID/{{cgs_content_id}}/{{lms_user_id}}/lesson_name={{hi}}&lesson_description={{bye}}
     * // the post data will be an attached file using post under the name lessonfile
     *
     * @return a string representing the url that we need to perform the post request to
     * @throws DsException
     */
    private String getBlossomFullPublishUrlWithParameters(CGSPackage cgsPackage, String baseUrl, SimpleCgsUserDetails publishingUser) throws DsException, UnsupportedEncodingException {
        if (cgsPackage.getPublishTarget() == PublishTarget.COURSE_TO_CATALOG) {
            return getBlossomFullPublishUrlWithParametersForCourse(cgsPackage, baseUrl, publishingUser);
        } else {
            return getBlossomFullPublishUrlWithParametersForLesson(cgsPackage, baseUrl, publishingUser);

        }
    }

    private String getBlossomFullPublishUrlWithParametersForLesson(CGSPackage cgsPackage, String baseUrl, SimpleCgsUserDetails publishingUser) throws DsException, UnsupportedEncodingException {
        TocItemIndicationForScorm selectedLesson = cgsPackage.getScormSelectedTocItems().get(0);
        String title = selectedLesson.getTitle();
        TocItemCGSObject lesson = tocItemDataService.get(cgsPackage.getPublisherId(), selectedLesson.getId(), cgsPackage.getCourseId(), null, true);
        String description = null;
        if (lesson.getContentData().containsField(DESCRIPTION)) {
            description = lesson.getContentData().get(DESCRIPTION).toString();
        }

        String fullUrl = String.format("%s%s/%s/lesson_name=%s", baseUrl, selectedLesson.getId(), publishingUser.getExternalId(), URLEncoder.encode(title, "UTF-8"));
        if (description != null) {  // adding URL if it exists
            fullUrl += "&lesson_description=" + URLEncoder.encode(description, "UTF-8");
        }
        return fullUrl;

    }

    private String getBlossomFullPublishUrlWithParametersForCourse(CGSPackage cgsPackage, String baseUrl, SimpleCgsUserDetails publishingUser) throws DsException, UnsupportedEncodingException {
        String title = cgsPackage.getCourseTitle();
        String description = cgsPackage.getDescription();
        String courseId = cgsPackage.getCourseId();
        String fullUrl = String.format("%s%s/%s/lesson_name=%s", baseUrl, courseId, publishingUser.getExternalId(), URLEncoder.encode(title, "UTF-8"));
        if (description != null) {  // adding URL if it exists
            fullUrl += "&lesson_description=" + URLEncoder.encode(description, "UTF-8");
        }
        return fullUrl;

    }

    public void setDefaultHttpClient(HttpClient blossomMockHttpClient) {
        this.injectedHttpClient = blossomMockHttpClient;
    }
}