package org.t2k.cgs.job;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.t2k.cgs.model.job.Job;

/**
 * @author Alex Burdusel on 2016-06-23.
 */
public interface JobRepository extends MongoRepository<Job, String> {

    Page<Job> findByType(Job.Type type, Pageable pageRequest);
}
