package org.t2k.ebooks;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.ebooks.EBookConversionService;
import org.t2k.cgs.ebooks.EBookConversionServiceFactory;
import org.t2k.cgs.ebooks.EBookService;
import org.t2k.cgs.ebooks.EBookUtil;
import org.t2k.cgs.ebooks.pdf.PdfToEBookPdf2HtmlEXConversionServiceImpl;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.model.ebooks.EBookFormat;
import org.t2k.cgs.model.ebooks.EBookStructure;
import org.t2k.cgs.model.ebooks.UploadEBookData;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.UUID;

/**
 * Created by moshe.avdiel on 10/19/2015.
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class Pdf2HtmlExServiceTest extends AbstractTestNGSpringContextTests {

    public static final String TEST_FOLDER = "pdf2htmlExTest";
    @Autowired
    private EBookConversionServiceFactory eBookConversionServiceFactory;

    @Autowired
    private EBookUtil ebookUtil;

    @BeforeClass
    public void createTestFolder() {
        File testFolder = new File(TEST_FOLDER);
        if (!testFolder.exists()) {
            testFolder.mkdirs();
        }
    }

    @AfterClass
    public void clearTestsFolder() throws IOException {
        FileUtils.deleteDirectory(new File(TEST_FOLDER));
    }

    @DataProvider(name = "pdfsToConvert", parallel = true)
    public Object[][] EBookBlankPagesGenerationFromPageDataProvider() {
        return new Object[][]{
                {"books/Snowboarding.pdf"},
                {"books/Beitza.pdf"},
                {"books/Page_With_Missing_Font.pdf"}
        };
    }

    @Test(dataProvider = "pdfsToConvert")
    public void generateEBookStructureWithPdf2htmlexSuccessTest(String pdfPath) throws Exception {

        String OS_NAME = System.getProperty("os.name").toLowerCase();
        if (!OS_NAME.contains("windows")) {
            logger.debug("This code runs only on windows");
            Assert.assertTrue(true);
            return;
        }
        String jobId = UUID.randomUUID().toString();
        String eBookId = UUID.randomUUID().toString();
        String convertedEBookBasePath = String.format("%s/%s", TEST_FOLDER, eBookId);
        URL pdfUrl = this.getClass().getClassLoader().getResource(pdfPath);
        File pdfFile = new File(pdfUrl.getFile());
        int pdfPagesCount = ebookUtil.getPageCount(pdfFile);

        EBookConversionService eBookConversionService = eBookConversionServiceFactory.getEBookConversionService(EBookFormat.PDF, EBookConversionServiceTypes.PDFEX);
        UploadEBookData uploadEBookData = new UploadEBookData(eBookId, convertedEBookBasePath, 22, "someuser", pdfFile, jobId, EBookConversionServiceTypes.PDFEX);
//        uploadEBookData.setEBookFile(pdfFile);

        //generate the ebook structure and thumbnails
        EBookStructure eBookStructure = eBookConversionService.generateEBookStructure(uploadEBookData);
        eBookConversionService.generatePageThumbnails(eBookStructure, uploadEBookData);

        //number of page in the structure are the same as in the original pdf
        Assert.assertEquals(eBookStructure.getNumberOfPages(), pdfPagesCount);

        //ebook folder was created
        File convertedEbookFolder = new File(convertedEBookBasePath);
        Assert.assertTrue(convertedEbookFolder.exists());

        //font folder was created
        File fontsFolder = new File(String.format("%s/%s", convertedEBookBasePath, EBookUtil.FONTS_FOLDER));
        Assert.assertTrue(fontsFolder.exists());

        //thumbnails folder was created
        File thumbnailsFolder = new File(String.format("%s/%s", convertedEBookBasePath, EBookService.E_BOOKS_THUMBNAILS_FOLDER));
        Assert.assertTrue(thumbnailsFolder.exists());

        //assets folder exists
        File assetsFolder = new File(String.format("%s/%s", convertedEBookBasePath, PdfToEBookPdf2HtmlEXConversionServiceImpl.ASSETS_FOLDER));
        Assert.assertTrue(assetsFolder.exists());

        //check that shared assets files exists
        for (String file : PdfToEBookPdf2HtmlEXConversionServiceImpl.SHARED_ASSETS_FILES) {
            File asset = new File(assetsFolder, file);
            Assert.assertTrue(asset.exists());
        }

        //loop over pages to check folder structure and files inside each page
        for (int i = 1; i <= pdfPagesCount; i++) {
            // check that we have all the thumbnails files
            File thumbnailFile = new File(thumbnailsFolder, String.format("%d%s", i, EBookUtil.THUMBNAIL_EXTENSION));
            Assert.assertTrue(thumbnailFile.exists());

            //check that all the pages were created in their folder
            File PageFolder = new File(String.format("%s/%d", convertedEBookBasePath, i));
            Assert.assertTrue(PageFolder.exists());

            //check that the page's html file was created
            File htmlFile = new File(String.format("%s/%d/%s.html", convertedEBookBasePath, i, eBookId));
            Assert.assertTrue(htmlFile.exists());
            String htmlFileString = FileUtils.readFileToString(htmlFile, "UTF-8");

            //check that reference to assets files in the html were change to the new location in the assets folder
            for (String file : PdfToEBookPdf2HtmlEXConversionServiceImpl.SHARED_ASSETS_FILES) {
                Assert.assertTrue(htmlFileString.contains(String.format("../%s/%s", PdfToEBookPdf2HtmlEXConversionServiceImpl.ASSETS_FOLDER, file)));
            }
        }
    }
}