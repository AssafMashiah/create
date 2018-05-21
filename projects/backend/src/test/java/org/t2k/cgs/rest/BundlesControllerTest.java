/*
package org.t2k.cgs.rest;

import com.t2k.common.utils.FileUtils;
import com.t2k.common.utils.ZipUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.io.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.fileUpload;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringJUnit4ClassRunner.class)
@WebAppConfiguration
@ContextConfiguration("/springContext/applicationContext-controllers.xml")
public class BundlesControllerTest {

    @Autowired
    private org.springframework.web.context.WebApplicationContext ctx;


    private MockMvc mockMvc;

    private BundlesController bundlesController;

    @Before
    public void setUp() {
        this.bundlesController = new BundlesController();
        this.mockMvc = MockMvcBuilders.webAppContextSetup(ctx).build();
    }

    @Test
    public void testDummyZipFile() throws IOException {


        Writer writer = new BufferedWriter(new OutputStreamWriter(
                new FileOutputStream("test.txt"), "utf-8"));
        writer.write("Something");
        // out put file
        FileInputStream in = new FileInputStream("test.txt");
        ZipOutputStream out = new ZipOutputStream(new FileOutputStream("tmp.zip"));

        // name the file inside the zip  file
        out.putNextEntry(new ZipEntry("zippedjava.txt"));

        // buffer size
        byte[] b = new byte[1024];
        int count;

        while ((count = in.read(b)) > 0) {
            System.out.println();
            out.write(b, 0, count);
        }
        out.close();
        in.close();
    }

    public byte[] getDummyZipFile() throws IOException {


        Writer writer = new BufferedWriter(new OutputStreamWriter(
                new FileOutputStream("test.txt"), "utf-8"));
        writer.write("Something");
        // out put file
        FileInputStream in = new FileInputStream("test.txt");
        ZipOutputStream out = new ZipOutputStream(new FileOutputStream("tmp.zip"));

        // name the file inside the zip  file
        out.putNextEntry(new ZipEntry("zippedjava.txt"));

        // buffer size
        byte[] b = new byte[1024];
        int count;

        while ((count = in.read(b)) > 0) {
            System.out.println();
            out.write(b, 0, count);
        }
        out.close();
        in.close();

        return b;
    }

    @Test
    public void handleWrongFileUpload() throws Exception {
        //create wrong mime type text file
        MockMultipartFile firstFile = new MockMultipartFile("file", "filename.txt", "text/plain", "some xml".getBytes());
        //dispatch the request to BundlesController
        this.mockMvc.perform(fileUpload("/publishers/1/bundles/upload")
                .file(firstFile)).
                andExpect(status().isBadRequest());
    }

    @Test
    public void handleExtractZipFiles() throws IOException {
        File zipFile = new File("tmp.zip");
        File targetDirectory = new File("tmp");

        try {
            if (!targetDirectory.exists()) {
                targetDirectory.mkdir();
            }

            ZipInputStream zipStream = ZipUtils.openZipFile(zipFile);
            String zipElementPath;

            while ((zipElementPath = ZipUtils.nextEntry(zipStream)) != null) {
                String zipEntryContent = ZipUtils.readTextData(zipStream);
                ByteArrayInputStream is = new ByteArrayInputStream(zipEntryContent.getBytes("utf-8"));

                FileUtils.copy(is, "tmp/" + zipElementPath, false);
            }
        } catch (IOException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        } finally {
            //targetDirectory.delete();
        }
    }

    @Test
    public void handleCreateBundleManifest() {

    }

    @Test
    public void handleValidateBundleManifest() {

    }


    @Test
    public void handleCorrectFileUpload() throws Exception {

        MockMultipartFile firstFile = new MockMultipartFile("file", "filename.zip", "application/zip", getDummyZipFile());

        this.mockMvc.perform(fileUpload("/publishers/1/bundles/upload")
                .file(firstFile)).
                andExpect(status().isOk());
    }
}*/
