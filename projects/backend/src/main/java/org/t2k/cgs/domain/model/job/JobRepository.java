package org.t2k.cgs.domain.model.job;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

/**
 * @author Alex Burdusel on 2016-06-23.
 */
public interface JobRepository extends MongoRepository<Job, String> {

    Page<Job> findByType(Job.Type type, Pageable pageRequest);
}
