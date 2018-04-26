package org.t2k.cgs.packages;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.io.IOUtils;
import org.t2k.cgs.security.AccountCustomization;
import org.t2k.cgs.security.CGSAccount;
import org.t2k.cgs.security.ExternalPartnerSettings;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 24/06/14
 * Time: 09:33
 */
@Test(groups = "ignore")
public class AccountMapping {

     @Test
    public void mapAccountToObject() throws IOException {
       String path  = "jsons/basic/accounts/validAccount.json";
        String content = readResouresAsString(path);
        ObjectMapper mapper = new ObjectMapper();

        CGSAccount account = mapper.readValue(content, CGSAccount.class);

    }

    @Test
    public void mapCustomizationToObject() throws IOException {
        String path  = "jsons/basic/accounts/customization.json";
        String content = readResouresAsString(path);
        ObjectMapper mapper = new ObjectMapper();

        AccountCustomization account = mapper.readValue(content, AccountCustomization.class);

    }

    @Test
    public void mapPartnerExternalSettingsToObject() throws IOException {
        String path  = "jsons/basic/accounts/externalPartnerSettings.json";
        String content = readResouresAsString(path);
        ObjectMapper mapper = new ObjectMapper();

        ExternalPartnerSettings externalPartner = mapper.readValue(content, ExternalPartnerSettings.class);

    }

    private String readResouresAsString(String localPath) throws IOException {
        InputStream resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
        StringWriter writer = new StringWriter();
        IOUtils.copy(resourceAsStream, writer);
        resourceAsStream.close();
        return writer.toString();
    }
}
