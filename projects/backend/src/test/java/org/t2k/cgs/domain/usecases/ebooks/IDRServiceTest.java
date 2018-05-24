package org.t2k.cgs.domain.usecases.ebooks;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.ebooks.EBookStructure;
import org.t2k.cgs.domain.model.ebooks.Page;
import org.t2k.cgs.domain.model.utils.Pair;
import org.t2k.cgs.domain.usecases.TestUtils;
import org.t2k.cgs.service.ebooks.pdf.PdfToEBookIDRConversionServiceImpl;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

/**
 * Created by thalie.mukhtar on 21/2/2016.
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
public class IDRServiceTest extends AbstractTestNGSpringContextTests {

    private static final String RTL_INPUT_HTML = "books/htmls/convertedByIDR/rtlConvertedHtml-input.html"; //this is a mixed html with both hebrew and english text
    private static final String RTL_EXPECTED_HTML_OUTPUT = "books/htmls/convertedByIDR/rtlConvertedHtml-output.html"; // this is a file generated "by hand" to simulate the expected conversion result
    private static final String IDR_CONVERTED_HTML_ENGLISH = "books/htmls/convertedByIDR/englishConvertedHtml.html"; // file with only english (no rtl language inside)
    private static final String IDR_RTL_CONVERSION_TEST_FOLDER = "idrRtlConversionTest";

    @Autowired
    private PdfToEBookIDRConversionServiceImpl idrConversionService;

    @Autowired
    private TestUtils testUtils;

    @AfterClass
    public void clearTestData() throws IOException {
        File testFolder = new File(IDR_RTL_CONVERSION_TEST_FOLDER);
        if (testFolder.exists()) {
            FileUtils.forceDelete(new File(IDR_RTL_CONVERSION_TEST_FOLDER));
        }
    }

    @DataProvider(parallel = true)
    public static Object[][] htmlPagesToConvert() {
        return new Object[][]{
                {new Pair<>(RTL_INPUT_HTML, RTL_EXPECTED_HTML_OUTPUT)}, // hebrew html should be different after the function
                {new Pair<>(IDR_CONVERTED_HTML_ENGLISH, IDR_CONVERTED_HTML_ENGLISH)}, // english html should be the same after the function

        };
    }

    @Test(dataProvider = "htmlPagesToConvert")
    public void rtlReverseText(Pair<String, String> data) throws Exception {
        String reversedPageText = idrConversionService.getReversedPageHtml(testUtils.readResourcesAsString(data.getKey()));
        String expectedOutput = testUtils.readResourcesAsString(data.getValue());

        this.checkHtmlFileConversion(reversedPageText, expectedOutput);
    }

    @Test(dataProvider = "htmlPagesToConvert")
    public void RtlReverseEbook(Pair<String, String> data) throws Exception {
        File originalTestFile = testUtils.readResourceAsFile(data.getKey());
        String fileName = FilenameUtils.getName(data.getKey());
        String ebookId = UUID.randomUUID().toString();
        Page page = new Page("pageId", ebookId, "page-title", fileName, 0, null);

        //copy the test file to the publisher folder in cms, because the conversion code is expecting to find the file in that location
        File copiedFile = new File(IDR_RTL_CONVERSION_TEST_FOLDER, fileName);
        FileUtils.copyFile(originalTestFile, copiedFile);

        EBookStructure structure = new EBookStructure("structure-title", null);
        structure.addPage(page);

        idrConversionService.reverseBookText(structure, IDR_RTL_CONVERSION_TEST_FOLDER);

        checkHtmlFileConversion(FileUtils.readFileToString(copiedFile), testUtils.readResourcesAsString(data.getValue()));
    }

    private void checkHtmlFileConversion(String result, String expectedResult) {
        Document inputDocument = Jsoup.parse(result);
        Assert.assertEquals(inputDocument.getElementsByTag("bdo").size(), 0);

        //run the expected result through jsoup in order to format the html the same as in the conversion result
        Document outputDocument = Jsoup.parse(expectedResult);
        expectedResult = outputDocument.outerHtml();

       // Assert.assertEquals(result, expectedResult);
        Assert.assertEquals(result.replaceAll("\\s+", ""), expectedResult.replaceAll("\\s+", ""));
    }
}
