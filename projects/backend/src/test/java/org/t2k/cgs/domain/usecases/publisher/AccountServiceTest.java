package org.t2k.cgs.domain.usecases.publisher;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.exceptions.ValidationException;
import org.t2k.cgs.domain.model.user.CGSAccount;
import org.testng.annotations.Test;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URISyntaxException;
import java.net.URL;

import static org.testng.Assert.assertEquals;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 03/12/13
 * Time: 11:45
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
@Test(groups = "ignore")
public class AccountServiceTest extends AbstractTestNGSpringContextTests {
    @Autowired
    PublisherService accountService;

    @Test
    public void testValidation() throws Exception {
        String invalidAccount = resourceFileAsString("publisher/invalidAccount.json");

        boolean pass = false;
        try {
            accountService.createPublisher(invalidAccount);
        } catch (ValidationException e) {
            pass = true;
        }
//        assertTrue(pass);

        String validAccount = resourceFileAsString("publisher/validAccount.json");

        String accountJson = accountService.createPublisher(validAccount);
        DBObject publisherDbObject = (DBObject) JSON.parse(accountJson);

        int accountId = Integer.parseInt(publisherDbObject.get("accountId").toString());

        String accountJson2 = accountService.getPublisher(accountId);

        assertEquals(accountJson2, accountJson);

        accountService.deletePublisher(accountId);

    }

    @Test
    public void accountObjectMapping() throws IOException, URISyntaxException {
        String validAccount = resourceFileAsString("publisher/validAccount.json");
        ObjectMapper objectMapper = new ObjectMapper();
        CGSAccount cgsAccount = objectMapper.readValue(validAccount, CGSAccount.class);

    }

    public static FileInputStream getFileInputStream(String path) throws URISyntaxException, FileNotFoundException {
        URL url = ClassLoader.getSystemResource(path);
        File file = new File(url.toURI());
        FileInputStream is = new FileInputStream(file);
        return is;
    }

    public static String getInputStreamAsString(InputStream inputStream) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
        StringBuilder out = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            out.append(line);
        }
        return out.toString();
    }

    public static String resourceFileAsString(String resourcePath) throws IOException, URISyntaxException {
        InputStream is = null;
        try {
            is = getFileInputStream(resourcePath);
            return getInputStreamAsString(is);
        } finally {
            IOUtils.closeQuietly(is);
        }
    }


}
