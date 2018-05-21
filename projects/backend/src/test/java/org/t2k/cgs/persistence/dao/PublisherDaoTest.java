package org.t2k.cgs.persistence.dao;

import atg.taglib.json.util.JSONObject;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.util.Assert;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.exceptions.ValidationException;
import org.t2k.cgs.domain.model.user.CGSAccount;
import org.t2k.cgs.domain.model.user.PublishSettings;
import org.t2k.cgs.persistence.dao.config.PublisherMongoTestDao;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.List;

import static org.testng.Assert.assertNotNull;
import static org.testng.Assert.assertTrue;

/**
 * The {@link AccountMongoDao} class has validation on id when creating a new publisher.
 * Therefore, we are unable to cleanup test publishers, without deleting all the publishers, as we can't know the
 * publisher id.
 * In order to avoid this issue, use the MOCK_UP_PUBLISHER name for all the publishers mocks, to be able to retrieve them
 * <p>
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/7/12
 * Time: 6:06 PM
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
public class PublisherDaoTest extends AbstractTestNGSpringContextTests {

    private final static String MOCK_UP_PUBLISHER = "mock_up_publisher";
    private String TTS_PROVIDERS = "ttsProviders";
    private String TTS_PROVIDER_ID = "id";

    @Autowired
    private PublisherMongoTestDao publisherDao;
    private static final String PACKAGE_PATH = "jsons/publishers";


    @AfterClass
    private void setUp() throws ValidationException {
        clean();
    }

    @BeforeMethod
    private void clean() throws ValidationException {
//        publisherDao.removeAllItems(null);
        int id = publisherDao.getPublisherIdByPublisherName(MOCK_UP_PUBLISHER);
        if (id > 0)
            publisherDao.deletePublisher(id);
    }


    private CGSAccount getAccountObject(int accountId) {
        CGSAccount cgsAccount = publisherDao.getAccountAuthenticationData(accountId);
        return cgsAccount;
    }

    @Test
    public void getPublishSettings() throws Exception {
        int id = createPublisherFromJson("validAccount.json");
        CGSAccount cgsAccount = publisherDao.getAccountAuthenticationData(id);
        PublishSettings publishSettings = cgsAccount.getAccountCustomization().getPublishSettings();
        Gson globalGson = new Gson();
        JsonObject jsonObject = globalGson.toJsonTree(publishSettings).getAsJsonObject();
//        JsonElement jsonElement = jsonObject.get("publishUploadServerUrl");
//        String uploadUrl = jsonElement.getAsString();
//        System.out.println("Upload URL: " + uploadUrl);
    }

    @Test
    public void getTTsDataFromAccountObject() throws ValidationException, IOException, URISyntaxException {
        int id = createPublisherFromJson("validAccount.json");
        int expectedTtsConfigurationId = 1;
        Gson globalGson = new Gson();
        JsonElement publisher = globalGson.toJsonTree(getAccountObject(id));
        JsonArray ttsProviders = publisher.getAsJsonObject().get(TTS_PROVIDERS).getAsJsonArray();
        JsonObject firstProvider = ttsProviders.get(0).getAsJsonObject();
        logger.debug("firstProvider.get(TTS_PROVIDER_ID).getAsInt() = " + firstProvider.get(TTS_PROVIDER_ID).getAsInt());
        logger.debug("expectedTtsConfigurationId = " + expectedTtsConfigurationId);
        Assert.isTrue(firstProvider.get(TTS_PROVIDER_ID).getAsInt() == expectedTtsConfigurationId);
    }

    @Test
    public void getAccountObjectAsJson() throws Exception {
        int accountId = createPublisherFromJson("add_publisher_request.json");
        CGSAccount cgsAccount = getAccountObject(accountId);
        ObjectMapper objectMapper = new ObjectMapper();
        String mappedCgs = objectMapper.writeValueAsString(cgsAccount);
        JSONObject serialize = new JSONObject(mappedCgs);
    }

    @Test
    public void testGetAllPublisherIds() throws Exception {
        createPublisherFromJson("add_publisher_request.json");
        List<Integer> ids = publisherDao.getAllPublisherIds();
        assertTrue(ids.size() != 0);
    }

    @Test
    public void checkGetPublisher() throws Exception {
        int id = createPublisherFromJson("add_publisher_request.json");
        String result = publisherDao.getPublisher(id);
        assertNotNull(result);
    }

    @Test
    public void putGetPublisher() throws Exception {
        createPublisherFromJson("add_publisher_request.json");
        int result = publisherDao.getPublisherIdByPublisherName(MOCK_UP_PUBLISHER);
        Assert.isTrue(result != 0);
    }

    @Test
    public void putDelPublisher() throws Exception {
        int id = createPublisherFromJson("add_publisher_request.json");
        publisherDao.deletePublisher(id);
        Assert.isNull(publisherDao.getPublisher(id));
    }

    private int createPublisherFromJson(String jsonName) throws URISyntaxException, IOException, ValidationException {
        InputStream is = getFileInputStream(jsonName);
        String json = getInputStreamAsString(is);
        publisherDao.createPublisher(json);
        return publisherDao.getPublisherIdByPublisherName(MOCK_UP_PUBLISHER);
    }

    @Test
    public void insertTwoPublishersTest() throws Exception {
        InputStream is = getFileInputStream("add_publisher_request.json");
        String json = getInputStreamAsString(is);
        publisherDao.createPublisher(json);
        int id1 = publisherDao.getPublisherIdByPublisherName(MOCK_UP_PUBLISHER);
        is.close();
        is = getFileInputStream("add_second_publisher_request.json");
        json = getInputStreamAsString(is);
        publisherDao.createPublisher(json);
        int id2 = publisherDao.getPublisherIdByPublisherName("mock_up_publisher2");
        Assert.isTrue(id2 > id1);
        publisherDao.deletePublisher(id2);
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
