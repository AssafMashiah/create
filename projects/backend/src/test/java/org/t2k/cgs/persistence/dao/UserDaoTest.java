package org.t2k.cgs.persistence.dao;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.user.RelatesTo;
import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.domain.model.user.SimpleCgsUserRole;
import org.t2k.sample.dao.exceptions.DaoException;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import javax.servlet.ServletException;
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

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/7/12
 * Time: 6:06 PM
 */
@SpringApplicationConfiguration(classes = Application.class)
public class UserDaoTest extends AbstractTestNGSpringContextTests {

    private static final String PACKAGE_PATH = "jsons/users";
    private static final String USERS_COLLECTION = "users";

    @Autowired
    private UsersMongoDao userDao;

    private SimpleCgsUserDetails defaultUser;

    @BeforeMethod
    @AfterClass
    public void reset() throws Exception {
        defaultUser = new SimpleCgsUserDetails();
        defaultUser.setEmail("work@timetoknow.com");
        defaultUser.setFirstName("Time");
        defaultUser.setLastName("Know");
        defaultUser.setPassword("password");
        defaultUser.setUsername("time.to.know100");
        defaultUser.setUserId(1000);
        defaultUser.setRelatesTo(new RelatesTo(1, "PUBLISHER"));
    }

    @AfterClass
    @BeforeMethod
    public void cleanUp() throws DaoException {
        userDao.delete(1000);
    }

    @Test
    public void successfullyInsertUser() throws Exception {
        userDao.insert(defaultUser, null);
    }

    @Test
    public void castToSimpleCgsUserDetails() throws ServletException, IOException, URISyntaxException, JSONException {
        InputStream is = getFileInputStream("user_with_customization.json");
        String json = getInputStreamAsString(is);
        JSONObject jsonObject = new JSONObject(json);
        SimpleCgsUserDetails simple = new ObjectMapper().readValue(json, SimpleCgsUserDetails.class);
        Assert.assertEquals(simple.getUsername(), jsonObject.getString("username"));
        Assert.assertEquals(simple.getFirstName(), jsonObject.getString("firstName"));
        Assert.assertEquals(simple.getEmail(), jsonObject.getString("email"));
        Assert.assertEquals(simple.getCustomization().getCgsHintsShowMode(), new JSONObject(jsonObject.getString("customization")).getString("cgsHintsShowMode"));
    }

    @Test
    public void UserInsertWithoutField() throws Exception {
        defaultUser.setFirstName("");
        userDao.insert(defaultUser, null);
    }

    @Test
    public void getAdminUsersTest() throws DaoException {
        List<SimpleCgsUserRole> roles = userDao.getRolesByAdminUser();
    }

    /*@Test
    public void UserInsertAndGetTest() throws Exception {

        userDao.insert(defaultUser);

        SimpleCgsUserDetails returnedUser = userDao.getById(defaultUser.getUserId());

        assertEquals(returnedUser, defaultUser);
    }

    /*
    @Test
    public void getAdminUser() throws Exception{
        SimpleCgsUserDetails admin = userDao.getByName("admin");
        Assert.isTrue(admin!=null);

    }
    
    @Test
    public void getRolesByAdminUserTest() throws DaoException {
        List<SimpleCgsUserRole> roles = userDao.getRolesByAdminUser();
        Assert.isTrue(roles!=null);
    }
    /*
    @Test(expectedExceptions = DaoDuplicateKeyException.class)
    public void duplicateUserIdInsertTest() throws Exception {
        userDao.insert(defaultUser);

        defaultUser.setEmail("something@else.com");
        defaultUser.setUsername("some.other.name");

        userDao.insert(defaultUser);
    }

    @Test(expectedExceptions = DaoDuplicateKeyException.class)
    public void duplicateUserIdInsertTest2() throws Exception {

        userDao.insert(defaultUser);

        defaultUser.setUsername("some.other.name");

        userDao.insert(defaultUser);
    }

    @Test(expectedExceptions = DaoDuplicateKeyException.class)
    public void duplicateUserIdInsertTest3() throws Exception {

        userDao.insert(defaultUser);

        defaultUser.setEmail("something@else.com");

        userDao.insert(defaultUser);
    }


    @Test
    public void insertTwoUsersTest() throws Exception {

        userDao.insert(defaultUser);

        defaultUser.setEmail("something@else.com");
        defaultUser.setUsername("some.other.name");
        defaultUser.setUserId(2);

        userDao.insert(defaultUser);
    }

    @Test
    public void putGetUser() throws Exception, URISyntaxException, ValidationException {
        InputStream is = getFileInputStream("good_user.json");
        String json = getInputStreamAsString(is);
        SimpleCgsUserDetails userDetails = JsonUtils.jsonToObject(json, SimpleCgsUserDetails.class);
        userDetails.setUserId(1);
        userDao.insert(userDetails);
        SimpleCgsUserDetails resultUser = userDao.getByName("rd1");
        Assert.isTrue(resultUser != null && resultUser.getUserId() != 0);
    }

    @Test
    public void putDelUser() throws Exception, IOException, URISyntaxException {
        InputStream is = getFileInputStream("good_user.json");
        String json = getInputStreamAsString(is);
        SimpleCgsUserDetails userDetails = JsonUtils.jsonToObject(json, SimpleCgsUserDetails.class);
        userDetails.setUserId(1);
        userDao.insert(userDetails);
        SimpleCgsUserDetails resultUser = userDao.getByName("rd1");
        int id = resultUser.getUserId().intValue();
        userDao.delete(id);
        Assert.isNull(userDao.getById(id));
    }

    */
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
        String res = out.toString();
        inputStream.close();
        return res;
    }
}