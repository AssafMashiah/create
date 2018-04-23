package org.t2k.cgs.packages;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.io.IOUtils;
import org.t2k.cgs.security.CGSUserDetailsImpl;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;

/**
 * Created by elad.avidan on 23/07/2014.
 */
@Test(groups = "ignore")
public class UserMappingTest {

    @Test
    public void mapUserToObject() throws IOException {
        String path  = "jsons/basic/users/user.json";
        String content = readResourcesAsString(path);
        ObjectMapper mapper = new ObjectMapper();

        CGSUserDetailsImpl user = mapper.readValue(content, CGSUserDetailsImpl.class);
    }

    private String readResourcesAsString(String localPath) throws IOException {
        InputStream resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
        StringWriter writer = new StringWriter();
        IOUtils.copy(resourceAsStream, writer);
        resourceAsStream.close();
        return writer.toString();
    }
}
