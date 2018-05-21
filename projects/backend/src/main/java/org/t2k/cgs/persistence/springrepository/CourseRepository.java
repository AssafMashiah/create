package org.t2k.cgs.persistence.springrepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.t2k.cgs.domain.model.course.Course;
import org.t2k.cgs.domain.usecases.course.CourseLite;

import java.util.Date;
import java.util.List;

/**
 * @author Alex Burdusel on 2016-04-25.
 */
public interface CourseRepository extends MongoRepository<Course, String> {

    /**
     * @return a list of all courses for the given publisher that use the eBook with the given eBookId
     */
    @Query(value = "{'cgsData.publisherId': ?0, 'contentData.eBooksIds': ?1}")
    List<Course> findByPublisherIdAndEBookId(int publisherId, String eBookId);

    @Query(value = "{'cgsData.publisherId': ?0}")
    Page<Course> findByPublisherId(int publisherId, Pageable pageRequest);
//
//    @Query(value = "{'cgsData.publisherId': ?0, 'contentData.header.last-modified': {$gt: ?1}}") // out of memory when too many courses
//    List<Course> findByPublisherIdAndLastModifiedGreaterThan(int publisherId, Date lastModified);

    @Query(value = "{'contentData.header.last-modified': ?0}")
    List<CourseLite> findByLastModified(Date lastModified);

    @Query(value = "{'cgsData.publisherId': ?0, 'contentData.courseId': ?1}")
    Course findByPublisherIdAndCourseId(int publisherId, String courseId);

    @Query(value = "{'cgsData.publisherId': ?0, 'contentData.courseId': {$in: ?1}}")
    List<Course> findByPublisherIdAndCourseIdIn(int publisherId, List<String> courseIds);

    @Query(value = "{'cgsData.publisherId': ?0, 'contentData.courseId': {$in: ?1}}")
    Page<Course> findByPublisherIdAndCourseIdIn(int publisherId, List<String> courseIds, Pageable pageRequest);
}
