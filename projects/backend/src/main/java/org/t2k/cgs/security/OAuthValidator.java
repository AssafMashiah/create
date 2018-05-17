package org.t2k.cgs.security;

import com.t2k.configurations.Configuration;
import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Collection;
import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 1/6/15
 * Time: 8:07 AM
 */
@Service
public class OAuthValidator {

    private Logger logger = Logger.getLogger(OAuthValidator.class);
    /**
     * Validation variables  - initialized in initVariables method
     */
    private String HMAC_SHA256_JAVA_CRYPTO_FORMAT;
    public String HMAC_SHA256_REQUEST_FORMAT;
    public Collection<String> VALID_SCOPES;
    private String AUD_REGEX_MATCHER;
    public String VALID_TOKEN_TYPE;

    @Autowired
    private Configuration configuration;

    @PostConstruct
    public void initVariables() {
        HMAC_SHA256_JAVA_CRYPTO_FORMAT = configuration.getProperty("ssoSettings.HMAC_SHA256_JAVA_CRYPTO_FORMAT");
        HMAC_SHA256_REQUEST_FORMAT = configuration.getProperty("ssoSettings.HMAC_SHA256_REQUEST_FORMAT");
        VALID_SCOPES = configuration.getProperties("ssoSettings.VALID_SCOPE.").values();
        AUD_REGEX_MATCHER = configuration.getProperty("ssoSettings.AUD_REGEX_MATCHER");
        VALID_TOKEN_TYPE = configuration.getProperty("ssoSettings.VALID_TOKEN_TYPE");
    }

    public boolean validateSignature(OAuthDetails oAuthDetails, String secretKey) {

        if (!areAuthenticationDetailsValid(oAuthDetails)) {
            logger.error(String.format("validateSignature - some of the oAuthDetails passed in JWT are not valid. Details: %s", oAuthDetails));
            return false;
        }

        if (!areSignaturesIdentical(oAuthDetails, secretKey)) {
            logger.error("validateSignature - authentication with secret key failed. Check secret key used");
            return false;
        }
        return true;
    }

    private boolean areAuthenticationDetailsValid(OAuthDetails oAuthDetails) {
        return (userDataIsValid(oAuthDetails) && jwsHeaderIsValid(oAuthDetails));
    }

    private boolean jwsHeaderIsValid(OAuthDetails oAuthDetails) {
        boolean allConstraintsAreValid = true;
        if (!VALID_TOKEN_TYPE.equals(oAuthDetails.getTyp())) {
            allConstraintsAreValid = false;
            logger.error("jwsHeaderIsValid: json's TYP property: " + oAuthDetails.getTyp() + " is not a valid type.");
        }

        if (!HMAC_SHA256_REQUEST_FORMAT.equals(oAuthDetails.getAlg())) {
            allConstraintsAreValid = false;
            logger.error("jwsHeaderIsValid: json's ALG property: " + oAuthDetails.getAlg() + " is not a valid algorithm.");
        }
        return allConstraintsAreValid;
    }

    private boolean userDataIsValid(OAuthDetails oAuthDetails) {
        boolean allConstraintsAreValid = true;

        boolean scopeMatched = false;  //scope validation
        for (String scopePatterns : VALID_SCOPES) {
            Pattern r = Pattern.compile(scopePatterns);
            Matcher m = r.matcher(oAuthDetails.getScope());
            if (m.find()) {
                scopeMatched = true;
            }
        }

        if (!scopeMatched) {
            logger.error("userDataIsValid: json's scope property: " + oAuthDetails.getScope() + " is not a valid scope url.");
            allConstraintsAreValid = false;
        }

        Pattern r = Pattern.compile(AUD_REGEX_MATCHER);
        Matcher m = r.matcher(oAuthDetails.getAud());
        if (!m.find()) {  //aud validation
            logger.error("userDataIsValid: json's aud property: " + oAuthDetails.getAud() + " doesn't match aud options.");
            allConstraintsAreValid = false;
        }

        Date issueDate = new Date(oAuthDetails.getIat() * 1000);
        Date now = new Date();
        Date yesterday = new DateTime(now).minusHours(24).toDate();
        Date tomorrow = new DateTime(now).plusHours(24).toDate();
        if (issueDate.before(yesterday) || issueDate.after(tomorrow)) { //iat validation - iat should be one day before/after current date
            allConstraintsAreValid = false;
            logger.error(String.format("userDataIsValid: json's iat property: %d is not in the defined iat range.", oAuthDetails.getIat()));
        }

        Date expDate = new Date(oAuthDetails.getExp() * 1000);
        if (expDate.before(yesterday)) { //exp validation - exp should be one day before/after current date
            allConstraintsAreValid = false;
            logger.error(String.format("userDataIsValid: jwt has expired. json's exp property: %d is not in the defined range.", oAuthDetails.getIat()));
        }

        if (oAuthDetails.getUsername() == null) {
            allConstraintsAreValid = false;
            logger.error("userDataIsValid: username cannot be null");

        }
        if (oAuthDetails.getUsername().contains(" ")) {
            allConstraintsAreValid = false;
            logger.error("userDataIsValid: a username cannot contain white-spaces");
        }

        return allConstraintsAreValid;
    }

    private Boolean areSignaturesIdentical(OAuthDetails oAuthDetails, String secretKey) {
        try {
            String calculatedSignature = calculateSignature(oAuthDetails.getJwsHeader(), oAuthDetails.getUserData(), oAuthDetails.getAlg(), secretKey);
            boolean isMatch = calculatedSignature.equals(oAuthDetails.getSignature());
            if (isMatch) {
                logger.debug("Signatures match");
                return true;
            } else {
                logger.error("Signatures don't match");
                return false;
            }

        } catch (Exception e) {
            logger.error("Error calculating the signature", e);
            return false;
        }
    }

    private String calculateSignature(String jwsHeader, String userData, String algorithm, String secretKey) throws NoSuchAlgorithmException, InvalidKeyException, IllegalStateException, UnsupportedEncodingException {
        String baseString = String.format("%s.%s", jwsHeader, userData);
        if (!algorithm.equals(HMAC_SHA256_REQUEST_FORMAT)) {
            logger.error(String.format("calculateSignature: signature format %s is not supported. OAuth supports only HMAC+SHA256.\ntoken sent: %s", algorithm, jwsHeader));
            return null;
        }
        Mac mac = Mac.getInstance(HMAC_SHA256_JAVA_CRYPTO_FORMAT);
        SecretKeySpec secret = new SecretKeySpec(secretKey.getBytes(), mac.getAlgorithm());
        mac.init(secret);
        byte[] digest = mac.doFinal(baseString.getBytes());
        logger.debug("Signature calculation completed");
        return Base64.encodeBase64String(digest);
    }

}
