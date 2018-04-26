package org.t2k.cgs.rest;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.dataServices.exceptions.ValidationException;
import org.t2k.cgs.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.security.Customization;
import org.t2k.cgs.security.OAuthSecurityService;
import org.t2k.cgs.security.SimpleCgsUserRole;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;
import org.t2k.cgs.user.UserService;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 25/06/13
 * Time: 14:46
 */
@Controller
@AllowedForAllUsers
public class UsersController {
    private static Logger logger = Logger.getLogger(UsersController.class);

    @Autowired
    private OAuthSecurityService oAuthSecurityService;

    @Autowired
    UserService userService;

    @RequestMapping(value = "/accounts/{accountId}/users", method = RequestMethod.POST)
    public
    @ResponseBody
    SimpleCgsUserDetails addUser(@PathVariable int accountId,
                                 @RequestParam(value = "roleId", required = false) String roleId,
                                 @RequestBody SimpleCgsUserDetails cgsUserDetails) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("addUser");
        }
        try {
            SimpleCgsUserDetails fullUser = userService.add(cgsUserDetails, roleId,true);
            // don't send the password back to the client
            fullUser.setPassword(null);
            return fullUser;
        } catch (ValidationException e) {
            //don't log, useless
            throw e;
        } catch (DsException e) {
            logger.error("addUser error.", e);
            throw e;
        }

    }

    @RequestMapping (value = "/accounts/{accountId}/users/roles", method = RequestMethod.GET)
    public
    @ResponseBody
    List<SimpleCgsUserRole> getRoles(@RequestParam(value = "type", required = true) String type,
                               @PathVariable int accountId) throws Exception {
        if (logger.isDebugEnabled()) {
            logger.debug("getRoles");
        }
        try {
             return userService.getRoles(accountId, type);
        } catch (DsException e) {
            logger.error("getRoles error.", e);
            throw e;
        }
    }

    @RequestMapping(value = "/accounts/{accountId}/users/publisher", method = RequestMethod.GET)
    public
    @ResponseBody
    List<SimpleCgsUserDetails> getUsersOfPublisher(@RequestParam(value = "role", required = false) String role,
                                                   @PathVariable int accountId) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("getUsersOfPublisher");
        }
        try {
            // don't send the passwords back to the client
            List<SimpleCgsUserDetails> users = userService.getByPublisherAccountIdAndRole(accountId, role);
            for(SimpleCgsUserDetails user : users) {
                user.setPassword(null);
            }
            return users;
        } catch (DsException e) {
            logger.error("getUsers error.", e);
            throw e;
        }

    }

    @RequestMapping(value = "/accounts/{accountId}/users/group", method = RequestMethod.GET)
    public
    @ResponseBody
    List<SimpleCgsUserDetails> getUsersOfGroup(@RequestParam(value = "role", required = false) String role,
                                               @PathVariable int accountId) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("getUsersOfGroup");
        }
        try {

            // don't send the passwords back to the client
            List<SimpleCgsUserDetails> users = userService.getByGroupAccountIdAndRole(accountId, role);
            for(SimpleCgsUserDetails user : users) {
                user.setPassword(null);
            }
            return users;
        } catch (DsException e) {
            logger.error("getUsers error.", e);
            throw e;
        }

    }

    @RequestMapping(value = "/accounts/{accountId}/users/{userId}/showHintsMode/", method = RequestMethod.PUT)
    public
    @ResponseBody
    void setUserShowHintsMode(
            @PathVariable int accountId,
            @PathVariable int userId,
            @RequestParam(value = "mode", required = true) String showHintsMode) throws DsException {
        logger.debug("showHintsMode to "+showHintsMode);
        try {
            SimpleCgsUserDetails user = userService.getById(userId, false);
            Customization cust = user.getCustomization();
            cust.setCgsHintsShowMode(showHintsMode);
            user.setCustomization(cust);
            userService.update(user, userId, user.getRole().getId());
        } catch (DsException e) {
            logger.error("Customization/ShowHintsMode error.", e);
            throw e;
        }

    }

    @RequestMapping(value = "/accounts/{accountId}/users/{userId}", method = RequestMethod.GET)
    public
    @ResponseBody
    SimpleCgsUserDetails getUser(
            @PathVariable int accountId,
            @PathVariable int userId) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("getUser");
        }
        SimpleCgsUserDetails user = userService.getById(userId, false);
        // don't send the password  back to the client
        user.setPassword(null);
        return user;
    }

    @RequestMapping(value = "/accounts/{accountId}/users/{userId}", method = RequestMethod.PUT)
    public
    @ResponseBody
    void updateUser(@RequestParam(value = "roleId", required = true) String roleId,
                    @PathVariable int accountId,
                    @PathVariable int userId,
                    @RequestBody SimpleCgsUserDetails user) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("updateUser " + user.toString());
        }
        try {
            userService.update(user, userId, roleId);
        } catch (ValidationException e) {
            //don't log, useless
            throw e;
        } catch (DsException e) {
            logger.error("updateUser error.", e);
            throw e;
        }

    }

    @RequestMapping(value = "/accounts/{accountId}/users/{userId}", method = RequestMethod.DELETE)
    public
    @ResponseBody
    void deleteUserFromPublisher(
            @PathVariable int accountId, @PathVariable int userId) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("deletePublisherAdminUser");
        }
        try {
            userService.delete(userId);
        } catch (DsException e) {
            logger.error("deletePublisherAdminUser error.", e);
            throw e;
        }

    }

}
