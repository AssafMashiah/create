package org.t2k.cgs.persistence.dao.util;

import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.model.utils.JobsDao;
import org.t2k.cgs.persistence.dao.MongoDao;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.model.job.Job.Status;
import org.t2k.cgs.domain.model.job.Job.Type;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 13/08/13
 * Time: 16:49
 */
@Service
public class JobsMongoDao extends MongoDao implements JobsDao {

    private static Logger logger = Logger.getLogger(JobsMongoDao.class);

    private final String STATUS = "status";
    private final String TYPE = "type";
    private final String ID = "_id";

    protected static final String JOBS_COLLECTION = "jobs";

    @Override
    public void saveJob(Job job) {
        getMongoTemplate().save(job, JOBS_COLLECTION);
    }

    @Override
    public Job getJob(String jobId) throws DataAccessException {
        Query query = new Query(Criteria.where(ID).is(jobId));
        return getMongoTemplate().findOne(query, Job.class, JOBS_COLLECTION);
    }

    @Override
    public void updateJobProgress(String jobId, String componentName, int progress, Status status ) {
        Query query = new Query(Criteria.where(ID).is(jobId));
        Update update = new Update();
        if (status != null) {
           update.set(STATUS, status);
        }
        
        getMongoTemplate().updateFirst(query, update.set("componentsProgressInPercent." + componentName, progress), JOBS_COLLECTION);
    }

    @Override
    public void addError(String jobId, String errorCode , String error, Status status ) {
        Query query = new Query(Criteria.where(ID).is(jobId));
        Update update = new Update();
        getMongoTemplate().updateFirst(query, update.set("errors." + errorCode, error), JOBS_COLLECTION);
          if (status != null){
            getMongoTemplate().updateFirst(query, update.set(STATUS, status), JOBS_COLLECTION);
        }
    }

    @Override
    public void updateJobPhase(String jobId, Status status) {
        Query query = new Query(Criteria.where(ID).is(jobId));
        Update update = new Update();
        if (status != null) {
            update.set(STATUS, status);
        }

        getMongoTemplate().updateFirst(query, update, JOBS_COLLECTION);
    }

    @Override
    public List<Job> getJobsByPhases(List<Status> statuses, Type jobType) {
        Query query = new Query(Criteria.where(STATUS).in(statuses).and(TYPE).is(jobType));
        return getMongoTemplate().find(query, Job.class, JOBS_COLLECTION);
    }

    @Override
    public void removeJob(String jobId) throws DataAccessException {
        getMongoTemplate().remove(new Query(Criteria.where(ID).is(jobId)), JOBS_COLLECTION);
    }
}