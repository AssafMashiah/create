package org.t2k.cgs.domain.usecases.packaging;

import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.user.CGSUserDetails;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 27/11/12
 * Time: 17:17
 */
public interface PackageManager {

    /**
     * A Method to start the course packaging process.
     * the package output is an archive which compresses the collection of all the
     * course resources (like lessons , assets , standards etc..)
     */
    CGSPackage createPackageAndAddToPendingQueue(int publisherId, CoursePackageParams params, CGSUserDetails cgsUserDetails)throws Exception;

    /**
     * Cancel an execution of the packaging process.
     * The package task  may be in a pending queue or already running. the request tries to cancel the
     * job at all cases.
     *
     * @param packageId
     * @throws Exception
     */
    void stopPackage(String packageId) throws Exception;

    /**
     * A callback operation to notify the manager on a packaging process finish.
     * which may result from a success , cancel , or failed processing.
     *
     * @param cgsPackageId
     */
    void onTaskFinished(String cgsPackageId);

    /**
     * notifies the pending packages queue on
     */
    void notifyPendingWorkQueue();

    /**
     * sets the package status as reported, if the publish process has been either completed or failed.
     *
     * @param packageId
     */
    void hidePackage(String packageId) throws DsException;

    /**
     * Release the lock for the package's course.
     *
     * @param cgsPackage
     * @throws DsException
     */
    void releaseLock(CGSPackage cgsPackage) throws DsException;
}