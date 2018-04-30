package org.t2k.security;

import atg.taglib.json.util.JSONException;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.security.OAuthDetails;
import org.t2k.cgs.domain.usecases.publisher.ExternalPartnersService;
import org.t2k.cgs.domain.usecases.publisher.PublisherService;
import org.t2k.cgs.domain.usecases.publisher.ExternalPartnerSettings;
import org.t2k.cgs.security.OAuthValidator;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Date;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 07/05/14
 * Time: 13:53
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class OAuthValidatorTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private TestUtils testUtils;

    @Autowired
    private PublisherService publisherService;

    @Autowired
    private OAuthValidator oAuthValidator;

    @Autowired
    private ExternalPartnersService externalPartnersService;

    OAuthJWTGenerator oAuthJWTGenerator = new OAuthJWTGenerator();
    
    private String HMAC_SHA256_REQUEST_FORMAT = null;

    public String VALID_TYP = null;

    private String MOCK_KEY = null;
    private Date now = new Date();
    private int mockPublisher;
    public static final String VALID_AUD = "https://12312312.timetoknow.com/cgs/auth/oauth2/login";
    public final long VALID_EXP = (now.getTime() + 122000) / 1000;
    String mockPublisherExternalId = null;
    private String firstname = "bob";
    private String lastname = "the builder";

    @BeforeClass
    private void initPublisherWithSSO() throws DsException, IOException, JSONException {
        HMAC_SHA256_REQUEST_FORMAT = oAuthValidator.HMAC_SHA256_REQUEST_FORMAT;
        VALID_TYP = oAuthValidator.VALID_TOKEN_TYPE;
        mockPublisher = testUtils.createANewPublisherWithBlossomSSOCredentials(); // this method created a new publisher with the secret key = veryHardSecretKey1234567
        mockPublisherExternalId = externalPartnersService.getExternalPartnersByPublisherId(mockPublisher).get(0).getExternalAccountId();
        List<ExternalPartnerSettings> partners = externalPartnersService.getExternalPartnersByExternalAccountId(mockPublisherExternalId);
        for (ExternalPartnerSettings externalPartner : partners) {
                MOCK_KEY = externalPartner.getSecretKey();
        }
    }

    @AfterClass
    public void removeMockPublisher() throws DsException {
        publisherService.deletePublisher(mockPublisher);
    }

    @Test
    public void SimpleValidRequestValidation() throws JSONException, NoSuchAlgorithmException, InvalidKeyException, UnsupportedEncodingException, DsException {
        String base64User = oAuthJWTGenerator.createBase64UserJsonAsString(firstname, lastname,mockPublisherExternalId, "https://cgs.timetoknow.com/cgs/login/EDITOR", VALID_AUD, VALID_EXP, now.getTime() / 1000, "uniqueId", "testUser");
        String base64Header = oAuthJWTGenerator.createBase64HeaderJsonAsString(HMAC_SHA256_REQUEST_FORMAT, VALID_TYP);
        String signature = oAuthJWTGenerator.calculateSignature(base64Header, base64User, MOCK_KEY);
        String request = base64Header + "." + base64User + "." + signature;
        logger.debug("jwt query: " + request);
        OAuthDetails oAuthDetails = new OAuthDetails(request);
        Assert.assertTrue(oAuthValidator.validateSignature(oAuthDetails, MOCK_KEY));
    }

    @Test
    public void ValidationFailsWithWrongKey() throws JSONException, NoSuchAlgorithmException, InvalidKeyException, UnsupportedEncodingException, DsException {
        String wrongKey = "wrongKey";
        String base64User = oAuthJWTGenerator.createBase64UserJsonAsString(firstname, lastname,"123", "https://cgs.timetoknow.com/cgs/login/EDITOR", VALID_AUD, VALID_EXP, now.getTime(), "uniqueId", "testUser");
        String base64Header = oAuthJWTGenerator.createBase64HeaderJsonAsString(HMAC_SHA256_REQUEST_FORMAT, VALID_TYP);
        String signature = oAuthJWTGenerator.calculateSignature(base64Header, base64User, wrongKey);
        OAuthDetails oAuthDetails = new OAuthDetails(base64Header + "." + base64User + "." + signature);
        Assert.assertFalse(oAuthValidator.validateSignature(oAuthDetails, MOCK_KEY));
    }

    @Test
    public void ValidationFailsWithWrongButValidAlgorithm() throws JSONException, NoSuchAlgorithmException, InvalidKeyException, UnsupportedEncodingException, DsException {
        String wrongAlg = "HmacSHA1";
        String base64User = oAuthJWTGenerator.createBase64UserJsonAsString(firstname, lastname,"123", "https://cgs.timetoknow.com/cgs/login/EDITOR", VALID_AUD, VALID_EXP, now.getTime(), "uniqueId", "testUser");
        String base64Header = oAuthJWTGenerator.createBase64HeaderJsonAsString(wrongAlg, VALID_TYP);
        String signature = oAuthJWTGenerator.calculateSignature(base64Header, base64User, MOCK_KEY);
        OAuthDetails oAuthDetails = new OAuthDetails(base64Header + "." + base64User + "." + signature);
        Assert.assertFalse(oAuthValidator.validateSignature(oAuthDetails, MOCK_KEY));
    }

    @Test
    public void ValidationFailsWithWrongNonValidAlgorithm() throws JSONException, NoSuchAlgorithmException, InvalidKeyException, UnsupportedEncodingException, DsException {
        String wrongAlg = "wrongAlg";
        String base64User = oAuthJWTGenerator.createBase64UserJsonAsString(firstname, lastname,"123", "https://cgs.timetoknow.com/cgs/login/EDITOR", VALID_AUD, VALID_EXP, now.getTime(), "uniqueId", "testUser");
        String base64Header = oAuthJWTGenerator.createBase64HeaderJsonAsString(wrongAlg, VALID_TYP);
        String signature = oAuthJWTGenerator.calculateSignature(base64Header, base64User, MOCK_KEY);
        OAuthDetails oAuthDetails = new OAuthDetails(base64Header + "." + base64User + "." + signature);
        Assert.assertFalse(oAuthValidator.validateSignature(oAuthDetails, MOCK_KEY));
    }

    @Test
    public void ValidationFailsWithWrongTYP() throws JSONException, NoSuchAlgorithmException, InvalidKeyException, UnsupportedEncodingException, DsException {
        String wrongTYP = "wrongTyp";
        String base64User = oAuthJWTGenerator.createBase64UserJsonAsString(firstname, lastname,"123", "https://cgs.timetoknow.com/cgs/login/EDITOR", VALID_AUD, VALID_EXP, now.getTime(), "uniqueId", "testUser");
        String base64Header = oAuthJWTGenerator.createBase64HeaderJsonAsString(HMAC_SHA256_REQUEST_FORMAT, wrongTYP);
        String signature = oAuthJWTGenerator.calculateSignature(base64Header, base64User, MOCK_KEY);
        OAuthDetails oAuthDetails = new OAuthDetails(base64Header + "." + base64User + "." + signature);
        Assert.assertFalse(oAuthValidator.validateSignature(oAuthDetails, MOCK_KEY));
    }

    @Test
    public void ValidationFailsWithWrongScope() throws JSONException, NoSuchAlgorithmException, InvalidKeyException, UnsupportedEncodingException, DsException {
        String wrongScope = "https://google.google.timetoknow.com";
        String base64User = oAuthJWTGenerator.createBase64UserJsonAsString(firstname, lastname,"123", "https://cgs.timetoknow.com/cgs/login/EDITOR", wrongScope, VALID_EXP, now.getTime(), "uniqueId", "testUser");
        String base64Header = oAuthJWTGenerator.createBase64HeaderJsonAsString(HMAC_SHA256_REQUEST_FORMAT, VALID_TYP);
        String signature = oAuthJWTGenerator.calculateSignature(base64Header, base64User, MOCK_KEY);
        OAuthDetails oAuthDetails = new OAuthDetails(base64Header + "." + base64User + "." + signature);
        Assert.assertFalse(oAuthValidator.validateSignature(oAuthDetails, MOCK_KEY));
    }

    @Test(expectedExceptions = DsException.class)
    public void ValidationFailsWithBadRequestStructure() throws JSONException, NoSuchAlgorithmException, InvalidKeyException, UnsupportedEncodingException, DsException {
        String request = "ABC.DFG.FFFF..";
        new OAuthDetails(request);
    }

    @Test(expectedExceptions = DsException.class)
    public void ValidationFailsWithEmptyRequestToken() throws JSONException, NoSuchAlgorithmException, InvalidKeyException, UnsupportedEncodingException, DsException {
        String request = "";
        new OAuthDetails(request);
    }

    @Test(expectedExceptions = DsException.class)
    public void ValidationFailsWithNonBase64RequestStructure() throws JSONException, NoSuchAlgorithmException, InvalidKeyException, UnsupportedEncodingException, DsException {
        String request = "!!@#!$%@$#%@#$%@.ASDFASDF.!@#$!@#$";
        OAuthDetails oAuthDetails = new OAuthDetails(request);
        Assert.assertFalse(oAuthValidator.validateSignature(oAuthDetails, MOCK_KEY));
    }

    @Test(expectedExceptions = DsException.class)
    public void ValidationFailsWithMissingDataOnRequest() throws JSONException, NoSuchAlgorithmException, InvalidKeyException, UnsupportedEncodingException, DsException {
        String base64User = oAuthJWTGenerator.createBase64UserJsonAsString(firstname, lastname,"", "https://cgs.timetoknow.com/cgs/login/EDITOR", VALID_AUD, VALID_EXP, now.getTime(), null, "testUser");
        String base64Header = oAuthJWTGenerator.createBase64HeaderJsonAsString(HMAC_SHA256_REQUEST_FORMAT, VALID_TYP);
        String signature = oAuthJWTGenerator.calculateSignature(base64Header, base64User, MOCK_KEY);
        new OAuthDetails(base64Header + "." + base64User + "." + signature);

    }


    @Test(expectedExceptions = DsException.class)
    public void ValidationFailsWithDateBeforeYesterdayOnRequest() throws JSONException, NoSuchAlgorithmException, InvalidKeyException, UnsupportedEncodingException, DsException {
        Date longTimeAgo = new DateTime(now).minusDays(2).toDate();

        String base64User = oAuthJWTGenerator.createBase64UserJsonAsString(firstname, lastname,"", "https://cgs.timetoknow.com/cgs/login/EDITOR",VALID_AUD , VALID_EXP, longTimeAgo.getTime(), null, "testUser");
        String base64Header = oAuthJWTGenerator.createBase64HeaderJsonAsString(HMAC_SHA256_REQUEST_FORMAT, VALID_TYP);
        String signature = oAuthJWTGenerator.calculateSignature(base64Header, base64User, MOCK_KEY);
        OAuthDetails oAuthDetails = new OAuthDetails(base64Header + "." + base64User + "." + signature);
        Assert.assertFalse(oAuthValidator.validateSignature(oAuthDetails, MOCK_KEY));
    }

    @Test(expectedExceptions = DsException.class)
    public void ValidationFailsWithDateAfterTomorrowOnRequest() throws JSONException, NoSuchAlgorithmException, InvalidKeyException, UnsupportedEncodingException, DsException {
        Date futureTime = new DateTime(now).plusDays(2).toDate();

        String base64User = oAuthJWTGenerator.createBase64UserJsonAsString(firstname, lastname,mockPublisherExternalId, "https://cgs.timetoknow.com/cgs/login/EDITOR", VALID_AUD, VALID_EXP, futureTime.getTime(), null, "testUser");
        String base64Header = oAuthJWTGenerator.createBase64HeaderJsonAsString(HMAC_SHA256_REQUEST_FORMAT, VALID_TYP);
        String signature = oAuthJWTGenerator.calculateSignature(base64Header, base64User, MOCK_KEY);
        new OAuthDetails(base64Header + "." + base64User + "." + signature);

    }

    @Test
    public void ValidationOfUserWithWhiteSpacesShouldFail() throws Exception {
        String blossomUserName = "kirk douglas  ";
        String blossomUserId = "1234";
        String aud = "aud";
        String jwtToken = oAuthJWTGenerator.getJwtString(firstname, lastname, mockPublisherExternalId,"https://cgs.timetoknow.com/cgs/login/EDITOR",aud, 29127,new Date().getTime(),blossomUserId,blossomUserName, "123456");
        OAuthDetails oAuthDetails = new OAuthDetails(jwtToken);
        boolean valid = oAuthValidator.validateSignature(oAuthDetails, MOCK_KEY);
        Assert.assertFalse(valid);


    }
}
