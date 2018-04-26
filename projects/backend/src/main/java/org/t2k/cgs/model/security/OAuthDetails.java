package org.t2k.cgs.model.security;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import org.apache.commons.codec.binary.Base64;
import org.apache.log4j.Logger;
import org.t2k.cgs.dataServices.exceptions.DsException;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 07/05/14
 * Time: 10:36
 */
public class OAuthDetails {

    private static final int NAME_MAX_LENGTH = 100;
    private static Logger logger = Logger.getLogger(OAuthDetails.class);

    /**
     * Local variables *
     */
    private String iss;
    private String scope;
    private String aud;
    private long exp;
    private long iat;
    private String sub;
    private String username;
    private String firstName;
    private String lastName;
    private String catalogUrl;
    private String catalogType;
    private String alg;
    private String typ;
    private String jwsHeader;
    private String userData;
    private String signature;

    /**
     * sets all variables,
     * validating all parameters passed in the queryString.
     * throws an exception if there is an error
     * @param queryString - the jwt query string
     */

    public OAuthDetails(String queryString) throws DsException {
        if (queryString == null || queryString.isEmpty()) {
            String msg = "OAuthDetails: request string for OAuth is empty.";
            logger.warn(msg);
            throw new DsException(msg);
        }

        String[] requestParts = queryString.split("\\.");
        if (requestParts.length != 3) {
            String msg = "OAuthDetails: request string for OAuth authentication is not in the correct format, should contain 3 parts seperated by dots. Actual jwt is: ." + queryString;
            logger.warn(msg);
            throw new DsException(msg);
        }

        for (int i = 0; i < 3; i++) {
            if (requestParts[i] == null || requestParts[i].isEmpty()) {
                String msg = "authentication parts in authentication token cannot be empty. Actual jwt is: "+queryString;
                logger.warn(msg);
                throw new DsException(msg);
            }
        }

        this.jwsHeader = requestParts[0];
        this.userData = requestParts[1];
        this.signature = requestParts[2];

        try {
            setUserDetails(userData);
        }catch (Exception e) {
            String msg = String.format("OAuthDetails: Error parsing userData JSON from base64 encoded text %s", userData);
            logger.warn(msg, e);
            throw new DsException(msg,e);
        }
        try {
            setHeaderData(jwsHeader);
        }catch (Exception e) {
            String msg = String.format("OAuthDetails: Error parsing jwsHeader JSON from base64 encoded text  %s",jwsHeader);
            logger.warn(msg, e);
            throw new DsException(msg,e);
        }
    }


    private void setHeaderData(String jwsHeader) throws Exception {
        JSONObject jwHeaderJson = Base64ToJson(jwsHeader);
        this.alg = jwHeaderJson.getString("alg"); // the signing algorithm
        this.typ = jwHeaderJson.getString("typ"); // the format of the assertion
    }

    private void setUserDetails(String userData) throws Exception {
        JSONObject userJson = Base64ToJson(userData);
        this.iss = userJson.getString("iss");    // The client_id of the application making the access token request.
        this.scope = userJson.getString("scope"); // A space-delimited list of the permissions that the application requests. For T2K Create authentication
        this.aud = userJson.getString("aud"); // A descriptor of the intended target of the assertion
        this.exp = userJson.getLong("exp");  // The expiration time of the assertion, measured in seconds since 00:00:00 UTC, January 1, 1970. This value has a maximum of 1 hour from the issued time.
        this.iat = userJson.getLong("iat"); // The time the assertion was issued, measured in seconds since 00:00:00 UTC, January 1, 1970.
        this.sub = userJson.getString("sub"); // The unique id of the user attempting to login in the external system
        this.username = userJson.getString("username"); // The username of the user attempting to login in the external system

        this.firstName = userJson.getString("first_name"); // making sure the first & last name are in the correct order
        if (this.firstName.length() > NAME_MAX_LENGTH)
            this.firstName = this.firstName.substring(0,NAME_MAX_LENGTH);

        this.lastName = userJson.getString("last_name");
        if (this.lastName.length() > NAME_MAX_LENGTH)
            this.lastName = this.lastName.substring(0,NAME_MAX_LENGTH);

        if (userJson.has("t2k.ext.catalog.url"))
            this.catalogUrl = userJson.getString("t2k.ext.catalog.url");
        if (userJson.has("t2k.ext.catalog.type"))
            this.catalogType = userJson.getString("t2k.ext.catalog.type");
    }

    private JSONObject Base64ToJson(String base64Encoded) throws Exception {
        String decodedText = new String(Base64.decodeBase64(base64Encoded.getBytes()), "UTF-8");

        try {
            return new JSONObject(decodedText);
        } catch (JSONException jsonE) {
            String msg = String.format("Base64ToJson: Could not convert decoded text %s into Json. Original encoded text is: %s", decodedText,base64Encoded);
            logger.error(msg);
            throw new Exception(msg, jsonE);
        }
    }


    public String getIss() {
        return iss;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    public String getAud() {
        return aud;
    }

    public long getIat() {
        return iat;
    }

    public String getSub() {
        return sub;
    }


    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserData() {
        return userData;
    }

    public String getJwsHeader() {
        return jwsHeader;
    }

    public String getSignature() {
        return signature;
    }

    public String getTyp() {
        return typ;
    }

    public String getAlg() {
        return alg;
    }

    public long getExp() {
        return exp;
    }

    @Override
    public String toString() {
        return "OAuthDetails{" +
                "typ='" + typ + '\'' +
                ", iss='" + iss + '\'' +
                ", scope='" + scope + '\'' +
                ", aud='" + aud + '\'' +
                ", exp=" + exp +
                ", iat=" + iat +
                ", sub='" + sub + '\'' +
                ", username='" + username + '\'' +
                ", alg='" + alg + '\'' +
                '}';
    }

    public String getCatalogUrl() {
        return catalogUrl;
    }

    public String getCatalogType() {
        return catalogType;
    }

    public String getLastName() {
        return lastName;
    }

    public String getFirstName() {
        return firstName;
    }
}
