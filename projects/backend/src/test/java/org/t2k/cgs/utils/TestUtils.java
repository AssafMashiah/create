package org.t2k.cgs.utils;

import org.apache.commons.io.IOUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.map.ObjectWriter;
import org.springframework.core.io.ClassPathResource;

import java.io.*;
import java.net.URISyntaxException;
import java.net.URL;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 03/12/13
 * Time: 12:04
 */
public class TestUtils {

    public static final String DOCUMENTATION_JSON_LOCATION = "c:\\t2kdev\\cgs\\doc\\design\\architecture\\data";

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

    public static String resource2String(String fileName) throws IOException {
        InputStream file = null;
        try {
            file = (new ClassPathResource(fileName)).getInputStream();
            return getStringFromInputStream(file);
        } finally {
            IOUtils.closeQuietly(file);
        }
    }

    public static String getStringFromInputStream(InputStream is) throws IOException {
        StringWriter writer = new StringWriter();
        IOUtils.copy(is, writer);
        return writer.toString();
    }


    public static void dumpJson(Object obj, String filePath) throws Exception {
         ObjectMapper mapper = new ObjectMapper();
         ObjectWriter writer = mapper.writer().withDefaultPrettyPrinter();
         String json = writer.writeValueAsString(obj);

         org.apache.commons.io.FileUtils.writeStringToFile(new File(filePath), json, "UTF-8");
     }

     public static void json4Documentation(Object obj, String filePath) throws Exception {
         dumpJson(obj, DOCUMENTATION_JSON_LOCATION + "/" + filePath);
     }

}
