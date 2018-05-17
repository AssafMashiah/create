package org.t2k.cgs.security;

import atg.taglib.json.util.JSONException;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.domain.usecases.publisher.ExternalPartnersService;
import org.t2k.cgs.domain.usecases.publisher.PublisherService;
import org.t2k.cgs.domain.usecases.publisher.ExternalPartnerSettings;
import org.t2k.cgs.domain.model.user.RelatesTo;
import org.t2k.cgs.domain.usecases.user.UserService;
import org.t2k.cgs.domain.usecases.TestUtils;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static org.mockito.Matchers.any;
import static org.mockito.Mockito.when;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 07/05/14
 * Time: 13:53
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class OAuthSecurityServiceTest extends AbstractTestNGSpringContextTests {

    public static final String EDITOR_SCOPE = "https://cgs.timetoknow.com/cgs/login/EDITOR";
    public static final String AUTHOR_SCOPE = "https://cgs.timetoknow.com/cgs/login/AUTHOR";
    public static final String VALID_AUD = "https://cgs-production-qa.timetoknow.com/cgs/auth/oauth2/login";

    @Autowired
    private OAuthSecurityServiceImpl oAuthSecurityService;

    @Autowired
    private TestUtils testUtils;

    @Autowired
    private PublisherService publisherService;

    @Autowired
    private UserService userService;

    @Autowired
    private ExternalPartnersService externalPartnersService;

    OAuthJWTGenerator oAuthJWTGenerator = new OAuthJWTGenerator();
    int mockPublisher;
    String mockPublisherExternalId = null;
    String mockPublisherSecretKey = null;

    @Mock
    private AuthenticationManager mockAuthenticationManager;
    private String firstname = "bozo";
    private String lastname = "the clown";
    private List<Integer> usersIdsToDelete = new ArrayList<>();

    @BeforeClass
    private void initPublisherWithSSO() throws DsException, IOException, JSONException {
        mockPublisher = testUtils.createANewPublisherWithBlossomSSOCredentials(); // this method created a new publisher with the secret key = veryHardSecretKey1234567
        ExternalPartnerSettings externalPartnerSettings = externalPartnersService.getExternalPartnersByPublisherId(mockPublisher).get(0);
        mockPublisherExternalId = externalPartnerSettings.getExternalAccountId();
        mockPublisherSecretKey = externalPartnerSettings.getSecretKey();
        MockitoAnnotations.initMocks(this);
        when(mockAuthenticationManager.authenticate(any(Authentication.class))).thenReturn(new TestingAuthenticationToken("bla", "bla")); // always return a 200 status - OK.
        oAuthSecurityService.setAuthenticationManager(mockAuthenticationManager);
    }

    @AfterClass
    public void removeMockPublisher() throws DsException {
        publisherService.deletePublisher(mockPublisher);
        for (int userId : usersIdsToDelete) {
            userService.delete(userId);
        }
    }

    @Test
    public void extractEditorRole() throws Exception {
        String id = oAuthSecurityService.extractRoleIdRef("https://cgs.timetoknow.com/cgs/login/EDITOR");
        Assert.assertNotNull(id, "could not find an object in mongo for role EDITOR");
    }

    @Test
    public void extractAuthorRole() throws Exception {
        String id = oAuthSecurityService.extractRoleIdRef("https://cgs.timetoknow.com/cgs/login/AUTHOR");
        Assert.assertNotNull(id, "could not find an object in mongo for role AUTHOR");
    }

    @Test
    public void extractOfInvalidRoleThrowsAnException() throws Exception {
        boolean correctExceptionWasThrown = false;
        try {
            oAuthSecurityService.extractRoleIdRef("https://cgs.timetoknow.com/cgs/login/Something");
        } catch (DsException e) {
            Assert.assertNotEquals(e.getMessage().indexOf("Failure to find role"), -1);
            correctExceptionWasThrown = true;
        }

        Assert.assertTrue(correctExceptionWasThrown);
    }

    @Test
    public void extractOfEmptyRoleStringThrowsAnException() throws Exception {
        boolean correctExceptionWasThrown = false;
        try {
            oAuthSecurityService.extractRoleIdRef("");
        } catch (DsException e) {
            Assert.assertNotEquals(e.getMessage().indexOf("Failure to find role"), -1);
            correctExceptionWasThrown = true;
        }

        Assert.assertTrue(correctExceptionWasThrown);
    }

    @Test
    public void testConvertUser() throws Exception {
        String blossomUserName = "kirk";
        String blossomUserId = "1234";
        String aud = "aud";
        String jwtToken = oAuthJWTGenerator.getJwtString(firstname, lastname, mockPublisherExternalId, EDITOR_SCOPE, aud, 29127, new Date().getTime(), blossomUserId, blossomUserName, mockPublisherSecretKey);
        OAuthDetails authDetails = new OAuthDetails(jwtToken);
        SimpleCgsUserDetails actualUserDetailsFromAuthDetails = oAuthSecurityService.convert(authDetails);

        SimpleCgsUserDetails expectedUserDetailsFromAuthDetails = new SimpleCgsUserDetails();
        expectedUserDetailsFromAuthDetails.setExternalId("1234");
        expectedUserDetailsFromAuthDetails.setFirstName(blossomUserName);
        expectedUserDetailsFromAuthDetails.setLastName(blossomUserName);
        expectedUserDetailsFromAuthDetails.setUsername(blossomUserName + "_" + blossomUserId + "_" + mockPublisher);
        expectedUserDetailsFromAuthDetails.setEmail(expectedUserDetailsFromAuthDetails.getUsername() + "@NotARealEmail.ext");
        expectedUserDetailsFromAuthDetails.setRelatesTo(new RelatesTo(mockPublisher, "PUBLISHER"));

        Assert.assertEquals(actualUserDetailsFromAuthDetails, expectedUserDetailsFromAuthDetails);
    }

    @Test
    public void testSaveUser() throws Exception {
        String mockKey = "someKey";
        String userExternalId = "1234";
        String externalUserName = "kirk";
        String aud = "aud";
        String jwtToken = oAuthJWTGenerator.getJwtString(firstname, lastname, mockPublisherExternalId, EDITOR_SCOPE, aud, 29127, new Date().getTime(), userExternalId, externalUserName, mockKey);
        OAuthDetails authDetails = new OAuthDetails(jwtToken);

        //New
        SimpleCgsUserDetails userDetails = oAuthSecurityService.saveUserDetails(authDetails);
        usersIdsToDelete.add(userDetails.getUserId());
        Assert.assertNotNull(userDetails.getUserId());
        Assert.assertNotNull(userDetails.getRole().getName(), "EDITOR");

        //Update
        jwtToken = oAuthJWTGenerator.getJwtString(firstname, lastname, mockPublisherExternalId, AUTHOR_SCOPE, aud, 29127, new Date().getTime(), userExternalId, "douglas", mockKey);
        authDetails = new OAuthDetails(jwtToken);
        userDetails = oAuthSecurityService.saveUserDetails(authDetails);
        Assert.assertNotNull(userDetails.getRole().getName(), "AUTHOR");

        //Same userId - different name
        jwtToken = oAuthJWTGenerator.getJwtString(firstname, lastname, mockPublisherExternalId, AUTHOR_SCOPE, aud, 29127, new Date().getTime(), "4321", "kirk", mockKey);
        authDetails = new OAuthDetails(jwtToken);
        userDetails = oAuthSecurityService.saveUserDetails(authDetails);
        Assert.assertNotNull(userDetails.getUserId());

    }

    @Test
    public void convertUserWithALongName() throws DsException {
        String mockKey = "someKey";
        String userExternalId = "1234";
        String externalUserName = "kirk";
        StringBuffer sb = new StringBuffer();
        for (int i = 0; i < 300; i++) {
            sb.append("a");
        }

        String firstName = sb.toString();
        String lastName = firstName;
        String aud = "aud";
        String jwtToken = oAuthJWTGenerator.getJwtString(firstName, lastName, mockPublisherExternalId, EDITOR_SCOPE, aud, 29127, new Date().getTime(), userExternalId, externalUserName, mockKey);
        OAuthDetails authDetails = new OAuthDetails(jwtToken);

        // New
        SimpleCgsUserDetails userDetails = oAuthSecurityService.convert(authDetails);
        Assert.assertEquals(userDetails.getFirstName().length(), 100);
        Assert.assertEquals(userDetails.getLastName().length(), 100);
    }

    @Test
    public void fullCycleAuthenticationSuccess() throws DsException {
        HttpServletRequest request = new MockHttpServletRequest();
        String userExternalId = "1234";
        String externalUserName = "BestUsernameEver";
        String aud = VALID_AUD;
        String jwtToken = oAuthJWTGenerator.getJwtString(firstname, lastname, mockPublisherExternalId, AUTHOR_SCOPE, aud, new Date().getTime() / 1000, new Date().getTime() / 1000, userExternalId, externalUserName, mockPublisherSecretKey);
        Assert.assertTrue(oAuthSecurityService.authenticate(jwtToken, request), "Error in full cycle authentication");
    }

    @Test
    public void fullCycleAuthenticationFailure() throws DsException {
        HttpServletRequest request = new MockHttpServletRequest();
        String userExternalId = "1234";
        String externalUserName = "BestUsernameEver";
        String aud = "aud";
        String jwtToken = oAuthJWTGenerator.getJwtString(firstname, lastname, mockPublisherExternalId, AUTHOR_SCOPE, aud, 29127, new Date().getTime(), userExternalId, externalUserName, mockPublisherSecretKey);
        Assert.assertFalse(oAuthSecurityService.authenticate(jwtToken, request), "This should have been false because the aud is invalid");
    }
}