package org.t2k.cgs.domain.usecases.user.validation;

import org.springframework.stereotype.Service;
import org.springframework.validation.Errors;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/4/13
 * Time: 5:03 PM
 */
@Service
public class UpdateUserValidator extends BaseUserValidator implements Validator {


    @Override
    public void validate(Object target, Errors e) {
        super.validate(target, e);

        //check that userId and publisherId exists and valid
        ValidationUtils.rejectIfEmptyOrWhitespace(e, "userId", "userId.empty", "userId can not be empty");
        ValidationUtils.rejectIfEmptyOrWhitespace(e, "relatesTo", "relatesTo.empty", "relatesTo can not be empty");

        //check that if a password exits it's valid
        SimpleCgsUserDetails user = (SimpleCgsUserDetails) target;
        if (user.getPassword() != null) {
            super.validatePassword(target, e);
        }
    }
}
