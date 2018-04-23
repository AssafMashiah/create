package org.t2k.cgs.dao.packaging;

import org.springframework.dao.DataAccessException;
import org.t2k.cgs.dao.util.GenericDaoOperations;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.model.packaging.PackagePhase;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 19/11/12
 * Time: 11:33
 */
public interface PackagingDao extends GenericDaoOperations {

    CGSPackage getCGSPackage(String packageId) throws DataAccessException;

    void saveCGSPackage(CGSPackage cgsPackage) throws DataAccessException;

    CGSPackage getCGSPackage(String courseId, String revision) throws DataAccessException;

    List<CGSPackage> getPackagesOfPublisher(int publisherId)throws DataAccessException;

    List<CGSPackage> getPackagesByPhase(String courseId, List<String> packagePhase);

    void removeUnEndedPackages() throws DataAccessException;

    List<CGSPackage> getPackagesByCourse(String courseId) throws DataAccessException;

    void removePackagesByPackagePhases(List<String> packagePhases) throws DataAccessException;

    void removePackageById(String packageId) throws DataAccessException;

    void increasePackageResourceCount(String packId) throws DataAccessException;

    void increasePackageResourceDoneCount(String packId) throws DataAccessException ;

    List<CGSPackage> getPackagesByUserFromSpecificDate(String username, Date fromDateIso) throws DataAccessException;

    void updatePackagePendingPlace(String packId, int pendingPlace)throws DataAccessException;

    void updatePackagePhase(String packageId, PackagePhase packagePhase) throws DataAccessException;

    List<CGSPackage> getPackagesByUserAndState(String username, List<String> packagePhases) throws DataAccessException;

    List<CGSPackage> getPackagesByUsernameToDisplay(String username, int limit) throws DataAccessException;

    List<CGSPackage> getPackagesByPublisherToDisplay(int publisherId) throws DataAccessException;

    List<CGSPackage> getPackagesByPhase(List<String> packagePhasesStrings);

    List<CGSPackage> getOldHiddenPackages(Date dateOfExpiredPackages) throws DataAccessException, DaoException;

    void removePackage(String packId) throws DaoException;
}