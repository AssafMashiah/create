package org.t2k.cgs.user.validation;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.t2k.cgs.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.security.RelatesTo;
import org.t2k.cgs.user.MockValidCGSSimpleUserDetails;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import static org.testng.Assert.*;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/3/13
 * Time: 4:31 PM
 */
@Test
public class UpdateUserValidatorTest {

    private Validator updateNameValidator;
    private SimpleCgsUserDetails defaultUser;


    @BeforeMethod
    private void beforeTest() {
        this.updateNameValidator = new UpdateUserValidator();

        defaultUser = new MockValidCGSSimpleUserDetails();
        defaultUser.setUserId(1);
        defaultUser.setRelatesTo(new RelatesTo(2,"PUBLISHER"));
    }

    @Test
    public void supportTest() throws Exception {
        assertTrue(this.updateNameValidator.supports(SimpleCgsUserDetails.class));
    }

    @Test
    public void noValidationErrorsTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        ValidationUtils.invokeValidator(this.updateNameValidator, defaultUser, errors);

        if (errors.hasErrors()) {
            assertFalse(errors.hasErrors(), "Validation errors found" + errors.toString());
        }
    }

    @Test
    public void withPasswordTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setPassword("123456");

        ValidationUtils.invokeValidator(this.updateNameValidator, defaultUser, errors);

        assertTrue(!errors.hasErrors());
        assertSame(errors.getErrorCount(), 0);
    }

    @Test
    public void withoutPasswordTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setPassword(null);

        ValidationUtils.invokeValidator(this.updateNameValidator, defaultUser, errors);

        assertTrue(!errors.hasErrors());
        assertSame(errors.getErrorCount(), 0);
    }

    @Test
    public void withoutUserIdTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setUserId(null);

        ValidationUtils.invokeValidator(this.updateNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }

    @Test
    public void withoutPublisherIdTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setRelatesTo(null);

        ValidationUtils.invokeValidator(this.updateNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }

}
