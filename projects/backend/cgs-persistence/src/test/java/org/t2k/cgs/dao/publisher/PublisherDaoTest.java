package org.t2k.cgs.dao.publisher;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.util.Assert;
import org.t2k.cgs.dataServices.exceptions.ValidationException;
import org.t2k.cgs.security.CGSAccount;
import org.t2k.cgs.security.PublishSettings;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.*;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.List;

import static org.testng.Assert.assertNotNull;
import static org.testng.Assert.assertTrue;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/7/12
 * Time: 6:06 PM
 */

@ContextConfiguration("/springContext/applicationContext-MongoDaosTest.xml")
@Test(groups = "ignore")
public class PublisherDaoTest extends AbstractTestNGSpringContextTests {

    private String TTS_PROVIDERS = "ttsProviders";
    private String TTS_PROVIDER_ID = "id";

    @Autowired
    private PublisherMongoTestDao publisherDao;
    private static final String PACKAGE_PATH = "jsons/publishers" ;


    @BeforeMethod
    @AfterClass
    private void setUp() {
        clean();
    }

    @BeforeMethod
    private void clean() {
        publisherDao.removeAllItems(null);
    }


    private CGSAccount getAccountObject(int accountId){
        CGSAccount cgsAccount = publisherDao.getAccountAuthenticationData(accountId);
        return cgsAccount;
    }

    @Test
    public void getPublishSettings() {
        CGSAccount cgsAccount = this.publisherDao.getAccountAuthenticationData(1);
        PublishSettings publishSettings = cgsAccount.getAccountCustomization().getPublishSettings();

        Gson globalGson = new Gson();
        JsonObject jsonObject = globalGson.toJsonTree(publishSettings).getAsJsonObject();
        JsonElement jsonElement = jsonObject.get("publishUploadServerUrl");
        String uploadUrl = jsonElement.getAsString();
        System.out.println("Upload URL: " + uploadUrl);

    }

    @Test
    public void getTTsDataFromAccountObject(){

        int expectedTtsConfigurationId = 1;
        Gson globalGson = new Gson();
        JsonElement publisher = globalGson.toJsonTree(getAccountObject(1));
        JsonArray ttsProviders = publisher.getAsJsonObject().get(TTS_PROVIDERS).getAsJsonArray();
        JsonObject firstProvider = ttsProviders.get(0).getAsJsonObject();
        logger.debug("firstProvider.get(TTS_PROVIDER_ID).getAsInt() = "+firstProvider.get(TTS_PROVIDER_ID).getAsInt());
        logger.debug("expectedTtsConfigurationId = "+expectedTtsConfigurationId);
        Assert.isTrue( firstProvider.get(TTS_PROVIDER_ID).getAsInt() == expectedTtsConfigurationId);

    }

    @Test
    public void getAccountObjectAsJson() throws JsonProcessingException, JSONException {
        int accountId =1;
        CGSAccount cgsAccount = getAccountObject(accountId);
        ObjectMapper objectMapper = new ObjectMapper();
        String mappedCgs = objectMapper.writeValueAsString(cgsAccount);
        JSONObject serialize = new JSONObject(mappedCgs);

    }

    @Test
    public void testGetAllPublisherIds(){

        List<Integer> ids = publisherDao.getAllPublisherIds();
        assertTrue(ids.size()!=0);

    }
    @Test
    public void checkGetPublisher(){

        String result = publisherDao.getPublisher(1);

        assertNotNull(result);
    }

    @Test
    public void putGetPublisher() throws IOException, URISyntaxException, ValidationException {
        InputStream is = getFileInputStream("add_publisher_request.json");
        String json = getInputStreamAsString(is);
        publisherDao.createPublisher(json);
        int result = publisherDao.getPublisherIdByPublisherName("test");
        Assert.isTrue(result != 0);
    }

    @Test
    public void putDelPublisher() throws ValidationException, IOException, URISyntaxException {
        InputStream is = getFileInputStream("add_publisher_request.json");
        String json = getInputStreamAsString(is);
        publisherDao.createPublisher(json);
        int id = publisherDao.getPublisherIdByPublisherName("test");
        publisherDao.deletePublisher(id);
        Assert.isNull(publisherDao.getPublisher(id));
    }

    @Test
    public void insertTwoPublishersTest() throws Exception {
        InputStream is = getFileInputStream("add_publisher_request.json");
        String json = getInputStreamAsString(is);
        publisherDao.createPublisher(json);
        int id1 = publisherDao.getPublisherIdByPublisherName("test");
        is.close();
        is = getFileInputStream("add_second_publisher_request.json");
        json = getInputStreamAsString(is);
        publisherDao.createPublisher(json);
        int id2 = publisherDao.getPublisherIdByPublisherName("test2");
        Assert.isTrue(id2 > id1);
    }

    private FileInputStream getFileInputStream(String path) throws URISyntaxException, FileNotFoundException {
        String relativePath = PACKAGE_PATH + "/" + path;
        System.out.println(relativePath);
        URL url = ClassLoader.getSystemResource(relativePath);
        File file = new File(url.toURI());
        FileInputStream is = new FileInputStream(file);
        return is;
    }

    private String getInputStreamAsString(InputStream inputStream) throws IOException, IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        StringBuilder out = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            out.append(line);
        }
        return out.toString();
    }

    public PublisherMongoTestDao getPublisherDao() {
        return publisherDao;
    }

    public void setPublisherDao(PublisherMongoTestDao publisherDao) {
        this.publisherDao = publisherDao;
    }
}
