package org.t2k.cgs.dao.util;

import org.springframework.dao.DataAccessException;
import org.t2k.cgs.model.job.Job;

import java.util.List;

import static org.t2k.cgs.model.job.Job.*;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 13/08/13
 * Time: 16:44
 */
public interface JobsDao {

    void saveJob(Job job);

    Job getJob(String jobId) throws DataAccessException;

    void updateJobProgress(String jobId, String componentName, int progress, Status status)  throws DataAccessException;

    void removeJob(String jobId) throws DataAccessException;

    void addError(String jobId, String errorCode, String error, Status status);

    void updateJobPhase(String jobId, Status status);

    List<Job> getJobsByPhases(List<Status> statuses, Type jobType);
}