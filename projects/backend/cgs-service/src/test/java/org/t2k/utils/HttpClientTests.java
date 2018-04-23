package org.t2k.utils;

import org.apache.commons.httpclient.Credentials;
import org.apache.commons.httpclient.HttpClient;
import org.apache.commons.httpclient.HttpMethod;
import org.apache.commons.httpclient.UsernamePasswordCredentials;
import org.apache.commons.httpclient.auth.AuthScope;
import org.apache.commons.httpclient.methods.PostMethod;
import org.apache.commons.httpclient.methods.RequestEntity;
import org.apache.commons.httpclient.methods.multipart.FilePart;
import org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
import org.apache.commons.httpclient.methods.multipart.Part;
import org.apache.log4j.Logger;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.utils.CountingMultipartRequestEntity;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 28/05/14
 * Time: 14:34
 */
@Test(groups = "ignore")
public class HttpClientTests {

    private static Logger logger = Logger.getLogger(HttpClientTests.class);

    private HttpClient httpClient = new HttpClient();
    private String blossomHost = "www.blossom-kc.com";
    private String blossomPostUrl = "http://www.blossom-kc.com/demo/WebServices/content?Upload_ExtID/4a57249d-52f9-49fa-8c40-0608104d8805/2245/lesson_name=New+Lesson";
    private String zipFilePath =   "C:\\t2k\\cgs-data\\content\\packages\\output\\download\\a66d9b92-67c2-4676-87c0-d83261acfd9a.scorm.zip";
    private HttpClient clientWithBlossomCredentials(){
        Credentials defaultcreds = new UsernamePasswordCredentials("t2k_cgs_in", "93G5Ym0k6BUXQC9");
        httpClient.getState().setCredentials(new AuthScope(blossomHost, 80, AuthScope.ANY_REALM), defaultcreds);
        return httpClient;
    }

    @Test
    public void httpDigestPassesWithCorrectCredentials() throws IOException {
        Credentials defaultcreds = new UsernamePasswordCredentials("username", "password");
        httpClient.getState().setCredentials(new AuthScope(blossomHost, 80, AuthScope.ANY_REALM), defaultcreds);
        HttpMethod httpMethod = new PostMethod(blossomPostUrl);
        httpClient.executeMethod(httpMethod);
        int status = httpMethod.getStatusCode();
        Assert.assertTrue(status == 401);
    }

    @Test
    public void httpDigestFailsWithWrongCredentials() throws IOException {
        Credentials defaultcreds = new UsernamePasswordCredentials("t2k_cgs_in", "93G5Ym0k6BUXQC9");
        httpClient.getState().setCredentials(new AuthScope(blossomHost, 80, AuthScope.ANY_REALM), defaultcreds);
        HttpMethod httpMethod = new PostMethod(blossomPostUrl);
        httpClient.executeMethod(httpMethod);
        int status = httpMethod.getStatusCode();
        Assert.assertTrue(status==200);
    }

    @Test
    public void uploadFileUsingBlossom() throws IOException {
        HttpClient blossomClient = clientWithBlossomCredentials();
        PostMethod blossomFileUploadPost = new PostMethod(blossomPostUrl);

        Part parts = new FilePart("lessonfile",new File(zipFilePath));
        MultipartRequestEntity reqEntity = new MultipartRequestEntity(new Part[]{parts},blossomFileUploadPost.getParams());
        blossomFileUploadPost.setRequestEntity(reqEntity);
        int status;
        String response=null;
        try{

            status = blossomClient.executeMethod(blossomFileUploadPost);
            response = blossomFileUploadPost.getResponseBodyAsString();
            logger.debug("response : "+response);
        }
        catch (Exception e){
            logger.error("Error publishing to blossom",e);
            throw e;
        }
        finally {
            blossomFileUploadPost.releaseConnection();
        }

        Assert.assertEquals(status,200);
        Assert.assertNotNull(response);
    }

    @Test
    public void uploadFileUsingBlossomWithProgressListener() throws IOException {
        HttpClient blossomClient = clientWithBlossomCredentials();
        PostMethod blossomFileUploadPost = new PostMethod(blossomPostUrl);
        File fileToUpload = new File(zipFilePath);
        if (!fileToUpload.exists())
            throw new IOException("File "+zipFilePath+" does not exist.");
        long fileBytes = fileToUpload.length();
        Part parts = new FilePart("lessonfile",fileToUpload);


        MultipartRequestEntity reqEntity = new MultipartRequestEntity(new Part[]{parts},blossomFileUploadPost.getParams());


        RequestEntity requestEntity = new CountingMultipartRequestEntity(reqEntity,new UploadProgressListener(fileBytes,null));


        blossomFileUploadPost.setRequestEntity(requestEntity);
        int status;
        String response=null;
        try{
            status = blossomClient.executeMethod(blossomFileUploadPost);
            response = blossomFileUploadPost.getResponseBodyAsString();
            logger.debug("response : "+response);
        }
        catch (Exception e){
            logger.error("Error publishing to blossom",e);
            throw e;
        }
        finally {
            blossomFileUploadPost.releaseConnection();
        }

        Assert.assertEquals(status,200);
        Assert.assertNotNull(response);


    }

    public class UploadProgressListener implements CountingMultipartRequestEntity.ProgressListener{

        private final CGSPackage cgsPackage;
        private final long totalSizeToBeSent;
        private int lastUpdated = 0;
        public UploadProgressListener(long totalSizeToBeSent, CGSPackage cgsPackageToUpdate) {
            this.totalSizeToBeSent = totalSizeToBeSent;
            this.cgsPackage = cgsPackageToUpdate;
        }

        @Override
        public void transferred(long num) {
            float estimatedPercentSent = 100f *num  / totalSizeToBeSent;
            float percentForProgress =   100f * estimatedPercentSent / 105;
            int percentageInt = (int) percentForProgress;
            if (lastUpdated != percentageInt && percentageInt%3==0 ) {  //update only every 3 percent
                lastUpdated = percentageInt;
                logger.debug(num +" from "+totalSizeToBeSent+" = "+estimatedPercentSent+"%,percentage for job progress = "+percentForProgress+", int ="+percentageInt );
            }
        }
    };
}
