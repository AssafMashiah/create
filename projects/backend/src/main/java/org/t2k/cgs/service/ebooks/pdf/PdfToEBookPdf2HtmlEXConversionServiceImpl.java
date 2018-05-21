package org.t2k.cgs.service.ebooks.pdf;

import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.usecases.ebooks.EBookConversionService;
import org.t2k.cgs.domain.usecases.ebooks.EBookService;
import org.t2k.cgs.service.ebooks.EBookUtil;
import org.t2k.cgs.domain.usecases.ebooks.EbookJobComponent;
import org.t2k.cgs.domain.model.ebooks.EBookConversionServiceTypes;
import org.t2k.cgs.domain.model.ebooks.EBookStructure;
import org.t2k.cgs.domain.model.ebooks.Page;
import org.t2k.cgs.domain.usecases.ebooks.UploadEBookData;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.utils.ZipHelper;

import javax.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;


/**
 * Created by moshe.avdiel on 1/7/2016.
 */
@Service("pdfToEBookPdf2HtmlEXConversionService")
public class PdfToEBookPdf2HtmlEXConversionServiceImpl implements EBookConversionService {

    public static final String UTILS_DIR = "utilsDir";
    public static final String ASSETS_FOLDER = "assets";
    public static final List<String> SHARED_ASSETS_FILES = Arrays.asList("pdf2htmlEX-64x64.png", "base.min.css", "styleOverride.css", "compatibility.min.js", "pdf2htmlEX.min.js");
    public static final String LD_LIBRARY = "/usr/lib";

    /*string of the command line value to run the program
            * in linux the program is installed globally, so we only need the command name
            * in windows the program runs from an exe file, so we need the path of the exe*/
    private String pdf2htmlCommandLineValue;

    //for windows
    @Value("classpath:pdf2htmlexwin/pdf2htmlexwin.zip")
    private Resource pdf2htmlEX_win;//zip file with pdf2htmlex exe files for windows, received from xml
    public static final String PDF2HTML_EXE_FILE_NAME = "pdf2htmlEX.exe"; //executable file name
    public static final String PDF2HTML_DIR_WIN = "pdf2htmlex_dir";//folder that will contain the extracted pdf2html exe file and data

    //for linux
    @Value("classpath:pdf2htmlexlin/pdf2htmlexLin.zip")
    private Resource pdf2htmlEX_lin; //zip file with pdf2html override data,received from xml
    public static final String PDF2HTML_LINUX_DIR = "/usr/local/share/pdf2htmlEX";
    public static final String PDF2HTML_LINUX_COMMAND_LINE_VALUE = "pdf2htmlEX";

    @Autowired
    private Configuration configuration;

    @Autowired
    private JobService jobService;
    @Autowired
    private EBookUtil ebookUtil;

    private Logger logger = Logger.getLogger(this.getClass());

    @PostConstruct
    public void init() throws Exception {
        if (isWindows()) {
            preparePdf2HtmlEXProgramForWindows();
        } else {
            preparePdf2HtmlEXProgramForLinux();
        }
    }

    private void preparePdf2HtmlEXProgramForWindows() throws Exception {
        // get installation path
        String utilsInstallationDir = configuration.getProperty(UTILS_DIR);
        if (utilsInstallationDir == null || utilsInstallationDir.isEmpty()) {
            throw new IllegalArgumentException("utilsDir is undefined");
        }

        File pdf2htmlExWorkFolder = new File(utilsInstallationDir, PDF2HTML_DIR_WIN);
        if (pdf2htmlExWorkFolder.exists() && pdf2htmlExWorkFolder.isDirectory()) {
            FileUtils.cleanDirectory(pdf2htmlExWorkFolder); // remove existing data from directory
        } else {
            pdf2htmlExWorkFolder.mkdirs();
        }

        // get executable program and extract it to installation dir
        String filename = pdf2htmlEX_win.getFilename();
        if (!pdf2htmlEX_win.exists()) {
            throw new Exception(String.format("pdf2htmlEX zip file %s does not exist.", filename));
        }

        logger.info(String.format("Initializing pdf2htmlEX jar from zip file : %s", filename));
        try {
            // remove old data from installation dir
            FileUtils.cleanDirectory(pdf2htmlExWorkFolder); // remove existing data from directory
        } catch (IOException e) {
            logger.error(String.format("Error while trying to clean directory: %s", pdf2htmlExWorkFolder.getAbsolutePath()), e);
            throw e;
        }

        // unzip files to installation dir
        logger.debug(String.format("Unzipping pdf2htmlEX to: %s", pdf2htmlExWorkFolder.getAbsolutePath()));
        File pdf2htmlExWinWorkProgram;
        try {
            ZipHelper.decompressInputStream(pdf2htmlEX_win.getInputStream(), pdf2htmlExWorkFolder.getAbsolutePath());
            pdf2htmlExWinWorkProgram = new File(String.format("%s/%s", pdf2htmlExWorkFolder.getAbsolutePath(), PDF2HTML_EXE_FILE_NAME));
        } catch (Exception e) {
            logger.error(String.format("Error decompressing file %s", pdf2htmlEX_win.getURL()), e);
            throw e;
        }

        pdf2htmlCommandLineValue = pdf2htmlExWinWorkProgram.getAbsolutePath();
    }

    private void preparePdf2HtmlEXProgramForLinux() throws Exception {
        String filename = pdf2htmlEX_lin.getFilename();
        if (!pdf2htmlEX_lin.exists()) {
            throw new Exception(String.format("pdf2htmlEX zip file %s does not exist.", filename));
        }

        logger.info(String.format("Initializing pdf2htmlEX override data zip file : %s", filename));

        File pdf2htmlDataFolder = new File(PDF2HTML_LINUX_DIR);
        if (pdf2htmlDataFolder.exists() && pdf2htmlDataFolder.isDirectory()) {
            FileUtils.cleanDirectory(pdf2htmlDataFolder); // remove old files from data dir
        } else {
            pdf2htmlDataFolder.mkdirs();
        }

        try {
            logger.debug(String.format("Unzipping pdf2htmlEX data files to: %s", pdf2htmlDataFolder.getAbsolutePath()));
            ZipHelper.decompressInputStream(pdf2htmlEX_lin.getInputStream(), pdf2htmlDataFolder.getAbsolutePath());
        } catch (Exception e) {
            logger.error(String.format("Error decompressing file %s", pdf2htmlEX_lin.getURL()), e);
            throw e;
        }

        pdf2htmlCommandLineValue = PDF2HTML_LINUX_COMMAND_LINE_VALUE;
    }

    @Override
    public EBookStructure generateEBookStructure(UploadEBookData uploadEBookData) throws Exception {
        logger.debug(String.format("Generating eBook structure for book: %s", uploadEBookData.getUploadedEBookFile()));

        String jobId = uploadEBookData.getJobId();
        jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), 0, Job.Status.IN_PROGRESS);

        // Convert to HTML.
        return this.convertPdfToHtml(uploadEBookData, jobId);
    }

    /**
     * @param uploadEBookData - data from user about the ebook
     * @param jobId           - job id to update for progress
     * @return converted ebook structure
     * @throws IOException
     * @throws DsException
     */
    public EBookStructure convertPdfToHtml(UploadEBookData uploadEBookData, String jobId) throws DsException, IOException, InterruptedException {
        String eBookId = uploadEBookData.getEBookId();
        String bookTitle = ebookUtil.getEBookTitle(uploadEBookData.getUploadedEBookFile());
        EBookStructure eBookStructure = new EBookStructure(bookTitle, null);

        // make a copy of the pdf file with an new name- the ebook's id, in order to support multiple languages
        File originalFile = uploadEBookData.getUploadedEBookFile().getAbsoluteFile();
        String fileExtension = FilenameUtils.getExtension(uploadEBookData.getUploadedEBookFile().getName());
        File newPdfFile = new File(String.format("%s/%s.%s", uploadEBookData.getUploadedEBookFile().getParent(), uploadEBookData.getEBookId(), fileExtension));
        try {
            FileUtils.copyFile(originalFile, newPdfFile);
        } catch (IOException e) {
            String msg = String.format("failed to copy pdf: %s ,with file renaming", uploadEBookData.getUploadedEBookFile().getAbsolutePath());
            logger.error(msg, e);
            jobService.addError(jobId, "FAILED TO CONVERT PDF TO HTML", msg, Job.Status.FAILED);
            throw new DsException(msg, e);
        }

        String filePath = newPdfFile.getAbsolutePath();
        int eBookPagesCount = ebookUtil.getPageCount(newPdfFile);
        String outPath = uploadEBookData.getEBookDir();

        if (eBookPagesCount == 0) {
            String msg = String.format("cannot convert pdf: %s file, it contains no pages", newPdfFile.getAbsolutePath());
            logger.error(msg);
            jobService.addError(jobId, "FAILED TO CONVERT PDF TO HTML", msg, Job.Status.FAILED);
            throw new DsException(msg);
        }

        for (int i = 1; i <= eBookPagesCount; i++) {
            int currentProgress = (int) (((double) i / eBookPagesCount) * 100);
            jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), currentProgress, Job.Status.IN_PROGRESS);
            String pageNumber = String.valueOf(i);
            try {
                runConversionCommand(filePath, pageNumber, outPath);
                String pageRelativeHref = String.format("%s/%s/%s/%s.html", configuration.getProperty(EBookService.E_BOOKS_BASE_FOLDER), eBookId, pageNumber, eBookId);
                addPageToStructure(pageRelativeHref, i, eBookId, null, eBookStructure);
            } catch (IOException | InterruptedException e) {
                String msg = String.format("failed to convert pdf page:%s from pdf file:%s", pageNumber, filePath);
                logger.error(msg);
                jobService.addError(jobId, "FAILED TO CONVERT PDF TO HTML", msg, Job.Status.FAILED);
                throw e;
            }
        }

        try {
            eBookStructureOptimization(uploadEBookData, eBookPagesCount);
        } catch (DsException e) {
            String msg = "failed to optimize ebook structure";
            logger.error(msg);
            jobService.addError(jobId, "FAILED TO OPTIMIZE EBOOK STRUCTURE", msg, Job.Status.FAILED);
        }

        return eBookStructure;
    }

    private void eBookStructureOptimization(UploadEBookData uploadEBookData, int eBookPagesCount) throws DsException {
        String baseEbookDir = uploadEBookData.getEBookDir();
        // loop over generated pages folders, starts from 1-n
        for (int i = 1; i <= eBookPagesCount; i++) {
            /* move commonly used files from each page's folder to one shared "assets folder*/
            moveSharedFilesToAssetsFolder(baseEbookDir, i, uploadEBookData.getEBookId());

            /* create sha1 signature on each font file, and move it to "fonts" folder,
            * to allow reuse of fonts between pages*/
            optimizeFontsStructure(baseEbookDir, i);
        }
    }

    private void optimizeFontsStructure(String eBookDir, int pageIndex) throws DsException {
        String cssFilePath = String.format("%s/%d/page-%d.css", eBookDir, pageIndex, pageIndex);
        File cssWithFontFaceFile = new File(cssFilePath);
        // read css file as string
        String cssWithFontFace = readFileAsString(cssWithFontFaceFile);

        // extract fonts paths for css file
        List<String> fontsFaces = ebookUtil.getCssFontsFacesFromHtml(cssWithFontFace, "@font-face?\\{[\\s\\S]*?\\}");

        if (!fontsFaces.isEmpty()) {
            // create sha1 on all fonts in the page and move them to "fonts" folder
            for (String fontFace : fontsFaces) {
                String fontName = ebookUtil.getFontPathFromFontFace(fontFace, "src:url(", ")");
                File fontFile = new File(eBookDir, String.format("%d/%s", pageIndex, fontName));
                if (!fontFile.exists()) {
                    logger.warn(String.format("optimizeFontsStructure. Missing font %s from css file %s, eBookId: %s", fontFile.getName(), cssWithFontFaceFile.getName(), new File(eBookDir).getName()));
                    continue;
                }

                String fontSha1 = ebookUtil.moveFontsToFolderAndRenameToSha1(String.format("%d/%s", pageIndex, fontName), eBookDir);
                cssWithFontFace = cssWithFontFace.replace(String.format("src:url(%s)", fontName), String.format("src:url(../%s/%s)", EBookUtil.FONTS_FOLDER, fontSha1));
            }

            writeStringToFile(cssWithFontFaceFile, cssWithFontFace);
        }
    }

    private String readFileAsString(File file) throws DsException {
        String fileString;
        try {
            fileString = FileUtils.readFileToString(file, "UTF-8");
        } catch (IOException e) {
            String msg = String.format("Failed to read file: %s ,in eBookStructureOptimization process", file.getAbsolutePath());
            logger.error(msg, e);
            throw new DsException(msg, e);
        }

        return fileString;
    }

    private void writeStringToFile(File file, String data) throws DsException {
        try {
            FileUtils.writeStringToFile(file, data, "UTF-8");
        } catch (IOException e) {
            String msg = String.format("Failed to write data to file: %s ,in eBookStructureOptimization process", file.getAbsolutePath());
            logger.error(msg, e);
            throw new DsException(msg, e);
        }
    }

    /* move the the general assets only once on the first page folder,
     because that in all the other files folders the files are the same */
    private void moveSharedFilesToAssetsFolder(String baseEbookDir, int i, String eBookId) throws DsException {
        // read html file of current page as string
        String htmlFilePath = String.format("%s/%d/%s.html", baseEbookDir, i, eBookId);
        File htmlFile = new File(htmlFilePath);
        String htmlFileString = readFileAsString(htmlFile);

        /* move each of the specified files to assets folder
        * if the file already exists there, we can delete it from the page folder*/
        File assetsFolder = new File(String.format("%s/%s", baseEbookDir, ASSETS_FOLDER));

        for (String fileName : SHARED_ASSETS_FILES) {
            File srcFile = new File(String.format("%s/%d/%s", baseEbookDir, i, fileName));
            File outFile = new File(String.format("%s/%s", assetsFolder, fileName));
            if (srcFile.exists()) {
                // delete original file from the page folder
                if (outFile.exists()) {
                    try {
                        FileUtils.forceDelete(srcFile);
                    } catch (IOException e) {
                        String msg = String.format("failed to delete asset file: %s", srcFile.getAbsolutePath());
                        logger.error(msg, e);
                        throw new DsException(msg, e);
                    }

                } else { // move file to assets folder
                    try {
                        FileUtils.moveFileToDirectory(srcFile, assetsFolder, true);
                    } catch (IOException e) {
                        String msg = String.format("failed to move file: %s, to assets directory", srcFile.getAbsolutePath());
                        logger.error(msg, e);
                        throw new DsException(msg, e);
                    }
                }
                htmlFileString = htmlFileString.replace(fileName, String.format("../%s/%s", ASSETS_FOLDER, fileName));
            }
        }
        // save new html with updated assets paths
        writeStringToFile(htmlFile, htmlFileString);
    }

    @Override
    public boolean isValid(UploadEBookData uploadEBookData) throws DsException {
        // pdf is always valid, so we'll return always true here
        return true;
    }

    @Override
    public void generatePageThumbnails(EBookStructure eBookStructure, UploadEBookData uploadEBookData) throws DsException {
        String jobId = uploadEBookData.getJobId();
        jobService.updateJobProgress(jobId, EbookJobComponent.GENERATING_PAGE_THUMBNAILS.getTitle(), 0, Job.Status.IN_PROGRESS);

        String thumbnailsFolderName = EBookService.E_BOOKS_THUMBNAILS_FOLDER;
        File originalPdfFile = uploadEBookData.getUploadedEBookFile().getAbsoluteFile();
        String pdfPath = originalPdfFile.getAbsolutePath();
        String outputPath = String.format("%s/%s", uploadEBookData.getEBookDir(), thumbnailsFolderName);
        String ebookFolder = configuration.getProperty(EBookService.E_BOOKS_BASE_FOLDER);
        String eBookId = uploadEBookData.getEBookId();

        // add a thumbnails directory in the ebook
        File thumbnailsDir = new File(outputPath);
        if (!thumbnailsDir.exists()) {
            thumbnailsDir.mkdirs();
        }

        String absoluteOutPath = thumbnailsDir.getAbsolutePath();
        int thumbnailWidth = configuration.getIntProperty("eBookThumbnailWidth");
        int thumbnailHeight = configuration.getIntProperty("eBookThumbnailHeight");
        List<String> imageRefs;

        try {
            imageRefs = ebookUtil.generateThumbnailsForPdf(pdfPath, absoluteOutPath, thumbnailHeight, thumbnailWidth, jobId);
        } catch (Exception e) {
            String errorMsg = String.format("Failed to generate thumbnails at path: %s", absoluteOutPath);
            logger.error(errorMsg);
            jobService.addError(jobId, "FAILED TO GENERATE THUMBNAILS", errorMsg, Job.Status.FAILED);
            throw new DsException(errorMsg, e);
        }

        List<Page> pages = eBookStructure.getPages();
        if (imageRefs.size() > 0) {
            // add the thumbnail reference to each of the ebook's pages
            for (int i = 1; i <= pages.size(); i++) {
                String thumbnailFileName = String.format("%d%s", i, EBookUtil.THUMBNAIL_EXTENSION);
                if (imageRefs.contains(thumbnailFileName)) {
                    String thumbnailHref = String.format("%s/%s/%s/%s", ebookFolder, eBookId, thumbnailsFolderName, thumbnailFileName);
                    pages.get(i - 1).setThumbnailHref(thumbnailHref);

                    //the first page thumbnail is used a a cover image of the ebook
                    if (i == 1) {
                        eBookStructure.setCoverImage(thumbnailHref);
                    }
                } else {
                    logger.error("missing thumbnail: " + thumbnailFileName);
                }
            }
        }
    }

    private void addPageToStructure(String pageRelativeHref, int pageNumber, String ebookId, String thumbnailHref, EBookStructure eBookStructure) {
        String pageTitle = String.format("Page %d", pageNumber);
        String pageId = String.format("page-%d", pageNumber);
        Page page = new Page(pageId, ebookId, pageTitle, pageRelativeHref, pageNumber, thumbnailHref);
        eBookStructure.addPage(page);
    }

    //activate the pdf2htmlEx conversion service
    private void runConversionCommand(String filePath, String pageNumber, String baseOutputFolder) throws IOException, InterruptedException, DsException {
        String outputPath = String.format("%s/%s", baseOutputFolder, pageNumber);
        File pageDir = new File(outputPath);
        if (!pageDir.exists()) {
            pageDir.mkdirs();
        }

        List<String> commands = new ArrayList<>();

        //continue code same for linux and windows
        commands.add(pdf2htmlCommandLineValue);
        commands.add(filePath);
        commands.add("--zoom");
        commands.add("1.9");
        commands.add("--tounicode");
        commands.add("1");
        commands.add("--first-page");  // convert one page at a time
        commands.add(pageNumber);
        commands.add("--last-page");
        commands.add(pageNumber);
        commands.add("--embed");  // don't embed fonts and images, put them in separate files
        commands.add("cfijo");
        commands.add("--css-filename");
        commands.add(String.format("page-%s.css", pageNumber));
        commands.add("--outline-filename");
        commands.add(String.format("page-%s.outline", pageNumber));

        commands.add("--dest-dir");
        commands.add(pageDir.getAbsolutePath());

        ProcessBuilder processBuilder = new ProcessBuilder(commands);
        if (!isWindows()) {
            processBuilder.environment().put("LD_LIBRARY_PATH", LD_LIBRARY);
        }

        processBuilder.redirectErrorStream(true);
        Process process = processBuilder.start();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
                logger.debug(line);
            }
        }

        // read error stream
        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new DsException(String.format("Error in conversion service for file %s", filePath));
        }
    }

    private boolean isWindows() {
        String OS_NAME = System.getProperty("os.name").toLowerCase();
        return OS_NAME.contains("windows");
    }

    @Override
    public EBookConversionServiceTypes getEBookConversionServiceType() {
        return EBookConversionServiceTypes.PDFEX;
    }

    @Override
    public String getEbookConversionLibraryVersion() {
        return "1.0";
    }
}

