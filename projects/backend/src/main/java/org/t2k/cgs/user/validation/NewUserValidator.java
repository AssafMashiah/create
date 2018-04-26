package org.t2k.cgs.user.validation;

import org.springframework.stereotype.Service;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/3/13
 * Time: 12:24 PM
 */
@Service
public class NewUserValidator extends BaseUserValidator implements Validator {

    @Override
    public void validate(Object target, Errors e) {
        super.validate(target, e);
        ValidationUtils.rejectIfEmptyOrWhitespace(e, "password", "password.empty", "Password can not be empty");
        super.validatePassword(target, e);
    }
}
