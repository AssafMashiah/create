package org.t2k.cgs.service;

import com.t2k.configurations.Configuration;
import fr.sertelon.media.CMYKReader;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.SystemUtils;
import org.apache.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ObjectNode;
import org.codehaus.jackson.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.InitServiceException;
import org.t2k.cgs.domain.usecases.ThumbnailsGeneratorService;
import org.t2k.cgs.domain.usecases.ebooks.EBookCleanupService;
import org.t2k.cgs.domain.usecases.ebooks.EBookService;
import org.t2k.cgs.domain.usecases.ebooks.EbookJobComponent;
import org.t2k.cgs.domain.model.ebooks.EBookThumbnail;
import org.t2k.cgs.domain.model.ebooks.PageInsideLesson;
import org.t2k.cgs.domain.usecases.ebooks.UploadEBookData;
import org.t2k.cgs.domain.model.ebooks.overlayElement.OverlayElement;
import org.t2k.cgs.utils.FilesUtils;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.domain.usecases.CmsService;

import javax.annotation.PostConstruct;
import java.io.*;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 10/12/2015
 * Time: 08:44
 */
@Service
public class ThumbnailsGeneratorServiceImpl implements ThumbnailsGeneratorService {

    private Logger logger = Logger.getLogger(this.getClass());

    private final String PHANTOM_JS = "phantomjs";
    private final String ENABLE_CROSS_DOMAIN_OPTION = "--web-security=false";

    @Autowired
    private Configuration configuration;

    @Autowired
    private JobService jobService;

    @Autowired
    private FilesUtils filesUtils;

    @Autowired
    private CmsService cmsService;

    @Autowired
    private EBookService eBookService;

    @Autowired
    private EBookCleanupService eBookCleanupService;

    @Value("classpath:phantomjs/phantomjs.exe")
    private Resource phantomJs;

    @Value("classpath:phantomjs/captureScreen.js")
    private Resource captureScreenScript;

    @Value("classpath:phantomjs/jquery-2.1.3.min.js")
    private Resource jqueryMinifiedScript;

    private File phantomjsFolder;
    private String phantomjsExecutablePath;
    private String captureScreenScriptPath;

    private int totalNumberOfThumbnailGeneratorsThreads;
    private int thumbnailWidth;
    private int thumbnailHeight;

    @PostConstruct
    private void init() throws IOException {
        totalNumberOfThumbnailGeneratorsThreads = configuration.getIntProperty("totalNumberOfThumbnailGeneratorsThreads", 7);
        thumbnailWidth = configuration.getIntProperty("eBookThumbnailWidth");
        thumbnailHeight = configuration.getIntProperty("eBookThumbnailHeight");
        phantomjsFolder = new File(configuration.getProperty("cmsHome"), PHANTOM_JS);

        decompressPhantomjsFiles();
    }

    private void decompressPhantomjsFiles() throws IOException {
        logger.debug("init. Unzipping PhantomJS executable file into file system");
        if (!phantomJs.exists()) {
            throw new InitServiceException(String.format("phantomjs executable file %s does not exist.", phantomJs.getFilename()));
        }

        if (phantomjsFolder.exists() && phantomjsFolder.isDirectory()) {
            FileUtils.cleanDirectory(phantomjsFolder); // remove existing phantomjs files from directory
        } else {
            phantomjsFolder.mkdirs();
        }

        unzipPhantomJsExecutable();
        File jQuery = unzipJQuery();
        unzipCaptureScreenScript(jQuery);
    }

    private void unzipCaptureScreenScript(File jQuery) throws IOException {
        try {
            logger.debug(String.format("Unzipping capture screen script to: %s", phantomjsFolder.getAbsolutePath()));
            File captureScreen = new File(phantomjsFolder.getAbsolutePath(), captureScreenScript.getFilename());
            Files.copy(captureScreenScript.getInputStream(), captureScreen.toPath());
            captureScreenScriptPath = captureScreen.getAbsolutePath();

            // put the jQuery path in the captureScreen script
            String captureScreenScript = FileUtils.readFileToString(captureScreen);
            captureScreenScript = captureScreenScript.replace("{{jQueryPath}}", jQuery.toURI().toString());
            FileUtils.writeStringToFile(captureScreen, captureScreenScript);
        } catch (Exception e) {
            logger.error(String.format("Error decompressing file %s", captureScreenScript.getURL()), e);
            throw e;
        }
    }

    private File unzipJQuery() throws IOException {
        File jQuery;
        try {
            logger.debug(String.format("Unzipping jQuery 2.1.3 to: %s", phantomjsFolder.getAbsolutePath()));
            jQuery = new File(phantomjsFolder.getAbsolutePath(), jqueryMinifiedScript.getFilename());
            Files.copy(jqueryMinifiedScript.getInputStream(), jQuery.toPath());
        } catch (Exception e) {
            logger.error(String.format("Error decompressing file %s", captureScreenScript.getURL()), e);
            throw e;
        }
        return jQuery;
    }

    private void unzipPhantomJsExecutable() throws IOException {
        if (SystemUtils.IS_OS_UNIX) {
            phantomjsExecutablePath = PHANTOM_JS;
        } else {
            try {
                logger.debug(String.format("Unzipping PhantomJS to: %s", phantomjsFolder.getAbsolutePath()));
                File phantomjs = new File(phantomjsFolder.getAbsolutePath(), phantomJs.getFilename());
                Files.copy(phantomJs.getInputStream(), phantomjs.toPath());
                phantomjsExecutablePath = phantomjs.getAbsolutePath();
            } catch (Exception e) {
                logger.error(String.format("Error decompressing file %s", phantomJs.getURL()), e);
                throw e;
            }
        }
    }

    @Override
    public void generateThumbnail(EBookThumbnail eBookThumbnail) throws DsException {
        logger.debug(String.format("generateThumbnail. About to generate a thumbnail from URL: %s", eBookThumbnail.getUrl()));
        createSnapshot(eBookThumbnail.getUrl(), eBookThumbnail.getOutputLocation());
        createThumbnail(new File(eBookThumbnail.getOutputLocation()), thumbnailWidth, thumbnailHeight);
        logger.debug(String.format("generateThumbnail. Generation of thumbnail from URL %s had ended successfully", eBookThumbnail.getUrl()));
    }

    /**
     * Generates thumbnails for each url provided within an EBookThumbnail object from the eBookThumbnails list to the
     * output location defined also in the EBookThumbnail object.
     * @param eBookThumbnails - a list of EBookThumbnail objects. Each EBookThumbnail object contains a URL for a website
     *                          or a file, and an output location in which the generated thumbnail will be saved to.
     */
    @Override
    public void generateThumbnails(List<EBookThumbnail> eBookThumbnails) throws Exception {
        generateThumbnails(eBookThumbnails, null);
    }

    /**
     * Generates thumbnails for each url provided within an EBookThumbnail object from the eBookThumbnails list to the
     * output location defined also in the EBookThumbnail object.
     * @param eBookThumbnails - a list of EBookThumbnail objects. Each EBookThumbnail object contains a URL for a website
     *                          or a file, and an output location in which the generated thumbnail will be saved to.
     * @param uploadEBookData - the data of the eBook upload process that also contains the jobId of the job to be updated with the progress of the thumbnail generation.
     */
    @Override
    public void generateThumbnails(List<EBookThumbnail> eBookThumbnails, UploadEBookData uploadEBookData) throws Exception {
        logger.debug("generateThumbnails. Generating thumbnails...");
        List<String> errors = new ArrayList<>();
        ThumbnailGenerationProgress thumbnailGenerationProgress = new ThumbnailGenerationProgress(jobService, uploadEBookData.getJobId(), eBookThumbnails.size());

        int threadsQuantity = getThreadsQuantity();
        ExecutorService fixedPool = Executors.newFixedThreadPool(threadsQuantity);
        try {
            for (EBookThumbnail eBookThumbnail : eBookThumbnails) {
                Runnable aRunnable = () -> {
                    if (uploadEBookData.isCancelled()) {
                        return;
                    }
                    try {
                        generateThumbnail(eBookThumbnail);
                        int progress = thumbnailGenerationProgress.updateJobProgress();
                        logger.debug(String.format("generateThumbnails progress: %s%%", progress));
                    } catch (DsException e) {
                        String errorMsg = String.format("Failed to create thumbnail for URL: %s", eBookThumbnail.getUrl());
                        logger.error(errorMsg, e);
                        errors.add(String.format("%s\n%s\nCause: %s", errorMsg, e.getMessage(), e.getCause()));
                    }
                };
                fixedPool.execute(aRunnable);
            }

            fixedPool.shutdown();
            fixedPool.awaitTermination(1, TimeUnit.HOURS); // shut down
        } finally {
            int configuredTotalNumberOfThumbnailGeneratorsThreads = configuration.getIntProperty("totalNumberOfThumbnailGeneratorsThreads", 7);
            if (totalNumberOfThumbnailGeneratorsThreads + threadsQuantity > configuredTotalNumberOfThumbnailGeneratorsThreads) {
                totalNumberOfThumbnailGeneratorsThreads = configuredTotalNumberOfThumbnailGeneratorsThreads;
            } else {
                totalNumberOfThumbnailGeneratorsThreads += threadsQuantity;
            }
        }

        if (uploadEBookData.isCancelled()) {
            logger.debug(String.format("generateThumbnails. Cancelling thumbnails generation for eBookId: %s", uploadEBookData.getEBookId()));
            return;
        }

        if (!errors.isEmpty()) {
            throw new Exception(String.format("Failed to generate thumbnails to eBook: %s", errors.toString()));
        }

        logger.debug("generateThumbnails. Generating thumbnails finished.");
    }

    private int getThreadsQuantity() {
        if (totalNumberOfThumbnailGeneratorsThreads > 4) {
            totalNumberOfThumbnailGeneratorsThreads -= 4;
            return 4;
        }

        if (totalNumberOfThumbnailGeneratorsThreads >= 2) {
            totalNumberOfThumbnailGeneratorsThreads -= 2;
            return 2;
        }

        return 1;
    }

    /**
     * Generates thumbnails for each page provided within the pages list, using the eBook dynamic player, to the output
     * location defined in the outputBasePath.
     * The jobId will be used to update the progress of the job as the thumbnails are being generated.
     * @param pages - a list of eBook pages which we want to generate thumbnails to.
     * @param publisherId - will be used to get the eBook's folder which is under this publisher.
     * @param outputBasePath - the base directory location in which to save the thumbnails.
     * @param jobId - the id of the job to be updated with the progress of the thumbnail generation.
     * @return a list of errors which occurred during the thumbnails generation process.
     * @throws Exception
     */
    @Override
    public void generateThumbnailsUsingDynamicPlayer(List<PageInsideLesson> pages, int publisherId, String outputBasePath, String jobId) throws Exception {
        String playerWrapperTemplate = filesUtils.readResourcesAsString(this.getClass(), "templates/dynamicPlayerTemplate.html");
        String eBookFolder = eBookCleanupService.getEBookFolderById(publisherId, pages.get(0).getEBookId());
        cmsService.getPublisherPath(publisherId);
        List<EBookThumbnail> eBookThumbnails = new ArrayList<>();
        File tempPlayerWrapperHtmlsDir = new File(eBookFolder, "tempPlayerWrapperHtmls");
        tempPlayerWrapperHtmlsDir.mkdirs();

        for (PageInsideLesson page : pages) {
            File file = new File(tempPlayerWrapperHtmlsDir, String.format("dynamicPlayer-%s-%s.html", page.getId(), page.getEBookId()));
            String playerWrapperForPage = createPlayerWrapperForPage(page, publisherId, new String(playerWrapperTemplate));
            FileUtils.writeStringToFile(file, playerWrapperForPage);
            String url = file.toURI().getPath().replace(String.format("/%s", cmsService.getCmsLocation()), configuration.getProperty("eBookThumbnailHttpServerAddress"));
            eBookThumbnails.add(new EBookThumbnail(url, String.format("%s/%s", outputBasePath, page.getThumbnailHref())));
        }

//        generateThumbnails(eBookThumbnails, jobId);

        FileUtils.deleteDirectory(tempPlayerWrapperHtmlsDir);
    }

    private String createPlayerWrapperForPage(PageInsideLesson page, int publisherId, String playerWrapperTemplate) throws IOException {
        playerWrapperTemplate = playerWrapperTemplate.replace("{{pageId}}", page.getId());
        playerWrapperTemplate = playerWrapperTemplate.replace("{{title}}", page.getTitle() != null ? page.getTitle() : "");
        playerWrapperTemplate = playerWrapperTemplate.replace("{{courseId}}", page.getEBookId());
        playerWrapperTemplate = playerWrapperTemplate.replace("{{publisherId}}", String.valueOf(publisherId));
        playerWrapperTemplate = playerWrapperTemplate.replace("{{overlayElements}}", getConvertedOverlayElementsForDynamicPlayer(page));
        playerWrapperTemplate = playerWrapperTemplate.replace("{{pageRelativeHref}}", page.getHref());
        playerWrapperTemplate = playerWrapperTemplate.replace("{{httpServerAddress}}", configuration.getProperty("eBookThumbnailHttpServerAddress"));

        return playerWrapperTemplate;
    }

    private String getConvertedOverlayElementsForDynamicPlayer(PageInsideLesson page) throws IOException {
        List<OverlayElement> overlayElements = page.getOverlayElements();
        if (overlayElements == null || overlayElements.isEmpty()) {
            return "[]";
        }

        try {
            List<ObjectNode> overlayElementsNodes = new ObjectMapper().convertValue(overlayElements, new TypeReference<List<ObjectNode>>(){});
            overlayElementsNodes.forEach(overlayElementNode -> {
                String cid = overlayElementNode.get("cid").getTextValue();
                overlayElementNode.put("id", cid);
                overlayElementNode.remove("cid");

                ObjectNode presentationNode = (ObjectNode) overlayElementNode.get("presentation");
                String presentationType = presentationNode.get("type").getTextValue();
                presentationNode.put("display_type", String.format("@@dbp.enums.OVERLAY_ELEMENT.DISPLAY_TYPE['%s']@@", presentationType));
                presentationNode.remove("type");

                ObjectNode contentNode = (ObjectNode) overlayElementNode.get("content");
                String contentType = contentNode.get("type").getTextValue();
                contentNode.put("type", String.format("@@dbp.enums.OVERLAY_ELEMENT.CONTENT_TYPE['%s']@@", contentType)); // we add the @@ after and before the apostrophes because these are enums, so later we'll look for regexes of "@@ and @@" and we'll remove them
            });

            String overlayElementsJson = new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(overlayElementsNodes);
            overlayElementsJson = overlayElementsJson.replaceAll("\"@@|@@\"", ""); // remove all "@@ and @@" so we'll have enums instead of strings
            return overlayElementsJson;
        } catch (IOException e) {
            String errorMsg = String.format("Failed to parse overlay elements for pageId: %s, title: %s", page.getId(), page.getTitle());
            logger.error(errorMsg, e);
            throw e;
        }
    }

//    /**
//     * Generates thumbnails for each url provided within an EBookThumbnail object from the eBookThumbnails list, using the
//     * eBook dynamic player, to the output location defined also in the EBookThumbnail object.
//     * The jobId will be used to update the progress of the job as the thumbnails are being generated.
//     * @param eBookThumbnails - a list of EBookThumbnail objects. Each EBookThumbnail object contains a URL for a website
//     *                          or a file, and an output location in which the generated thumbnail will be saved to.
//     * @param jobId - the id of the job to be updated with the progress of the thumbnail generation.  @return a list of
//     *                errors which occurred during the thumbnails generation process.
//     * @throws Exception
//     */
//    @Override
//    public void generateThumbnailsUsingDynamicPlayer(List<EBookThumbnail> eBookThumbnails, int publisherId, String eBookId, String jobId, int i) throws Exception {
////        String playerWrapperTemplate = filesUtils.readResourcesAsString(this.getClass(), "templates/dynamicBookTemplate.html");
//        String playerWrapperTemplate = filesUtils.readResourcesAsString(this.getClass(), eBookThumbnails.get(0).getUrl());
//        Document doc = Jsoup.parse(new File(eBookThumbnails.get(0).getUrl()), "UTF-8");
//        doc.body().attr("style", "overflow:hidden; width:980px;");
//
//
//        String eBookFolder = eBookService.getEBookFolderById(publisherId, eBookId);
//        File tempPlayerWrapperHtmlsDir = new File(eBookFolder, "tempPlayerWrapperHtmls");
//        tempPlayerWrapperHtmlsDir.mkdirs();
//
//        for (EBookThumbnail eBookThumbnail : eBookThumbnails) {
//            File file = new File(tempPlayerWrapperHtmlsDir, String.format("dynamicPlayer-%s.html", UUID.randomUUID().toString()));
//            String playerWrapperForPage = new String(playerWrapperTemplate);
//            playerWrapperForPage = playerWrapperForPage.replace("{{htmlPath}}", eBookThumbnail.getUrl());
//            FileUtils.writeStringToFile(file, playerWrapperForPage);
////            String url = file.toURI().getPath().replace(String.format("/%s", cmsService.getCmsLocation()), configuration.getProperty("eBookThumbnailHttpServerAddress"));
//            eBookThumbnail.setUrl(file.toURI().toString());
//        }
//
//        generateThumbnails(eBookThumbnails, jobId);
//
//        FileUtils.deleteDirectory(tempPlayerWrapperHtmlsDir);
//
//        generateThumbnails(eBookThumbnails, jobId);
//    }

    private void createThumbnail(File image, int width, int height) throws DsException {
        // Go to: https://code.google.com/p/thumbnailator/wiki/Examples#Scaling_an_image_by_a_given_factor for more examples of available APIs
        try {
            Thumbnails.of(CMYKReader.read(image))
                    .size(width, height)
                    .toFile(image);
        } catch (IOException e) {
            throw new DsException(String.format("Failed to create thumbnail for file %s", image.getAbsolutePath()));
        }
    }

    private void createSnapshot(String url, String outputFilePath) throws DsException {
        Process process = null;
        try {
            // running process with following arguments: phantomjs [options] captureScreen.js <url> <output file> (optional:) <thumbnail width> <thumbnail height>
            ProcessBuilder processBuilder = new ProcessBuilder(phantomjsExecutablePath, ENABLE_CROSS_DOMAIN_OPTION, captureScreenScriptPath, url, outputFilePath);
            processBuilder.redirectErrorStream(true);
            process = processBuilder.start();
            logPhantomJsOutputs((process.getInputStream()));

            int exitCode = process.waitFor();
            if (exitCode != 0) { // validation failed due to errors
                throw new DsException(String.format("Failed to create a snapshot for URL %s using PhantomJS", url));
            }
        } catch (InterruptedException | IOException e) {
            throw new DsException(String.format("Failed to create a snapshot for URL %s using PhantomJS", url), e);
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
    }

    /**
     * @param inputStream to read and parse
     * @throws IOException
     */
    private void logPhantomJsOutputs(InputStream inputStream) throws IOException {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = br.readLine()) != null) {
                if (line.isEmpty()) {
                    continue;
                }

                logger.debug(String.format("PhantomJS process: %s", line));
            }
        } finally {
            inputStream.close();
        }
    }

    private class ThumbnailGenerationProgress {

        JobService jobService;
        int tasksNumber;
        String jobId;
        private int progress;

        int count = 0;

        public ThumbnailGenerationProgress(JobService jobService, String jobId, int tasksNumber) {
            this.jobService = jobService;
            this.tasksNumber = tasksNumber;
            this.jobId = jobId;
        }

        public synchronized int updateJobProgress() throws DsException {
            if (jobId == null) {
                return progress;
            }
            count++;
            progress = count * 100 / tasksNumber;
            jobService.updateJobProgress(jobId, EbookJobComponent.GENERATING_PAGE_THUMBNAILS.getTitle(), progress, null);
            return progress;
        }
    }
}