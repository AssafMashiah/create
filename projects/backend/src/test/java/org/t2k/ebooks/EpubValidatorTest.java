package org.t2k.ebooks;

import com.t2k.configurations.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.service.ebooks.epub.EpubValidator;
import org.t2k.cgs.domain.usecases.ebooks.EpubValidationResult;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.net.URL;

//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class EpubValidatorTest extends AbstractTestNGSpringContextTests {
   
    private String validEpub3 = "books/epub3_childrens-literature.epub";
    private String nonValidEpub3 = "books/nonValid/childrens-literature-non-valid.epub";
    private String epub2File = "books/epub2_example.epub";

    @Autowired
    private EpubValidator epubValidator;

    @Autowired
    private Configuration configuration;

    @Test
    public void noFileResultsInFailureTest() {
        EpubValidationResult validationStatus = epubValidator.validateEpubFile("");
        Assert.assertFalse(validationStatus.isValid());
        Assert.assertFalse(validationStatus.getErrorMessages().isEmpty());
    }

    @Test
    public void validEpub3SuccessTest() {
        EpubValidationResult validationStatus = epubValidator.validateEpubFile(getBookAbsolutePath(validEpub3));
        Assert.assertTrue(validationStatus.isValid());
        Assert.assertNull(validationStatus.getErrorMessages());
    }

    @Test
    public void nonValidEpub3FailureTest() {
        EpubValidationResult validationStatus = epubValidator.validateEpubFile(getBookAbsolutePath(nonValidEpub3));
        Assert.assertFalse(validationStatus.isValid());
        Assert.assertFalse(validationStatus.getErrorMessages().isEmpty());
    }

    @Test
    public void epub2ValidationFailureTest(){
        EpubValidationResult validationStatus = epubValidator.validateEpubFile(getBookAbsolutePath(epub2File));
        Assert.assertTrue(validationStatus.isValid());
        Assert.assertNull(validationStatus.getErrorMessages());
    }

    private String getBookAbsolutePath(String relativePath) {
        URL url = this.getClass().getClassLoader().getResource(relativePath);
        return url.getPath();
    }
}