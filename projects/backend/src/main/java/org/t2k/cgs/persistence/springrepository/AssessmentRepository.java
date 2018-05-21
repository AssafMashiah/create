package org.t2k.cgs.persistence.springrepository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.t2k.cgs.domain.model.tocItem.Assessment;

import java.util.List;

/**
 * @author Alex Burdusel on 2017-01-09.
 */
public interface AssessmentRepository extends MongoRepository<Assessment, ObjectId> {

    @Query(value = "{'cgsData.publisherId': ?0, 'cgsData.courseId': ?1, 'contentData.cid': ?2}")
    Assessment findByPublisherIdAndCourseIdAndCid(int publisherId, String courseId, String assessmentCid);

    @Query(value = "{'cgsData.publisherId': ?0, 'cgsData.courseId': ?1}")
    List<Assessment> findByPublisherIdAndCourseId(int publisherId, String courseId);

    @Query(value = "{'cgsData.publisherId': ?0, 'cgsData.courseId': ?1, 'contentData.cid': {$in: ?2}}")
    List<Assessment> findByPublisherIdAndCourseIdAndCidIn(int publisherId, String courseId, List<String> lessonCid);
}
