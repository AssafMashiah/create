package org.t2k.cgs.domain.usecases.user;

import atg.taglib.json.util.JSONException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.Customization;
import org.t2k.cgs.domain.model.ExternalSetting;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.ValidationException;
import org.t2k.cgs.domain.model.user.RelatesTo;
import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.service.UserServiceImpl;
import org.testng.Assert;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/3/13
 * Time: 3:44 PM
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
public class UserServiceTest extends AbstractTestNGSpringContextTests {

    private static final String PACKAGE_PATH = "jsons/users";

    public static final String BLOSSOM = "blossom";

    private List<SimpleCgsUserDetails> usersAddedByTests = new ArrayList<>();

    private static final int publisherId = 10000;

    @Autowired
    private UserServiceImpl userService;

    private SimpleCgsUserDetails defaultUser;

    @BeforeMethod
    public void reset() throws Exception {
        defaultUser = new SimpleCgsUserDetails();
        defaultUser.setEmail("work@timetoknow.com");
        defaultUser.setFirstName("Time");
        defaultUser.setLastName("Know");
        defaultUser.setPassword("password");
        defaultUser.setUsername("time.to.know100");
        defaultUser.setRelatesTo(new RelatesTo(publisherId, "PUBLISHER"));
    }

    @AfterClass
    public void deleteUsersAddedByTests() throws DsException {
        userService.removeUsersByPublisherAccountId(publisherId);
    }

    public SimpleCgsUserDetails getDefaultUser() throws IOException, URISyntaxException, JSONException {
        InputStream is = getFileInputStream("user_with_customization.json");
        String json = getInputStreamAsString(is);
        return new ObjectMapper().readValue(json, SimpleCgsUserDetails.class);
    }

    @Test
    public void testAddUserSuccessfully() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        String name = RandomStringUtils.randomAlphabetic(20);
        String email = name + "@dummy.com";
        user.setFirstName(name);
        user.setEmail(email);
        try {
            userService.add(user, "EDITOR", true);
            usersAddedByTests.add(user);
        } catch (Exception e) {
            logger.error(e.getMessage());
            throw e;
        }
        SimpleCgsUserDetails fetchedUser = userService.getById(user.getUserId(), true);
        Assert.assertEquals(user.getFirstName(), fetchedUser.getFirstName());
        userService.delete(user.getUserId());

    }

    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithoutShowHintsModeCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        userService.add(user, "EDITOR", true);
        usersAddedByTests.add(user);

    }

    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithEmptyNameCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        user.setFirstName("");
        userService.add(user, "EDITOR", true);
        usersAddedByTests.add(user);

    }

    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithNullNameCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        user.setFirstName(null);
        userService.add(user, "EDITOR", true);
        usersAddedByTests.add(user);

    }

    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithoutEmailCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        user.setEmail("");
        userService.add(user, "EDITOR", true);
    }

    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithNullEmailCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        user.setEmail(null);
        userService.add(user, "EDITOR", true);
    }

    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithoutRelatesToCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        user.setRelatesTo(new RelatesTo());
        userService.add(user, "EDITOR", true);
    }

    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithNullRelatesToCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        user.setRelatesTo(null);
        userService.add(user, "EDITOR", true);
    }

    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithNullUserIdCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        user.setUserId(null);
        userService.add(user, "EDITOR", true);
    }

    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithoutCustomizationCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        user.setCustomization(new Customization());
        userService.add(user, "EDITOR", true);
    }

    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithNullCustomizationCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        user.setCustomization(null);
        userService.add(user, "EDITOR", true);
    }


    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithNoneExistingRoleCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        userService.add(user, "NON_EXISTING", true);
    }

    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithCustomizationWithoutCgsHintsShowModeCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        Customization cust = new Customization();
        cust.setCgsHintsShowMode(null);
        user.setCustomization(cust);
        userService.add(user, "EDITOR", true);
    }

    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithNullCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        user.setFirstName(null);
        userService.add(user, "EDITOR", true);
    }

    @Test(expectedExceptions = ValidationException.class)
    public void UserInsertWithoutCannotBeAdded() throws Exception {
        SimpleCgsUserDetails user = getDefaultUser();
        user.setFirstName("");
        userService.add(user, "EDITOR", true);
    }

    @Test(expectedExceptions = ValidationException.class)
    public void duplicateUserIdInsertTest() throws Exception {
        userService.add(defaultUser, "EDITOR", true);

        defaultUser.setEmail("something@else.com");
        defaultUser.setUsername("some.other.name");

        userService.add(defaultUser, "EDITOR", true);
        usersAddedByTests.add(defaultUser);

    }

    @Test(expectedExceptions = ValidationException.class)
    public void notValidRoleInsertTest() throws Exception {
        defaultUser.setUsername("duplicateEmail");
        userService.add(defaultUser, "BAD_ROLE", true);
    }

    @Test(expectedExceptions = ValidationException.class)
    public void duplicateEmailInsertTest() throws Exception {
        defaultUser.setUsername("duplicateEmail");
        userService.add(defaultUser, "EDITOR", true);
        defaultUser.setUsername("some.other.name");
        userService.add(defaultUser, "EDITOR", true);
    }

    @Test
    public void getBlossomUrlTest() throws Exception {
        Customization customizationWithBlossom = new Customization();
        String blossomURL = "http://www.blossom-kc.com/demo/WebServices/content?Upload_ExtID/";
        customizationWithBlossom.setExternalSettings(Arrays.asList(new ExternalSetting(BLOSSOM, blossomURL)));
        defaultUser.setCustomization(customizationWithBlossom);
        Assert.assertEquals(userService.getBlossomUrl(defaultUser), blossomURL, "Blossom url should be the same as the one exists for this user");
    }

    @Test
    public void isUserRelatedToBlossomNegativeAnswerTest() throws Exception {
        // null customization
        defaultUser.setCustomization(null);
        Assert.assertFalse(userService.isUserRelatedToBlossom(defaultUser), "User with null customization should not be counted as a user related to Blossom");

        // empty customization
        defaultUser.setCustomization(new Customization());
        Assert.assertFalse(userService.isUserRelatedToBlossom(defaultUser), "User with an empty customization should not be counted as a user related to Blossom");

        // customization with external partner, but not blossom
        Customization customizatioWithoutBlossom = new Customization();
        String otherPartnerURL = "http://www.not-a-blossom-catalog.com";
        customizatioWithoutBlossom.setExternalSettings(Arrays.asList(new ExternalSetting("MOODLE_HAHA", otherPartnerURL)));
        defaultUser.setCustomization(customizatioWithoutBlossom);
        Assert.assertNull(userService.getBlossomUrl(defaultUser), "Blossom url should not exist in this case");
        Assert.assertFalse(userService.isUserRelatedToBlossom(defaultUser), "User with a customization of another provider should not be counted as a user related to Blossom");
    }

    @Test
    public void isUserRelatedToBlossomPositiveAnswerTest() throws Exception {
        Customization customizationWithBlossom = new Customization();
        String blossomURL = "http://www.blossom-kc.com/demo/WebServices/content?Upload_ExtID/";
        customizationWithBlossom.setExternalSettings(Arrays.asList(new ExternalSetting(BLOSSOM, blossomURL)));
        defaultUser.setCustomization(customizationWithBlossom);
        Assert.assertTrue(userService.isUserRelatedToBlossom(defaultUser), "Blossom url should indicate that the url is related to blossombe the same as the one exists for this user");
    }

    private FileInputStream getFileInputStream(String path) throws URISyntaxException, FileNotFoundException {
        String relativePath = PACKAGE_PATH + "/" + path;
        System.out.println(relativePath);
        URL url = ClassLoader.getSystemResource(relativePath);
        File file = new File(url.toURI());
        return new FileInputStream(file);
    }

    private String getInputStreamAsString(InputStream inputStream) throws IOException {
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
