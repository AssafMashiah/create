package org.t2k.cgs.security;

import com.mongodb.DBRef;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.security.OAuthDetails;
import org.t2k.cgs.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.publisher.ExternalPartnersService;
import org.t2k.cgs.publisher.PublisherService;
import org.t2k.cgs.user.UserService;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 07/05/14
 * Time: 15:15
 */
@Service
public class OAuthSecurityServiceImpl implements OAuthSecurityService {

    public static final String BLOSSOM = "blossom";
    public static final String URL = "url";
    private static Logger logger = Logger.getLogger(OAuthSecurityService.class);

    @Autowired
    private UserService userService;

    @Autowired
    private PublisherService publisherService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private OAuthValidator oAuthValidator;

    @Autowired
    private ExternalPartnersService externalPartnersService;

    @Override
    public boolean authenticate(String jwtToken, HttpServletRequest request) throws DsException {

        try {
            OAuthDetails oAuthDetails = new OAuthDetails(jwtToken); // in case of a failure creating oAuthDetails - an exception is thrown

            // use the iss field as the externalAccountId key to get data from DB
            List<ExternalPartnerSettings> partners = externalPartnersService.getExternalPartnersByExternalAccountId(oAuthDetails.getIss());

            if (partners.isEmpty() || partners.get(0).getSecretKey() == null) {
                logger.debug(String.format("No secret key was configured for publisher %s", oAuthDetails.getIss()));
                invalidateAuthentication();
                return false;
            }
            String secretSsoKey = partners.get(0).getSecretKey();

            if (!oAuthValidator.validateSignature(oAuthDetails, secretSsoKey)) {
                logger.debug(String.format("Token %s is not valid", jwtToken));
                invalidateAuthentication();
                return false;
            }

            //save user into local db
            SimpleCgsUserDetails userDetails = saveUserDetails(oAuthDetails);

            //plugin into spring authentication service
            //used example from http://token-spring-security.blogspot.co.il/
            Authentication user = new UsernamePasswordAuthenticationToken(userDetails.getUsername(), userDetails.getPassword());
            request.getSession(true); // creates jsession id if neccesary. We need this because the request is not generated from CGS, so it doesn't already have a session id
            ((AbstractAuthenticationToken)user).setDetails(new WebAuthenticationDetails(request));
            Authentication result = authenticationManager.authenticate(user);
            SecurityContextHolder.getContext().setAuthentication(result); // TODO: make sure this is thread locale
            return true;

        } catch (Exception e) {
            logger.error(String.format("Failure to authenticate user: %s", e.getMessage()), e);
            return false;
        }
    }

    @Override
    public void invalidateAuthentication() {
        SecurityContextHolder.getContext().setAuthentication(null);
    }

    public SimpleCgsUserDetails saveUserDetails(OAuthDetails oauthUserDetails) throws DsException {
        logger.debug(String.format("Converting and saving user details for: %s", oauthUserDetails));
        SimpleCgsUserDetails userDetails = convert(oauthUserDetails);
        SimpleCgsUserDetails userDetailsFromDb = userService.getByAccountAndExternalId(userDetails.getRelatesTo().getId(), userDetails.getExternalId());
        String roleId = extractRoleIdRef(oauthUserDetails.getScope());
         // TODO: replace with use of usersService
        if (userDetailsFromDb == null) {
            userDetails.setPassword(generateRandomPassword());
            userService.add(userDetails, roleId, false);  // add a new user with role - @roleId
            // get user from DB with his updated role
            userDetailsFromDb = userService.getByAccountAndExternalId(userDetails.getRelatesTo().getId(), userDetails.getExternalId());
            logger.debug(String.format("Converted user into a user with username: %s, publisherID: %d", userDetailsFromDb.getUsername(), userDetailsFromDb.getRelatesTo().getId()));
            return userDetailsFromDb;

        } else {
            //username cannot be changed in cgs. See also UserMongoDao.updateUser
            if (!userDetailsFromDb.getUsername().equals(userDetails.getUsername())) {
                logger.warn(String.format("Username %s has been changed to %s, but it will not be updated in db", userDetailsFromDb.getUsername(), userDetails.getUsername()));
            }

            boolean userNeedsToBeResaved = false;

            // update the catalog URL
            if (userDetailsFromDb.getCustomization() != null && userDetailsFromDb.getCustomization().getExternalSettings() != null) {
                List<ExternalSetting> userExternalSettings = userDetailsFromDb.getCustomization().getExternalSettings(); // get existing settings
                for (ExternalSetting setting : userExternalSettings) {      // override blossom url if exists
                    if (setting.getType() !=null && setting.getType().equals(BLOSSOM)) {
                        if (!setting.getUrl().equals(oauthUserDetails.getCatalogUrl())) { //update to the url from jwt token
                            setting.setUrl(oauthUserDetails.getCatalogUrl());
                            userNeedsToBeResaved = true;
                        }
                        break;
                    }
                }
            } else if (userDetailsFromDb.getCustomization() == null){ // if there is no customization - set the one created by the "convert" method
                userDetailsFromDb.setCustomization(userDetails.getCustomization());
                userNeedsToBeResaved = true;
            } else if (userDetailsFromDb.getCustomization().getExternalSettings() == null){ // if customization exists but has no elements
                userDetailsFromDb.getCustomization().setExternalSettings(Arrays.asList(new ExternalSetting(oauthUserDetails.getCatalogType(),oauthUserDetails.getCatalogUrl())));
                userNeedsToBeResaved = true;
            }

            if (!roleId.equals(userDetailsFromDb.getRole().getName()) || userNeedsToBeResaved) { // if we need to update the roll, or to update something else - update user
                logger.debug(String.format("Resaving user %s", userDetailsFromDb.getUsername()));
                userService.update(userDetailsFromDb, userDetailsFromDb.getUserId(), roleId);
                // get user from DB with his updated role
                userDetailsFromDb = userService.getByAccountAndExternalId(userDetails.getRelatesTo().getId(), userDetails.getExternalId());
            }
        }
        logger.debug(String.format("Converted user into a user with username: %s, publisherID: %d", userDetailsFromDb.getUsername(), userDetailsFromDb.getRelatesTo().getId()));
        //reread from db
        return userDetailsFromDb;
    }

    public SimpleCgsUserDetails convert(OAuthDetails oAuthDetails) throws DsException {
        List<ExternalPartnerSettings> partners = externalPartnersService.getExternalPartnersByExternalAccountId(oAuthDetails.getIss());
        if (partners == null || partners.size() == 0) {
            String msg = String.format("Could not convert jwt details into a cgs user: External account id " + oAuthDetails.getIss() + " is not related to any cgs account");
            throw new DsException(msg);
        }
        int accountId = partners.get(0).getAccountId(); // getting the account id by externalAccountId
        if (accountId == 0) {
            String msg = String.format("convert: Error connecting the user from SSO into a Create account, oAuthDetails: %s", oAuthDetails);
            logger.error(msg);
            throw new DsException(msg);
        }

        CGSAccount publisherObj = publisherService.getAccountAuthenticationData(accountId, false);
        String hintsShowMode = publisherObj.getAccountCustomization().isEnableCoachMarks() ? "showAll" : "hideAll";
        Customization userCustomization = new Customization(hintsShowMode);

        if (oAuthDetails.getCatalogType() != null && oAuthDetails.getCatalogUrl() != null) {
            ExternalSetting externalSetting = new ExternalSetting(oAuthDetails.getCatalogType(), oAuthDetails.getCatalogUrl());
            userCustomization.setExternalSettings(Arrays.asList(externalSetting));
        }

        String username = String.format("%s_%s_%d", oAuthDetails.getUsername(), oAuthDetails.getSub(), accountId); // formatting the new username
        String prefixForEmail =  username.contains("@") ? username.replace("@",".") : username;
        String email = String.format("%s@NotARealEmail.ext", prefixForEmail);
        return new SimpleCgsUserDetails(oAuthDetails.getFirstName(), oAuthDetails.getLastName(), username, new RelatesTo(accountId, "PUBLISHER"), email, oAuthDetails.getSub(), userCustomization);
    }

    /**
     * @param jwtScope - the scope passed in the jwt string, representing a valid OEL in cgs.
     *                 for example: //"scope":" https://cgs.timetoknow.com/cgs/login/EDITOR",
     * @return the DBRef id for that role in roles collection
     * @throws DsException
     */
    public String extractRoleIdRef(String jwtScope) throws DsException {
        String roleName = jwtScope.substring(jwtScope.lastIndexOf("/") + 1);

        DBRef role = userService.getRoleIdRefByName(roleName);
        if (role == null) {
            throw new DsException(String.format("Failure to find role %s", roleName));
        }
        return role.getId().toString();
    }

    private String generateRandomPassword() {
        return UUID.randomUUID().toString().replaceAll("-", "").substring(0, 15);
    }

    public void setAuthenticationManager(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }


}
