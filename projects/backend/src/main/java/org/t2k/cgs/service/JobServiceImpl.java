package org.t2k.cgs.service;

import org.apache.log4j.Logger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.t2k.cgs.domain.model.job.JobRepository;
import org.t2k.cgs.domain.model.utils.JobsDao;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.service.ebooks.websocket.Message;
import org.t2k.cgs.service.ebooks.websocket.MessageCode;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.model.job.Job.Type;
import org.t2k.cgs.domain.model.job.JobComponent;
import org.t2k.cgs.domain.model.job.JobComponentProgress;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.domain.model.utils.ErrorCode;

import javax.inject.Inject;
import java.util.List;
import java.util.Optional;

import static org.t2k.cgs.domain.model.job.Job.Status;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 13/08/13
 * Time: 17:35
 */
@Service
public class JobServiceImpl implements JobService, WebsocketObservable {

    private Logger logger = Logger.getLogger(this.getClass());

    private JobsDao jobsDao;
    private JobRepository jobRepository;
    private SimpMessagingTemplate simpMessagingTemplate;

    @Inject
    public JobServiceImpl(JobsDao jobsDao,
                          JobRepository jobRepository,
                          SimpMessagingTemplate simpMessagingTemplate) {
        Assert.notNull(jobsDao);
        Assert.notNull(jobRepository);
        Assert.notNull(simpMessagingTemplate);

        this.jobsDao = jobsDao;
        this.jobRepository = jobRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
    }

    @Override
    public void saveJob(Job job) {
        if (job.getJobId() != null) {
            save(job);
        }
    }

    @Override
    public Optional<Job> getLastJobForType(Type type) {
        Page<Job> jobs = jobRepository.findByType(type, new PageRequest(0, 1, new Sort(Sort.Direction.DESC, "creationDate")));
        if (jobs.getContent().size() > 0) {
            return Optional.of(jobs.getContent().get(0));
        }
        return Optional.empty();
    }

    public Job save(Job job) {
        job = jobRepository.save(job);
        sendJobProgressToWebsocket(job);
        return job;
    }

    @Override
    public Job getJob(String jobId) {
        return jobsDao.getJob(jobId);
    }

    @Override
    public Job updateJobProgress(String jobId, String componentName, int progress, Status status) {
        jobsDao.updateJobProgress(jobId, componentName, progress, status);
        Job job = jobsDao.getJob(jobId);
        sendJobProgressToWebsocket(job);
        return job;
    }

    @Override
    public Job updateComponentProgress(String jobId, String componentName, int progress, Status jobStatus) {
        if (progress < 0 || progress > 100) {
            throw new IllegalArgumentException("Progress value must be between 0 and 100");
        }
        jobsDao.updateJobProgress(jobId, componentName, progress, jobStatus);
        Job job = jobsDao.getJob(jobId);
        sendJobProgressToWebsocket(job);
        return job;
    }

    @Override
    public Job updateComponentProgress(String jobId, JobComponent componentName, int progress, Status jobStatus) {
        return updateComponentProgress(jobId, componentName.getValue(), progress, jobStatus);
    }

    @Override
    public Job updateComponentProgress(String jobId, JobComponent componentName, int progress) {
        Job job = updateComponentProgress(jobId, componentName.getValue(), progress, null);
        sendJobProgressToWebsocket(job);
        return job;
    }

    @Override
    public Job updateComponentProgress(String jobId, JobComponentProgress componentProgress, Status jobStatus) {
        return updateComponentProgress(jobId, componentProgress.getComponent(), componentProgress.getProgress(), jobStatus);
    }

    @Override
    public void updateJobPhase(String jobId, Status status) {
        jobsDao.updateJobPhase(jobId, status);
    }


    public Job updateJobStatus(String jobId, Status status) {
        jobsDao.updateJobPhase(jobId, status);
        Job job = jobsDao.getJob(jobId);
        sendJobProgressToWebsocket(job);
        return job;
    }

    @Override
    public void addError(String jobId, String errorCode, String error, Status status) {
        jobsDao.addError(jobId, errorCode, error, status);
    }

    @Override
    public Job addError(String jobId, ErrorCode errorCode, String errorMessage, Status status) {
        logger.error(String.format("Job %s encountered error '%s' with error message '%s'", jobId, errorCode, errorMessage));
        Job job = getJob(jobId);
        job.addError(errorCode, errorMessage);
        job.setStatus(status);
        sendJobProgressToWebsocket(job);
        return save(job);
    }

    @Override
    public Job addError(String jobId, ErrorCode errorCode, String errorMessage) {
        logger.error(String.format("Job %s encountered error '%s' with error message '%s'", jobId, errorCode, errorMessage));
        Job job = getJob(jobId);
        job.addError(errorCode, errorMessage);
        sendJobProgressToWebsocket(job);
        return save(job);
    }

    @Override
    public Job addWarning(String jobId, String warningMessage) {
        Job job = getJob(jobId);
        job.addWarning(warningMessage);
        sendJobProgressToWebsocket(job);
        return save(job);
    }

    @Override
    public List<Job> getJobsByPhases(List<Status> statuses, Type jobType) {
        return jobsDao.getJobsByPhases(statuses, jobType);
    }

    @Override
    public void removeJob(String jobId) throws DsException {
        jobsDao.removeJob(jobId);
    }

    @Override
    public Job onJobFailure(String jobId, ErrorCode errorCode, String errorMessage, JobComponentProgress componentProgress) {
        logger.error(String.format("Job %s failed with error code '%s' and error message '%s'", jobId, errorCode, errorMessage));
        Job job = getJob(jobId);
        job.addError(errorCode, errorMessage);
        job.setStatus(Status.FAILED);
        if (componentProgress != null) {
            job.updateComponentProgress(componentProgress.getComponent(), componentProgress.getProgress());
        }
        sendJobProgressToWebsocket(job);
        return save(job);
    }

    /**
     * Broadcasts the serialized job to the websocket topic specified in the job
     *
     * @param job job to be sent broadcasted to listeners
     */
    private void sendJobProgressToWebsocket(Job job) {
        if (job != null && job.getWebsocketTopic() != null) {
            notifyObservers(job.getWebsocketTopic(), Message.newInstance(MessageCode.PROGRESS, job));
        }
    }

    @Override
    public void notifyObservers(String topic, Object payload) {
        simpMessagingTemplate.convertAndSend(topic, payload);
    }
}