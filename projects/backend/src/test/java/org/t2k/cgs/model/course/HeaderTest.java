package org.t2k.cgs.model.course;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.t2k.cgs.model.Header;
import org.t2k.utils.ISO8601DateFormatter;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.text.ParseException;
import java.util.Date;

/**
 * @author Alex Burdusel on 2016-04-27.
 */
public class HeaderTest {

    @Test
    public void testHeaderCreation() {
        Header header = new Header();
        Assert.assertEquals(header.getLastModified(), new Date(0));
    }

    @Test
    public void testDeserialization() throws IOException, ParseException {
        ObjectMapper objectMapper =  new ObjectMapper();
        Header header = objectMapper.readValue(headerJSON, Header.class);
        Assert.assertEquals(header.getLastModified(), ISO8601DateFormatter.toDate("2016-07-12T11:24:46.280+0000"));
    }


    private String headerJSON = "{\n" +
            "  \"creationDate\": {\n" +
            "    \"$date\": \"2016-07-12T08:31:10.374+0000\"\n" +
            "  },\n" +
            "  \"last-modified\": {\n" +
            "    \"$date\": \"2016-07-12T11:24:46.280+0000\"\n" +
            "  }\n" +
            " }";
}
