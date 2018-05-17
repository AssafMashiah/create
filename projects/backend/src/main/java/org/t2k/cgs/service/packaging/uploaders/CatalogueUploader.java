package org.t2k.cgs.service.packaging.uploaders;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.t2k.common.utils.PublishModeEnum;
import com.t2k.configurations.Configuration;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.httpclient.Header;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.NameValuePair;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.RequestEntity;
import org.apache.commons.httpclient.methods.multipart.FilePart;
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
import org.apache.commons.httpclient.methods.multipart.Part;
import org.apache.commons.httpclient.methods.multipart.StringPart;
import org.apache.commons.httpclient.params.HttpMethodParams;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.model.classification.TaggedStandards;
import org.t2k.cgs.domain.usecases.packaging.CGSPackage;
import org.t2k.cgs.domain.usecases.packaging.ContentParseUtil;
import org.t2k.cgs.domain.usecases.packaging.PackageUploader;
import org.t2k.cgs.service.packaging.PackageHandlerImpl;
import org.t2k.cgs.domain.usecases.packaging.PackageStepsUpdater;
import org.t2k.cgs.service.packaging.PublishLogUtil;
import org.t2k.cgs.utils.CountingMultipartRequestEntity;
import org.t2k.cgs.utils.UploadProgressListener;

import java.io.*;
import java.net.URLEncoder;
import java.net.UnknownHostException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * Created by IntelliJ IDEA.
 * User: Ophir.Barnea
 * Date: 09/01/13
 * Time: 19:39
 */
@Service
public class CatalogueUploader implements PackageUploader {

    private static Logger logger = Logger.getLogger(CatalogueUploader.class);
    private static Logger publishingLog = Logger.getLogger("publishing");

    @Autowired
    private Configuration configuration;

    private HttpClient defaultHttpClient = null;  // used when we want to inject a specific httpClient object, specially for tests

    @Autowired
    private PackageStepsUpdater packageStepsUpdater;

    @Autowired
    private PublishLogUtil publishLogUtil;

    /**
     * POSTs the multipart message to the catalogue.
     * The catalogue details (url , credentials.. should be in the configurations)
     *
     * @throws Exception
     */
    @Override
    public String uploadPackage(PackageHandlerImpl packageHandler) throws Exception {

        String publishingMsg = this.publishLogUtil.getLog("Start ---> uploadPackage()", packageHandler);
        publishingLog.debug(publishingMsg);

        CGSPackage cgsPackage = packageHandler.getCGSPackage();
        logger.info(String.format("About to upload package %s to %s", cgsPackage.getPackId(), getCatalogueUrl()));

        int status = 0;
        String body = null;
        PostMethod catalogFileUploadPost = buildPostRequest(packageHandler, cgsPackage);
        HttpClient httpClient;
        if (defaultHttpClient == null) {
            httpClient = new HttpClient();   // initializing http client
        } else {
            httpClient = defaultHttpClient; // getting the injected httpClient
        }

        try {
            logger.info(String.format(">>>>>>>>>>>>> Start uploading package %s to %s", cgsPackage.getPackId(), getCatalogueUrl()));
            status = httpClient.executeMethod(catalogFileUploadPost);
            body = catalogFileUploadPost.getResponseBodyAsString();
        } catch (UnknownHostException e) {
            publishingLog.error( String.format("Unknown Host. Message: %s", e.getMessage()), e);
            throw new Exception(createErrorMessage(getCatalogueUrl(), "UnknownHostException"), e);
        } catch (Exception e) {
            publishingLog.error( String.format("Unexpected Exception. Message: %s", e.getMessage()), e);
            throw new Exception(createErrorMessage(getCatalogueUrl(), e.getMessage()), e);
        } finally {
            publishingLog.debug( String.format("Catalogue Uploader.  Upload Response:\n%s",body) );
            catalogFileUploadPost.releaseConnection();
        }

        if (status != 200) {
            String message = getErrorMessageFromBody(body);
            switch (status) {   // specific handling for known error codes
                case 404:
                    message = "404 - Not Found";
                    break;
            }

            logger.error(String.format("Error uploading to catalogue. url: %s Message: %s Exception: %s", getCatalogueUrl(), message, body));
            throw new Exception(createErrorMessage(getCatalogueUrl(), message));
        }

        logger.info(String.format(">>>>>>>>>>>>> Done uploading package %s to %s", cgsPackage.getPackId(), getCatalogueUrl()));
        return body;
    }

    private PostMethod buildPostRequest(PackageHandlerImpl packageHandler, CGSPackage cgsPackage) throws IOException {
        PostMethod catalogFileUploadPost = new PostMethod(getCatalogueUrl());
        List<Part> parts = buildPublishRequestParts(packageHandler.getCourseNode(), packageHandler.getLessonsStandards(), cgsPackage);
        MultipartRequestEntity multipartRequestEntity = new MultipartRequestEntity(parts.toArray(new Part[parts.size()]), new HttpMethodParams());
        long bytesNumberOfHttpRequest = multipartRequestEntity.getContentLength();
        RequestEntity requestEntity = new CountingMultipartRequestEntity(multipartRequestEntity, new UploadProgressListener(bytesNumberOfHttpRequest, packageHandler, packageStepsUpdater));
        catalogFileUploadPost.setRequestEntity(requestEntity);
        catalogFileUploadPost.setRequestHeader(getAuthenticationHeader()); // basic authentication headers

        NameValuePair[] queryStringParams = {
                new NameValuePair("username", cgsPackage.getUserName()),
                new NameValuePair("publisherId", String.valueOf(cgsPackage.getPublisherId())),
                new NameValuePair("host", cgsPackage.getHostName()),
                new NameValuePair("publishDate", new SimpleDateFormat("dd-MM-yyyy hh:mm:ss").format(cgsPackage.getPackStartDate()).toString())
        };
        catalogFileUploadPost.setQueryString(queryStringParams);
        logger.debug(String.format("buildPostRequest. Post request for publish to catalog created with params: %s", Arrays.asList(queryStringParams).toString()));

        return catalogFileUploadPost;
    }

    /**
     * returns the error from the response.
     * if there is a problem (parsing error) - return the body itself
     *
     * @param body http response body
     * @return - error message string from request
     */
    private String getErrorMessageFromBody(String body) {
        try {
            String messageKey = "messageDisplayString";
            JSONObject jsonObject = new JSONObject(body);
            if (jsonObject.has(messageKey))
                return jsonObject.get(messageKey).toString();
            else
                return body;
        } catch (Exception e) {
            return body;
        }
    }

    private String usernameAndPasswordEncoded() {
        String userName = configuration.getProperty("catalogueUsername");
        String userPass = configuration.getProperty("cataloguePassword");
        return Base64.encodeBase64String((String.format("%s:%s", userName, userPass)).getBytes());
    }

    private String getCatalogueUrl() {
        return configuration.getProperty("catalogueUrl");
    }

    private Header getAuthenticationHeader() {
        return new Header("Authorization", "Basic " + usernameAndPasswordEncoded());
    }

    private List<Part> buildPublishRequestParts(JsonNode courseNode, Set<TaggedStandards> lessonsStandards, CGSPackage cgsPackage) throws IOException {
        List<Part> parts = new ArrayList<>();
        String courseCId = courseNode.get(ContentParseUtil.CONTENT_ID).getTextValue();
        String publisherName = courseNode.get(ContentParseUtil.PUBLISHER).getTextValue();
        JsonNode titleJsonNode = courseNode.get(ContentParseUtil.TITLE);
        String name = null;

        if (titleJsonNode != null) {
            name = titleJsonNode.getTextValue();
        }

        StringBuffer sb = new StringBuffer();
        JsonNode subjectAreaNode = courseNode.get(ContentParseUtil.SUBJECT_AREA);
        if (subjectAreaNode != null) {
            Iterator<JsonNode> subjectAreaIter = subjectAreaNode.getElements();
            while (subjectAreaIter.hasNext()) {
                String se = subjectAreaIter.next().getTextValue();
                sb.append(se);
                if (subjectAreaIter.hasNext()) {
                    sb.append(";");
                }
            }
        }

        String disciplines = sb.toString();
        sb = new StringBuffer();
        JsonNode gradeLevelJsonNode = courseNode.get(ContentParseUtil.GRADE_LEVEL);
        if (gradeLevelJsonNode != null) {
            Iterator<JsonNode> gradeLevelIter = gradeLevelJsonNode.getElements();
            while (gradeLevelIter.hasNext()) {
                String gl = gradeLevelIter.next().getTextValue();
                sb.append(gl);
                if (gradeLevelIter.hasNext()) {
                    sb.append(";");
                }
            }
        }

        String gradeLevels = sb.toString();

        JsonNode coverRefId = courseNode.get(ContentParseUtil.COVER_REF_ID);
        String coverInBase64 = null;
        if (coverRefId != null) {
            Iterator<JsonNode> resources = courseNode.get(ContentParseUtil.RESOURCES).getElements();
            while (resources.hasNext()) {
                JsonNode resource = resources.next();
                if (resource.get(ContentParseUtil.RES_ID).getTextValue().equals(coverRefId.getTextValue())) {
                    String href = resource.get(ContentParseUtil.RESOURCE_HREF).getTextValue();
                    File coverImg = new File(cgsPackage.getCmsPublisherHomeLocation() + "/" + href);
                    coverInBase64 = Base64.encodeBase64String(FileUtils.readFileToByteArray(coverImg));
                    break;
                }
            }
        }

        String standards = StringUtils.join(lessonsStandards.toArray(), ";");
        FileSystemResource packageFile = new FileSystemResource(cgsPackage.getPackageOutputLocation());
        InputStream inputStream = packageFile.getInputStream();
        String md5 = DigestUtils.md5Hex(inputStream);
        inputStream.close();


        StringBuilder sbLog = new StringBuilder();
        sbLog.append(PublishLogUtil.NEW_LINE).append("---[[[  POST Params  ]]]---").append(PublishLogUtil.NEW_LINE);

        handleAddingStringToPostParts(parts, "courseCId", courseCId, sbLog);
        handleAddingStringToPostParts(parts, "publisherName", publisherName, sbLog);
        handleAddingStringToPostParts(parts, "description", cgsPackage.getDescription(), sbLog);
        handleAddingStringToPostParts(parts, "name", name, sbLog);
        handleAddingStringToPostParts(parts, "discipline", disciplines, sbLog);
        handleAddingStringToPostParts(parts, "gradeLevel", gradeLevels, sbLog);
        handleAddingStringToPostParts(parts, "version", cgsPackage.getVersion(), sbLog);
        handleAddingStringToPostParts(parts, "standards", standards, sbLog);
        handleAddingStringToPostParts(parts, "image", coverInBase64, null);  // don't write image content to the log..
        parts.add(new FilePart("file", packageFile.getFile()));

        // ** part added for bug investingation regarding mixed versions  **//
        extractAndValidateVersionBetweenManifestAndPostParams(packageFile.getFile(), cgsPackage);
        // *** ========================================================== **//

        handleAddingStringToPostParts(parts, "md5", md5, sbLog);
        handleAddingStringToPostParts(parts, "releaseNote", cgsPackage.getReleaseNote(), sbLog);
        handleAddingStringToPostParts(parts, "state", cgsPackage.getPublishModeEnum().getName(), sbLog);

        publishingLog.debug(sbLog.toString());

        return parts;
    }

    private void extractAndValidateVersionBetweenManifestAndPostParams(File packageFile, CGSPackage cgsPackage) throws IOException {
        try (ZipFile zipFile = new ZipFile(packageFile)) {

        ZipEntry manifestEntry = zipFile.getEntry("manifest");
            BufferedReader bufReader = new BufferedReader(new InputStreamReader(zipFile.getInputStream(manifestEntry)));

        if (manifestEntry != null) {

            String line;
            StringBuilder sbManifest = new StringBuilder();
            while ((line = bufReader.readLine()) != null) {
                sbManifest.append(line);
            }

                bufReader.close();

            String jsonManifestStr = sbManifest.toString();

            try {
                JSONObject jsonManifestObject = new JSONObject(jsonManifestStr);
                if (jsonManifestObject.has("version")) {
                    String versionInZipManifest = jsonManifestObject.getString("version");

                    StringBuilder sbv = new StringBuilder();
                    sbv.append(PublishLogUtil.NEW_LINE);
                    sbv.append("Version Comparison:").append(PublishLogUtil.NEW_LINE);
                    sbv.append("ZIP Manifest Version  .................: ").append(versionInZipManifest).append(PublishLogUtil.NEW_LINE);
                    sbv.append("POST Param - CGS Version ..............: ").append(cgsPackage.getVersion()).append(PublishLogUtil.NEW_LINE);
                    sbv.append("POST Param - New Version Production ...: ").append(cgsPackage.getNewVersion_prod()).append(PublishLogUtil.NEW_LINE);
                    sbv.append("POST Param - New Version QA ...........: ").append(cgsPackage.getNewVersion_preProd()).append(PublishLogUtil.NEW_LINE);

                    publishingLog.debug( sbv.toString() );

                    if (versionInZipManifest != null) {
                        if (cgsPackage.getPublishModeEnum() == PublishModeEnum.PRODUCTION) {
                            if (!versionInZipManifest.equals(cgsPackage.getNewVersion_prod())) {
                                String msg = String.format(" ERROR:  ***  ZIP MANIFEST VERSION (%s),  AND POST REQUEST VERSION (%s) ARE DIFFERENT ***  ", versionInZipManifest, cgsPackage.getNewVersion_prod());
                                publishingLog.error( msg );
                                throw new IllegalArgumentException("Package Version Mismatch!  Publish Aborted.\n" + msg);
                            }
                        }
                        else if (cgsPackage.getPublishModeEnum() == PublishModeEnum.PRE_PRODUCTION) {
                            if (!versionInZipManifest.equals(cgsPackage.getNewVersion_preProd())) {
                                String msg = String.format(" ERROR:  ***  ZIP MANIFEST VERSION (%s),  AND POST REQUEST VERSION (%s) ARE DIFFERENT ***  ", versionInZipManifest, cgsPackage.getNewVersion_preProd());
                                publishingLog.error( msg );
                                throw new IllegalArgumentException("Package Version Mismatch!  Publish Aborted.\n" + msg);
                            }
                        }
                    } else { // version is null
                        publishingLog.error("Version in ZIP Manifest is NULL");
                        throw new IllegalArgumentException("The Version in the Package Manifest is NULL.");
                    }
                } else {
                    publishingLog.error("Manifest Has NO VERSION !");
                }
                }
            catch (JSONException e) {
                publishingLog.error( String.format("Unable to Parse the Manifest from the ZIP Package file.  Exception: %s", e.toString()), e);
                e.printStackTrace();
            }
        }
    }
    }

    private void handleAddingStringToPostParts(List<Part> parts, String fieldName, String value, StringBuilder logBuilder) throws UnsupportedEncodingException {
        if (value != null && !value.isEmpty()) {
            parts.add(new StringPart(fieldName, URLEncoder.encode(value, "UTF-8")));
            logger.debug(String.format("handleAddingStringToPostParts: %s -> %s", fieldName, value));
            if (logBuilder != null) {
                logBuilder.append(String.format("Param: %s = %s", fieldName, URLEncoder.encode(value, "UTF-8")));
            }
        } else {
            if (logBuilder != null) {
                logBuilder.append(String.format("Param: %s = NULL (This field will be removed from the request.", fieldName));
            }
            logger.warn(String.format("addPostPart: field value is null. will be removed from request. field = %s", fieldName));
        }

        if (logBuilder != null) {
            logBuilder.append(PublishLogUtil.NEW_LINE);
    }
    }

    private String createErrorMessage(String catalogueUrl, String unknownHostException) {
        return String.format("Error uploading to catalogue.\nUrl: %s\nDetails: %s", catalogueUrl, unknownHostException);
    }

    public void setDefaultHttpClient(HttpClient defaultHttpClient) {
        this.defaultHttpClient = defaultHttpClient;
    }
}