package org.t2k.cgs.domain.usecases;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 11/12/13
 * Time: 15:55
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
@Test(groups = "ignore")
public class TextToSpeechProviderServiceTest extends AbstractTestNGSpringContextTests {
    @Autowired
    private TextToSpeechProviderService ttsProviderService;

    public void testGetAllProviders() throws DsException {
        String str = ttsProviderService.getTextToSpeechProviders();
        Assert.assertNotNull(str);
    }
}
