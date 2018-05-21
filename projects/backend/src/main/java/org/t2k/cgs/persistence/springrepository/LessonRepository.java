package org.t2k.cgs.persistence.springrepository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.t2k.cgs.domain.model.tocItem.Lesson;

import java.util.List;

/**
 * @author Alex Burdusel on 2016-06-16.
 */
public interface LessonRepository extends MongoRepository<Lesson, ObjectId> {

    @Query(value = "{'cgsData.publisherId': ?0, 'cgsData.courseId': ?1, 'contentData.cid': ?2}")
    Lesson findByPublisherIdAndCourseIdAndCid(int publisherId, String courseId, String lessonCid);

    @Query(value = "{'cgsData.publisherId': ?0, 'cgsData.courseId': ?1}")
    List<Lesson> findByPublisherIdAndCourseId(int publisherId, String courseId);

    @Query(value = "{'cgsData.publisherId': ?0, 'cgsData.courseId': ?1, 'contentData.cid': {$in: ?2}}")
    List<Lesson> findByPublisherIdAndCourseIdAndCidIn(int publisherId, String courseId, List<String> lessonCid);
}
