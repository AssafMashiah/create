package org.t2k.security;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;
import org.t2k.cgs.dataServices.exceptions.DsException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 11/05/14
 * Time: 12:17
 */
public class OAuthJWTGenerator {

    private String HMAC_SHA256_JAVA_CRYPTO_FORMAT = "HmacSHA256";
    private String HMAC_SHA256_REQUEST_FORMAT = "HS256";

    private static Logger logger = Logger.getLogger(OAuthJWTGenerator.class);

    public OAuthJWTGenerator(){}

    public String getJwtString(String first_name, String last_name, String accountId, String scope, String aud, long exp, long iat, String sub, String username, String secretKey) throws DsException {
        try{
            String base64User = createBase64UserJsonAsString(first_name, last_name, accountId, scope, aud, exp, iat, sub, username);
            String base64Header = createBase64HeaderJsonAsString(HMAC_SHA256_REQUEST_FORMAT, "JWT");
            String signature = calculateSignature(base64Header, base64User, secretKey);
            String request = base64Header+"."+base64User+"."+signature;
            logger.debug("jwt query: "+request);
            return request;
        } catch (Exception e){
            throw new DsException(e);
        }
    }



    public String createBase64UserJsonAsString(String first_name, String last_name, String iss, String scope, String aud, long exp, long iat, String sub, String username) throws JSONException {
        JSONObject user = new JSONObject();
        user.put("iss",iss);
        user.put("scope",scope);
        user.put("aud",aud);
        user.put("exp",exp);
        user.put("iat",iat);
        user.put("sub",sub);
        user.put("username",username);
        user.put("first_name",first_name);
        user.put("last_name",last_name);

        return Base64.encodeBase64String(user.toString().getBytes());
    }

    public String createBase64HeaderJsonAsString(String alg, String typ) throws JSONException {
        JSONObject user = new JSONObject();
        user.put("alg",alg);
        user.put("typ",typ);
        return Base64.encodeBase64String(user.toString().getBytes());
    }
    public String calculateSignature(String jwsHeader, String userData, String secretKey) throws NoSuchAlgorithmException, InvalidKeyException, IllegalStateException, UnsupportedEncodingException {
        String baseString = jwsHeader + "." + userData;

        Mac mac = Mac.getInstance(HMAC_SHA256_JAVA_CRYPTO_FORMAT);
        SecretKeySpec secret = new SecretKeySpec(secretKey.getBytes(), mac.getAlgorithm());
        mac.init(secret);
        byte[] digest = mac.doFinal(baseString.getBytes());
        return Base64.encodeBase64String(digest);
    }
}
