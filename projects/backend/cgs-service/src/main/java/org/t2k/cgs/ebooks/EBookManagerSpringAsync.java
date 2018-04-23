package org.t2k.cgs.ebooks;

import org.apache.log4j.Logger;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.model.ebooks.EBookErrorCode;
import org.t2k.cgs.model.ebooks.EBookManagerData;
import org.t2k.cgs.model.ebooks.UploadEBookData;
import org.t2k.cgs.model.ebooks.UploadEBookResponse;
import org.t2k.cgs.model.job.Job;
import org.t2k.cgs.model.job.JobService;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.io.File;
import java.util.*;
import java.util.concurrent.Future;

import static org.t2k.cgs.model.job.Job.Type.UploadEBookFile;

/**
 * Implementation of {@link EBookManager} using spring spring's {@link AsyncTaskExecutor}, in order to allow spring to
 * catch runtime exceptions
 *
 * @author Alex Burdusel on 2016-11-02.
 */
@Service(value = "eBookManagerSpringAsync")
public class EBookManagerSpringAsync implements EBookManager {

    private Logger logger = Logger.getLogger(this.getClass());

    private AsyncTaskExecutor asyncTaskExecutor;

    private EBookService eBookService;

    private EBookCleanupService eBookCleanupService;

    private JobService jobService;

    private Map<String, EBookHandlingRunnable> jobsRunnableMap = new HashMap<>();
    private Map<String, Future<?>> jobsFutureMap = new HashMap<>();

    @Inject
    public EBookManagerSpringAsync(AsyncTaskExecutor asyncTaskExecutor,
                                   EBookService eBookService,
                                   EBookCleanupService eBookCleanupService,
                                   JobService jobService) {
        Assert.notNull(asyncTaskExecutor);
        Assert.notNull(eBookService);
        Assert.notNull(eBookCleanupService);
        Assert.notNull(jobService);
        this.asyncTaskExecutor = asyncTaskExecutor;
        this.eBookService = eBookService;
        this.eBookCleanupService = eBookCleanupService;
        this.jobService = jobService;
    }

    @PostConstruct
    private void init() throws Exception {
        handleUploadThatAreInProgressOrPending();
    }

    private void handleUploadThatAreInProgressOrPending() throws DsException {
        List<String> pendingJobsIds = new ArrayList<>();
        List<String> inProgressJobsIds = new ArrayList<>();

        List<Job> pendingPackagesToModify = jobService.getJobsByPhases(Arrays.asList(Job.Status.PENDING, Job.Status.IN_PROGRESS), UploadEBookFile);
        for (Job job : pendingPackagesToModify) {
            Job.Status currentPhase = job.getStatus();
            job.setStatus(Job.Status.FAILED);
            job.addError(EBookErrorCode.FAILED_TO_UPLOAD_EBOOK_FILE, "Failed due to server shutdown during the job progress.");
            jobService.saveJob(job);

            if (currentPhase == Job.Status.IN_PROGRESS) { // perform cleanups for in_progress jobs
                inProgressJobsIds.add(job.getJobId());
                eBookCleanupService.removeEBook(job.getProperties().getEBooksDir(),
                        job.getProperties().getEBookId(),
                        job.getProperties().getPublisherId());

            } else { // no need to perform cleanups for pending jobs
                pendingJobsIds.add(job.getJobId());
            }
        }
        logger.info(String.format("Changed statuses for %d jobs from PENDING to FAILED. Jobs ids modified: %s",
                pendingJobsIds.size(), Arrays.toString(pendingJobsIds.toArray())));
        logger.info(String.format("Changed statuses and performed cleanup for %d jobs from IN_PROGRESS to FAILED. Jobs ids modified: %s",
                inProgressJobsIds.size(), Arrays.toString(inProgressJobsIds.toArray())));
    }

    @Override
    public UploadEBookResponse addJobToPendingQueue(String jobId, String eBookId, int publisherId, String username,
                                                    File uploadedEBookFile, EBookConversionServiceTypes conversionLibrary) {
        String eBookDir = eBookCleanupService.getEBookFolderById(publisherId, eBookId);
        UploadEBookData uploadEBookData = new UploadEBookData(eBookId, eBookDir, publisherId, username, uploadedEBookFile, jobId, conversionLibrary);
        UploadEBookThread uploadEBookThread = new UploadEBookThread(uploadEBookData, eBookService, this);
        addJobToPendingQueue(jobId, uploadEBookThread);
        return new UploadEBookResponse(jobId);
    }

    @Override
    public void addJobToPendingQueue(String jobId, EBookHandlingRunnable runnable) {
        jobsFutureMap.put(jobId, asyncTaskExecutor.submit(runnable));
        jobsRunnableMap.put(jobId, runnable);
    }

    @Override
    public EBookHandlingRunnable removeJob(String jobId) {
        Future future = jobsFutureMap.remove(jobId);
        if (future != null) future.cancel(false);
        return jobsRunnableMap.remove(jobId);
    }

    @Override
    public void cancelUploadProcess(String jobId) throws DsException {
        logger.info("Canceling job with id: " + jobId);
        EBookHandlingRunnable uploadEBookThread = jobsRunnableMap.get(jobId);
        if (uploadEBookThread == null) {
            logger.warn(String.format("Cannot cancel job wit with id: %s. The job is not in progress.", jobId));
            return;
        } else {
            Job job = jobService.getJob(jobId);
            if (job.getStatus().equals(Job.Status.PENDING)) {
                removeJob(jobId);
            }
        }
        jobService.updateJobPhase(jobId, Job.Status.CANCELED);
        uploadEBookThread.cancelProcess(); // cancel a working/pending thread
    }

    @Override
    public void onTaskFinished(EBookManagerData eBookManagerData) {
        String jobId = eBookManagerData.getJobId();
        Job job = jobService.getJob(jobId);
        if (job == null || !job.getErrors().isEmpty()) { // job had errors
            eBookCleanupService.removeEBook(eBookManagerData.getEBookDir(), eBookManagerData.getEBookId(), eBookManagerData.getPublisherId());
            if (job != null && job.getStatus() != Job.Status.FAILED) {
                jobService.updateJobPhase(jobId, Job.Status.FAILED);
            }
        } else if (eBookManagerData.isCancelled()) {
            eBookCleanupService.removeEBook(eBookManagerData.getEBookDir(), eBookManagerData.getEBookId(), eBookManagerData.getPublisherId());
        } else if (jobsRunnableMap.get(jobId) instanceof UploadEBookThread) {
            // we need the job not to be marked as completed for other tasks, where we re-use the manager and the upload process
            removeJob(jobId);
            jobService.updateJobPhase(jobId, Job.Status.COMPLETED);
        } else if (job.getStatus().equals(Job.Status.COMPLETED)) {
            removeJob(jobId);
        }
    }
}
