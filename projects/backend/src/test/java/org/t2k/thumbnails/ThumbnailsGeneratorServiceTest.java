package org.t2k.thumbnails;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.ebooks.EBookThumbnail;
import org.t2k.cgs.thumbnails.ThumbnailsGeneratorService;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.File;
import java.net.URISyntaxException;
import java.util.Arrays;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 10/12/2015
 * Time: 09:04
 */
@ContextConfiguration("/springContext/applicationContext-allServices.xml")
public class ThumbnailsGeneratorServiceTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private ThumbnailsGeneratorService thumbnailsGeneratorService;

    @Autowired
    private TestUtils testUtils;

    @Test(enabled = false)
    public void generateThumbnailFromWebSiteUrlTest() throws DsException, URISyntaxException {
        File thumbnail = new File("thumbnailFromWebSiteUrl.jpg");
        EBookThumbnail eBookThumbnail = new EBookThumbnail("http://www.ynet.co.il", thumbnail.getAbsolutePath());

        generateAndValidateThumbnail(eBookThumbnail);
    }

    @Test(enabled = false)
    public void generateThumbnailFromFileUrlTest() throws Exception {
        File thumbnail = new File("thumbnailFromFileUrl.jpg");
        File file = new File(testUtils.getResourcePath("thumbnails"), "cover.xhtml");
        EBookThumbnail eBookThumbnail = new EBookThumbnail(file.toURI().toString(), thumbnail.getAbsolutePath());

        generateAndValidateThumbnail(eBookThumbnail);
    }

    private void generateAndValidateThumbnail(EBookThumbnail eBookThumbnail) throws DsException {
        File thumbnail = new File(eBookThumbnail.getOutputLocation());
        try {
            thumbnailsGeneratorService.generateThumbnail(eBookThumbnail);
            Assert.assertTrue(thumbnail.exists());
        } finally {
            if (thumbnail.exists()) {
                thumbnail.delete();
            }
        }
    }

    @Test(enabled = false)
    public void generateMultipleThumbnailsFromWebSitesUrlsTest() throws Exception {
        File ynet = new File("ynet.jpg");
        File google = new File("google.jpg");

        try {
            thumbnailsGeneratorService.generateThumbnails(Arrays.asList(
                    new EBookThumbnail("http://www.ynet.co.il", ynet.getAbsolutePath()),
                    new EBookThumbnail("http://www.google.com", google.getAbsolutePath())
            ), null);

            Assert.assertTrue(ynet.exists());
            Assert.assertTrue(google.exists());
        } finally {
            if (ynet.exists()) {
                ynet.delete();
            }
            if (google.exists()) {
                google.delete();
            }
        }
    }

//    @Test
//    public void generateThumbnailFromFileUsingDynamicPlayerTest() throws Exception {
//        File thumbnail = new File("thumbnailFromFileUrl.jpg");
//        File file = new File(testUtils.getResourcePath("thumbnails"), "cover.xhtml");
//        Page page = new Page("page-id", "ebook-id", "title", file.getAbsolutePath(), 1, thumbnail.getAbsolutePath());
//        EBookThumbnail eBookThumbnail = new EBookThumbnail(file.toURI().toString(), thumbnail.getAbsolutePath());
//
//        try {
//            thumbnailsGeneratorService.generateThumbnailsUsingDynamicPlayer(Arrays.asList(page), 1, thumbnailsDir.getAbsolutePath(), null);
//            Assert.assertTrue(thumbnail.exists());
//        } finally {
//            if (thumbnail.exists()) {
//                thumbnail.delete();
//            }
//        }
//    }
}