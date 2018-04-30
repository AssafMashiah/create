package org.t2k.ebooks;

import org.apache.commons.io.FileUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.service.ebooks.HtmlParsingService;
import org.t2k.cgs.domain.model.ebooks.JouveEnrichment;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * Created by roee.kachila on 24/1/2016.
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class HtmlParsingServiceTest extends AbstractTestNGSpringContextTests {

    private ObjectMapper objectMapper = new ObjectMapper();

    public static final String BOOKS_HTMLS_FOLDER = "books/htmls/";
    public static final String BOOKS_HTMLS_VISUALISATIONCHANGE_FOLDER = "books/htmls/visualisationChange/";
    public static final String BOOKS_HTMLS_JOUVESTUDIO_FOLDER = "books/htmls/jouveStudio/";
    public static final String JOUVE_TOC_XHTML_FOLDER = "jouve/";

    @Autowired
    private TestUtils testUtils;

    @Autowired
    private HtmlParsingService htmlParsingService;

    @Test
    public void extractTextFromEmptyHtml() throws Exception {
        // checks empty document
        String inputHtmlPath = "emptyHtml-input.html";
        String outputTextPath = "emptyHtml-output.txt";
        extractTextAndCheckEqualityToExpectedOutput(inputHtmlPath, outputTextPath);
    }

    @Test
    public void extractTextFromTinyHtml() throws Exception {
        // checks a small html with few divs and spans
        String inputHtmlPath = "tinyHtml-input.html";
        String outputTextPath = "tinyHtml-output.txt";
        extractTextAndCheckEqualityToExpectedOutput(inputHtmlPath, outputTextPath);
    }

    @Test
    public void extractTextFromEditisBook() throws Exception {
        // checks page from Editis book ( book: 'POC_PER_JOUVE_ECRAN', page: 'chapter_6\Page_3.html' )
        String inputHtmlPath = "editisHtml1-input.html";
        String outputTextPath = "editisHtml1-output.txt";
        extractTextAndCheckEqualityToExpectedOutput(inputHtmlPath, outputTextPath);
    }

    @Test
    public void extractTextFromHebrewPdfFromIdr() throws Exception {
        // checks a converted hebrew PDF ( vacations table with CSS attribute of direction: ltr )
        String inputHtmlPath = "hebrewPDF-input.html";
        String outputTextPath = "hebrewPDF-output.txt";
        extractTextAndCheckEqualityToExpectedOutput(inputHtmlPath, outputTextPath);
    }

    @Test
    public void extractTextFromHebrewWebSite() throws Exception {
        // checks a real hebrew site ( www.sport5.co.il )
        String inputHtmlPath = "hebrewWebSite-input.html";
        String outputTextPath = "hebrewWebSite-output.txt";
        extractTextAndCheckEqualityToExpectedOutput(inputHtmlPath, outputTextPath);
    }

    @Test
    public void extractTextFromProblematicPageIDR() throws Exception {
        // checks a problematic page from IDR( http://52.49.131.218/scp/index.html?locale=en_US&contentPath=../#/lessonView/6f6ba717-42b8-4426-bd9d-c932128eb9ce/courseVersion/1.0.2/lesson/7699bad5-b705-4508-9a6b-ce15c101856a/lessonVersion/1.0.2/contentItem/6e560ee5-8ef1-4b3f-bfdd-618b74eaa35f/selected )
        String inputHtmlPath = "problematicPage-IDR-input.html";
        String outputTextPath = "problematicPage-IDR-output.txt";
        extractTextAndCheckEqualityToExpectedOutput(inputHtmlPath, outputTextPath);
    }

    @Test
    public void extractTextFromProblematicPagePDF2HTML() throws Exception {
        // checks a problematic page from PDF2HTML( http://52.49.131.218/scp/index.html?locale=en_US&contentPath=../#/lessonView/6f6ba717-42b8-4426-bd9d-c932128eb9ce/courseVersion/1.0.2/lesson/fb41566f-ff9b-4d60-ac37-0e28e0d8a7a7/lessonVersion/1.0.2/contentItem/2d9a14c4-078b-4823-834d-927ded0019d0/selected )
        String inputHtmlPath = "problematicPage-PDF2HTML-input.html";
        String outputTextPath = "problematicPage-PDF2HTML-output.txt";
        extractTextAndCheckEqualityToExpectedOutput(inputHtmlPath, outputTextPath);
    }

    @Test
    public void extractTextFromPageWithSpecialChars() throws Exception {
        // checks a page with special char which seems like the regular char
        String inputHtmlPath = "tinyHtmlWithSpecialChars-input.html";
        String outputTextPath = "tinyHtmlWithSpecialChars-output.txt";
        extractTextAndCheckEqualityToExpectedOutput(inputHtmlPath, outputTextPath);
    }

    private void extractTextAndCheckEqualityToExpectedOutput(String inputHtmlPath, String outputTextPath) throws Exception {
        File input = testUtils.readResourceAsFile(BOOKS_HTMLS_FOLDER + inputHtmlPath);
        File expectedOutput = testUtils.readResourceAsFile(BOOKS_HTMLS_FOLDER + outputTextPath);
        String expectedText = FileUtils.readFileToString(expectedOutput);
        expectedText = expectedText.replaceAll("\uFEFF", ""); // resolving bug regarding first char added to out test files
        String actualText = htmlParsingService.extractText(input);
        Assert.assertEquals(actualText, expectedText, String.format("The text extracted from html: %s, is not the as expected in: %s", inputHtmlPath, outputTextPath));
    }

    @Test
    public void changePageVisualizationForEpubPagesXhtml() throws Exception {
        // add CSS rules to .xhtml file (eBook name: EPUB3 - French- ANA_MATH_3E)
        String inputHtmlPath = "ANA_MATH_3E_RP62-input.xhtml";
        String outputHtmlPath = "ANA_MATH_3E_RP62-output.xhtml";
        String epubPageCssRules = "body { min-height: 768px; width: 1280px; } object { height: 768px; width: 100%;  }";
        changePageVisualizationEqualityToExpectedOutput(inputHtmlPath, outputHtmlPath, epubPageCssRules);
    }

    @Test
    public void changePageVisualizationForEpubPagesHtml() throws Exception {
        // add CSS rules to .html file (eBook name: EPUB3 - French- RETZ_Ecole-des-albums_texte_seul, chapter name: chapter1, page: Page_1-input.html )
        String inputHtmlPath = "Page_1-input.html";
        String outputHtmlPath = "Page_1-output.html";
        String epubPageCssRules = "body { min-height: 768px; width: 1280px; } object { height: 768px; width: 100%;  }";
        changePageVisualizationEqualityToExpectedOutput(inputHtmlPath, outputHtmlPath, epubPageCssRules);
    }

    @Test
    public void changePageVisualizationForEpubPagesHtmlEmptyHead() throws Exception {
        // add CSS rules to .html file with empty head (eBook name: EPUB3 - French- RETZ_Ecole-des-albums_texte_seul, chapter name: chapter1, page: Page_1-input.html which I manually emptied the head)
        String inputHtmlPath = "Page_3-input-emptyHead.html";
        String outputHtmlPath = "Page_3-output-emptyHead.html";
        String epubPageCssRules = "body { min-height: 768px; width: 1280px; } object { height: 768px; width: 100%;  }";
        changePageVisualizationEqualityToExpectedOutput(inputHtmlPath, outputHtmlPath, epubPageCssRules);
    }


    private void changePageVisualizationEqualityToExpectedOutput(String inputHtmlPath, String outputHtmlPath, String epubPageCssRules) throws Exception {
        // read input file
        File inputFile = testUtils.readResourceAsFile(BOOKS_HTMLS_VISUALISATIONCHANGE_FOLDER + inputHtmlPath);
        String originalHtml = FileUtils.readFileToString(inputFile);
        htmlParsingService.changePageVisualization(inputFile, epubPageCssRules);
        String actualHtml = FileUtils.readFileToString(inputFile);

        // read output file
        File outputFile = testUtils.readResourceAsFile(BOOKS_HTMLS_VISUALISATIONCHANGE_FOLDER + outputHtmlPath);
        String expectedHtml = FileUtils.readFileToString(outputFile);

        // This line is for the test purposes only, has nothing to do with the logic
        // revert the CSS rules in the input file for the next test ('changePageVisualization' function changes the file itself)
        FileUtils.writeStringToFile(inputFile, originalHtml);

        // check if the CSS rules were added OK and the files are identical
        Assert.assertEquals(actualHtml, expectedHtml, String.format("The html extracted from html: %s, is not the as expected in: %s", inputHtmlPath, outputHtmlPath));
    }

    @Test()
    public void runJouveStudioFixOnHtmlWhichNeedFix() throws Exception {
        // 9782091139630.epub (chapter_1\Page_1.html)
        String inputHtmlPath = "Page_1-needFix-input.html";
        String outputHtmlPath = "Page_1-needFix-output.html";
        String jouveStudioEpubPageCssRules = "div.line{ opacity: 1 !important; color: transparent !important; } div.line span{ color: transparent !important; }";
        fixJouveStudioEbooksTestEqualityToExpectedOutput(inputHtmlPath, outputHtmlPath, jouveStudioEpubPageCssRules);
    }

    @Test()
    public void runJouveStudioFixOnHtmlWhichNeedFix2() throws Exception {
        // 9782091139630.epub (chapter_1\Page_20.html)
        String inputHtmlPath = "Page_20-needFix-input.html";
        String outputHtmlPath = "Page_20-needFix-output.html";
        String jouveStudioEpubPageCssRules = "div.line{ opacity: 1 !important; color: transparent !important; } div.line span{ color: transparent !important; }";
        fixJouveStudioEbooksTestEqualityToExpectedOutput(inputHtmlPath, outputHtmlPath, jouveStudioEpubPageCssRules);
    }

    @Test()
    public void runJouveStudioFixOnHtmlWhichDoesntNeedFix() throws Exception {
        // POC_PER_JOUVE_ECRAN.epub (chapter_2\Page_1.html)
        String inputHtmlPath = "Page_30-notNeedFix-input.html";
        String outputHtmlPath = "Page_30-notNeedFix-output.html";
        String jouveStudioEpubPageCssRules = "div.line{ opacity: 1 !important; color: transparent !important; } div.line span{ color: transparent !important; }";
        fixJouveStudioEbooksTestEqualityToExpectedOutput(inputHtmlPath, outputHtmlPath, jouveStudioEpubPageCssRules);
    }

    @Test()
    public void runJouveStudioFixOnXHtmlWhichNeedFix() throws Exception {
        // POC_PER_JOUVE_ECRAN.epub (chapter_2\Page_1.html)
        String inputHtmlPath = "Page_40-notNeedFix-input.xhtml";
        String outputHtmlPath = "Page_40-notNeedFix-output.xhtml";
        String jouveStudioEpubPageCssRules = "div.line{ opacity: 1 !important; color: transparent !important; } div.line span{ color: transparent !important; }";
        fixJouveStudioEbooksTestEqualityToExpectedOutput(inputHtmlPath, outputHtmlPath, jouveStudioEpubPageCssRules);
    }

    private void fixJouveStudioEbooksTestEqualityToExpectedOutput(String inputHtmlPath, String outputHtmlPath, String jouveStudioEpubPageCssRules) throws Exception {
        // read input file
        File inputFile = testUtils.readResourceAsFile(BOOKS_HTMLS_JOUVESTUDIO_FOLDER + inputHtmlPath);
        String originalHtml = FileUtils.readFileToString(inputFile);
        htmlParsingService.fixJouveStudioEbooks(inputFile, jouveStudioEpubPageCssRules);
        String actualHtml = FileUtils.readFileToString(inputFile);

        // read output file
        File outputFile = testUtils.readResourceAsFile(BOOKS_HTMLS_JOUVESTUDIO_FOLDER + outputHtmlPath);
        String expectedHtml = FileUtils.readFileToString(outputFile);

        // This line is for the test purposes only, has nothing to do with the logic
        // revert the CSS rules in the input file for the next test ('changePageVisualization' function changes the file itself)
        FileUtils.writeStringToFile(inputFile, originalHtml);

        // check if the CSS rules were added OK and the files are identical
        Assert.assertEquals(actualHtml, expectedHtml, String.format("The html extracted from html: %s, is not the as expected in: %s", inputHtmlPath, outputHtmlPath));
    }


    @Test
    public void createJouveEnrichmentsTestAmountOfEnrichment() throws Exception {
        ArrayList<JouveEnrichment> jouveEnrichmentList = htmlParsingService.createJouveEnrichmentList(testUtils.readResourceAsFile(JOUVE_TOC_XHTML_FOLDER + "/toc-9782091132242_texte_enrichissement.xhtml"));
        Assert.assertEquals(jouveEnrichmentList.size(), 17);
    }

    @Test
    public void createJouveEnrichmentsTestStructure() throws Exception {
        // check toc.xhtml of 9782047343999_image_enrichissiment.epub
        File inputFile = testUtils.readResourceAsFile(JOUVE_TOC_XHTML_FOLDER + "/toc-9782047343999_image_enrichissiment.xhtml");
        ArrayList<JouveEnrichment> jouveEnrichmentList = htmlParsingService.createJouveEnrichmentList(inputFile);

        // check enrichment list size
        Assert.assertEquals(jouveEnrichmentList.size(), 44);

        // check if specific enrichment got the right type
        HashMap<Integer, String> expectedEnrichmentTypes = new HashMap<>();
        expectedEnrichmentTypes.put(0, "IMAGE_FILE");
        expectedEnrichmentTypes.put(1, "VIDEO_FILE");
        expectedEnrichmentTypes.put(2, "FILE");
        expectedEnrichmentTypes.put(8, "IMAGE_FILE");
        expectedEnrichmentTypes.put(21, "VIDEO_FILE");
        expectedEnrichmentTypes.put(22, "IMAGE_FILE");
        expectedEnrichmentTypes.put(32, "VIDEO_FILE");
        expectedEnrichmentTypes.put(43, "FILE");
        for (Map.Entry<Integer, String> entry : expectedEnrichmentTypes.entrySet()) {
            Integer index = entry.getKey();
            String enrichmentType = entry.getValue();
            Assert.assertEquals(enrichmentType, jouveEnrichmentList.get(index).getType());
        }

        // check all the enrichment list (each enrichment has title, type, path attributes)
        String enrichmentList = "[{\"title\":\"Le schéma-bilan\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP3/resources/Jouve_Rez_04733146_021_01_jpg.xhtml\"},{\"title\":\"Le schéma-bilan animé\",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP3/resources/Jouve_Rez_733146_P1C1_SB_flv.xhtml\"},{\"title\":\"Le schéma-bilan à compléter\",\"type\":\"FILE\",\"path\":\"CHAP3/resources/Jouve_Rez_733146_P1C1_SB_pdf.xhtml\"},{\"title\":\"Une sortie dans l’environnement proche\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP3/resources/Jouve_Rez_04733146_011_jpg.xhtml\"},{\"title\":\"Le schéma-bilan à compléter\",\"type\":\"FILE\",\"path\":\"CHAP4/resources/Jouve_Rez_733146_P1C2_SB_pdf.xhtml\"},{\"title\":\"Un rouge-gorge en hiver\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP4/resources/Jouve_Rez_04733146_027_jpg.xhtml\"},{\"title\":\"Le schéma-bilan\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP4/resources/Jouve_Rez_04733146_037_01_jpg.xhtml\"},{\"title\":\"Le schéma-bilan animé\",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP4/resources/Jouve_Rez_733146_P1C2_SB_flv.xhtml\"},{\"title\":\"Des fougères s’installent sur une coulée de lave\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP5/resources/Jouve_Rez_04733146_045_jpg.xhtml\"},{\"title\":\"La sauge et le bourdon \",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP5/resources/Jouve_Rez_04733146_P1C3_video_sauge_flv.xhtml\"},{\"title\":\"Le schéma-bilan à compléter\",\"type\":\"FILE\",\"path\":\"CHAP5/resources/Jouve_Rez_733146_P1C3_SB_pdf.xhtml\"},{\"title\":\"Le schéma-bilan\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP5/resources/Jouve_Rez_04733146_055_01_jpg.xhtml\"},{\"title\":\"Le schéma-bilan animé\",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP5/resources/Jouve_Rez_733146_P1C3_SB_flv.xhtml\"},{\"title\":\"L’impact sur le paysage de la construction d’une autoroute\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP6/resources/Jouve_Rez_04733146_063_jpg.xhtml\"},{\"title\":\"Le schéma-bilan\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP6/resources/Jouve_Rez_04733146_069_01_jpg.xhtml\"},{\"title\":\"Le schéma-bilan animé\",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP6/resources/Jouve_Rez_733146_P1C4_SB_flv.xhtml\"},{\"title\":\"Le schéma-bilan à compléter\",\"type\":\"FILE\",\"path\":\"CHAP6/resources/Jouve_Rez_733146_P1C4_SB_pdf.xhtml\"},{\"title\":\"Le schéma-bilan\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP9/resources/Jouve_Rez_04733146_093_01_jpg.xhtml\"},{\"title\":\"Le schéma-bilan animé\",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP9/resources/Jouve_Rez_733146_P2C1_SB_flv.xhtml\"},{\"title\":\"Passereau donnant la becquée à ses oisillons\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP9/resources/Jouve_Rez_04733146_083_jpg.xhtml\"},{\"title\":\"Le schéma-bilan à compléter\",\"type\":\"FILE\",\"path\":\"CHAP9/resources/Jouve_Rez_733146_P2C1_SB_pdf.xhtml\"},{\"title\":\"Dissection d’une pelote de réjection de rapace nocturne \",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP9/resources/Jouve_Rez_04733146_P2C1_video_pelote_flv.xhtml\"},{\"title\":\"Sur le sol d’une forêt à l’automne\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP10/resources/Jouve_Rez_04733146_101_jpg.xhtml\"},{\"title\":\"Le schéma-bilan\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP10/resources/Jouve_Rez_04733146_111_01_jpg.xhtml\"},{\"title\":\"Le schéma-bilan animé\",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP10/resources/Jouve_Rez_733146_P2C2_SB_flv.xhtml\"},{\"title\":\"Le schéma-bilan à compléter\",\"type\":\"FILE\",\"path\":\"CHAP10/resources/Jouve_Rez_733146_P2C2_SB_pdf.xhtml\"},{\"title\":\"Le schéma-bilan animé\",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP13/resources/Jouve_Rez_733146_P3C1_SB_flv.xhtml\"},{\"title\":\"Le schéma-bilan à compléter\",\"type\":\"FILE\",\"path\":\"CHAP13/resources/Jouve_Rez_733146_P3C1_SB_pdf.xhtml\"},{\"title\":\"La moisson en Pays de Loire\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP13/resources/Jouve_Rez_04733146_125_jpg.xhtml\"},{\"title\":\"Le schéma-bilan\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP13/resources/Jouve_Rez_04733146_135_01_jpg.xhtml\"},{\"title\":\"Le boulanger au travail\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP14/resources/Jouve_Rez_04733146_141_jpg.xhtml\"},{\"title\":\"La fabrication du pain\",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP14/resources/Jouve_Rez_04733146_P3C2_video_pain_flv.xhtml\"},{\"title\":\"Un autre exemple : la fabrication du fromage\",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP14/resources/Jouve_Rez_04733146_P4C2_video_fromage_flv.xhtml\"},{\"title\":\"Le schéma-bilan\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP14/resources/Jouve_Rez_04733146_149_01_jpg.xhtml\"},{\"title\":\"Le schéma-bilan animé\",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP14/resources/Jouve_Rez_733146_P3C2_SB_flv.xhtml\"},{\"title\":\"Le schéma-bilan à compléter\",\"type\":\"FILE\",\"path\":\"CHAP14/resources/Jouve_Rez_733146_P3C2_SB_pdf.xhtml\"},{\"title\":\"Le schéma-bilan\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP17/resources/Jouve_Rez_04733146_171_01_jpg.xhtml\"},{\"title\":\"Le schéma-bilan animé\",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP17/resources/Jouve_Rez_733146_P4C1_SB_flv.xhtml\"},{\"title\":\"Le schéma-bilan à compléter\",\"type\":\"FILE\",\"path\":\"CHAP17/resources/Jouve_Rez_733146_P4C1_SB_pdf.xhtml\"},{\"title\":\"Une espèce rare : le dendrobate bleu\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP17/resources/Jouve_Rez_04733146_163_jpg.xhtml\"},{\"title\":\"Les vertébrés du Muséum National d’Histoire Naturelle\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP18/resources/Jouve_Rez_04733146_177_jpg.xhtml\"},{\"title\":\"Le schéma-bilan\",\"type\":\"IMAGE_FILE\",\"path\":\"CHAP18/resources/Jouve_Rez_04733146_185_01_jpg.xhtml\"},{\"title\":\"Le schéma-bilan animé\",\"type\":\"VIDEO_FILE\",\"path\":\"CHAP18/resources/Jouve_Rez_733146_P4C2_SB_flv.xhtml\"},{\"title\":\"Le schéma-bilan à compléter\",\"type\":\"FILE\",\"path\":\"CHAP18/resources/Jouve_Rez_733146_P4C2_SB_pdf.xhtml\"}]";
        com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
        Assert.assertEquals(enrichmentList, objectMapper.writeValueAsString(jouveEnrichmentList));
    }

    @Test
    public void createJouveEnrichmentsTestEmptyList() throws Exception {
        File inputFile = testUtils.readResourceAsFile(JOUVE_TOC_XHTML_FOLDER + "/toc-9782047343999_empty_enrichissiment.xhtml");
        ArrayList<JouveEnrichment> jouveEnrichmentList = htmlParsingService.createJouveEnrichmentList(inputFile);
        Assert.assertEquals(jouveEnrichmentList.size(), 0);
    }

}