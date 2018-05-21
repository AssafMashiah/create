package org.t2k.cgs.domain.usecases.course.search;

import org.springframework.data.domain.Pageable;
import org.springframework.data.elasticsearch.core.FacetedPage;
import org.t2k.cgs.domain.model.course.Course;

/**
 * Search service for courses
 *
 * @author Alex Burdusel on 2017-01-19.
 */
public interface CourseSearchService {

    /**
     * Validates if the data indexed for search is correct
     *
     * @return true if the data is correctly indexed, false otherwise
     */
    boolean isIndexationValid();

    /**
     * Indexes (re-indexes) all courses for search
     */
    void indexAll();

    /**
     * Indexes a course object for search
     *
     * @param course course object to index
     */
    void index(Course course);

    /**
     * Removes an indexed course from search service
     *
     * @param courseId courseId of the course to remove
     */
    void delete(String courseId);

    /**
     * Searches courses for a given publisher that contain a given text in the title of the course or in its
     * content
     *
     * @param publisherId id of the publisher to retrieve courses for
     * @param searchText  text to search courses by
     * @param pageRequest pagination information to return data by
     * @return a page containing courses matching the given criteria
     */
    FacetedPage<CourseES> searchCoursesByText(int publisherId, String searchText, Pageable pageRequest);

    /**
     * Searches courses for a given publisher that contain a given text in the title
     *
     * @param publisherId id of the publisher to retrieve courses for
     * @param searchText  text to search courses by in their title
     * @param pageRequest pagination information to return data by
     * @return a page containing courses matching the given criteria
     */
    FacetedPage<CourseES> searchCoursesByTitle(int publisherId, String searchText, Pageable pageRequest);
}
