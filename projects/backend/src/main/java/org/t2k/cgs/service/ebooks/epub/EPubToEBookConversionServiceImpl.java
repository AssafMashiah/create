package org.t2k.cgs.service.ebooks.epub;

import com.t2k.configurations.Configuration;
import fr.sertelon.media.CMYKReader;
import net.coobird.thumbnailator.Thumbnails;
import nl.siegmann.epublib.domain.Book;
import nl.siegmann.epublib.domain.Resource;
import nl.siegmann.epublib.domain.Spine;
import nl.siegmann.epublib.domain.SpineReference;
import nl.siegmann.epublib.epub.EpubReader;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.filefilter.FileFilterUtils;
import org.apache.commons.io.filefilter.TrueFileFilter;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.usecases.ebooks.EBookConversionService;
import org.t2k.cgs.domain.usecases.ebooks.EBookErrorCode;
import org.t2k.cgs.domain.usecases.ebooks.EBookService;
import org.t2k.cgs.domain.usecases.ebooks.EbookJobComponent;
import org.t2k.cgs.domain.model.ebooks.EBookConversionServiceTypes;
import org.t2k.cgs.domain.model.ebooks.*;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.domain.usecases.ebooks.EpubValidationResult;
import org.t2k.cgs.domain.usecases.ebooks.UploadEBookData;
import org.t2k.cgs.domain.usecases.publisher.PublisherService;
import org.t2k.cgs.domain.usecases.ThumbnailsGeneratorService;
import org.t2k.cgs.utils.Progress;
import org.t2k.cgs.utils.ZipHelper;
import org.t2k.cgs.utils.directory.ExtensionsFilesFilter;
import org.t2k.cgs.domain.usecases.CmsService;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.awt.image.BufferedImage;
import java.io.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Created by moshe.avdiel on 11/1/2015.
 */
@Service("epubToEBookConversionService")
public class EPubToEBookConversionServiceImpl implements EBookConversionService {

    public static final String MINIFIED_THUMBAIL_SUFFIX = "-minified-thumbail.jpeg";

    private Logger logger = Logger.getLogger(this.getClass());

    @Autowired
    private JobService jobService;

    @Autowired
    private CmsService cmsService;

    @Autowired
    private PublisherService publisherService;

    @Autowired
    private Configuration configuration;

    @Autowired
    private EpubValidator epubValidator;

    @Autowired
    private ThumbnailsGeneratorService thumbnailsGeneratorService;

    private EBookStructure generateEBookStructure(String eBookFolderPath, String baseDir, String eBookId, String jobId, int maxPercentageToReach, Book userObject) throws Exception {
        logger.debug(String.format("generateEBookStructure: About to generate structure for eBook %s", eBookId));
        jobService.updateJobProgress(jobId, "buildEBookStructure", 0, Job.Status.IN_PROGRESS);

        EBookStructure eBookStructure;
        try {
            Book eBook = userObject;  //readEpubBook(eBookFolderPath);
            jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), 5, Job.Status.IN_PROGRESS);

            Resource coverImage = eBook.getCoverImage();

            String coverImagePath = coverImage == null ? "" : String.format("%s/%s/%s", baseDir, eBookId, coverImage.getOriginalHref());
            eBookStructure = new EBookStructure(eBook.getTitle(), coverImagePath);

            EPubVersion ePubVersion = getEpubVersion(eBook);
            if (ePubVersion == EPubVersion.Version3) {
                List<Page> pages = getPagesFromSpine(eBook, true, baseDir, eBookId, jobId, maxPercentageToReach);
                eBookStructure.addPages(pages);

                logger.debug(String.format("Structure generation of eBook [%s], eBookId: %s - COMPLETED. Pages processed: %d", eBookStructure.getTitle(), eBookId, eBookStructure.getNumberOfPages()));
            } else {
                String errorMsg = String.format("The ebook file %s, is EPUB Version 2 which is obsolete and not supported", eBookId);
                logger.error(errorMsg);
                throw new Exception(errorMsg);
            }
        } catch (IOException e) {
            logger.error(e.toString(), e);
            throw e;
        }

        return eBookStructure;
    }

    public List<Page> getPagesFromSpine(Book eBook,
                                        boolean updateJobProgress,
                                        String baseDir,
                                        String eBookId,
                                        String jobId,
                                        int maxPercentageToReach) throws DsException {
        List<Page> pages = new ArrayList<>();
        Spine spine = eBook.getSpine();
        if (spine != null) {
            List<SpineReference> spineReferences = spine.getSpineReferences();
            int totalSpines = spineReferences.size();
            Progress progress = updateJobProgress ? new Progress(totalSpines, 10, maxPercentageToReach) : null;

            for (int i = 0; i < spineReferences.size(); i++) {
                SpineReference spineReference = spineReferences.get(i);

                // check is it a primary page (secondary/auxiliary pages shouldn't have a page representation)
                if (spineReference.isLinear()) {
                    Resource spineResource = spineReference.getResource();
                    String pageTitle = spineResource.getTitle();
                    String pageId = spineResource.getId();
                    String pageHref = String.format("%s/%s/%s", baseDir, eBookId, spineResource.getOriginalHref());

                    // TODO: Replace with Real Thumbnail when generated...

                    String thumbnailHref = null;

                    // TODO: Progress for Generating Thumbnails...
                    // ...  here ...

                    Page page = new Page(pageId, eBookId, pageTitle, pageHref, i + 1, thumbnailHref);  // TODO: Verify about Cover
//                            eBookStructure.addPage(page);
                    pages.add(page);
                }

                if (updateJobProgress) {
                    progress.increment();
                    if (progress.hasProgress()) {
                        jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), progress.getPercentage(), Job.Status.IN_PROGRESS);
                    }
                }
            }
        } else { // Due to EPUB Validation earlier, reaching this point may occur only due to a bug.
            throw new DsException(String.format("EPub3 Book: %s has no pages.(Spine tag was not found)", eBook.getTitle()));
        }
        return pages;
    }

    @Override
    public EBookStructure generateEBookStructure(UploadEBookData uploadEBookData) throws Exception {
        String eBookId = uploadEBookData.getEBookId();
        String jobId = uploadEBookData.getJobId();
        int publisherId = uploadEBookData.getPublisherId();
        File eBookDir = new File(uploadEBookData.getEBookDir());
        File eBookTempDir = new File(eBookDir, configuration.getProperty(EBookService.E_BOOKS_TEMP_SUBFOLDER));

//        FileItem fileItem = uploadEBookData.getFileItemStream();
//        File eBookFile = new File(eBookTempDir.getAbsolutePath(), fileItem.getName());
        File eBookFile = uploadEBookData.getUploadedEBookFile();

        jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), 0, Job.Status.IN_PROGRESS);

        // Convert
        EBookStructure eBookStructure = generateEBookStructure(eBookFile.getAbsolutePath(), configuration.getProperty(EBookService.E_BOOKS_BASE_FOLDER),
                eBookId, jobId, 2, (Book) uploadEBookData.getUserObject());

        // Unzip
        boolean isSuccess = unzipEBookFile(eBookDir, eBookFile, jobId);
        if (!isSuccess) {
            String msg = String.format("Unable to Unzip EPUB File: %s, at Dir: %s", eBookFile, eBookDir);
            handleError(msg, jobId);
            throw new DsException(msg);
        }
        Job job = jobService.getJob(jobId);
        if (job.getStatus() != Job.Status.IN_PROGRESS) return eBookStructure;
        jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), 8, Job.Status.IN_PROGRESS);

        logger.debug("minifying the cover image for performance reasons");
        minifyCoverImageAndUpdateEBookStructure(publisherId, eBookId, eBookStructure);

        job = jobService.getJob(jobId);
        if (job.getStatus() != Job.Status.IN_PROGRESS) return eBookStructure;
        jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), 10, Job.Status.IN_PROGRESS);

        logger.debug("change quality of images to improve performance");
        changeImagesQuality(uploadEBookData.getEBookDir(), jobId, 10, 100);

        job = jobService.getJob(jobId);
        if (job.getStatus() != Job.Status.IN_PROGRESS) return eBookStructure;
        jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), 100, Job.Status.IN_PROGRESS);
        return eBookStructure;
    }

    private void changeImagesQuality(String eBookDirPath, String jobId, int progressPercentageStart, int progressPercentageEnd) {
        File eBookDir = new File(eBookDirPath);
        ExtensionsFilesFilter extensionsFilter = new ExtensionsFilesFilter(Arrays.asList("png", "jpg", "tif", "bmp"));
        Collection<File> imageFiles = FileUtils.listFiles(eBookDir, FileFilterUtils.and(FileFilterUtils.asFileFilter(extensionsFilter), FileFilterUtils.sizeFileFilter(300000)), TrueFileFilter.INSTANCE);
        double currentProgress = progressPercentageStart;
        int progressRange = progressPercentageEnd - progressPercentageStart;
        double progressIncreasePerTick = imageFiles.size() == 0
                ? 0
                : new BigDecimal(progressRange)
                .setScale(2, RoundingMode.HALF_EVEN)
                .divide(new BigDecimal(imageFiles.size()), RoundingMode.HALF_EVEN).doubleValue();
        logger.debug("Images to process: " + imageFiles.size());
        int progress = 0;
        for (File image : imageFiles) {
            try {
                BufferedImage bImg;
                try {
                    bImg = CMYKReader.read(image);
                } catch (IllegalArgumentException e) {
                    logger.warn(String.format("Cannot read image file! Image may be corrupted and won't be optimized. image path: %s", image.getAbsolutePath()), e);
                    continue; // continue to next image to optimize in size
                }
                Thumbnails.of(bImg).size(bImg.getWidth(), bImg.getHeight()).outputQuality(0.7).toFile(image);
                currentProgress = currentProgress > progressPercentageEnd ? progressPercentageEnd : currentProgress + progressIncreasePerTick;
                if (progress != (int) currentProgress) {
                    progress = (int) currentProgress;
                    logger.debug(String.format("changeImagesQuality progress: %s%%", progress));
                    Job job = jobService.updateComponentProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), progress, null);
                    if (job.getStatus() == Job.Status.CANCELED) {
                        logger.debug(String.format("Job %s was interrupted, stopping images optimization", jobId));
                        return;
                    }
                }
            } catch (IOException e) {
                logger.warn(String.format("Could not optimize the image by reducing its quality. image path: %s", image.getAbsolutePath()), e);
            }
        }
        logger.debug("Images optimized");
    }

    /**
     * generates a thumbnail for epub using its original cover image
     * This resizing is meant for optimization purposes only
     *
     * @param publisherId    publisher ID for the publisher who uploaded the file
     * @param eBookId        CGS' ebook id for the epub
     * @param eBookStructure object representing the converted epub, containing its cover image
     * @throws IOException
     */
    public void minifyCoverImageAndUpdateEBookStructure(int publisherId, String eBookId, EBookStructure eBookStructure) throws IOException {
        if (eBookStructure.getCoverImage() != null && !eBookStructure.getCoverImage().isEmpty()) {
            File imageToModify = new File(publisherService.getPublisherCmsHomeLocation(publisherId), eBookStructure.getCoverImage());
            File newImageMinified = new File(imageToModify.getParentFile().getAbsolutePath(), eBookId + MINIFIED_THUMBAIL_SUFFIX); // absolute path of the newly created image
            // resize the cover image to maximum of 300x300 width\height. this method keeps the image ratio and scale
            Thumbnails.of(CMYKReader.read(imageToModify))
                    .size(300, 300)
                    .toFile(newImageMinified);

            // override the original cover image with the resized one
            // the path here starts from ebooks/..
            eBookStructure.setCoverImage(String.format("%s/%s", new File(eBookStructure.getCoverImage()).getParent(), newImageMinified.getName()));
        }
    }

    @Override
    public boolean isValid(UploadEBookData uploadEBookData) throws DsException {
//        FileItem fileItem = uploadEBookData.getFileItemStream();
        File eBookDir = new File(uploadEBookData.getEBookDir());
        File eBookTempDir = new File(eBookDir, configuration.getProperty(EBookService.E_BOOKS_TEMP_SUBFOLDER));
//        File eBookFile = new File(eBookTempDir.getAbsolutePath(), fileItem.getName());
        File eBookFile = uploadEBookData.getUploadedEBookFile();

        try {
            if (uploadEBookData.getUserObject() == null) { // for toc generation feature book object is already bound
                bindBookObject(uploadEBookData);
            }
        } catch (Exception e) {
            logger.error("Corrupted EPUB File. Failed to extract EBook object from file " + uploadEBookData);
            throw new DsException("failed to extract EBook object from file", e);
        }

        if (!isVersionSupported(uploadEBookData, eBookFile)) {
            return false;
        }

        if (!isValidationActivated()) {
            logger.debug("Validation is disabled by configuration - skipping validation jar");
            return true;
        }
        return isEpubValid(uploadEBookData, eBookFile);
    }

    private boolean isValidationActivated() {
        return configuration.getBooleanProperty("isEpubValidationActivated");
    }

    private boolean isEpubValid(UploadEBookData uploadEBookData, File eBookFile) throws DsException {
        EpubValidationResult epubValidationResult;

        epubValidationResult = epubValidator.validateEpubFile(eBookFile.getAbsolutePath());
        if (!epubValidationResult.isValid()) {
            String errorMsg = String.format("The epub file %s isn't valid. Errors:\n%s", eBookFile.getName(), epubValidationResult.getStringFromErrorsList());
            handleError(errorMsg, uploadEBookData.getJobId());
        }

        return epubValidationResult.isValid();
    }

    private boolean isVersionSupported(UploadEBookData uploadEBookData, File eBookFile) throws DsException {
        try {
            EPubVersion epubVersion = getEpubVersion((Book) uploadEBookData.getUserObject());
            if (epubVersion != EPubVersion.Version3) {
                String errorMsg = String.format("The epub file %s is not valid.\nError Messages:\n - EPUB (%s) is not supported. Only EPUB 3.0 is supported.\n Please convert this file to EPUB3 then upload again.", eBookFile.getName(), epubVersion.toString());
                handleError(errorMsg, uploadEBookData.getJobId());
                return false;
            } else {
                return true;
            }
        } catch (Exception e) {
            throw new DsException(e);
        }
    }

    private void bindBookObject(UploadEBookData uploadEBookData) throws DsException {

        try {
            Book book = readEpubBook(uploadEBookData.getUploadedEBookFile().getAbsolutePath(), uploadEBookData.getJobId());
            uploadEBookData.setUserObject(book);
        } catch (IOException e) {
            handleError("Unable to Read EPUB File.", e, uploadEBookData.getJobId());
            throw new DsException(e);
        } catch (DsException dsEx) {
            throw dsEx;
        } catch (Throwable t) {
            jobService.addError(uploadEBookData.getJobId(), "FAILED_TO_VALIDATE_EPUB", "Unexpected Error while reading EPUB for validation. Error: " + t.toString(), Job.Status.FAILED);
            throw new DsException(t);
        }
    }

    @Override
    public void generatePageThumbnails(EBookStructure eBookStructure, UploadEBookData uploadEBookData) throws Exception {
        String jobId = uploadEBookData.getJobId();
        jobService.updateJobProgress(jobId, EbookJobComponent.GENERATING_PAGE_THUMBNAILS.getTitle(), 0, Job.Status.IN_PROGRESS);
        String eBookDir = uploadEBookData.getEBookDir();
        String publisherFolderPath = cmsService.getPublisherPath(uploadEBookData.getPublisherId());

        File thumbnailsDir = new File(eBookDir, EBookService.E_BOOKS_THUMBNAILS_FOLDER);
        if (!thumbnailsDir.exists()) {
            thumbnailsDir.mkdirs();
        }

        Map<String, EBookThumbnail> eBookThumbnails = new HashMap<>();
        eBookStructure.getPages().stream().forEach(page -> {
            String thumbnailFullHref = String.format("%s/%s.jpg", thumbnailsDir, UUID.randomUUID().toString());
            eBookThumbnails.put(page.getId(), new EBookThumbnail(new File(publisherFolderPath, page.getHref()).toURI().toString(), thumbnailFullHref));
            String eBookRelativePath = thumbnailFullHref.substring(thumbnailFullHref.indexOf(configuration.getProperty("eBooksBaseFolder")));
            page.setThumbnailHref(FilenameUtils.separatorsToUnix(eBookRelativePath));
        });

        thumbnailsGeneratorService.generateThumbnails(new ArrayList<>(eBookThumbnails.values()), uploadEBookData);
        if (uploadEBookData.isCancelled()) {
            return;
        }

        jobService.updateJobProgress(jobId, EbookJobComponent.GENERATING_PAGE_THUMBNAILS.getTitle(), 100, Job.Status.IN_PROGRESS);
    }

    @Override
    public EBookConversionServiceTypes getEBookConversionServiceType() {
        return EBookConversionServiceTypes.EPUB;
    }

    @Override
    public String getEbookConversionLibraryVersion() {
        return "1.0";
    }

    private Book readEpubBook(String epubPath, String jobId) throws IOException, DsException {
        EpubReader epubReader = new EpubReader();
        File epubFile = new File(epubPath);
//        FileInputStream fileIn = null;
        try {
//            fileIn = new FileInputStream(epubFile);
            Book book = epubReader.readEpubLazy(epubPath, "UTF-8");

            if (book.getOpfResource() == null) {
                String errorMessage = String.format("Corrupted EPUB File: %s. Unable to find a Package Resource (OPF). JobId: %s", epubPath, jobId);
                handleError(errorMessage, jobId);
                throw new DsException(errorMessage);
            }

            return book;
        } catch (FileNotFoundException e) { // should never get here
            logger.error(String.format("Couldn't find the EPUB file %s to be read.", epubFile.getName()));
            throw e;
        } finally {
//            fileIn.close();
        }
    }

    public EPubVersion getEpubVersion(Book eBook) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        InputStream is = new ByteArrayInputStream(eBook.getOpfResource().getData());
        Document opfXml = builder.parse(is);

        NodeList opfPackage = opfXml.getElementsByTagName("package");
        String version = opfPackage.item(0).getAttributes().getNamedItem("version").getNodeValue();
        EPubVersion ePubVersion = getEPubVersion(version);
        return ePubVersion;
    }

    private EPubVersion getEPubVersion(String version) throws Exception {
        if (version.startsWith("2.")) {
            return EPubVersion.Version2;
        } else if (version.startsWith("3.")) {
            return EPubVersion.Version3;
        }

        throw new Exception(String.format("No matching EPUB version was found for version %s", version));
    }

    private boolean unzipEBookFile(File eBookDir, File eBookFile, String jobId) throws DsException {
        try {
            ZipHelper.decompressZipFile(eBookFile.getAbsolutePath(), eBookDir.getAbsolutePath());
        } catch (IOException e) {
            String errorMsg = String.format("Failed to unzip EBook file %s into directory %s.", eBookFile.getName(), eBookDir.getAbsolutePath());
            logger.error(errorMsg, e);
            handleError(errorMsg, jobId);
            return false;
        }

        return true;
    }

    private void handleError(String errorMessage, String jobId) throws DsException {
        handleError(errorMessage, null, jobId);
    }

    private void handleError(String errorMessage, Throwable t, String jobId) throws DsException {
        if (t == null) {
            logger.error(errorMessage);
        } else {
            logger.error(errorMessage, t);
        }

        addErrorToJob(errorMessage, jobId);
    }

    private void addErrorToJob(String massage, String jobId) throws DsException {
        jobService.addError(jobId, EBookErrorCode.FAILED_TO_CONVERT_EBOOK_FILE.toString(), massage, Job.Status.FAILED);
    }

    public void setJobService(JobService jobService) {
        this.jobService = jobService;
    }

    // Just for demo.  will not be needed later on.
    private void sleep(long millis) {
        Object waiter = new Object();
        synchronized (waiter) {
            try {
                waiter.wait(millis);
            } catch (InterruptedException e) {
                // Empty
            }
        }
    }
}