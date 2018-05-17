package org.t2k.cgs.domain.usecases.user.validation;

import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/3/13
 * Time: 5:23 PM
 */
public class MockErrorProducingValidator implements Validator {

    @Override
    public boolean supports(Class<?> clazz) {
        return true;
    }

    @Override
    public void validate(Object target, Errors errors) {
        errors.reject("general.error");
    }
}
