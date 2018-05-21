package org.t2k.cgs.domain.usecases;

import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.model.job.Job.Status;
import org.t2k.cgs.domain.model.job.Job.Type;
import org.t2k.cgs.domain.model.job.JobComponent;
import org.t2k.cgs.domain.model.job.JobComponentProgress;
import org.t2k.cgs.domain.model.utils.ErrorCode;

import java.util.List;
import java.util.Optional;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 13/08/13
 * Time: 17:31
 */
public interface JobService {

//    String ORIGINAL_EBOOK_ID = "originalEBookId";

    void saveJob(Job job);

    /**
     * Returns the last job of the given type
     *
     * @param type type of the job to return
     * @return the last job of the given type
     */
    Optional<Job> getLastJobForType(Job.Type type);

    Job save(Job job);

    Job getJob(String jobId);

    Job updateJobProgress(String jobId, String componentName, int progress, Status status);

    /**
     * @throws IllegalArgumentException if the progress value is not between 0 and 100
     */
    Job updateComponentProgress(String jobId, String componentName, int progress, Status jobStatus);

    /**
     * @throws IllegalArgumentException if the progress value is not between 0 and 100
     */
    Job updateComponentProgress(String jobId, JobComponent componentName, int progress, Status jobStatus);

    /**
     * @throws IllegalArgumentException if the progress value is not between 0 and 100
     */
    Job updateComponentProgress(String jobId, JobComponent componentName, int progress);

    /**
     * @throws IllegalArgumentException if the progress value is not between 0 and 100
     */
    Job updateComponentProgress(String jobId, JobComponentProgress componentProgress, Status jobStatus);

    void updateJobPhase(String jobId, Status status);

    Job updateJobStatus(String jobId, Status status);

    void removeJob(String jobId) throws DsException;

    void addError(String jobId, String errorCode, String error, Status status);

    Job addError(String jobId, ErrorCode errorCode, String errorMessage, Status status);

    Job addError(String jobId, ErrorCode errorCode, String errorMessage);

    Job addWarning(String jobId, String warningMessage);

    List<Job> getJobsByPhases(List<Status> statuses, Type jobType);

    /**
     * Marks the job as failed with the given error code and error message
     *
     * @param jobId             ID of the Job to update
     * @param componentProgress can be null
     * @return updated job
     */
    Job onJobFailure(String jobId, ErrorCode errorCode, String errorMessage, JobComponentProgress componentProgress);
}