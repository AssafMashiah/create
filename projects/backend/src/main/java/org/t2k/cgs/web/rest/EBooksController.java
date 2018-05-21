package org.t2k.cgs.web.rest;

import com.t2k.configurations.Configuration;
import org.apache.commons.fileupload.FileItemStream;
import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.t2k.cgs.service.ebooks.WebsocketTopics;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.model.exceptions.FileTypeNotAllowedException;
import org.t2k.cgs.domain.usecases.ebooks.*;
import org.t2k.cgs.domain.model.ebooks.EBookConversionServiceTypes;
import org.t2k.cgs.domain.model.course.Course;
import org.t2k.cgs.domain.model.ebooks.*;
import org.t2k.cgs.domain.usecases.ebooks.ebookForClientResponse.EbookForClient;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.model.job.JobProperties;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.domain.usecases.publisher.PublisherService;
import org.t2k.cgs.domain.model.user.CGSAccount;
import org.t2k.cgs.domain.model.user.CGSUserDetails;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;
import org.t2k.cgs.domain.usecases.CmsService;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 14/10/2015
 * Time: 19:39
 */
@RestController
@RequestMapping("/publishers/{publisherId}/ebooksapi")
@AllowedForAllUsers
public class EBooksController {

    private Logger logger = Logger.getLogger(this.getClass());

    @Qualifier("eBookManagerSpringAsync")
    @Autowired
    private EBookManager eBookManager;

    @Autowired
    private EBookService eBookService;

    @Autowired
    private EBookCleanupService eBookCleanupService;

    @Autowired
    private CGSUserDetails currentCgsUserDetails;

    @Autowired
    private PublisherService publisherService;

    @Autowired
    private CmsService cmsService;

    @Autowired
    private Configuration configuration;

    @Autowired
    private JobService jobService;

    @Autowired
    private CourseDataService courseDataService;

//    private final String EBOOK_ID = "eBookId";
//    private final String EBOOKS_DIR = "eBooksDir";
//    private final String PUBLISHER_ID = "publisherId";
//    private final String USERNAME = "username";

    @RequestMapping(value = "upload", method = RequestMethod.POST, headers = "content-type=multipart/*")
    public List<UploadEBookResponse> uploadEBook(@PathVariable int publisherId,
                                                 @RequestParam MultipartFile file,
                                                 @RequestParam String pdfConversionLibrary) throws Exception {
        logger.debug(String.format("---[ START Upload EBook ]---[Time: %d]", System.currentTimeMillis()));

        String eBookId = UUID.randomUUID().toString();
        String username = currentCgsUserDetails.getUsername();
        String jobId = eBookService.createJobForUploadProcess(publisherId, eBookId, username);
        List<UploadEBookResponse> jobsIdAndEBooksIdsPairs = new ArrayList<>();

        validateFileType(file);
        File uploadedEBookFile = eBookService.saveMultipartFileToDisk(file, publisherId, jobId, eBookId);

        EBookConversionServiceTypes conversionLibrary = EBookConversionServiceTypes.valueOf(pdfConversionLibrary);
        logger.debug(String.format("User selected conversion library: %s", conversionLibrary));
//        if (conversionLibrary == null) {
//            conversionLibrary = publisherService.getSelectedPdfConverter(publisherId);
//        }

        if (uploadedEBookFile != null) {
            logger.debug(String.format("---[ INIT Upload EBook]---[Time: %d]", System.currentTimeMillis()));
//            UploadEBookResponse result = eBookManager.createJobAndAddToPendingQueue(jobId, publisherId, currentCgsUserDetails.getUsername(), uploadedEBookFile, conversionLibrary);
            UploadEBookResponse result = eBookManager.addJobToPendingQueue(jobId, eBookId, publisherId, username, uploadedEBookFile, conversionLibrary);
            jobsIdAndEBooksIdsPairs.add(result);
        } else {
            String errorMsg = String.format("Upload Error: No file received for upload. (Upload File Parameter is Null in the HTTP Request)");
            logger.error(errorMsg);
            eBookService.addErrorToJob(errorMsg, jobId);
            throw new IllegalArgumentException(errorMsg);
        }
        return jobsIdAndEBooksIdsPairs;
    }

    /**
     * Method for uploading and converting epub3 files, including toc generation
     */
    @RequestMapping(value = "uploadAndConvert",
            method = RequestMethod.POST)
    public ResponseEntity<String> uploadAndConvert(@PathVariable int publisherId,
                                                   @RequestParam MultipartFile file,
                                                   @RequestParam String courseName,
                                                   @RequestParam String contentLanguage,
                                                   @RequestParam boolean learningObject) {
        logger.debug("REST request for starting upload and convert epub3");

        CGSAccount currentPublisher = publisherService.getCurrentPublisherAccount();
        if (currentPublisher == null || currentPublisher.getAccountId() != publisherId) {
            logger.error(String.format("Used publisher ID (%s) does not match current logged-in publisher (%s)", publisherId, currentPublisher));
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        if (file == null) {
            logger.error("uploaded file cannot be null");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        String extension = FilenameUtils.getExtension(file.getOriginalFilename());
        if (!extension.equalsIgnoreCase("epub")) {
            logger.error(String.format("File type '%s' is not supported for creation of an ebook", extension));
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        String username = currentCgsUserDetails.getUsername();
        String eBookId = UUID.randomUUID().toString();
        String jobId = eBookService.createJobForUploadProcess(publisherId, eBookId, username);
        logger.debug("Saving file to disk");
        File savedFile = eBookService.saveMultipartFileToDisk(file, publisherId, jobId, eBookId);

        EBookConversionData uploadData = new EBookConversionData.Builder()
                .setUsername(username)
                .setPublisherId(publisherId)
                .setJobId(jobId)
                .setUploadedEBookFile(savedFile)
                .setEBookDir(eBookCleanupService.getEBookFolderById(publisherId, eBookId))
                .setCourseName(courseName)
                .setContentLanguage(contentLanguage)
                .setLearningObject(learningObject)
                .seteBookId(eBookId)
                .build();

        jobService.updateJobStatus(jobId, Job.Status.PENDING); // job is waiting for the executor to start the conversion process
        // async method. UI will be updated through websockets
        eBookManager.addJobToPendingQueue(jobId, new EBookHandlingRunnable() {
            @Override
            public void cancelProcess() {
                eBookService.cancelProcess(uploadData);
            }

            @Override
            public void run() {
                eBookService.convertEpubAndGenerateToc(uploadData, eBookManager);
            }
        });

        return new ResponseEntity<>(jobId, HttpStatus.OK);
    }

    /**
     * Method for uploading and updating an existing eBook on one or all courses where it is being used
     */
    @RequestMapping(value = "uploadNewVersion",
            method = RequestMethod.POST)
    public ResponseEntity<String> uploadNewVersion(@PathVariable int publisherId,
                                                   @RequestParam(name = "file") MultipartFile newEBookFile,
                                                   @RequestParam String existingEBookId,
                                                   @RequestParam String courseId,
                                                   @RequestParam boolean updateOnAllCourses) {
        logger.debug(String.format("REST request from %s for updating eBook %s, for publisher %s, started on course %s. updateOnAllCourses: %s",
                currentCgsUserDetails, existingEBookId, publisherId, courseId, updateOnAllCourses));

        CGSAccount currentPublisher = publisherService.getCurrentPublisherAccount();
        if (currentPublisher == null || currentPublisher.getAccountId() != publisherId) {
            logger.error(String.format("Used publisher ID (%s) does not match current logged-in publisher (%s)", publisherId, currentPublisher));
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        if (newEBookFile == null) {
            logger.error("uploaded file cannot be null");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        String extension = FilenameUtils.getExtension(newEBookFile.getOriginalFilename());
        if (!extension.equalsIgnoreCase("pdf") && !extension.equalsIgnoreCase("epub")) {
            logger.error(String.format("File type '%s' is not supported for eBook conversion", extension));
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        EBookConversionServiceTypes conversionLibrary = currentPublisher.getAccountCustomization().getPdfConversionLibrary();
        if (extension.equalsIgnoreCase("pdf") && conversionLibrary == null) {
            logger.error("Uploaded ebook is PDF and no PDF conversion library is selected on publisher " + currentPublisher.getAccountId());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        EBook existingEBook = eBookService.getByPublisherAndEBookId(existingEBookId, publisherId);
        if (existingEBook == null) {
            logger.error(String.format("No eBook with ID '%s' was found for publisher '%s'", existingEBookId, publisherId));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Course course = courseDataService.getCourse(publisherId, courseId);
        if (course == null) {
            logger.error(String.format("No course with ID '%s' was found for publisher '%s'", courseId, publisherId));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        if (!course.getEBooksIds().contains(existingEBookId)) {
            logger.error(String.format("Course '%s' does not contain eBook '%s'", courseId, existingEBook));
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Set<String> courseIds = new HashSet<>(Collections.singletonList(courseId));
        if (updateOnAllCourses) {
            courseIds.addAll(courseDataService.getByPublisherAndEBookId(publisherId, existingEBook.getEBookId())
                    .stream().map(Course::getId).collect(Collectors.toSet()));
        }

        String username = currentCgsUserDetails.getUsername();
        String eBookId = UUID.randomUUID().toString();
        String jobId = UUID.randomUUID().toString();
        JobProperties properties = new JobProperties();
        properties.setPublisherId(publisherId);
        properties.setUsername(username);
        Job job = new Job.Builder(jobId, Job.Type.UPLOAD_AND_UPDATE_EBOOK, Job.Status.STARTED)
                .setProperties(properties)
                .setWebsocketTopic(WebsocketTopics.UPDATE_EBOOK + jobId)
                .build();
        jobService.save(job);
        logger.debug("Saving file to disk");
        File savedFile = eBookService.saveMultipartFileToDisk(newEBookFile, publisherId, jobId, eBookId);

        UploadEBookData uploadData = new UploadEBookData.Builder()
                .setEBookId(eBookId)
                .setEBookDir(eBookCleanupService.getEBookFolderById(publisherId, eBookId))
                .setPublisherId(publisherId)
                .setUsername(username)
                .setUploadedEBookFile(savedFile)
                .setJobId(jobId)
                .setPDFConverter(conversionLibrary)
                .build();

        jobService.updateJobStatus(jobId, Job.Status.PENDING); // job is waiting for the executor to start the conversion process
        // async method. UI will be updated through websockets or polling
        eBookManager.addJobToPendingQueue(jobId, new EBookHandlingRunnable() {
            @Override
            public void cancelProcess() {
                eBookService.cancelProcess(uploadData);
            }

            @Override
            public void run() {
                eBookService.uploadNewEBookVersion(uploadData, eBookManager, existingEBook, courseIds);
            }
        });

        return new ResponseEntity<>(jobId, HttpStatus.OK);
    }

    /**
     * Method for updating an existing eBook on a course with a newer version of the eBook, that already exists
     * on the server
     */
    @RequestMapping(value = "update",
            method = RequestMethod.POST)
    public ResponseEntity updateOnCourse(@PathVariable int publisherId,
                                         @RequestParam String courseId,
                                         @RequestParam String existingEBookId,
                                         @RequestParam String newEBookId) {
        logger.debug(String.format("REST request from %s for updating eBook %s with eBook %s, for publisher %s, on course %s",
                currentCgsUserDetails, existingEBookId, newEBookId, publisherId, courseId));

        CGSAccount currentPublisher = publisherService.getCurrentPublisherAccount();
        if (currentPublisher == null || currentPublisher.getAccountId() != publisherId) {
            logger.error(String.format("Used publisher ID (%s) does not match current logged-in publisher (%s)", publisherId, currentPublisher));
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        EBook existingEBook = eBookService.getByPublisherAndEBookId(existingEBookId, publisherId);
        if (existingEBook == null) {
            logger.error(String.format("No eBook with ID '%s' was found for publisher '%s'", existingEBookId, publisherId));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        EBook newEBook = eBookService.getByPublisherAndEBookId(newEBookId, publisherId);
        if (newEBook == null) {
            logger.error(String.format("No eBook with ID '%s' was found for publisher '%s'", newEBookId, publisherId));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Course course = courseDataService.getCourse(publisherId, courseId);
        if (course == null) {
            logger.error(String.format("No course with ID '%s' was found for publisher '%s'", courseId, publisherId));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        String username = currentCgsUserDetails.getUsername();

        String jobId = UUID.randomUUID().toString();

        JobProperties properties = new JobProperties();
        properties.setPublisherId(publisherId);
        properties.setUsername(username);
        Job job = new Job.Builder(jobId, Job.Type.UPDATE_EBOOK, Job.Status.STARTED)
                .setProperties(properties)
                .setWebsocketTopic(WebsocketTopics.UPDATE_EBOOK + jobId)
                .build();
        jobService.save(job);

        UpdateEBookData updateEBookData = new UpdateEBookData.Builder(jobId, publisherId, username,
                newEBook,
                existingEBook, eBookCleanupService.getEBookFolderById(publisherId, existingEBookId))
                .setCourseIds(Collections.singleton(courseId))
                .build();

        // async method. UI will be updated through websockets or polling
        eBookManager.addJobToPendingQueue(jobId, new EBookHandlingRunnable() {
            @Override
            public void cancelProcess() {
                eBookService.cancelProcess(updateEBookData);
            }

            @Override
            public void run() {
                eBookService.updateEBook(updateEBookData, eBookManager);
            }
        });

        return new ResponseEntity<>(jobId, HttpStatus.OK);
    }

    private void validateFileType(FileItemStream fileItemStream) throws FileTypeNotAllowedException {
        validateFileType(fileItemStream.getName());
    }

    private void validateFileType(MultipartFile file) throws FileTypeNotAllowedException {
        validateFileType(file.getOriginalFilename());
    }

    private void validateFileType(String fileName) throws FileTypeNotAllowedException {
        String ext = FilenameUtils.getExtension(fileName);
        if (!ext.equalsIgnoreCase("pdf") && !ext.equalsIgnoreCase("epub")) {
            throw new FileTypeNotAllowedException(String.format("File type '%s' is not supported for creation of an ebook", ext));
        }
    }

    @RequestMapping(value = "cancel", method = RequestMethod.PUT)
    public ResponseEntity cancelJob(@RequestParam(value = "jobId") String jobId) throws Exception {
        Job job = jobService.getJob(jobId);
        if (job == null) {
            return new ResponseEntity(HttpStatus.NOT_FOUND);
        } else if (!job.getProperties().getUsername().equals(currentCgsUserDetails.getUsername())) {
            logger.error(String.format("REST request to cancel job %s, received from user %s, was REJECTED. Job owner is %s",
                    jobId, currentCgsUserDetails.getUsername(), job.getProperties().getUsername()));
            return new ResponseEntity(HttpStatus.FORBIDDEN);
        }
        logger.debug(String.format("cancelJob. About to cancel job for EBook file, jobId: %s", jobId));
        eBookManager.cancelUploadProcess(jobId);
        return new ResponseEntity(HttpStatus.OK);
    }

    @RequestMapping(value = "{eBookId}", method = RequestMethod.GET)
    public EbookForClient getEBook(@PathVariable int publisherId, @PathVariable String eBookId) throws Exception {
        logger.debug(String.format("getEBook. Getting eBook %s", eBookId));
        return eBookService.getEbookForClientResponseByEBookId(eBookId, publisherId);
    }

    @RequestMapping(value = "basicInfo", method = RequestMethod.GET)
    public List<BasicEBookDTO> getAllPublisherBasicEBooksInfo(@PathVariable int publisherId) throws Exception {
        logger.debug(String.format("getAllPublisherBasicEBooksInfo. Getting eBooks basic info of publisher %d", publisherId));
        return eBookService.getAllPublisherBasicEBooksInfo(publisherId);
    }

    @RequestMapping(value = "basicInfo/{courseId}", method = RequestMethod.GET)
    public List<BasicEBookDTO> getPublisherBasicEBooksInfoByCourse(@PathVariable int publisherId,
                                                                   @PathVariable String courseId,
                                                                   @RequestParam(required = false) String additionalEBooks)
            throws Exception {
        logger.debug(String.format("getPublisherBasicEBooksInfoByCourse. Getting eBooks basic info of course %s, of publisher %d",
                courseId, publisherId));
        return eBookService.getPublisherBasicEBooksInfoByCourseAndAdditionalEBooksId(publisherId, courseId, additionalEBooks);
    }

    @RequestMapping(value = "blankPageTemplate", method = RequestMethod.GET)
    public String getBlankPageTemplate() throws IOException {
        return eBookService.getBlankPageTemplate();
    }
}