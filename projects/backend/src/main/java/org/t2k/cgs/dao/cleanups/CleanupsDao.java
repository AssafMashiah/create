package org.t2k.cgs.dao.cleanups;

import com.mongodb.DBCursor;
import org.t2k.cgs.dao.util.GenericDaoOperations;
import org.t2k.cgs.model.cleanup.CleanupJob;
import org.t2k.cgs.model.cleanup.CleanupStatus;
import org.t2k.cgs.model.cleanup.CleanupType;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: Asaf.Shochet
 * Date: 14/08/14
 * Time: 14:23
 */
public interface CleanupsDao extends GenericDaoOperations {

    void insertOrUpdateCleanup(CleanupJob cleanupJob) throws DaoException;

    void saveCleanup(CleanupJob cleanupJob) throws DaoException;

    List<CleanupJob> getWaitingCleanupJobs(int numberOfCleanupsToReturn,  CleanupType type) throws DaoException;

    DBCursor getWaitingCleanups() throws DaoException;

    void updateCleanupStatus(int publisherId, String courseId, String itemId, CleanupType cleanupType, CleanupStatus newStatus) throws DaoException;

    void removeCleanup(CleanupJob cleanupJob);

    CleanupJob getCleanup(int publisherId, String courseId, String tocItemId, CleanupType cleanupType, CleanupStatus cleanupStatus);

    CleanupJob getCourseCleanupJob(int publisherId, String courseId, CleanupStatus cleanupStatus);

    CleanupJob getTocItemCleanupJob(int publisherId, String courseId, String tocItemId, CleanupStatus cleanupStatus, CleanupType type);

    /**
     * Removes all the cleanup jobs which relate to the given course id.
     * @param courseId - the course id which will be used to find all the cleanup jobs relate to that course.
     * @throws DaoException
     */
    void removeRelatedCleanups(int publisherId, String courseId) throws DaoException;
}