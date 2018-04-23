package org.t2k.cgs.ebooks;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.log4j.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.enums.OverlayElementsTypes;
import org.t2k.cgs.model.ebooks.JouveEnrichment;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by roee.kachila on 1/25/2016.
 */
@Service
public class HtmlParsingService {

    public static final String CHAR_REPLACE = "CharReplace";

    private static Logger logger = Logger.getLogger(HtmlParsingService.class);

    private HashMap<String, String> charsToReplace = new HashMap<>();

    @Value("classpath:textSearchConfiguration/textSearchConfigurationFile.csv")
    private Resource textSearchConfigurationResource;

    /**
     * Goes over an html file and returns the text it contains, without any tags, scripts, css, etc.
     *
     * @param htmlFile - contains html
     * @return a String containing all the text
     */
    public String extractText(File htmlFile) throws DsException {
        Document doc;
        try {
            doc = Jsoup.parse(htmlFile, "UTF-8");
        } catch (IOException e) {
            String errorMsg = String.format("Error parsing html file: %s", htmlFile.getAbsolutePath());
            logger.error(errorMsg, e);
            throw new DsException(errorMsg, e);
        }

        // get page text
        String extractedText = doc.body().text();
        // replace Pseudo Characters such as non-breaking spaces, apostrophe and hyphen according to the configuration file
        return replacePseudoCharacters(extractedText);
    }


    private String replacePseudoCharacters(String extractedText) {

        if (charsToReplace.isEmpty()) { // no characters to replace
            return extractedText;
        }

        for (Map.Entry<String, String> charEntry : charsToReplace.entrySet()) {
            String pseudoChar = StringEscapeUtils.unescapeJava(charEntry.getKey());
            String realChar = StringEscapeUtils.unescapeJava(charEntry.getValue());
            extractedText = extractedText.replace(pseudoChar, realChar);
        }
        return extractedText;
    }

    /**
     * add CSS attributes to ePub pages in order to fix the resize problem.
     * ePub pages which might need GUI fix are ePub pages with PDF, scaling problem, pages which contain only pictures
     * adding the CSS rule is done by string manipulation because the JSoup escapes to characters which xhtml doesn't support. for example Jsoup changes &#160; to &nbsp;
     *
     * @param htmlFile         - file of specific eBook page (may be html or xhtml file)
     * @param epubPageCssRules - the CSS rules that we add manually to eBook pages
     */
    public void changePageVisualization(File htmlFile, String epubPageCssRules) throws DsException {
        String styleTagToAdd = "<style data-author=\"t2k\"> " + epubPageCssRules + " </style>";
        try {
            String pageContent;
            pageContent = FileUtils.readFileToString(htmlFile, "UTF-8");
            if (pageContent.contains("<head>")) {
                //  search for "<head>" and prepend the CSS rules as the default values
                pageContent = pageContent.replace("<head>", "<head>" + styleTagToAdd);
            } else {
                // we search for "<body" and not for "<body>" because the tag may may have inline style
                pageContent = pageContent.replace("<body", "<head>" + styleTagToAdd + "</head>" + "<body");
            }
            FileUtils.writeStringToFile(htmlFile, pageContent, "UTF-8");
        } catch (IOException e) {
            String errorMsg = String.format("Error in changePageVisualization for fixing the resize problem, file: %s", htmlFile.getAbsolutePath());
            logger.error(errorMsg, e);
            throw new DsException(errorMsg, e);
        }
    }


    /**
     * Checks if the given page is a Jouve studio page.
     *
     * @param htmlFile - file of specific eBook page (may be html or xhtml file)
     * @return Boolean is it a Jouve Studio eBook
     */
    public boolean checkIsJouveStudioPage(File htmlFile) throws DsException {
        try {
            // use Jsoup for questioning the HTML
            Document doc = Jsoup.parse(htmlFile, "UTF-8");
            // check is it Jouve page
            return isJouvePage(doc);
        } catch (IOException e) {
            String errorMsg = String.format("Error in checkIsJouveStudioPage while checking is it Jouve Studio page, file: %s", htmlFile.getAbsolutePath());
            logger.error(errorMsg, e);
            throw new DsException(errorMsg, e);
        }
    }


    /**
     * Creates Jouve Enrichment List from the toc.xhtml
     * The Jouve enrichment is defined by the file toc.xhtml which is located in the eBook
     *
     * @param htmlFile - file of the toc.xhtml
     * @return ArrayList with all the Jouve Enrichment
     */
    public ArrayList<JouveEnrichment> createJouveEnrichmentList(File htmlFile) throws DsException {
        try {
            ArrayList<JouveEnrichment> jouveEnrichmentList = new ArrayList<>();
            // use Jsoup for questioning the HTML
            Document doc = Jsoup.parse(htmlFile, "UTF-8");
            // the list of Jouve's Digital Assets is defined under the "jouve-lda" class
            Elements jouveElements = doc.select(".jouve-lda li a");
            for (Element jouveElement : jouveElements) {
                jouveEnrichmentList.add(createJouveEnrichmentElement(jouveElement));
            }
            return jouveEnrichmentList;
        } catch (Exception e) {
            String errorMsg = String.format("Error in createJouveEnrichmentList while creating Jouve Enrichment List, file: %s", htmlFile.getAbsolutePath());
            logger.error(errorMsg, e);
            throw new DsException(errorMsg, e);
        }
    }


    /**
     * Fix Jouve Studio Ebooks which have text that can't be highlight.
     * Some Jouve Studio Ebooks have text which is transparent, so we manually add CSS rules.
     * adding the CSS rule is done by string manipulation because the JSoup escapes to characters which xhtml doesn't support. for example Jsoup changes &#160; to &nbsp;
     *
     * @param htmlFile                    - file of specific eBook page (may be html or xhtml file)
     * @param jouveStudioEpubPageCssRules - the CSS rules that we add manually to eBook pages
     */
    public void fixJouveStudioEbooks(File htmlFile, String jouveStudioEpubPageCssRules) throws DsException {
        try {
            // boolean which indicates if we found jouve Studio that should be fixed
            Boolean pageWhichNeedsFixing = false;
            // use Jsoup for manipulating the HTML from the Java
            Document doc = Jsoup.parse(htmlFile, "UTF-8");
            Elements linesToFix = doc.select("div.line");
            for (Element line : linesToFix) {
                String lineStyle = line.attr("style");
                // problematic jouve Studio have div with class 'line' which have opacity:0)
                if (lineStyle.contains("opacity:0")) {
                    pageWhichNeedsFixing = true;
                    break;
                }
            }

            // check is it problematic jouve page which can't be highlighted
            if (pageWhichNeedsFixing) {
                String pageContent = FileUtils.readFileToString(htmlFile, "UTF-8");
                String styleTagToAdd = "<style data-author=\"t2k\"> " + jouveStudioEpubPageCssRules + " </style>";
                if (pageContent.contains("<head>")) {
                    //  search for "<head>" and prepend the CSS rules
                    pageContent = pageContent.replace("<head>", "<head>" + styleTagToAdd);
                } else {
                    // we search for "<body" and not for "<body>" because the tag may may have inline style
                    pageContent = pageContent.replace("<body", "<head>" + styleTagToAdd + "</head>" + "<body");
                }
                FileUtils.writeStringToFile(htmlFile, pageContent, "UTF-8");
            }
        } catch (IOException e) {
            String errorMsg = String.format("Error in fixJouveStudioEbooks for fixing the Jouve Studio problem, file: %s", htmlFile.getAbsolutePath());
            logger.error(errorMsg, e);
            throw new DsException(errorMsg, e);
        }
    }

    /**
     * init method for this class, will read the properties file from
     * textSearchConfigurationResource and will set the key-value pairs to replace in the converted HTML files.
     * <p>
     * example for a line in the configuration file: CharReplace,\u0060,\u0027
     * param 1.	Type  (CharReplace or RegEx) ? till now we got only CharReplace
     * param 2.	The char to replace (special char which seems like the regular char)
     * param 3.	The char that should be to placed (the regular char, as you got on the keyboard)
     */
    @PostConstruct
    public void readConfigurationFile() throws IOException {
        List<String> fileLines;
        try {
            fileLines = IOUtils.readLines(textSearchConfigurationResource.getInputStream(), "UTF-8");
        } catch (IOException e) {
            logger.error("Could not read configuration file for HtmlParsingService, method: readConfigurationFile", e);
            throw e;
        }

        charsToReplace = getValuesToReplaceFromFile(CHAR_REPLACE, fileLines);
    }

    private HashMap<String, String> getValuesToReplaceFromFile(String replaceTypeString, List<String> lines) {
        HashMap<String, String> result = new HashMap<>();
        if (lines != null)
            for (String line : lines) {
                if (line.contains(replaceTypeString)) {
                    result.put(line.split(",")[1], line.split(",")[2]);
                }
            }
        return result;
    }


    /**
     * Detects is it Jouve page
     * The result is based on attributes of the page: page title, its CSS and JS script, its DOM elements
     * In the end, the function returns Boolean is it a Jouve eBook
     *
     * @param doc - Document which represents the HTML of the current page
     * @return a Boolean is it a Jouve page
     */
    private boolean isJouvePage(Document doc) {
        String docTitle = doc.title();
        String docHtml = doc.html();
        String docHead = "";
        if (doc.head() != null) {
            docHead = doc.head().html();
        }

        // check according its title
        boolean isItJouvePage = (docTitle.equals("JOUVE STUDIO")) || (docTitle.equals("LOCUPLETO-JOUVE"));
        if (isItJouvePage) {
            return isItJouvePage;
        }

        // check according its javascript links
        isItJouvePage = (isItJouvePage) || (docHead.contains("jouve_fl.js"));
        isItJouvePage = (isItJouvePage) || (docHead.contains("jouve_tooltip.js"));
        isItJouvePage = (isItJouvePage) || (docHead.contains("jouve_highlighting.js"));
        if (isItJouvePage) {
            return isItJouvePage;
        }

        // check according its CSS links
        isItJouvePage = (isItJouvePage) || (docHead.contains("jouve_fl.css"));
        isItJouvePage = (isItJouvePage) || (docHead.contains("jouve_tooltip.css"));
        isItJouvePage = (isItJouvePage) || (docHead.contains("jouve_highlighting.css"));
        if (isItJouvePage) {
            return isItJouvePage;
        }

        // check according its DOM elements
        isItJouvePage = (isItJouvePage) || (docHtml.contains(".jouve-open-html"));
        isItJouvePage = (isItJouvePage) || (docHtml.contains(".jouve-open-audio"));
        isItJouvePage = (isItJouvePage) || (docHtml.contains(".jouve-open-video"));
        isItJouvePage = (isItJouvePage) || (docHtml.contains(".jouve-open-article"));
        isItJouvePage = (isItJouvePage) || (docHtml.contains(".jouve-widget-src-block"));

        // end of checking, return a flag was it a Jouve page
        return isItJouvePage;
    }


    /**
     * Creates Jouve Enrichment element from jsoup element
     * The enrichment type is defined by the OverlayElementsTypes enum
     *
     * @param jouveElement - jsoup element of a Jouve Enrichment
     * @return JouveEnrichment with title, type and path (relative path from the toc.xhtml)
     */
    private JouveEnrichment createJouveEnrichmentElement(Element jouveElement) {
        String originalTitle = jouveElement.childNode(0).attr("text");
        String originalPath = jouveElement.attributes().get("href");
        String originalType = jouveElement.attributes().get("class");
        String updatedType;

        switch (originalType) {
            case "jouve-open-audio":
                updatedType = OverlayElementsTypes.AUDIO_FILE.toString();
                break;
            case "jouve-open-video":
                updatedType = OverlayElementsTypes.VIDEO_FILE.toString();
                break;
            case "jouve-open-image":
                updatedType = OverlayElementsTypes.IMAGE_FILE.toString();
                break;
            case "jouve-open-article":
                // Article may contain image so we need to check is it Image or Article
                String articleType = ((Element) jouveElement).attributes().get("data-jouve-article");
                String labelType = ((Element) jouveElement).attributes().get("data-jouve-type-label");
                if ((articleType.equals("image")) || (labelType.equals("Images"))) {
                    updatedType = OverlayElementsTypes.IMAGE_FILE.toString();
                } else {
                    updatedType = OverlayElementsTypes.ARTICLE.toString();
                }
                break;
            case "jouve-open-zooms":
                updatedType = OverlayElementsTypes.ARTICLE.toString();
                break;
            case "jouve-open-zooms-corriges":
                updatedType = OverlayElementsTypes.ARTICLE.toString();
                break;
            case "jouve-open-pdf":
                updatedType = OverlayElementsTypes.FILE.toString();
                break;
            case "jouve-open-file":
                updatedType = OverlayElementsTypes.FILE.toString();
                break;
            case "jouve-open-html":
                updatedType = OverlayElementsTypes.HTML.toString();
                break;
            default:
                updatedType = OverlayElementsTypes.EXTERNAL_URL.toString();
                break;
        }

        return new JouveEnrichment.Builder()
                .title(originalTitle)
                .type(updatedType)
                .path(originalPath)
                .build();
    }
}
