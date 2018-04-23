package org.t2k.cgs.user.validation;

import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.ValidationUtils;
import org.springframework.validation.Validator;
import org.t2k.cgs.dataServices.exceptions.ValidationException;
import org.t2k.cgs.publisher.validation.BaseAccountDataValidator;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.*;
import java.net.URISyntaxException;
import java.net.URL;

import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 09/07/13
 * Time: 16:13
 */
@Test(groups = "ignore")
//TODO: fix and unignore
public class PublisherValidationTest {

//    private static final String PACKAGE_PATH = "jsons/publishers";

    private Validator publisherValidator;
    private String defaultPublisherJson;


    @BeforeMethod
    private void beforeTest() throws IOException, URISyntaxException, ValidationException {
        this.publisherValidator= new BaseAccountDataValidator(null, false); // FIXME: 1/4/17
        InputStream is = getFileInputStream( "schema/accountSchema.json");
        defaultPublisherJson = getInputStreamAsString(is);
    }

    @Test
    public void supportTest() throws Exception {
        assertTrue(this.publisherValidator.supports(String.class));
    }

    @Test
    public void noValidationErrorsTest() throws Exception {
        BeanPropertyBindingResult errors = new BeanPropertyBindingResult(defaultPublisherJson, "user");

        ValidationUtils.invokeValidator(this.publisherValidator, defaultPublisherJson, errors);

        if (errors.hasErrors()) {
            assertFalse(errors.hasErrors(), "Validation errors found" + errors.toString());
        }
    }


    private FileInputStream getFileInputStream(String path) throws URISyntaxException, FileNotFoundException {

        URL url = ClassLoader.getSystemResource(path);
        File file = new File(url.toURI());
        FileInputStream is = new FileInputStream(file);
        return is;
    }

    private String getInputStreamAsString(InputStream inputStream) throws IOException, IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        StringBuilder out = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            out.append(line);
        }
        String res = out.toString();
        inputStream.close();
        return res;
    }
}
