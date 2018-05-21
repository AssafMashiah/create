//package org.t2k.cgs.ebooks;
//
//import com.t2k.configurations.Configuration;
//import org.apache.log4j.Logger;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.t2k.cgs.dataServices.exceptions.DsException;
//import org.t2k.cgs.dataServices.exceptions.InitServiceException;
//import org.t2k.cgs.enums.EBookConversionServiceTypes;
//import org.t2k.cgs.domain.model.ebooks.EBookErrorCode;
//import org.t2k.cgs.domain.model.ebooks.EBookManagerData;
//import org.t2k.cgs.domain.model.ebooks.UploadEBookData;
//import org.t2k.cgs.domain.model.ebooks.UploadEBookResponse;
//import org.t2k.cgs.domain.model.job.Job;
//import org.t2k.cgs.domain.model.job.Job.Status;
//import org.t2k.cgs.domain.model.job.JobService;
//
//import javax.annotation.PostConstruct;
//import java.io.File;
//import java.util.*;
//import java.util.concurrent.ArrayBlockingQueue;
//import java.util.concurrent.BlockingQueue;
//import java.util.concurrent.ThreadPoolExecutor;
//import java.util.concurrent.TimeUnit;
//
//import static org.t2k.cgs.domain.model.job.Job.Type.UploadEBookFile;
//
///**
// * Created by IntelliJ IDEA.
// * User: elad.avidan
// * Date: 14/10/2015
// * Time: 19:07
// */
////@Service //replaced by EBookManagerSpringAsync
//public class EBookManagerImpl implements EBookManager {
//
//    private Logger logger = Logger.getLogger(this.getClass());
//
//    private final String EBOOK_ID = "eBookId";
//    private final String EBOOKS_DIR = "eBooksDir";
//    private final String PUBLISHER_ID = "publisherId";
//
//    @Autowired
//    private EBookService eBookService;
//
//    @Autowired
//    private EBookCleanupService eBookCleanupService;
//
//    @Autowired
//    private JobService jobService;
//
//    @Autowired
//    private Configuration configuration;
//
//    private ThreadPoolExecutor uploadEBookExecutor;
//    private BlockingQueue<Runnable> pendingUploads;
//    //    private RejectedExecutionHandler executionHandler = new UploadEBookRejectedExecutionHandlerImpl();
//    private Map<String, EBookHandlingRunnable> uploadThreadsMap = new Hashtable<>();
//
//    @PostConstruct
//    private void init() {
//        /** Cleanups section **/
//        logger.info("Init EBookService...");
////        if (uploadEBookExecutor != null) {
////            uploadEBookExecutor.shutdown();
////        }
//
//        try {
//            handleUploadEBookFileJobsThatAreInProgressOrPendingStatuses();
//        } catch (Exception e) {
//            String msg = String.format("init: Failed to change jobs statuses of type %s that were in progress before server was shut down.", UploadEBookFile);
//            logger.error(msg, e);
//            throw new InitServiceException(msg);
//        }
//
//        /** Initialization section **/
//        int maxPending = getMaxPendingTasks();
//        int maxRunning = getMaxConcurrentTasks();
//        logger.info(String.format("init: initialize uploadEBookExecutor with max pending: %d, max concurrent: %d", maxPending, maxRunning));
//        pendingUploads = new ArrayBlockingQueue<>(maxPending, true);
//        uploadEBookExecutor = new ThreadPoolExecutor(maxRunning, maxRunning, 10, TimeUnit.SECONDS, pendingUploads);
//    }
//
//    private void handleUploadEBookFileJobsThatAreInProgressOrPendingStatuses() throws DsException {
//        List<String> pendingJobsIds = new ArrayList<>();
//        List<String> inProgressJobsIds = new ArrayList<>();
//
//        List<Job> pendingPackagesToModify = jobService.getJobsByPhases(Arrays.asList(Status.PENDING, Status.IN_PROGRESS), UploadEBookFile);
//        for (Job job : pendingPackagesToModify) {
//            Status currentPhase = job.getStatus();
//            job.setStatus(Status.FAILED);
//            job.addError(EBookErrorCode.FAILED_TO_UPLOAD_EBOOK_FILE, "Failed due to server shutdown during the job progress.");
//            jobService.saveJob(job);
//
//            if (currentPhase == Status.IN_PROGRESS) { // perform cleanups for in_progress jobs
//                inProgressJobsIds.add(job.getJobId());
//                Map<String, Object> jobProperties = job.getProperties();
//                eBookCleanupService.removeEBook((String) jobProperties.get(EBOOKS_DIR), (String) jobProperties.get(EBOOK_ID),
//                        Integer.parseInt((String) jobProperties.get(PUBLISHER_ID)));
//            } else { // no need to perform cleanups for pending jobs
//                pendingJobsIds.add(job.getJobId());
//            }
//        }
//
//        logger.info(String.format("Changed statuses for %d jobs from PENDING to FAILED.\nJobs ids modified: %s", pendingJobsIds.size(), Arrays.toString(pendingJobsIds.toArray())));
//        logger.info(String.format("Changed statuses and performed cleanup for %d jobs from IN_PROGRESS to FAILED.\nJobs ids modified: %s", inProgressJobsIds.size(), Arrays.toString(inProgressJobsIds.toArray())));
//    }
//
//    private int getMaxConcurrentTasks() {
//        return Integer.parseInt(configuration.getProperty("maxConcurrentEBooksUploads", "5"));
//    }
//
//    private int getMaxPendingTasks() {
//        return Integer.parseInt(configuration.getProperty("maxPendingEBooksUploads", "20"));
//    }
//
//    @Override
//    public UploadEBookResponse addJobToPendingQueue(String jobId, String eBookId, int publisherId, String username, File uploadedEBookFile, EBookConversionServiceTypes conversionLibrary) {
//        String eBookDir = eBookCleanupService.getEBookFolderById(publisherId, eBookId);
//        UploadEBookData uploadEBookData = new UploadEBookData(eBookId, eBookDir, publisherId, username, uploadedEBookFile, jobId, conversionLibrary);
//        UploadEBookThread uploadEBookThread = new UploadEBookThread(uploadEBookData, eBookService, this);
//        uploadEBookExecutor.submit(uploadEBookThread);
//        uploadThreadsMap.put(jobId, uploadEBookThread);
//
//        return new UploadEBookResponse(jobId);
//    }
//
//    @Override
//    public void addJobToPendingQueue(String jobId, EBookHandlingRunnable runnable) {
//        uploadEBookExecutor.submit(runnable);
//        uploadThreadsMap.put(jobId, runnable);
//    }
//
//    @Override
//    public EBookHandlingRunnable removeJob(String jobId) {
//        EBookHandlingRunnable runnable = uploadThreadsMap.remove(jobId);
//        if (runnable != null) pendingUploads.remove(runnable);
//        if (runnable != null) uploadEBookExecutor.remove(runnable);
//        return runnable;
//    }
//
//    @Override
//    public void cancelUploadProcess(String jobId) throws DsException {
//        logger.info(String.format("cancelUploadProcess: id: %s", jobId));
//        EBookHandlingRunnable uploadEBookThread = uploadThreadsMap.get(jobId);
//
//        // handle the threads...
//        if (uploadEBookThread == null) { // if uploadEBookThread == null, then there is no thread to cancel. perhaps it is already finished...
//            logger.warn(String.format("Cannot cancel upload with jobId: %s. The upload is not in progress.", jobId));
//            return;
//        } else {
//            Job job = jobService.getJob(jobId);
//            if (job.getStatus().equals(Status.PENDING)) {
//                pendingUploads.remove(uploadThreadsMap.get(jobId));
//                uploadThreadsMap.remove(jobId);
//            }
//        }
//        jobService.updateJobPhase(jobId, Status.CANCELED);
//        uploadEBookThread.cancelProcess(); // cancel a working/pending thread
//    }
//
//    @Override
//    public void onTaskFinished(EBookManagerData uploadEBookData) {
//        String jobId = uploadEBookData.getJobId();
//        Job job = jobService.getJob(jobId);
//        if (job == null || !job.getErrors().isEmpty()) { // job had errors
//            eBookCleanupService.removeEBook(uploadEBookData.getEBookDir(), uploadEBookData.getEBookId(), uploadEBookData.getPublisherId());
//            if (job != null && job.getStatus() != Status.FAILED) {
//                jobService.updateJobPhase(jobId, Status.FAILED);
//            }
//        } else if (uploadEBookData.isCancelled()) {
//            eBookCleanupService.removeEBook(uploadEBookData.getEBookDir(), uploadEBookData.getEBookId(), uploadEBookData.getPublisherId());
//        } else if (uploadThreadsMap.get(jobId) instanceof UploadEBookThread) {
//            // we need the job not to be marked as completed for other tasks, where we re-use the manager and the upload process
//            removeJob(jobId);
//            jobService.updateJobPhase(jobId, Status.COMPLETED);
//        } else if (job.getStatus().equals(Status.COMPLETED)) {
//            removeJob(jobId);
//        }
//    }
//}