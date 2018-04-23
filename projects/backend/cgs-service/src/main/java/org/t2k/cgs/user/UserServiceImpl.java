package org.t2k.cgs.user;

import com.mongodb.DBRef;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.t2k.cgs.dao.user.UsersDao;
import org.t2k.cgs.dao.util.UniqueIdDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.dataServices.exceptions.ErrorCodes;
import org.t2k.cgs.dataServices.exceptions.ValidationException;
import org.t2k.cgs.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.security.AuthenticationHolder;
import org.t2k.cgs.security.CGSUserDetails;
import org.t2k.cgs.security.ExternalSetting;
import org.t2k.cgs.security.SimpleCgsUserRole;
import org.t2k.cgs.user.validation.NewUserValidator;
import org.t2k.cgs.user.validation.UpdateUserValidator;
import org.t2k.sample.dao.exceptions.DaoDuplicateKeyException;
import org.t2k.sample.dao.exceptions.DaoException;

import javax.inject.Inject;
import java.util.Arrays;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 25/06/13
 * Time: 14:55
 */
@Service
public class UserServiceImpl implements UserService {

    public static final String GROUP_ADMIN = "GROUP_ADMIN";
    private static final String BLOSSOM = "blossom";
    private static final String URL = "url";

    private static Logger logger = Logger.getLogger(UserServiceImpl.class);

    private UsersDao usersDao;
    private UniqueIdDao uniqueIdDao;
    private Validator newUserValidator;
    private Validator updateUserValidator;

    @Inject
    public UserServiceImpl(UsersDao usersDao,
                           UniqueIdDao uniqueIdDao) {
        Assert.notNull(usersDao);
        Assert.notNull(uniqueIdDao);

        this.usersDao = usersDao;
        this.uniqueIdDao = uniqueIdDao;

        this.newUserValidator = new NewUserValidator();
        this.updateUserValidator = new UpdateUserValidator();
    }

    @Override
    public SimpleCgsUserDetails add(SimpleCgsUserDetails user, String roleId, Boolean validateUserDetails) throws DsException {

        // validate user object
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(user, "user");

        if (validateUserDetails)
            ValidationUtils.invokeValidator(this.newUserValidator, user, errors);

        DBRef role = null;

        if (errors.hasErrors()) {
            logger.error(String.format("Cannot add user %s, there are validation errors: %s", user.getUsername(), Arrays.toString(errors.getAllErrors().toArray())));
            throw new ValidationException(errors, ErrorCodes.FIELD_NOT_VALID, "Not a valid user");
        }

        try {
            if (roleId == null &&
                    user.getRelatesTo().getType().equals("GROUP")) {
                role = usersDao.getRoleIdRefByName(GROUP_ADMIN);
            } else if (roleId == null &&
                    user.getRelatesTo().getType().equals("PUBLISHER")) {
                role = usersDao.getRoleIdRefByName("ACCOUNT_ADMIN");
            } else {
                role = usersDao.getRoleIdRefById(roleId);
            }

        } catch (DaoException e) {
            throw new DsException("Failed to get role for user", e);
        }

        logger.debug("validation successful for user object");

        //get next available id to set account Id
        int newId = -1;
        try {
            newId = uniqueIdDao.getNextId("user");
        } catch (DaoException e) {
            throw new DsException("Failed generating Id for new user", e);
        }

        if (logger.isDebugEnabled()) {
            logger.debug("New Id generated, id:" + newId);
        }
        user.setUserId(newId);
        //check authorization if a user with the provided role can be generated

        //TODO - authorization validation ?!

        //save user
        try {
            usersDao.insert(user, role);
        } catch (DaoDuplicateKeyException e) {
            logger.error(String.format("Error creating user: %s", user));
            throwValidationException(e);
        } catch (DaoException e) {
            logger.error(String.format("Error creating user: %s", user));
            throw new DsException("Failed saving new user to storage", e);
        }

        return user;
    }

    private void throwValidationException(DaoDuplicateKeyException e) throws ValidationException {

        if ("username".equals(e.getViolatingField())) {
            throw new ValidationException("userName.exists", ErrorCodes.USERNAME_EXISTS, "User name with same value already exists in the system");
        } else if ("email".equals(e.getViolatingField())) {
            throw new ValidationException("email.exists", ErrorCodes.EMAIL_EXISTS, "Email with same value already exists in the system");
        } else {
            throw new ValidationException("unknown.exists", ErrorCodes.USER_NOT_VALID, "Unknown duplicate index error");
        }
    }

    @Override
    public void update(SimpleCgsUserDetails user, int userId, String roleId) throws DsException {

        if (logger.isDebugEnabled()) {
            logger.debug("update userId=" + userId + " user:" + user.toString());
        }

        // validate user object
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(user, "user");

        ValidationUtils.invokeValidator(this.updateUserValidator, user, errors);

        DBRef role;

        if (errors.hasErrors()) {
            String msg = "Not a valid user object. Validation errors: " + Arrays.toString(errors.getAllErrors().toArray());
            logger.error(msg);
            throw new ValidationException(errors, ErrorCodes.FIELD_NOT_VALID, "Not a valid user object");
        }

        if (userId != user.getUserId()) {
            throw new ValidationException("userId.mismatch", ErrorCodes.ID_MISSING, "User details do not match in userId");
        }

        try {
            if (roleId == null &&
                    user.getRelatesTo().getType().equals("GROUP")) {
                role = usersDao.getRoleIdRefByName("GROUP_ADMIN");
            } else if (roleId == null &&
                    user.getRelatesTo().getType().equals("PUBLISHER")) {
                role = usersDao.getRoleIdRefByName("ACCOUNT_ADMIN");
            } else {
                role = usersDao.getRoleIdRefById(roleId);
            }
        } catch (DaoException e) {
            throw new DsException("Failed to get role for user", e);
        }

//        if (publisherAccountId != user.getPublisherAccountId()) {
//            throw new ValidationException("publisherAccountId.mismatch", ErrorCodes.PUBLISHER_ID_DISCREPANCY, "User details do not match in publisher accountId");
//        }

        try {
            usersDao.update(user, role);
        } catch (DaoDuplicateKeyException e) {
            throwValidationException(e);
        } catch (DaoException e) {
            throw new DsException("Failed to update user, id: " + userId, e);
        }

    }

    @Override
    public void delete(int userId) throws DsException {
        try {
            usersDao.delete(userId);
        } catch (DaoException e) {
            throw new DsException("Failed deleting user, id:" + userId, e);
        }
    }


    @Override
    public SimpleCgsUserDetails getById(int userId, Boolean isSecured) {
        SimpleCgsUserDetails user = usersDao.getById(userId);
        if (isSecured) {
            user.setPassword(null);
        }
        return user;
    }

    @Override
    public List<SimpleCgsUserRole> getRoles(int accountId, String type) throws DsException {
        List<SimpleCgsUserRole> result = null;

        try {
            result = usersDao.getRolesByAccountId(accountId, type);

            if (result.isEmpty()) {
                result = usersDao.getRolesByAdminUser();
            }
        } catch (DaoException e) {
            throw new DsException("Was unable to get roles for accountId: " + accountId, e);
        }

        return result;
    }

    @Override
    public List<SimpleCgsUserDetails> getByPublisherAccountIdAndRole(int publisherAccountId, String role) throws DsException {

        List<SimpleCgsUserDetails> results = null;

        try {
            results = usersDao.getByPublisherAccountId(publisherAccountId, role);
        } catch (DaoException e) {
            throw new DsException("Was unable to get user list for accountId: " + publisherAccountId, e);
        }

        return results;
    }


    @Override
    public List<SimpleCgsUserDetails> getByGroupAccountIdAndRole(int accountId, String role) throws DsException {
        List<SimpleCgsUserDetails> results = null;

        try {
            results = usersDao.getByGroupAccountId(accountId, role);
        } catch (DaoException e) {
            throw new DsException("Was unable to get user list for accountId: " + accountId, e);
        }

        return results;
    }

    @Override
    public SimpleCgsUserDetails getByAccountAndExternalId(int publisherId, String externalId) throws DsException {
        try {
            return usersDao.getByAccountAndExternalId(publisherId, externalId);
        } catch (DaoException de) {
            throw new DsException(de);
        }
    }

    @Override
    public DBRef getRoleIdRefByName(String roleName) throws DsException {
        try {
            return usersDao.getRoleIdRefByName(roleName);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public SimpleCgsUserDetails getByName(String userName) {
        return usersDao.getByName(userName);
    }

    @Override
    public String getBlossomUrl(SimpleCgsUserDetails userDetails) {
        if (userDetails.getCustomization() == null)
            return null;
        List<ExternalSetting> userExternalSettings = userDetails.getCustomization().getExternalSettings();
        if (userExternalSettings == null)
            return null;

        for (ExternalSetting setting : userExternalSettings) {
            if (setting.getType().equals(BLOSSOM)) {
                return setting.getUrl();
            }
        }
        logger.debug(String.format("URL key or any blossom setting were not found for user: %s", userDetails.getUsername()));
        return null; // URL key or any blossom setting were not found
    }

    @Override
    public boolean isUserRelatedToBlossom(SimpleCgsUserDetails userDetails) {
        return getBlossomUrl(userDetails) != null;
    }

    @Override
    public CGSUserDetails getCurrentUser() {
        return AuthenticationHolder.getUserDetails();
    }

    @Override
    public void removeUsersByPublisherAccountId(int publisherAccountId) throws DsException {
        try {
            this.usersDao.deleteByPublisherAccountId(publisherAccountId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }
}
