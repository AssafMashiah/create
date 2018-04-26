package org.t2k.cgs.packaging;

import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.model.packaging.PackagePhase;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 18/11/12
 * Time: 15:35
 */
public interface PackagingService {

    /**
     * Saves(inserts or updates) the given package
     *
     * @param cgsPackage
     * @throws DsException
     */
    void saveCGSPackage(CGSPackage cgsPackage) throws DsException;

    /**
     * returns a CGSPackage by packageId
     *
     * @param packId
     * @return CGSPackage
     * @throws DsException
     */
    CGSPackage getPackage(String packId) throws DsException;

    /**
     * returns all packages of the given book in the provided status
     *
     * @param courseId
     * @param packagePhase @return
     * @throws DsException
     */
    List<CGSPackage> getPackagesByPhases(String courseId, List<PackagePhase> packagePhase);

    /**
     * returns all packages in the system in the provided status
     *
     * @param packagePhase @return
     * @throws DsException
     */
    List<CGSPackage> getPackagesByPhases(List<PackagePhase> packagePhase) throws DsException;

    /**
     * Returns all packages of the given courseId
     *
     * @param courseId
     * @return
     * @throws DsException
     */
    List<CGSPackage> getPackagesByCourse(String courseId) throws DsException;

    void updatePackagePendingPlace(String packId, int pendingPlace) throws DsException;

    List<CGSPackage> getCgsPackagesToDisplayByUsername(String username) throws DsException;

    List<CGSPackage> getOldHiddenPackages(int numOfDaysAgo) throws DsException;

    void removeOldHiddenPackagesAndTheirFiles() throws DsException;

    void removePackage(String packId) throws DsException;
}