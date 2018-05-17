package org.t2k.cgs.service.packaging;

import com.t2k.common.utils.PublishModeEnum;
import com.t2k.common.utils.VersionUtils;
import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.model.course.CoursesDao;
import org.t2k.cgs.domain.model.exceptions.*;
import org.t2k.cgs.domain.usecases.lock.LockService;
import org.t2k.cgs.domain.usecases.lock.TransactionService;
import org.t2k.cgs.domain.model.lock.LockUser;
import org.t2k.cgs.domain.model.ContentItemBase;
import org.t2k.cgs.domain.model.course.Course;
import org.t2k.cgs.domain.model.course.CourseCGSObject;
import org.t2k.cgs.domain.model.course.CourseTocItemRef;
import org.t2k.cgs.domain.usecases.packaging.*;
import org.t2k.cgs.domain.usecases.publisher.PublishError;
import org.t2k.cgs.domain.model.tocItem.TocItemIndicationForScorm;
import org.t2k.cgs.domain.model.user.SimpleCgsUserDetails;
import org.t2k.cgs.domain.usecases.publisher.PublisherService;
import org.t2k.cgs.domain.model.user.CGSUserDetails;
import org.t2k.cgs.domain.usecases.tocitem.TocItemsManager;
import org.t2k.cgs.domain.usecases.user.UserService;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 25/11/12
 * Time: 13:23
 */
@Service
public class PackageManagerImpl implements PackageManager {

    private static Logger logger = Logger.getLogger(PackageManagerImpl.class);

    private static Logger publishLog = Logger.getLogger("publishing");

    @Autowired
    private PackagingService packagingService;

    @Autowired
    private CoursesDao coursesDao;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private Configuration configuration;

    @Autowired
    private PackageStepsUpdater packageStepsUpdater;

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private LockService lockService;

    @Autowired
    private CourseDataService courseDataService;

    @Autowired
    private TocItemsManager tocItemsManager;

    @Autowired
    private UserService userService;

    @Autowired
    private PublishLogUtil publishLogUtil;

    @Autowired
    private PublisherService publisherService;

    private Map<String, Future<String>> packagesMap = new Hashtable<>();
    private BlockingQueue<Runnable> pendingPackages;
    private RejectedExecutionHandler executionHandler = new PackRejectedExecutionHandlerImpl();
    private ThreadPoolExecutor packagesExecutor;

    private File outPathDir = null;
    private boolean isAsyncMode = true;
    private LockUser systemLockUser = createSystem();

    public PackageManagerImpl() {
    }

    /**
     * An initiation method to setup the manager resources.
     */
    @PostConstruct
    public void init() {
        /** Cleanups section **/
        logger.info("Init packageManager..");
        if (packagesExecutor != null) {
            packagesExecutor.shutdown();
        }

        try {
            transactionService.stopAllTransactions();
        } catch (DsException e) {
            String msg = "init: Failed to stop all transactions.";
            logger.error(msg, e);
            throw new InitServiceException(msg);
        }

        try {
            handlePackagesThatAreInProgressOrPending();
        } catch (Exception e) {
            String msg = "init: Failed to change package statuses that were in progress before server was shut down.";
            logger.error(msg, e);
            throw new InitServiceException(msg);
        }

        /** Initialization section **/
        int maxPending = getMaxPendingTasks();
        int maxRunning = getMaxConcurrentTasks();
        logger.info(String.format("init: initialize taskExecutor with max pending: %d, max concurrent: %d", maxPending, maxRunning));
        pendingPackages = new ArrayBlockingQueue<>(maxPending, true);
        packagesExecutor = new ThreadPoolExecutor(maxRunning, maxRunning, 10, TimeUnit.SECONDS, pendingPackages, executionHandler);
        String outDir = configuration.getProperty("packagedOutputLocation");
        outPathDir = new File(String.format("%s/packages/output", outDir));
        if (!outPathDir.exists()) {
            logger.info(String.format("creating directory: %s", outPathDir));
            outPathDir.mkdirs();
        }
    }

    /**
     * changes the status of packages from IN_PROGRESS & PENDING to FAILED
     * remove all temp folders linked to these packages
     */
    private void handlePackagesThatAreInProgressOrPending() throws DsException {

        // handle pending packages
        List<String> pendingPackagesIds = new ArrayList<>();
        List<String> inProgressPackagesIds = new ArrayList<>();

        List<CGSPackage> pendingPackagesToModify = packagingService.getPackagesByPhases(Arrays.asList(PackagePhase.PENDING, PackagePhase.IN_PROGRESS));
        for (CGSPackage cgsPackage : pendingPackagesToModify) {
            PackagePhase currentPhase = cgsPackage.getPackagePhase();
            cgsPackage.setPackagePhase(PackagePhase.FAILED);
            cgsPackage.addError(new PublishError("Failed due to server shutdown during the publishing process."));
            cgsPackage.setPackEndDate(new Date());
            packagingService.saveCGSPackage(cgsPackage);

            if (currentPhase == PackagePhase.IN_PROGRESS) {   // perform cleanups for in progress packages
                inProgressPackagesIds.add(cgsPackage.getPackId());
                if (cgsPackage.getPackId() != null) {
                    logger.debug(">>> on initializing - cleanup for tasks");
                    onTaskFinished(cgsPackage.getPackId());
                }
            } else { // no need to perform cleanups for pending packages
                pendingPackagesIds.add(cgsPackage.getPackId());
            }

        }
        logger.info(String.format("Changed statuses for %d packages from PENDING to FAILED.\nPackage ids modified: %s", pendingPackagesIds.size(), Arrays.toString(pendingPackagesIds.toArray())));
        logger.info(String.format("Changed statuses and performed cleanup for %d packages from IN_PROGRESS to FAILED.\nPackage ids modified: %s", inProgressPackagesIds.size(), Arrays.toString(inProgressPackagesIds.toArray())));
    }

    /**
     * Creates a cgsPackage object from user's input,
     * and add the package creation to the pending queue to be run async
     *
     * @param publisherId         - publisher ID
     * @param coursePackageParams - parameters received from user
     * @param cgsUserDetails      - user details
     * @return CGSPackage with no errors - if a package was successfully created in DB.
     * @throws Exception
     */
    @Override
    public CGSPackage createPackageAndAddToPendingQueue(int publisherId, CoursePackageParams coursePackageParams, CGSUserDetails cgsUserDetails) throws Exception {
        logger.info(String.format("createPackageAndAddToPendingQueue: courseId: %s", coursePackageParams.getCourseId()));

        validateParams(coursePackageParams);
        try {
            // set a transaction for this course, will be released upon failure or after DB copies
            acquireTransactionForAllCourseItemsAndLockCourse(coursePackageParams.getCourseId(), cgsUserDetails);
        } catch (Exception e) {
            logger.error(String.format("Could not acquire transaction for courseId: %s by user %s.", coursePackageParams.getCourseId(), cgsUserDetails.getUsername()), e);
            throw e;
        }

        coursePackageParams.setPublisherId(publisherId);
        CGSPackage cgsPackage = null;
        try {
            // creates the cgsPackage object - with all the data from the user
            Course course = courseDataService.getCourse(publisherId, coursePackageParams.getCourseId());
            cgsPackage = createCGSPackage(course, coursePackageParams, new SimpleCgsUserDetails(cgsUserDetails));
            packagingService.saveCGSPackage(cgsPackage); // save package to DB

            // add sample to course
            course.getContentData().setSample(coursePackageParams.getSample());
            courseDataService.save(course);

            if (cgsPackage.getPackagePhase() == PackagePhase.FAILED) {
                throw new PackagingException(ErrorCodes.CONTENT_IS_NOT_VALID, cgsPackage.getErrors().toString(),
                        "Package content is not valid: " + cgsPackage.toString(), HttpStatus.CONFLICT);
            }

            if (cgsPackage.getErrors().isEmpty()) {
                // run as async execution
                addPackageToPending(cgsPackage); // adding to pending packaging queue
            } else {
                String message = String.format("packageCourse : errors while creating package. : %s", Arrays.toString(cgsPackage.getErrors().toArray()));
                logger.error(message);
                packageStepsUpdater.changePackagePhaseToFailed(cgsPackage, message);
                onTaskFinished(cgsPackage.getPackId());
                throw new DsException(message);
            }

            return cgsPackage;
        } catch (Exception e) {
            if (cgsPackage != null) {
                packageStepsUpdater.changePackagePhaseToFailed(cgsPackage, e.getMessage());
                onTaskFinished(cgsPackage.getPackId());
            }
            throw e;
        }
    }

    private void validateParams(CoursePackageParams params) {
        if (params.getCourseId() == null || params.getCourseId().isEmpty()) {
            throw new IllegalArgumentException("No course id was received. Can't complete publish process.");
        }
        if (params.getDescription() == null || params.getDescription().isEmpty()) {
            throw new IllegalArgumentException("No description was received. Can't complete publish process.");
        }
        if (params.getReleaseNote() == null || params.getReleaseNote().isEmpty()) {
            throw new IllegalArgumentException("No release note was received. Can't complete publish process.");
        }
        if (PublishModeEnum.forName(params.getPublishMode()) == null) {
            throw new IllegalArgumentException("No publish mode was received. Can't complete publish process.");
        }
        if (params.getTarget() == null) {
            throw new IllegalArgumentException("No publishing target was received. Can't complete publish process.");
        }
    }

    /**
     * do necessary checks and acquire transaction
     *
     * @param courseId       - course id
     * @param cgsUserDetails - user details
     * @throws DsException
     */
    private void acquireTransactionForAllCourseItemsAndLockCourse(String courseId, CGSUserDetails cgsUserDetails) throws DsException {
        if (isCourseInPackagingProcess(courseId)) {
            logger.warn(String.format("Course %s is already in packaging process, aborting... ", courseId));
            throw new PackagingException(ErrorCodes.COURSE_ALREADY_IN_PACKAGING, courseId, String.format("the course %s is already in packaging process.", courseId));
        }

        if (isCourseLocked(courseId)) {
            logger.warn(String.format("Course %s is locked. Cannot start publishing.", courseId));
            throw new PackagingException(ErrorCodes.CONTENT_IS_LOCKED, courseId, String.format("the course %s is already in packaging process.", courseId));
        }

        boolean isTransactionSucceeded = transactionService.checkNStartTransaction(courseId, cgsUserDetails.getUsername(), new Date()); // taking a transaction with the user asking for a publish
        if (!isTransactionSucceeded) {
            logger.error(String.format("Error acquiring transaction for course %s", courseId));
            throw new TransactionException(ErrorCodes.CONTENT_IS_TRANSACTION_LOCKED, "");
        }

        try {
            ContentItemBase contentItemBase = courseDataService.getContentItemBase(courseId);
            lockService.acquireLock(contentItemBase, systemLockUser);
        } catch (Exception e) {
            logger.error(String.format("Could not lock course %s for publishing. Releasing transaction and lock", courseId));
            transactionService.stopTransaction(courseId, cgsUserDetails.getUsername());
        }
    }

    private boolean isCourseLocked(String courseId) {
        return lockService.isCourseLocked(courseId);
    }

    public boolean isCourseInPackagingProcess(String courseId) {
        List<CGSPackage> packagesByPhase = packagingService.getPackagesByPhases(courseId, Arrays.asList(PackagePhase.PENDING, PackagePhase.IN_PROGRESS));
        return packagesByPhase != null && !packagesByPhase.isEmpty();
    }

    /**
     * Adds the package to the execution pool as a Future task.
     *
     * @param cgsPackage - package object
     * @throws DsException
     */
    private void addPackageToPending(CGSPackage cgsPackage) throws DsException {
        logger.info("addPackageToPending: packageId: " + cgsPackage.getPackId());
        Assert.notNull(cgsPackage);

        //////// versions and file name ///////
        if (cgsPackage.getPublishTarget() == PublishTarget.COURSE_TO_CATALOG || cgsPackage.getPublishTarget() == PublishTarget.COURSE_TO_FILE) { // if this is SCORM publish, then we skip the "update version" part
            if (cgsPackage.getPublishModeEnum() == PublishModeEnum.PRODUCTION) {
                cgsPackage.setVersion(cgsPackage.getNewVersion_prod());
            } else {
                cgsPackage.setVersion(cgsPackage.getNewVersion_preProd());
            }
        }

        String fileName = cgsPackage.getPackId();
        fileName = fileName.replaceAll("\\.", "-");
        cgsPackage.setPackageOutputLocation(String.format("%s/%s.cgs", outPathDir, fileName));

        packageStepsUpdater.changePackagePhaseToPending(cgsPackage);
        if (!isAsyncMode) // for testing - run in same thread
            return;

        PackageHandler packageHandler = (PackageHandler) applicationContext.getBean("packageHandler");
        packageHandler.init(cgsPackage);
        PackageTask packageTask = new PackageTask(packageHandler, "");

        packagesExecutor.submit(packageTask);
        packagesMap.put(cgsPackage.getPackId(), packageTask);
        notifyPendingWorkQueue();
    }

    /**
     * Create a CGSPackage from the course details request user.
     *
     * @param coursePackageParams - parameters from user
     * @param cgsUserDetails      - user details
     * @return a cgs package
     * @throws PackagingException
     */
    private CGSPackage createCGSPackage(Course course, CoursePackageParams coursePackageParams, SimpleCgsUserDetails cgsUserDetails) throws DsException {

        String courseId = coursePackageParams.getCourseId();
        int publisherId = coursePackageParams.getPublisherId();
        CGSPackage cgsPackage = null;
        try {
            if (course == null) {
                throw new ResourceNotFoundException(courseId, String.format("can not find course %s for packaging.", courseId));
            }
            String cgsCourseVersion = course.getContentVersionNumber(); // course version from data base
            publishLog.debug(String.format("VERSION Before Upload: %s", cgsCourseVersion));
            if (coursePackageParams.getVersion() != null) {
                String versionsMessage = String.format("VERSION received from client is: %s, version existing in DB is: %s", coursePackageParams.getVersion(), cgsCourseVersion);
                if (coursePackageParams.getVersion().equals(cgsCourseVersion)) {
                    publishLog.error(String.format("!!!! Error!!! versions doesn't match! %s course Id %s", versionsMessage, courseId));
                } else {
                    publishLog.debug(String.format("Versions match: %s for course id: %s", versionsMessage, courseId));
                }
            } else {
                publishLog.debug("Version received from client is null for course " + courseId);
            }
            logger.info(String.format("createCGSPackage setting new version : %s", cgsCourseVersion));
            String publisherName = publisherService.getPublisherName(publisherId);
            cgsPackage = new CGSPackage(courseId, course.getContentId(), publisherId, cgsUserDetails.getUsername(),
                    publisherName, cgsCourseVersion, course.getTitle(), course.getContentData().getContentLocales());
            String prodVer = VersionUtils.updateVersion(cgsCourseVersion, PublishModeEnum.PRODUCTION);
            String preProdVer = VersionUtils.updateVersion(cgsCourseVersion, PublishModeEnum.PRE_PRODUCTION);

            List<TocItemIndicationForScorm> tocItemsWithHiddenIndication = new ArrayList<>();
            if (coursePackageParams.getSelectedList() != null && !coursePackageParams.getSelectedList().isEmpty()) {
                tocItemsWithHiddenIndication = tocItemsManager.getTocItemsWithHiddenIndication(courseId, coursePackageParams.getSelectedList());
            }

            List<String> excludedTocIds = new ArrayList<>();
            if (!coursePackageParams.getSelectedList().isEmpty()) {
                excludedTocIds = course.getContentData().getToc().getAllTocItemRefs().stream()
                        .map(CourseTocItemRef::getCid).collect(Collectors.toList());
                excludedTocIds.removeAll(coursePackageParams.getSelectedList());
            }

            cgsPackage.setPublishModeEnum(PublishModeEnum.forName(coursePackageParams.getPublishMode()));
            cgsPackage.setDescription(coursePackageParams.getDescription());
            cgsPackage.setReleaseNote(coursePackageParams.getReleaseNote());
            cgsPackage.setIncludeAncestorsStandards(coursePackageParams.getIncludeAncestorsStandards());
            cgsPackage.setNewVersion_prod(prodVer); //base on DB version
            cgsPackage.setNewVersion_preProd(preProdVer); //base on DB version
            cgsPackage.setCourseTitle(course.getTitle());
            cgsPackage.setScormExcludeTocItemsIds(excludedTocIds);
            cgsPackage.setScormSelectedTocItems(tocItemsWithHiddenIndication);
            cgsPackage.setPublishTarget(coursePackageParams.getTarget());
            cgsPackage.setEBooksLocation(String.format("%s/publishers/%d/ebooks", configuration.getProperty("cmsHome"), cgsPackage.getPublisherId()));

            if (coursePackageParams.getTarget() == PublishTarget.COURSE_TO_CATALOG || coursePackageParams.getTarget() == PublishTarget.LESSON_TO_CATALOG) {
                if (userService.isUserRelatedToBlossom(cgsUserDetails)) {
                    cgsPackage.setCatalogName(CatalogName.BLOSSOM);
                } else {
                    cgsPackage.setCatalogName(CatalogName.GCR);
                }
            }

            if (!cgsPackage.getErrors().isEmpty()) { // TODO: check if it is possible to have errors in this stage. maybe it is unnecessary
                packageStepsUpdater.changePackagePhaseToFailed(cgsPackage, null);
            }

            return cgsPackage;
        } catch (DsException e) {
            if (cgsPackage != null) {
                packageStepsUpdater.changePackagePhaseToFailed(cgsPackage, e.getMessage());
                if (cgsPackage.getCourseId() != null && cgsPackage.getPackId() != null) {
                    logger.error(String.format("Error creating package object on DB for packageId: %s, courseId: %s", cgsPackage.getPackId(), cgsPackage.getCourseId()), e);
                } else if (cgsPackage.getCourseId() != null) {
                    logger.error(String.format("Error creating package object on DB for courseId: %s", cgsPackage.getCourseId()), e);
                }
            }
            throw new DsException(e);
        }
    }

    @Override
    public void stopPackage(String packageId) {
        logger.info("stopPackage: id: " + packageId);
        Future<String> future = packagesMap.get(packageId);

        //handle the threads..
        if (future != null) { // if future == null, then there is no task to cancel. perhaps it is already finished

            boolean canceled = future.cancel(false);  // cancel a working item or a pending item
            if (canceled) {
                notifyPendingWorkQueue(); // if the thread is cancelled - notify the pending queue to start a new publish
            } else {
                try {
                    //if cancel failed for some reason..wait and try to force interrupt
                    future.get(180, TimeUnit.SECONDS);
                } catch (InterruptedException | ExecutionException e) {
                    logger.warn(e);
                } catch (TimeoutException e) {
                    logger.warn("stopPackage: timeout." + packageId + " . [Trying to cancel with 'mayInterruptIfRunning' !!]");
                    future.cancel(true);
                } catch (Exception e) {
                    logger.warn("stopPackage failed for packageId: " + packageId, e);
                } finally {
                    //if the task is still in the map. it means that it wasn't
                    //cleared by the 'onTaskFinished' callback.
                    //--need to release
                    if (packagesMap.containsKey(packageId)) {
                        logger.warn("stopPackage. the task exists even after a cancel operation. calling explicitly to complete " +
                                "task . packageId: " + packageId);
                        onTaskFinished(packageId);
                    }
                }
            }
        } else {
            logger.error(String.format("Cannot cancel publish with packageId: %s. The package is not in progress.", packageId));
        }
    }

    private int getMaxConcurrentTasks() {
        return Integer.parseInt(configuration.getProperty("maxConcurrentPackages", "3"));
    }

    private int getMaxPendingTasks() {
        return Integer.parseInt(configuration.getProperty("maxPendingPackages", "10000"));
    }

    public void onTaskFinished(String packageId) {
        CGSPackage cgsPackage = null;
        try {
            cgsPackage = packagingService.getPackage(packageId);
            logger.debug("onTaskFinished >>>>>>>>>>>>>>>>>>>> " + packageId + " >>>>> " + cgsPackage);

            logger.info("-----------------------------------------");
            logger.info(String.format("onTaskFinished: the following packaging for course %s, is finished with status: %s.\nThis is the complete package data: %s", cgsPackage.getCourseId(), cgsPackage.getPackagePhase(), cgsPackage.toString()));

            if (packagesMap.containsKey(packageId))
                packagesMap.remove(packageId);
            cgsPackage.setPackEndDate(new Date());
            packagingService.saveCGSPackage(cgsPackage);
            if (cgsPackage.getPackagePhase() == PackagePhase.COMPLETED) {
                setCourseDetails(cgsPackage);
            }
        } catch (ResourceNotFoundException e) {
            logger.error(String.format("Error getting cgsPackage for id: %s", packageId));
        } catch (Exception e) {
            logger.error(String.format("An error occurred during the after packaging final stage for packageId: %s, courseId: %s", packageId, cgsPackage.getCourseId()), e);
        } finally {
            try {
                releaseLock(cgsPackage);
                packageStepsUpdater.releaseTransaction(cgsPackage);
                cleanBackups(cgsPackage);
            } catch (DsException e) {
                logger.error(String.format("Failed to finalize 'onTaskFinished' method. -- might leave transactions (bad) " +
                        "or uncleaned FS(can be ignored), for packageId: %s, courseId: %s", packageId, cgsPackage.getCourseId()), e);
            }
        }
        logger.info("-------------------------------------------------------------------------------------------------------");
    }

    /**
     * Release the lock for the package's course.
     *
     * @param cgsPackage - package object
     * @throws DsException
     */
    public void releaseLock(CGSPackage cgsPackage) throws DsException {
        logger.debug(String.format("releaseLock. For package id: %s", cgsPackage.getPackId()));
        try {
            ContentItemBase contentItemBase = courseDataService.getContentItemBase(cgsPackage.getCourseId());
            if (contentItemBase != null && lockService.isContentItemLocked(contentItemBase)) {
                lockService.releaseLock(contentItemBase, systemLockUser);
            }
        } catch (DsException e) {
            logger.error(String.format("releaseLock. Error occurred while trying to release system lock. Package id: %s, Course id: %s", cgsPackage.getPackId(), cgsPackage.getCourseId()));
            throw e;
        }
    }

    private void cleanBackups(CGSPackage cgsPackage) {
        Assert.notNull(cgsPackage);
        logger.info("cleanBackups: for package: " + cgsPackage.getPackId());
        String basePath = null;
        try {
            PackagingLocalContext localResourcesLocation = cgsPackage.getLocalResourcesLocation();
            if (localResourcesLocation != null) {
                basePath = localResourcesLocation.getBasePath();
                logger.info("Deleting package's local resources folder: " + basePath);
                File basePathFile = new File(basePath);
                if (basePathFile.exists())
                    FileUtils.deleteDirectory(basePathFile);
            }
            basePath = cgsPackage.getPackageOutputLocation();
            if (basePath != null) {
                File cgsFile = new File(basePath);
                if (cgsFile.exists()) {
                    logger.info("Deleting package's temp cgs file: " + basePath);

//                    String cmsLocation = configuration.getProperty("cmsHome");
//                    File debugBackupDir = new File(cmsLocation, "publishers/"+cgsPackage.getPublisherId()+"/courses/"+cgsPackage.getCourseId());
//                    FileUtils.copyFileToDirectory(cgsFile, debugBackupDir);

                    FileUtils.forceDelete(cgsFile);
                }
            }
        } catch (IOException e) {
            logger.error(String.format("cleanBackups: Failed for basePath: %s, for packageId: %s, courseId: %s", basePath, cgsPackage.getPackId(), cgsPackage.getCourseId()), e);
        }
    }

    // According to package details , set the published course details.
    // A change in course's object on DB is performed only if there is a change in course version or if it was published to production
    private void setCourseDetails(CGSPackage cgsPackage) throws Exception {
        Assert.notNull(cgsPackage);

        StringBuilder sb = new StringBuilder();
        sb.append("INPUT: CGS PACKAGE VERSION: ").append(cgsPackage.getVersion()).append(PublishLogUtil.NEW_LINE);


        logger.info(String.format("setCourseDetails: for package: %s, courseId: %s", cgsPackage.getPackId(), cgsPackage.getCourseId()));
        try {
            boolean isCourseModified = false;
            Date current = new Date();
            CourseCGSObject course = coursesDao.getCourse(cgsPackage.getCourseId(), false);
            String oldVersion = course.getCgsCourseVersion();
            String newVersion = cgsPackage.getVersion();
            logger.info(String.format("setCourseDetails:  to version : \"%s\"", newVersion));

            sb.append(String.format("SET Version FROM: %s,  TO: %s", oldVersion, newVersion)).append(publishLogUtil.NEW_LINE);

            Assert.notNull(oldVersion);
            Assert.notNull(newVersion);

//            PublishVersion oldPublishVersion = new PublishVersion(oldVersion);
//            PublishVersion newPublishVersion = new PublishVersion(newVersion);

            // If Exactly Identical, then Error!
            if (oldVersion.equals(newVersion)) {
                String msg = String.format("Problem with Package Versions: Cannot have the same version in the target.  Old:%s,  New:%s", oldVersion, newVersion);
                publishLog.error(msg);
                throw new IllegalArgumentException(msg);
            }

            publishLog.debug(String.format("SAVING Course.  OldVersion: %s,  New Version: %s", oldVersion, newVersion));

            //if course is published to production sign the header with date.
            if (cgsPackage.getPublishModeEnum().equals(PublishModeEnum.PRODUCTION)) {
                course.setPublishedToProd(current);
                List<String> tocIdsToProduction = ContentParseUtil.getTocIdsFromCourseJson(course.serializeContentData(), true);
                course.setTocIdsPublishedToProd(tocIdsToProduction);
                course.removeHeaderEntry(CourseCGSObject.CGS_HEADER_EDITIONED_KEY); //removing the "editioned" entry from course's header,
                // to enable a new edition creation.
                isCourseModified = true;
            }

            if (!oldVersion.equals(newVersion)) {
                //set new version
                course.setCgsCourseVersion(newVersion);
                isCourseModified = true;
            }


            if (isCourseModified) { //save the modified object to DB only if it was changed
                //set header last modified
                course.setLastModified(current);
                logger.debug(String.format("setCourseDetails. saving revised course: %s, version: %s", course.getEntityId(), course.getCgsCourseVersion()));
                courseDataService.saveCourseCGSObject(course);
            }

            publishLog.debug(sb.toString());
        } catch (Exception e) {
            publishLog.error(String.format("ERROR SAVING THE COURSE! \nVersion: %s, \nNew Production Version: %s,  \nPackId: %s, \nError Message: %s", cgsPackage.getVersion(), cgsPackage.getNewVersion_prod(), cgsPackage.getPackId(), e.toString()));
            logger.error(String.format("setCourseDetails: Error while saving course details after packaging. id: %s", cgsPackage.getPackId()));
        }
    }


    private LockUser createSystem() {
        return new LockUser("System.t2k.publish", "System.t2k.publish", "System.t2k.publish", "system@publishing.user", -1);
    }

    public void setTransactionService(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    public void setAsyncMode(boolean asyncMode) {
        isAsyncMode = asyncMode;
    }

    /**
     * Override the RejectedExecutionHandler to handle rejections.
     */
    public class PackRejectedExecutionHandlerImpl implements RejectedExecutionHandler {

        @Override
        public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
            String message = String.format("rejectedExecution: active: %s, waiting: %s", executor.getActiveCount(), executor.getQueue().size());
            logger.warn(String.format("Rejected execution: %s", message));
            throw new RejectedExecutionException(message);
        }
    }

    public void notifyPendingWorkQueue() {
        try {
            Iterator<Runnable> iterator = pendingPackages.iterator();
            short place = 0;
            while (iterator.hasNext()) {
                place++;
                FutureTask ft = ((FutureTask) iterator.next());
                Set<String> packIds = packagesMap.keySet();
                for (String packId : packIds) {
                    Future<String> future = packagesMap.get(packId);
                    if (ft == future) {
                        packagingService.updatePackagePendingPlace(packId, place);
                        break;
                    }
                }
            }
        } catch (Throwable e) {
            logger.error("notifyPendingWorkQueue: Error while setting task queue index. Ignoring this action " +
                    "will not affect the process.", e);
        }
    }

    @Override
    public void hidePackage(String packageId) throws DsException {
        logger.debug(String.format("hidePackage. About to hide package id: %s, by marking its status as reported.", packageId));
        CGSPackage cgsPackage = packagingService.getPackage(packageId);
        if (!cgsPackage.getIsShow()) {
            return;
        }

        cgsPackage.setIsShow(false);
        packagingService.saveCGSPackage(cgsPackage);
    }

    @PreDestroy
    private void shutDown() {
        logger.info("shutDown()..");
        logger.info("removing all transactions of system...");
        try {
            transactionService.stopAllTransactions();
        } catch (DsException e) {
            logger.error("Error while trying to remove all transactions when shutting down tha package queue manager.", e);
        }
    }
}
