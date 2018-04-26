package org.t2k.cgs.course;

import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.security.CGSUserDetails;

/**
 * Service responsible with courses removal
 *
 * @author Alex Burdusel on 2016-10-13.
 */
public interface CourseCleanupService {

    /**
     * Removes the course and all references related to it, including disk resources.
     *
     * @param publisherId ID of the publisher on which the course is published
     * @param courseId
     * @throws DsException in case an error is encountered during deletion
     */
    void deleteCourse(int publisherId, String courseId) throws DsException;

    /**
     * Handles clean-up of toc items no longer referenced by course.
     * <p>
     * NOTE: Method migrated from {@link CourseDataService#courseCleanUp(int, String, CGSUserDetails)}
     *
     * @param publisherId
     * @param courseId
     * @param userDetails
     * @throws DsException
     */
    void cleanupTocItemsOnCourse(int publisherId, String courseId, CGSUserDetails userDetails) throws DsException;
}
