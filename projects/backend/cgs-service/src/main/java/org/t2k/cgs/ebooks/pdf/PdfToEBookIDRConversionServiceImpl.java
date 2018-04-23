package org.t2k.cgs.ebooks.pdf;

import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;
import org.jpedal.examples.html.PDFtoHTML5Converter;
import org.jpedal.exception.PdfException;
import org.jpedal.render.output.IDRViewerOptions;
import org.jpedal.render.output.html.HTMLConversionOptions;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.ebooks.EBookConversionService;
import org.t2k.cgs.ebooks.EBookService;
import org.t2k.cgs.ebooks.EBookUtil;
import org.t2k.cgs.ebooks.EbookJobComponent;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.model.ebooks.EBookStructure;
import org.t2k.cgs.model.ebooks.Page;
import org.t2k.cgs.model.ebooks.UploadEBookData;
import org.t2k.cgs.model.job.Job;
import org.t2k.cgs.model.job.JobService;
import org.t2k.cgs.utils.directory.DirectoryMonitor;
import org.t2k.cgs.utils.directory.HtmlFilesFilter;
import org.t2k.cgs.utils.directory.PageNumberComparator;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created by moshe.avdiel on 11/1/2015.
 * <p>
 * NOTE: @alex.burdusel - to invoke idr from command line run:
 * java -Dorg.jpedal.pdf2html.textMode=svg_shapetext_selectable -cp jpdf2html-licensed-08-02-2016.jar org.jpedal.examples.html.PDFtoHTML5Converter Test2.pdf test
 * where Test2.pdf is the name of your pdf file and test is the output dir
 */
@Service("pdfToEBookIDRConversionService")
public class PdfToEBookIDRConversionServiceImpl implements EBookConversionService {

    private Logger logger = Logger.getLogger(this.getClass());

    private static final String CONVERTED_EBOOK_DIRECTORY = "converted/";

    @Autowired
    private Configuration configuration;

    @Autowired
    private ApplicationContext appContext;

    @Autowired
    private JobService jobService;

    @Autowired
    private EBookUtil ebookUtil;

    @Override
    public EBookStructure generateEBookStructure(UploadEBookData uploadEBookData) throws Exception {
        String jobId = uploadEBookData.getJobId();
        jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), 0, Job.Status.IN_PROGRESS);

        String eBookId = uploadEBookData.getEBookId();
        String bookTitle = ebookUtil.getEBookTitle(uploadEBookData.getUploadedEBookFile()); // remove the ".pdf" from file name
        EBookStructure eBookStructure = generateEBookStructure(bookTitle, uploadEBookData.getUploadedEBookFile().getAbsolutePath(), uploadEBookData.getEBookDir(), eBookId, jobId);

        String ebookBasePath = String.format("%s/publishers/%d", configuration.getProperty("cmsHome"), uploadEBookData.getPublisherId());
        reverseBookText(eBookStructure, ebookBasePath);

        jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), 100, Job.Status.IN_PROGRESS);
        return eBookStructure;
    }

    @Override
    public boolean isValid(UploadEBookData uploadEBookData) throws DsException {
        return true;
    }

    @Override
    public void generatePageThumbnails(EBookStructure eBookStructure, UploadEBookData uploadEBookData) throws Exception {
        String jobId = uploadEBookData.getJobId();
        jobService.updateJobProgress(jobId, EbookJobComponent.GENERATING_PAGE_THUMBNAILS.getTitle(), 0, Job.Status.IN_PROGRESS);
        jobService.updateJobProgress(jobId, EbookJobComponent.GENERATING_PAGE_THUMBNAILS.getTitle(), 100, Job.Status.IN_PROGRESS);
    }

    @Override
    public EBookConversionServiceTypes getEBookConversionServiceType() {
        return EBookConversionServiceTypes.IDR;
    }

    @Override
    public String getEbookConversionLibraryVersion() {
        return "1.0";
    }

    private EBookStructure generateEBookStructure(String bookTitle, String eBookFilePath, String htmlOutputDir, String eBookId, String jobId) throws DsException {

        File convertedPdfHtmlDir;

        try {
            convertedPdfHtmlDir = convertPdf2Html(eBookFilePath, htmlOutputDir, jobId);
        } catch (Exception e) {
            throw new DsException(e);
        }
        return htmlToEBookStructure(bookTitle, convertedPdfHtmlDir, eBookId);
    }

    private File convertPdf2Html(String eBookFilePath, String htmlOutputDir, String jobId) throws PdfException, IOException, DsException {
        HTMLConversionOptions conversionOptions = new HTMLConversionOptions();//Set conversion options here
        logger.info("Setting IDR conversion option disableComments=" + true);
        conversionOptions.setDisableComments(true);

        String separateToWords = configuration.getProperty("IDRConversionSeparateToWords");
        String keepGlyfsSeparate = configuration.getProperty("IDRConversionKeepGlyfsSeparate");
        if (separateToWords != null) {
            logger.info("Setting IDR conversion option separateToWords=" + separateToWords);
            conversionOptions.setSeparateToWords(Boolean.parseBoolean(separateToWords));
        }
        if (keepGlyfsSeparate != null) {
            logger.info("Setting IDR conversion option keepGlyfsSeparate=" + keepGlyfsSeparate);
            conversionOptions.setKeepGlyfsSeparate(Boolean.parseBoolean(keepGlyfsSeparate));
        }

        HTMLConversionOptions.TextMode textMode;
        try {
            textMode = HTMLConversionOptions.TextMode.valueOf(configuration.getProperty("IDRConversionTextModeValue"));
        } catch (Exception e) {
            //set default value if something went wrong in the configuration file
            textMode = HTMLConversionOptions.TextMode.SVG_SHAPETEXT_SELECTABLE;
        }
        logger.info("Setting IDR conversion option textMode=" + textMode.name());
        conversionOptions.setTextMode(textMode);
        logger.info("Setting IDR conversion option omitNameDir=" + true);
        conversionOptions.setOmitNameDir(true); // make IDR solutions produce the converted file in the folder we path to the converter

        IDRViewerOptions viewerOptions = new IDRViewerOptions();//Set viewer options here

        File pdfFile = new File(eBookFilePath);

        File htmlFullPathOutputDir = new File(htmlOutputDir, CONVERTED_EBOOK_DIRECTORY);

        PDFtoHTML5Converter converter = new PDFtoHTML5Converter(pdfFile, htmlFullPathOutputDir, conversionOptions, viewerOptions);

        int totalPages = ebookUtil.getPageCount(pdfFile);

        DirectoryMonitor directoryMonitor = (DirectoryMonitor) appContext.getBean("directoryMonitor", htmlFullPathOutputDir, jobId, totalPages);
        new Thread(directoryMonitor).start();

        converter.convert();

        directoryMonitor.stop();

        String errors = conversionOptions.getErrors();
        if (errors != null && !errors.trim().isEmpty()) {
            throw new PdfException(errors);
        }

        changeFontsStructure(htmlFullPathOutputDir);

        return htmlFullPathOutputDir;
    }

    /**
     * Changes the location of fonts files from their original, location in which they were created by IDR Solutions' code,
     * to one 'fonts' under the eBook root folder.
     * This change of location also takes care of changing the references to the fonts files in each html file an deletes
     * the old fonts' directories.
     *
     * @param pdfDir the directory of the PDF eBook's resources.
     * @throws IOException
     */
    private void changeFontsStructure(File pdfDir) throws IOException, DsException {
        logger.debug(String.format("changeFontsStructure. About to change fonts structure of PDF eBook: %s", pdfDir.getName()));
        Set<String> relativeFontsDirs = new HashSet<>();
        createFontsDir(pdfDir);

        for (File file : pdfDir.listFiles()) {
            if (FilenameUtils.getExtension(file.getAbsolutePath()).contains("htm")) { // catches htm, html and xhtml files
                String htmlPage = FileUtils.readFileToString(file, "UTF-8");
                List<String> fontsFaces = ebookUtil.getCssFontsFacesFromHtml(htmlPage, "@font-face? \\{[\\s\\S]*?\\}");

                if (fontsFaces.isEmpty()) {
                    continue;
                }

                //create sha1 on all fonts in the page and move them to "fonts" folder
                for (String fontFace : fontsFaces) {
                    String fontRelativeDir = ebookUtil.getFontPathFromFontFace(fontFace, "src: url(\"", "\")");
                    File fontFile = new File(pdfDir, fontRelativeDir);
                    if (!fontFile.exists()) {
                        logger.warn(String.format("changeFontsStructure. Missing font %s from html page %s, eBookId: %s", fontFile.getName(), file.getName(), pdfDir.getParentFile().getName()));
                        continue;
                    }

                    relativeFontsDirs.add(fontRelativeDir.substring(0, fontRelativeDir.indexOf(ebookUtil.FONTS_FOLDER) + ebookUtil.FONTS_FOLDER.length()));
                    String fontSha1 = ebookUtil.moveFontsToFolderAndRenameToSha1(fontRelativeDir, pdfDir.getAbsolutePath());
                    htmlPage = htmlPage.replace(String.format("src: url(\"%s\")", fontRelativeDir), String.format("src: url(%s/%s)", ebookUtil.FONTS_FOLDER, fontSha1));
                }

                FileUtils.writeStringToFile(file, htmlPage, "UTF-8");
            }
        }

        deleteOldFontsDirsFromDisk(pdfDir, relativeFontsDirs);

        logger.debug(String.format("changeFontsStructure. Changing of fonts structure of PDF eBook: %s ended successfully.", pdfDir.getName()));
    }

    private void createFontsDir(File pdfFile) {
        File fontsDir = new File(pdfFile.getAbsolutePath(), "fonts");
        if (!fontsDir.exists()) {
            fontsDir.mkdir();
        }
    }

    private void deleteOldFontsDirsFromDisk(File pdfFile, Set<String> relativeFontsDirs) throws IOException {
        for (String relativeFontsDir : relativeFontsDirs) {
            File oldFontsDir = new File(pdfFile, relativeFontsDir);
            try {
                FileUtils.forceDelete(oldFontsDir);
            } catch (IOException e) {
                logger.warn(String.format("changeFontsStructure. Failed to delete old fonts directory: %s", oldFontsDir.getCanonicalFile()));
            }
        }
    }

    /**
     * Generates ebook structure object using the converted pdf's HTML directory.
     * this is a specific implementation depending on IDR solution's conversion output
     *
     * @param htmlBaseDir - a folder containing the conversion output (html files, css, fonts, etc)
     * @param eBookId     - the id of the ebook that exists in the directory
     * @return EBookStructure object representing the ebook
     */
    private EBookStructure htmlToEBookStructure(String originalFileName, File htmlBaseDir, String eBookId) {
        // Filter for only HTML Files:  (Non-Directory, with HTM or HTML extension).
        File[] htmlFiles = htmlBaseDir.listFiles(new HtmlFilesFilter());

        EBookStructure eBookStructure = new EBookStructure(originalFileName, "");

        // sorting pages by page number (folders = page numbers)
        Arrays.sort(htmlFiles, new PageNumberComparator());

        // going over all html files, creating an ebook-page object for each one
        for (File htmlFile : htmlFiles) {
            // Add only filenames with a number..
            String filename = htmlFile.getName();
            Matcher numberMatcher = Pattern.compile("\\d+").matcher(filename);
            if (numberMatcher.find()) {
                String numberMatched = numberMatcher.group();
                int pageNumber = Integer.parseInt(numberMatched); // finding page number from the html file name

                // Generate Relative HREF with structure: ../ebooks/ebookId/[converted]/htmlfilename.html
                String pageRelativeHref = String.format("%s/%s/%s/%s", configuration.getProperty(EBookService.E_BOOKS_BASE_FOLDER), eBookId, htmlBaseDir.getName(), htmlFile.getName());
                String thumbnailHref = String.format("%s/%s/%s/thumbnails/%d.jpg", configuration.getProperty(EBookService.E_BOOKS_BASE_FOLDER), eBookId, htmlBaseDir.getName(), pageNumber);
                Page page = new Page(String.format("page-%d", pageNumber), eBookId, String.format("Page %d", pageNumber), pageRelativeHref, pageNumber, thumbnailHref);
                eBookStructure.addPage(page);
            }
        }

        // set cover image using the first page's thumbnail
        if (!eBookStructure.getPages().isEmpty() && eBookStructure.getPages().get(0).getThumbnailHref() != null) {
            eBookStructure.setCoverImage(eBookStructure.getPages().get(0).getThumbnailHref());
        }
        return eBookStructure;
    }

    public void reverseBookText(EBookStructure eBookStructure, String ebookBasePath) throws DsException {
        for (Page page : eBookStructure.getPages()) {

            File htmlFile = new File(String.format("%s/%s", ebookBasePath, page.getHref()));
            String html;
            try {
                html = FileUtils.readFileToString(htmlFile);
            } catch (IOException e) {
                String msg = String.format("Failed to read html File%s", htmlFile.getAbsolutePath());
                logger.error(msg, e);
                throw new DsException(msg, e);
            }
            String result = null;
            try {
                result = getReversedPageHtml(html);
            } catch (Throwable t) {
                logger.error(String.format("could not parse html file : %s", page.getHref()));
            }
            if (result != null) {
                //re-save the htmlFile
                try {
                    FileUtils.writeStringToFile(htmlFile, result, "UTF-8");
                } catch (IOException e) {
                    String msg = String.format("Failed to write data to html File%s", htmlFile.getAbsolutePath());
                    logger.error(msg, e);
                    throw new DsException(msg, e);
                }
            }
        }
    }

    public String getReversedPageHtml(String pageHtml) {
        Document document = Jsoup.parse(pageHtml);
        Elements bdoElements = document.getElementsByTag("bdo");

        for (Element bdo : bdoElements) {
            String innerText = bdo.text();
            String logicalText = EBookUtil.visualToLogical(innerText);
            //String reversedText = new StringBuilder(innerText).reverse().toString();
            bdo.html(logicalText).tagName("span").removeAttr("dir").attr("style", "direction:rtl;unicode-bidi:embed;");
        }
        return document.outerHtml();
    }
}