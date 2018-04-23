package org.t2k.cgs.tts;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 11/12/13
 * Time: 15:55
 */
@ContextConfiguration("/springContext/applicationContext-service.xml")
@Test(groups = "ignore")
public class TextToSpeechProviderServiceTest extends AbstractTestNGSpringContextTests {
    @Autowired
    private TextToSpeechProviderService ttsProviderService;

    public void testGetAllProviders() throws DsException {
           String str = ttsProviderService.getTextToSpeechProviders();
            Assert.assertNotNull(str);
    }


}
