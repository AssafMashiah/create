package org.t2k.cgs.packaging;

import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dao.packaging.PackagingDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.dataServices.exceptions.ResourceNotFoundException;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.model.packaging.PackagePhase;
import org.t2k.sample.dao.exceptions.DaoException;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 18/11/12
 * Time: 18:17
 */
@Service
public class PackagingServiceImpl implements PackagingService {

    private static Logger logger = Logger.getLogger(PackagingServiceImpl.class);

    @Autowired
    private PackagingDao packagingDao;

    @Autowired
    private Configuration configuration;

    @Override
    public void saveCGSPackage(CGSPackage cgsPackage) throws DsException {
        logger.debug(String.format("saveCGSPackage. packageId: %s", cgsPackage.getPackId()));
        packagingDao.saveCGSPackage(cgsPackage);
    }

    @Override
    public CGSPackage getPackage(String packId) throws DsException {
        logger.debug(String.format("getPackage. packageId: %s", packId));
        CGSPackage cgsPackage = packagingDao.getCGSPackage(packId);
        if (cgsPackage == null) {
            throw new ResourceNotFoundException(packId, "can't find package id: " + packId);
        }
        return cgsPackage;
    }

    @Override
    public List<CGSPackage> getPackagesByPhases(String courseId, List<PackagePhase> packagePhases) {
        logger.debug(String.format("getPackagesByPhases. courseId: %s, package phases: %s", courseId,Arrays.toString(packagePhases.toArray())));
        List<String> packagePhasesStrings = new ArrayList<>();
        for (PackagePhase packagePhase : packagePhases)
            packagePhasesStrings.add(packagePhase.name());

        return packagingDao.getPackagesByPhase(courseId, packagePhasesStrings);
    }

    @Override
    public List<CGSPackage> getPackagesByPhases(List<PackagePhase> packagePhases) throws DsException {
        logger.debug(String.format("getPackagesByPhases. package phases: %s", Arrays.toString(packagePhases.toArray())));
        List<String> packagePhasesStrings = new ArrayList<>();
        for (PackagePhase packagePhase : packagePhases)
            packagePhasesStrings.add(packagePhase.name());

        return packagingDao.getPackagesByPhase(packagePhasesStrings);
    }

    @Override
    public List<CGSPackage> getPackagesByCourse(String courseId) throws DsException {
        logger.debug(String.format("getPackagesByCourse. courseId: %s", courseId));
        return packagingDao.getPackagesByCourse(courseId);
    }

    @Override
    public void updatePackagePendingPlace(String packId, int pendingPlace) throws DsException {
        logger.debug(String.format("updatePackagePendingPlace. packageId: %s, new place: %s", packId, pendingPlace));
        packagingDao.updatePackagePendingPlace(packId, pendingPlace);
    }

    @Override
    public List<CGSPackage> getCgsPackagesToDisplayByUsername(String username) throws DsException {
        int maxNotifications = configuration.getIntProperty("maxNotifications", 20);
        return packagingDao.getPackagesByUsernameToDisplay(username, maxNotifications);
    }

    @Override
    public List<CGSPackage> getOldHiddenPackages(int numOfDaysAgo) throws DsException {
        Date dateOfExpiredPackages = new DateTime().minusDays(numOfDaysAgo).toDate();
        try {
            return packagingDao.getOldHiddenPackages(dateOfExpiredPackages);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    public void removeOldHiddenPackagesAndTheirFiles() throws DsException {
        logger.debug("About to cleanup old hidden packages from DB and their zipped files from FS.");
        int counter = 0;
        List<CGSPackage> expiredPackages = getOldHiddenPackages(configuration.getIntProperty("numberOfDaysOfExpiredPackages"));
        for (CGSPackage expiredPackage : expiredPackages) {
            String zippedFileToDownloadLocation = expiredPackage.getZippedFileToDownloadLocation();
            try {
                if (zippedFileToDownloadLocation != null) {
                    File zippedFile = new File(zippedFileToDownloadLocation);
                    if (zippedFile.exists()) {
                        FileUtils.forceDelete(zippedFile);
                    }
                }

                removePackage(expiredPackage.getPackId());
                counter++;
            } catch (IOException e) {
                logger.warn(String.format("unusedPublishFilesCleanup. Failed to delete the zipped file %s", zippedFileToDownloadLocation));
            } catch (DsException e) {
                logger.error(String.format("unusedPublishFilesCleanup. Failed to delete package %s", expiredPackage.getPackId()));
            }
        }
        logger.debug(String.format("Finished to cleanup %d old hidden packages from DB and their zipped files from FS.", counter));
    }

    @Override
    public void removePackage(String packId) throws DsException {
        try {
            packagingDao.removePackage(packId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }
}