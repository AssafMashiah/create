package org.t2k.cgs.user.validation;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.t2k.cgs.model.user.SimpleCgsUserDetails;
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
public class NewUserValidatorTest {

    private Validator newNameValidator;
    private SimpleCgsUserDetails defaultUser;


    @BeforeMethod
    private void beforeTest() {
        this.newNameValidator = new NewUserValidator();

        defaultUser = new MockValidCGSSimpleUserDetails();
    }

    @Test
    public void supportTest() throws Exception {
        assertTrue(this.newNameValidator.supports(SimpleCgsUserDetails.class));
    }

    @Test
    public void noValidationErrorsTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        if (errors.hasErrors()) {
            assertFalse(errors.hasErrors(), "Validation errors found" + errors.toString());
        }
    }

    @Test
    public void passwordTooShortTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setPassword("1234");

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }

    @Test
    public void passwordTooLongTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");
        StringBuilder sb = new StringBuilder("");
        for(int i=0; i<200; i++) {
            sb.append("a");
        }
        defaultUser.setPassword(sb.toString());

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }


    @Test
    public void passwordBadCharactersTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setPassword("asdfSD~~~");

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }

    @Test
    public void userNameTooShortTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setUsername("a");

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }

    @Test
    public void userNameTooLongTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");
        StringBuilder sb = new StringBuilder("");
        for(int i=0; i<200; i++) {
            sb.append("a");
        }
        defaultUser.setPassword(sb.toString());

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }

    @Test
    public void userNameBadCharactersTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setUsername("asdfSD~");

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);

        errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setUsername("asd fSD");

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }

    @Test
    public void lastNameWhiteSpacesTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setLastName("asda asd");

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertFalse(errors.hasErrors());


    }

    @Test
    public void lastNameSuccessTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setLastName("Az2828AWsswE");

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertFalse(errors.hasErrors());

    }
    @Test
    public void lastNameTooLongTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");
        StringBuilder sb = new StringBuilder("");
        for(int i=0; i<2200; i++) {
            sb.append("a");
        }
        defaultUser.setLastName(sb.toString());

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);

    }
    @Test
    public void invalidEmailTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setEmail("mmmm@d.");

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }

    @Test
    public void emptyNamesTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setFirstName(null);
        defaultUser.setLastName(null);

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 2);
    }

    @Test
    public void emptyEmailTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setEmail(null);

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }

    @Test
    public void emptyPasswordTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setPassword(null);

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }

    @Test
    public void emptyUsernameTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setUsername(null);

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }

   /* @Test
    public void emptyCustomizeTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setCustomization(null);

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }  */

    /*@Test
    public void emptyRolesTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");

        defaultUser.setRoles(null);

        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);

        assertTrue(errors.hasErrors());
        assertSame(errors.getErrorCount(), 1);
    }*/

//    @Test
//    public void incorrectRolesTest() throws Exception {
//        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");
//
//        defaultUser.setRoles(null);
//        defaultUser.addRole(CGSRole.T2K_ADMIN);
//
//        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);
//
//        assertTrue(errors.hasErrors());
//        assertSame(errors.getErrorCount(), 1);
//
//        errors = new BeanPropertyBindingResult(defaultUser, "user");
//
//        defaultUser.setRoles(null);
//        defaultUser.addRole(CGSRole.ADMIN);
//
//        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);
//
//        assertTrue(errors.hasErrors());
//        assertSame(errors.getErrorCount(), 1);
//    }
//
//    @Test
//    public void incorrectNumberOfRolesTest() throws Exception {
//        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultUser, "user");
//
//        defaultUser.addRole(CGSRole.CONTENT_DEVELOPER);
//
//        ValidationUtils.invokeValidator(this.newNameValidator, defaultUser, errors);
//
//        assertTrue(errors.hasErrors());
//        assertSame(errors.getErrorCount(), 1);
//    }

}
