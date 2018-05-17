package org.t2k.cgs.domain.usecases.user.validation;

import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;

import java.util.regex.Pattern;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/4/13
 * Time: 4:59 PM
 */
public class BaseUserValidator implements Validator {

    private static final Pattern USER_NAME_VALIDATION_PATTERN = Pattern.compile("^[a-zA-Z0-9_\\.-\\@]*$");
    private static final Pattern PASSWORD_VALIDATION_PATTERN = Pattern.compile("^[a-zA-Z0-9\\%\\$\\!\\#\\.\\&\\^\\@]*$");
    private static final Pattern EMAIL_VALIDATION_PATTERN = Pattern.compile(
            "^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@"
                    + "[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$");
    private static final int NAME_MAX_LEN = 100;
    private static final int USERNAME_MIN_LEN = 3;
    private static final int USERNAME_MAX_LEN = 150;
    private static final int PASSWORD_MIN_LEN = 6;
    private static final int PASSWORD_MAX_LEN = 100;

    @Override
    public boolean supports(Class<?> clazz) {
        return SimpleCgsUserDetails.class.isAssignableFrom(clazz);
    }

    @Override
    public void validate(Object target, Errors e) {
        ValidationUtils.rejectIfEmptyOrWhitespace(e, "username", "userName.empty", "User name can not be empty");
        ValidationUtils.rejectIfEmptyOrWhitespace(e, "email", "email.empty", "Email can not be empty");
        ValidationUtils.rejectIfEmptyOrWhitespace(e, "firstName", "firstName.empty", "First Name can not be empty");
        ValidationUtils.rejectIfEmptyOrWhitespace(e, "lastName", "lastName.empty", "Last Name can not be empty");

        SimpleCgsUserDetails user = (SimpleCgsUserDetails) target;

        if(user.getUsername() != null && (user.getUsername().length() < USERNAME_MIN_LEN || user.getUsername().length() > USERNAME_MAX_LEN)) {
            e.rejectValue("username", "userName.size", "User name must be between " + USERNAME_MIN_LEN + " and " + USERNAME_MAX_LEN + " characters long");
        }
        if(user.getFirstName() != null && (user.getFirstName().length() > NAME_MAX_LEN)) {
            e.rejectValue("firstName", "firstName.size", "firstName name less then "+ NAME_MAX_LEN + " characters long");
        }
        if(user.getLastName() != null && (user.getLastName().length() > NAME_MAX_LEN)) {
            e.rejectValue("lastName", "lastName.size", "lastName name less then "+ NAME_MAX_LEN + " characters long");
        }

        if (!nullOrMatches(user.getUsername(), USER_NAME_VALIDATION_PATTERN)) {
            e.rejectValue("username", "userName.invalid", "Invalid user name, only a-z,A-Z,0-9,_,-,. characters are allowed");
        }

        if (!nullOrMatches(user.getEmail(), EMAIL_VALIDATION_PATTERN)) {
            e.rejectValue("email", "email.invalid", "Invalid email");
        }
    }

    protected void validatePassword(Object target, Errors e) {

        SimpleCgsUserDetails user = (SimpleCgsUserDetails) target;

        if (!nullOrMatches(user.getPassword(), PASSWORD_VALIDATION_PATTERN)) {
            e.rejectValue("password", "password.invalid", "Invalid password characters detected, must be a-z,A-Z,0-9,%,$,!,#,.,&,^,@");
        }
        if (user.getPassword() != null) {
            if (user.getPassword().length() < PASSWORD_MIN_LEN || user.getPassword().length() > PASSWORD_MAX_LEN) {
                e.rejectValue("password", "password.size", "Invalid password size, must be between 6 and 20");
            }
        }
    }

    protected boolean nullOrMatches(String str, Pattern pattern) {
        return str == null || pattern.matcher(str).matches();
    }
}
