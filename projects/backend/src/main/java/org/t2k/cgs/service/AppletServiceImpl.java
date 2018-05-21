package org.t2k.cgs.service;

import com.mongodb.BasicDBList;
import com.t2k.common.utils.FileUtils;
import com.t2k.common.utils.ZipUtils;
import com.t2k.configurations.Configuration;
import org.apache.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.AppletContentUpdater;
import org.t2k.cgs.domain.usecases.AppletService;
import org.t2k.cgs.domain.usecases.CmsService;
import org.t2k.cgs.domain.model.applet.AppletDao;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.ErrorCodes;
import org.t2k.cgs.domain.model.exceptions.ResourceNotFoundException;
import org.t2k.cgs.domain.model.exceptions.TransactionException;
import org.t2k.cgs.domain.usecases.lock.LockService;
import org.t2k.cgs.domain.usecases.lock.TransactionService;
import org.t2k.cgs.domain.model.lock.LockUser;
import org.t2k.cgs.domain.model.lock.Transaction;
import org.t2k.cgs.domain.model.applet.AppletData;
import org.t2k.cgs.domain.model.applet.AppletJobPhases;
import org.t2k.cgs.domain.model.applet.AppletManifest;
import org.t2k.cgs.domain.model.applet.AppletResources;
import org.t2k.cgs.domain.model.applet.AppletsUser;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.cgs.domain.model.tocItem.Format;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.usecases.packaging.ContentParseUtil;
import org.t2k.cgs.domain.usecases.publisher.PublisherService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemDataService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemsManager;
import org.t2k.cms.model.CmsLocations;
import org.t2k.gcr.common.client.GCRClient;
import org.t2k.gcr.common.client.exception.GCRClientException;
import org.t2k.gcr.common.model.applet.GCRAppletArtifact;
import org.t2k.gcr.common.model.applet.Permission;
import org.t2k.gcr.common.model.applet.Type;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.zip.ZipInputStream;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 31/01/13
 * Time: 12:30
 */
@Service
public class AppletServiceImpl implements AppletService {

    private static Logger logger = Logger.getLogger(AppletService.class);

    private static final String MANIFEST = "manifest.json";

    private static ObjectMapper mapper = new ObjectMapper();

    @Autowired
    private GCRClient gcrClient;

    @Autowired
    private AppletDao appletDao;

    @Autowired
    private LockService lockService;

    @Autowired
    private CmsService cmsService;

    @Autowired
    private TocItemsManager tocItemsManager;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private JobService jobService;

    @Autowired
    @Qualifier("lessonsDataServiceBean")
    private TocItemDataService tocItemDataService;

    @Autowired
    private PublisherService publisherService;

    @Autowired
    private Configuration configuration;

    @Override
    public List<GCRAppletArtifact> getAppletsAllowedForPublisher(int publisherId, Format tocFormat, Type appletType) throws DsException {
        try {
            List<GCRAppletArtifact> result = new ArrayList<>();
            String publisherName = publisherService.getPublisherName(publisherId);
            if (publisherName == null) {
                throw new ResourceNotFoundException(publisherId + "", String.format("Publisher with id %d was not found", publisherId));
            }

            List<GCRAppletArtifact> gcrApplets = gcrClient.getAppletList(null);
            //this white list array is only relevant to ebook course, in case of native course, we don't need this filter
            List<String> ebookWhiteListApplets = null;
            if (tocFormat != null && tocFormat == Format.EBOOK) {
                ebookWhiteListApplets = Arrays.asList(configuration.getProperty("eBookCourseAppletsWhiteList").split(";"));
            }
            //allowed applets are those which belong to publisher or allowed for public usage
            for (GCRAppletArtifact appletArtifact : gcrApplets) {
                if (appletType != null && appletArtifact.getType() != appletType) {
                    continue;
                }

                boolean hasPermission = Permission.PUBLIC.equals(appletArtifact.getPermission())
                        || Permission.ACCOUNT.equals(appletArtifact.getPermission())
                        && publisherName.equals(appletArtifact.getPublisher());

                //additional filter for ebook course , that allows only applets mentioned in the configuration
                boolean isInWhiteList = true;
                if (tocFormat != null && tocFormat == Format.EBOOK) {
                    isInWhiteList = ebookWhiteListApplets.contains(appletArtifact.getGuid());
                }

                if (hasPermission && isInWhiteList) {
                    result.add(appletArtifact);
                }
            }

            return result;
        } catch (GCRClientException e) {
            logger.error(e);
            throw new DsException(e);
        }
    }

    @Override
    public List<GCRAppletArtifact> getAppletsAllowedForPublisher(int publisherId) {
        try {
            List<GCRAppletArtifact> gcrApplets = gcrClient.getAppletList(null);
            String publisherName = null;
            List<GCRAppletArtifact> result = new ArrayList<>(gcrApplets.size());
            for (GCRAppletArtifact gcrAppletArtifact : gcrApplets) {
                switch (gcrAppletArtifact.getPermission()) {
                    case ACCOUNT:
                        publisherName = (publisherName != null)
                                ? publisherName
                                : publisherService.getPublisherName(publisherId);
                        if (gcrAppletArtifact.getPublisher().equals(publisherName)) {
                            result.add(gcrAppletArtifact);
                        }
                        break;
                    case PUBLIC:
                        result.add(gcrAppletArtifact);
                        break;
                }
            }
            return result;
        } catch (GCRClientException e) {
            logger.error("Error retrieving applets from GCR", e);
            return new ArrayList<>(0);
        }
    }

    @Override
    public AppletManifest getAppletManifest(String courseId, Date modifiedSince) {
        return appletDao.getAppletsManifestsByCourseId(courseId, modifiedSince);
    }

    @Override
    public void createAppletManifest(String courseId, String courseVersion) {
        AppletManifest appletManifest = new AppletManifest();
        appletManifest.setCourseId(courseId);
        appletManifest.setApplets(new ArrayList<>());
        appletDao.saveAppletManifest(appletManifest);
    }

    @Override
    synchronized public void addApplet(int publisherId, String courseId, String appletId, LockUser cgsUserDetails) throws Exception {
        checkForCourseTransactionAndThrowExceptionIfExists(courseId, appletId);
        AppletManifest appletManifest = appletDao.getAppletsManifestsByCourseId(courseId, null);
        if (appletManifest == null) {
            throw new DsException(String.format("Applet manifest for course %s does not exist", courseId));
        }
        if (appletManifest.hasApplet(appletId)) {
            throw new DsException(String.format("Course %s already has an applet %s", courseId, appletId));
        }

        addAppletFromGCR(publisherId, courseId, appletId, appletManifest);
        appletDao.saveAppletManifest(appletManifest);
    }

    @Override
    synchronized public void updateApplets(int publisherId, String courseId, List<String> appletIdsToUpdate, LockUser cgsUserDetails, String jobId) throws Exception {
        logger.debug(String.format("User %s, of publisher %d is starting to update applets for course %s", cgsUserDetails.getUserName(), cgsUserDetails.getPublisherId(), courseId));
        checkForCourseTransactionAndThrowExceptionIfExists(courseId, appletIdsToUpdate.get(0));

        LockUser appletsUpdatingLocker = new LockUser(AppletsUser.USERNAME, AppletsUser.F_NAME, AppletsUser.L_NAME, AppletsUser.EMAIL, AppletsUser.PUBLISHER_ID);
        try {
            //handle the job request if there is
            if (jobId != null) {
                Job job = new Job(jobId);
                job.setRefEntityId("Non");
                jobService.saveJob(job);
                jobService.updateJobProgress(jobId, AppletJobPhases.UPDATING_APPLETS_SAVED_DATA, 0, Job.Status.STARTED);
            }
            lockService.checkAndAcquireLocksOnCourse(publisherId, courseId, appletsUpdatingLocker);

            //------------------------
            // update applet
            //------------------------
            AppletManifest appletsUsedByCourse = this.getAppletManifest(courseId, null);
            if (appletsUsedByCourse == null) {
                throw new DsException(String.format("Applet manifest for course %s does not exist", courseId));
            }
            int numberOfApplets = appletIdsToUpdate.size();
            int currentApplet = 0;
            for (String appletId : appletIdsToUpdate) {

                if (!appletsUsedByCourse.hasApplet(appletId)) {   // TODO: don't throw an exception, simply don't do anything for this applet
                    throw new DsException(String.format("Course %s does not have an applet %s", courseId, appletId));
                }
                appletsUsedByCourse.removeApplet(appletId);
                // stage appletManifests indicates the download progress of the applets from GCR
                addAppletFromGCR(publisherId, courseId, appletId, appletsUsedByCourse);
                jobService.updateJobProgress(jobId, AppletJobPhases.DOWNLOADING_APPLET_MANIFESTS, calcProgress(numberOfApplets, ++currentApplet), Job.Status.IN_PROGRESS);
            }
            //------------------------
            // update applet resources in lessons
            //------------------------
            List<TocItemCGSObject> tocItems = tocItemsManager.getByCourse(publisherId, courseId, false);

            if (tocItems != null) {
                int numberOfTocItemsInCourse = tocItems.size();
                int currentTocItem = 0;
                for (TocItemCGSObject tocItem : tocItems) {
                    List<String> appletsUsedByTocItem = tocItemDataService.getAppletIdsUsedInTocItem(tocItem);
                    List<String> appletsThatNeedsUpdatingAnAreUsedByTocItem = new ArrayList<>();
                    for (String appletId : appletIdsToUpdate) {
                        if (appletsUsedByTocItem.contains(appletId)) {
                            appletsThatNeedsUpdatingAnAreUsedByTocItem.add(appletId); // create a list of applets that need to be updated for this lesson
                        }
                    }

                    if (!appletsThatNeedsUpdatingAnAreUsedByTocItem.isEmpty()) { // only if there are applets to update here - start the update process
                        BasicDBList resources = (BasicDBList) tocItem.getContentData().get(ContentParseUtil.RESOURCES);
                        AppletContentUpdater.updateResources(resources, appletIdsToUpdate, appletsUsedByCourse, tocItem);
                        logger.debug(String.format("Updating applets for lesson %s", tocItem.getContentId()));
                        tocItemsManager.save(tocItem, null);

                        List<Sequence> sequences = tocItemDataService.getSequences(tocItem.getContentId(), courseId);
                        AppletContentUpdater.updateSequences(sequences, appletIdsToUpdate, appletsUsedByCourse);
                        tocItemDataService.saveSequences(sequences);
                    }
                    jobService.updateJobProgress(jobId, AppletJobPhases.UPDATING_APPLETS_SAVED_DATA, calcProgress(numberOfTocItemsInCourse, ++currentTocItem), Job.Status.IN_PROGRESS);
                }
            }
            appletDao.saveAppletManifest(appletsUsedByCourse);

        } catch (Exception e) {
            logger.error(String.format("updateApplets: An ERROR occurred while updating applets in a course %s by user %s", courseId, cgsUserDetails));
            throw e;
        } finally {
            lockService.removeLocksOnCourse(courseId, publisherId, appletsUpdatingLocker);
            if (jobId != null) {
                jobService.updateJobProgress(jobId, AppletJobPhases.UPDATING_APPLETS_SAVED_DATA, 100, Job.Status.COMPLETED);
            }
        }
    }

    @Override
    public void deleteAppletManifest(String courseId) {
        appletDao.deleteAppletManifest(courseId);
    }

    int calcProgress(int totalNumberOfItems, int currentItem) {
        return (currentItem * 100) / totalNumberOfItems;
    }

    private void addAppletFromGCR(int publisherId, String courseId, String appletId, AppletManifest appletManifest) throws DsException, GCRClientException {
        // get stuff from gcr
        String appletZipFile = gcrClient.downloadApplet(appletId, null);
        GCRAppletArtifact appletArtifact = getAppletArtifact(appletZipFile);

        AppletData appletData = new AppletData(appletId, appletArtifact.getVersion());
        String appletRelativeLocation = CmsLocations.resolve(CmsLocations.APPLETS_LOCATION_PATTERN, appletId, appletArtifact.getVersion());
        AppletResources appletResources = new AppletResources(appletRelativeLocation);
        appletData.setThumbnail(String.format("%s/%s", appletRelativeLocation, appletArtifact.getThumbnail()));

        //TODO: validate MD5
        String appletCmsLocation = cmsService.prepareAssetDirectory(CmsLocations.COURSE_ASSETS_APPLETS_LOCATION_PATTERN, publisherId, courseId, appletId, appletArtifact.getVersion());
        try {
            //unzip files
            ZipInputStream zis = ZipUtils.openZipFile(appletZipFile);
            String zipElementPath;
            while ((zipElementPath = ZipUtils.nextEntry(zis)) != null) {
                FileUtils.copy(zis, String.format("%s/%s", appletCmsLocation, zipElementPath), false);
                appletResources.addHref(zipElementPath);
            }
            zis.close();
        } catch (IOException e) {
            throw new DsException("Failure to extract files from applet zip", e);
        }
        //clean temp dir
        new File(appletZipFile).delete();

        appletData.setResources(appletResources);
        appletManifest.addApplet(appletData);
    }

    private GCRAppletArtifact getAppletArtifact(String zipFile) throws DsException {
        try {
            ZipInputStream zis = ZipUtils.openZipFile(zipFile);
            zis = ZipUtils.findDataEntry(zis, MANIFEST);
            String json = ZipUtils.readTextData(zis);
            zis.close();

            InputStream is = new ByteArrayInputStream(json.getBytes("utf-8"));
            return mapper.readValue(is, GCRAppletArtifact.class);

        } catch (Exception e) {
            throw new DsException("Failure to extract applet manifest from applet zip", e);
        }
    }

    private void checkForCourseTransactionAndThrowExceptionIfExists(String courseId, String appletId) throws DsException {
        // block action if there is a transaction on this course (being published)
        if (transactionService.doesCourseHaveTransactions(courseId)) {
            List<Transaction> courseTransactions = transactionService.getTransactionForCourse(courseId);
            String m = String.format("Applet with id: %s cannot be saved, because its course (%s) is being published by %s.", appletId, courseId, courseTransactions.get(0).getUserName());
            logger.warn(m);
            String data = transactionService.createValidationErrorMessage(courseId, courseTransactions.get(0).getUserName());
            throw new TransactionException(ErrorCodes.CONTENT_IS_TRANSACTION_LOCKED, data);
        }
    }
}