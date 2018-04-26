package org.t2k.cgs.scheduling;

import com.t2k.configurations.Configuration;
import org.apache.log4j.Logger;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.t2k.cgs.bundles.BundlesDataService;
import org.t2k.cgs.course.CourseCleanupService;
import org.t2k.cgs.dao.cleanups.CleanupsDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.dataServices.exceptions.ResourceNotFoundException;
import org.t2k.cgs.exportImport.ExportImportService;
import org.t2k.cgs.lock.LockService;
import org.t2k.cgs.locks.Lock;
import org.t2k.cgs.locks.Transaction;
import org.t2k.cgs.lock.TransactionService;
import org.t2k.cgs.model.cleanup.CleanupJob;
import org.t2k.cgs.model.cleanup.CleanupStatus;
import org.t2k.cgs.model.cleanup.CleanupType;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.packaging.PackagingService;
import org.t2k.cgs.tocItem.TocItemsManager;
import org.t2k.cgs.user.UserService;
import org.t2k.sample.dao.exceptions.DaoException;

import java.io.IOException;
import java.util.Date;
import java.util.List;

/**
 * Created by elad.avidan on 17/08/2014.
 */
@Service
public class CleanupScheduler {

    private Logger logger = Logger.getLogger(CleanupScheduler.class);

    private final int numberOfCleanups = 10;

    @Autowired
    private CourseCleanupService courseCleanupService;

    @Autowired
    private TocItemsManager tocItemsManager;

    @Autowired
    private CleanupsDao cleanupsDao;

    @Autowired
    private Configuration configuration;

    @Autowired
    private PackagingService packagingService;

    @Autowired
    private LockService lockService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserService userService;

    @Autowired
    private ExportImportService exportImportService;

    @Autowired
    private BundlesDataService bundlesDataService;

    private SimpleCgsUserDetails getCleanupsUser() throws DsException {
        return userService.getById(-3, false);
    }

    @Scheduled(cron = "0 0 22 1/1 * ?") // Method executed every day at 22:00
    public void exportedCoursesFilesCleanup() throws IOException {
        exportImportService.removeOldExportedCoursesFiles(2);
    }

    @Scheduled(cron = "0 0 21 1/1 * ?") // Method executed every day at 21:00
    public void oldBundlesVersionsCleanup() throws DsException {
        int daysToRemoveOldBundleVersionFolders = configuration.getIntProperty("daysToRemoveOldBundleVersionFolders", 1);
        bundlesDataService.deleteOldBundlesFolders(daysToRemoveOldBundleVersionFolders);
    }

    @Scheduled(cron = "0 0 23 1/1 * ?") // Method executed every day at 23:00
    public void unusedPublishFilesCleanup() throws DsException {
        packagingService.removeOldHiddenPackagesAndTheirFiles();
    }

    @Scheduled(cron = "0 0 0-23/2 * * ?") // Method executed at every 2 even hours
    public void cleanupTocItems() throws DsException, DaoException {
        int numberOfCleanupJobs = 0;
        Date hourFromNow = new DateTime().plusHours(1).toDate(); // We use this so the job will not run for over an hour
        logger.debug("About to cleanup required lessons/assessments.");
        List<CleanupJob> waitingCleanups = cleanupsDao.getWaitingCleanupJobs(numberOfCleanups, CleanupType.LESSON);
        while (!waitingCleanups.isEmpty() && new Date().before(hourFromNow)) {
            for (CleanupJob cleanupJob : waitingCleanups) {
                if (getTocItemLock(cleanupJob.getTocItemEntityId()) == null && getCourseTransaction(cleanupJob.getCourseId()) == null) {
                    try {
                        TocItemCGSObject tocItemCGSObject = tocItemsManager.get(cleanupJob.getPublisherId(),
                                cleanupJob.getTocItemId(), cleanupJob.getCourseId(), null, false);
                        updateCleanupJobStatusInProgress(cleanupJob); // We do this so we know if there were cleanups who failed during process.
                        tocItemsManager.tocItemCleanUp(cleanupJob.getCourseId(), tocItemCGSObject,
                                cleanupJob.getCleanupType().name().toLowerCase(), getCleanupsUser().toUserDetails());
                    } catch (ResourceNotFoundException e) {
                        logger.error("Toc item resource not found. It may no longer exist.", e);
                    }
                    logger.info("Removing cleanup job: " + cleanupJob);
                    cleanupsDao.removeCleanup(cleanupJob);
                    numberOfCleanupJobs++;
                } else { // Update the cleanup's last-modified so we won't have an infinite loop in case we have a locked toc item.
                    cleanupJob.setLastModified(new Date());
                    cleanupsDao.insertOrUpdateCleanup(cleanupJob);
                }
            }
            waitingCleanups = cleanupsDao.getWaitingCleanupJobs(numberOfCleanups, CleanupType.LESSON);
        }
        logger.debug(String.format("Cleanup finished. Total number of cleanups: %s.", numberOfCleanupJobs));
    }

    @Scheduled(cron = "0 0 1-23/2 * * ?") // Method executed at every 2 odd hours
    public void cleanupCourses() throws DaoException, DsException {
        int numberOfCleanupJobs = 0;
        Date hourFromNow = new DateTime().plusHours(1).toDate(); // We use this so the job will not run for over an hour
        logger.debug("About to cleanup required courses.");

        List<CleanupJob> waitingCleanups = cleanupsDao.getWaitingCleanupJobs(numberOfCleanups, CleanupType.COURSE);

        while (!waitingCleanups.isEmpty() && new Date().before(hourFromNow)) {
            for (CleanupJob cleanupJob : waitingCleanups) {
                if (getTocItemLock(cleanupJob.getCourseId()) == null && getCourseTransaction(cleanupJob.getCourseId()) == null) {

                    updateCleanupJobStatusInProgress(cleanupJob); // We do this so we know if there were cleanups who failed during process.
                    courseCleanupService.cleanupTocItemsOnCourse(cleanupJob.getPublisherId(), cleanupJob.getCourseId(), getCleanupsUser().toUserDetails());
                    cleanupsDao.removeCleanup(cleanupJob);
                    numberOfCleanupJobs++;

                    // We need to remove any cleanups that relate to the course's cleanup job (lessons or assessments) we've updated if exist
                    removeRelatedCleanups(cleanupJob);
                } else { // Update the cleanup's last-modified so we won't have an infinite loop in case we have a locked toc item.
                    cleanupJob.setLastModified(new Date());
                    cleanupsDao.insertOrUpdateCleanup(cleanupJob);
                }
            }
            waitingCleanups = cleanupsDao.getWaitingCleanupJobs(numberOfCleanups, CleanupType.COURSE);
        }
        logger.debug(String.format("Cleanup finished. Total number of cleanups: %s.", numberOfCleanupJobs));
    }

    private void updateCleanupJobStatusInProgress(CleanupJob cleanupJob) throws DaoException {
        CleanupStatus newStatus = CleanupStatus.InProgress;
        cleanupsDao.updateCleanupStatus(cleanupJob.getPublisherId(), cleanupJob.getCourseId(), cleanupJob.getTocItemId(), cleanupJob.getCleanupType(), newStatus);
    }

    private Lock getTocItemLock(String tocItemId) throws DsException {
        return lockService.getLock(tocItemId);
    }

    private Transaction getCourseTransaction(String courseId) throws DsException {
        List<Transaction> transactionsForCourse = transactionService.getTransactionForCourse(courseId);
        if (transactionsForCourse.isEmpty()) {
            return null;
        } else {
            return transactionsForCourse.get(0);
        }
    }

    private void removeRelatedCleanups(CleanupJob cleanupJob) throws DaoException {
        cleanupsDao.removeRelatedCleanups(cleanupJob.getPublisherId(), cleanupJob.getCourseId());
    }
}