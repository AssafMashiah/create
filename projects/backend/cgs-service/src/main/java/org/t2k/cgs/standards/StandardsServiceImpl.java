package org.t2k.cgs.standards;

import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.t2k.cgs.course.CourseContentEditor;
import org.t2k.cgs.course.CourseDataService;
import org.t2k.cgs.course.StandardsChangeMode;
import org.t2k.cgs.dao.standards.StandardsDao;
import org.t2k.cgs.dataServices.exceptions.*;
import org.t2k.cgs.lock.LockService;
import org.t2k.cgs.lock.TransactionService;
import org.t2k.cgs.locks.LockUser;
import org.t2k.cgs.model.classification.StandardsChange;
import org.t2k.cgs.model.classification.StandardsChangeInstance;
import org.t2k.cgs.model.classification.StandardsDiff;
import org.t2k.cgs.model.classification.StandardsPackage;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.model.standards.StandardPackageDetails;
import org.t2k.cgs.model.standards.StandardsDeleteResponse;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.standards.loader.TextLoader;
import org.t2k.cgs.tocItem.TocItemContentEditor;
import org.t2k.cgs.tocItem.TocItemsManager;

import javax.inject.Inject;
import java.io.IOException;
import java.util.*;

/**
 * Created by elad.avidan on 23/07/2014.
 */
@Service
public class StandardsServiceImpl implements StandardsService {

    private static Logger logger = Logger.getLogger(StandardsServiceImpl.class);

    private final static String STANDARDS_PROPERTY_NAME = "standards";
    private final static String DESCRIPTION_PROPERTY_NAME = "description";
    private final static String TAGGABLE_PROPERTY_NAME = "taggable";
    private final static String CHILDREN_PROPERTY_NAME = "children";
    private final static String PEDAGOGICAL_ID_PROPERTY_NAME = "pedagogicalId";

    private final static String PUBLISHER_ID = "publisherId";
    private final static String PUBLISHER_NAME = "publisher";
    private final static String COURSE_NAME = "title";

    private final static String STANDARD_PACKAGES_PROPERTY = "standardPackages";
    private final static String STANDARD_PACKAGE_SUBJECT_AREA_PROPERTY = "subjectArea";
    private final static String STANDARD_PACKAGE_NAME_PROPERTY = "name";
    private final static String STANDARD_PACKAGE_VERSION_PROPERTY = "version";
    private final static String STANDARD_PACKAGE_ID_PROPERTY = "stdPackageId";

    private final static String NO_SUCH_PACKAGE_ERROR_MSG = "Course doesn't currently use the requested standards package";
    private final static String SAME_VERSION_ERROR_MSG = "Course already at the requested version";

    private StandardsDao standardsDao;
    private LockService lockService;
    private CourseDataService courseDataService;
    private TocItemsManager tocItemsManager;
    private TextLoader textLoader;
    private TransactionService transactionService;

    @Inject
    public StandardsServiceImpl(StandardsDao standardsDao,
                                LockService lockService,
                                CourseDataService courseDataService,
                                TocItemsManager tocItemsManager,
                                TextLoader textLoader,
                                TransactionService transactionService) {
        Assert.notNull(standardsDao);
        Assert.notNull(lockService);
        Assert.notNull(courseDataService);
        Assert.notNull(tocItemsManager);
        Assert.notNull(textLoader);
        Assert.notNull(transactionService);

        this.standardsDao = standardsDao;
        this.lockService = lockService;
        this.courseDataService = courseDataService;
        this.tocItemsManager = tocItemsManager;
        this.textLoader = textLoader;
        this.transactionService = transactionService;
    }

    @Override
    public void loadStandards(String standardPackageText, StandardPackageDetails standardPackageDetails) throws Exception {
        textLoader.installStandardPackage(standardPackageDetails, standardPackageText);
    }

    @Override
    public List<CourseCGSObject> getCoursesByStandardPackage(String packageName, String subjectArea) {
        List<CourseCGSObject> coursesByStandardPackage = courseDataService.getCoursesByStandardPackage(packageName, subjectArea);
        return coursesByStandardPackage;
    }

    private List<StandardsDeleteResponse> convertToStandardDeleteResponseList(List<CourseCGSObject> coursesList) {
        StandardsDeleteResponse standardsDeleteResponse;
        List<StandardsDeleteResponse> standardsDeleteResponseList = new ArrayList<>();
        for (CourseCGSObject courseObject : coursesList) {
            String publisherId = courseObject.getCGSData().get(PUBLISHER_ID).toString();
            String publisherName = courseObject.getContentData().get(PUBLISHER_NAME).toString();
            String courseId = courseObject.getEntityId();
            String courseName = courseObject.getContentData().get(COURSE_NAME).toString();

            standardsDeleteResponse = new StandardsDeleteResponse(publisherId, publisherName, courseId, courseName);
            standardsDeleteResponseList.add(standardsDeleteResponse);
        }

        return standardsDeleteResponseList;
    }

    @Override
    public List<StandardsDeleteResponse> getStandardsDeleteResponseList(String packageName, String subjectArea) {
        List<CourseCGSObject> coursesList = getCoursesByStandardPackage(packageName, subjectArea);
        return convertToStandardDeleteResponseList(coursesList);
    }

    @Override    // Todo: remove the use of this function, and start using  getStandardsPackageObject
    public String getStandardsPackage(String packageName, String subjectArea, String version) throws DsException {
        String result;
        try {
            result = standardsDao.getStandardsPackage(packageName, subjectArea, version);
        } catch (DataAccessException e) {
            throw new DsException(e);
        }

        return result;
    }

    @Override
    public String getStandardPackagesHeaders() throws DsException {
        String result;
        try {
            result = standardsDao.getStandardPackagesHeaders();
        } catch (DataAccessException e) {
            throw new DsException(e);
        }

        return result;
    }

    @Override
    public StandardsDiff getDiff(String packageName, String subjectArea, String oldVersion, String newVersion) throws DsException {
        String oldStandardsString = standardsDao.getStandardsPackage(packageName, subjectArea, oldVersion);
        String newStandardsString = standardsDao.getStandardsPackage(packageName, subjectArea, newVersion);

        if (oldStandardsString == null) {
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, String.format("Old standard package %s wasn't found for version %s", packageName, oldVersion));
        }

        if (newStandardsString == null) {
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, String.format("New standard package %s wasn't found for version %s", packageName, newVersion));
        }

        DBObject oldStandards = (DBObject) JSON.parse(oldStandardsString);
        DBObject newStandards = (DBObject) JSON.parse(newStandardsString);

        Map<String, DBObject> oldStandardsMap = extractStandardsByPedagogicalIds((DBObject) oldStandards.get(STANDARDS_PROPERTY_NAME));
        Map<String, DBObject> newStandardsMap = extractStandardsByPedagogicalIds((DBObject) newStandards.get(STANDARDS_PROPERTY_NAME));

        StandardsDiff diff = new StandardsDiff();
        for (String oldStandardsPedId : oldStandardsMap.keySet()) {
            boolean standardRemains = newStandardsMap.containsKey(oldStandardsPedId);
            boolean standardDescriptionChanged = standardRemains && !newStandardsMap.get(oldStandardsPedId).get(DESCRIPTION_PROPERTY_NAME).equals(oldStandardsMap.get(oldStandardsPedId).get(DESCRIPTION_PROPERTY_NAME));
            boolean standardStillTaggable = standardRemains && ("false".equals(oldStandardsMap.get(oldStandardsPedId).get(TAGGABLE_PROPERTY_NAME)) || "true".equals(newStandardsMap.get(oldStandardsPedId).get(TAGGABLE_PROPERTY_NAME)));

            if (!(standardRemains && standardStillTaggable)) {
                diff.addDeletedStandard(oldStandardsPedId);
            }

            if (standardDescriptionChanged) {
                diff.addUpdatedStandard(oldStandardsPedId);
            }
        }

        for (String newStandardsPedId : newStandardsMap.keySet()) {
            if (oldStandardsMap.containsKey(newStandardsPedId)) {
                diff.addNewStandard(newStandardsPedId);
            }
        }

        return diff;
    }

    private Map<String, DBObject> extractStandardsByPedagogicalIds(DBObject standards) {
        Map<String, DBObject> result = new HashMap<String, DBObject>();

        //get map of all sub trees
        BasicDBList children = (BasicDBList) standards.get(CHILDREN_PROPERTY_NAME);

        if (children != null) {
            for (int i = 0; i < children.size(); i++) {
                DBObject object = (DBObject) children.get(i);
                Map<String, DBObject> subTreeStandards = extractStandardsByPedagogicalIds(object);
                result.putAll(subTreeStandards);
            }
        }

        //insert current into map
        String pedagogicalId = standards.get(PEDAGOGICAL_ID_PROPERTY_NAME).toString();
        result.put(pedagogicalId, standards);

        return result;
    }

    @Override
    public StandardsChange prepareForStandardsPackageUpdate(LockUser lockUser, int publisherId, String courseId, String packageName, String subjectArea, String newVersion) throws DsException {
        if (logger.isDebugEnabled()) {
            logger.debug(String.format("prepareForStandardsPackageUpdate publisherId: %d, courseId: %s, packageName: %s, subjectArea: %s, newVersion: %s", publisherId, courseId, packageName, subjectArea, newVersion));
        }

        final StandardsChange change = new StandardsChange(publisherId, courseId);
        change.setPackageName(packageName);
        change.setSubjectArea(subjectArea);

        validateThatUserEditCourse(lockUser, publisherId, courseId);

        // acquire locks
        lockService.checkAndAcquireLocksOnCourse(publisherId, courseId, lockUser);

        //get current course version
        String currentStandardsPackageVersion = null;
        DBObject currentCoursePackageObject = null;
        boolean packageIsUsed = false;

        CourseCGSObject courseObject = courseDataService.getCourse(publisherId, courseId, null, false);
        BasicDBList coursePackages = (BasicDBList) courseObject.getContentData().get(STANDARD_PACKAGES_PROPERTY);

        for (int i = 0; i < coursePackages.size(); i++) {
            currentCoursePackageObject = (DBObject) coursePackages.get(i);
            String currentCoursePackageSubjectArea = (String) currentCoursePackageObject.get(STANDARD_PACKAGE_SUBJECT_AREA_PROPERTY);
            String currentCoursePackageName = (String) currentCoursePackageObject.get(STANDARD_PACKAGE_NAME_PROPERTY);
            currentStandardsPackageVersion = (String) currentCoursePackageObject.get(STANDARD_PACKAGE_VERSION_PROPERTY);

            if (subjectArea.equals(currentCoursePackageSubjectArea) && packageName.equals(currentCoursePackageName)) {
                packageIsUsed = true;
                break;
            }
        }

        //package not available for the course requested
        if (!packageIsUsed) {
            change.addErrorMessage(NO_SUCH_PACKAGE_ERROR_MSG);
            lockService.removeLocksOnCourse(courseId, publisherId, lockUser);
            return change;
        }

        //set version information of change object
        change.setNewVersion(newVersion);
        change.setOldVersion(currentStandardsPackageVersion);

        String changedPackageId = (String) currentCoursePackageObject.get(STANDARD_PACKAGE_ID_PROPERTY);

        //diff requested newVersion with current newVersion (if the same just mark as an error, return and release locks)
        if (newVersion.equals(currentStandardsPackageVersion)) {
            change.addErrorMessage(SAME_VERSION_ERROR_MSG);
            lockService.removeLocksOnCourse(courseId, publisherId, lockUser);
            return change;
        }

        final StandardsDiff diff = getDiff(packageName, subjectArea, currentStandardsPackageVersion, newVersion);

        List<String> tocItemCids = courseDataService.getAllTocItemCIdsFromCourse(change.getPublisherId(), change.getCourseId());

        for (final String tocItemCid : tocItemCids) {
            TocItemCGSObject tocItemObject = tocItemsManager.get(change.getPublisherId(), tocItemCid, change.getCourseId(), null, false);

            final String tocItemTitle = tocItemObject.getTitle();

            TocItemContentEditor editor = new TocItemContentEditor(tocItemObject);

            editor.traverseStandards(changedPackageId, new TocItemContentEditor.StandardsTraversalHandler() {
                @Override
                public Collection<String> handleStandardEncountered(Collection<String> pedagogicalIds, String sequenceCid, String sequenceName,
                                                                    String taskCid, String taskName) {
                    StandardsChangeInstance updates = new StandardsChangeInstance();
                    updates.setTocItemName(tocItemTitle);
                    updates.setTocItemCid(tocItemCid);
                    updates.setSequenceCid(sequenceCid);
                    updates.setSequenceName(sequenceName);
                    updates.setTaskCid(taskCid);
                    updates.setTaskName(taskName);

                    StandardsChangeInstance deletes = new StandardsChangeInstance();
                    deletes.setTocItemName(tocItemTitle);
                    deletes.setTocItemCid(tocItemCid);
                    deletes.setSequenceCid(sequenceCid);
                    deletes.setSequenceName(sequenceName);
                    deletes.setTaskCid(taskCid);
                    deletes.setTaskName(taskName);

                    for (String pedagogicalId : pedagogicalIds) {
                        if (diff.getUpdatedStandards().contains(pedagogicalId)) {
                            updates.addStandard(pedagogicalId);
                        }

                        if (diff.getDeletedStandards().contains(pedagogicalId)) {
                            deletes.addStandard(pedagogicalId);
                        }
                    }

                    if (deletes.getStandardIds().size() > 0) {
                        change.addDeleteChange(deletes);
                    }
                    if (updates.getStandardIds().size() > 0) {
                        change.addUpdateChange(updates);
                    }

                    //No need to delete anything
                    return Collections.emptyList();
                }
            });
            editor.getStandardsChangesInLearningObjects(change, diff, changedPackageId, StandardsChangeMode.DELETE_AND_UPDATE, tocItemTitle, tocItemCid);
        }

        CourseContentEditor courseEditor = new CourseContentEditor(courseObject);

        return courseEditor.getChangesListForStandardPackage(diff, changedPackageId, change, StandardsChangeMode.DELETE_AND_UPDATE);
    }

    @Override
    public void updateStandardsPackage(LockUser lockUser, int publisherId, String courseId, String packageName, String subjectArea, String version) throws DsException, IOException {
        logger.debug(String.format("updateStandardsPackage. publisherId: %d, courseId: %s, packageName: %s, subjectArea: %s", publisherId, courseId, packageName, subjectArea));

        validateThatUserEditCourse(lockUser, publisherId, courseId);

        CourseCGSObject courseObject = courseDataService.getCourse(publisherId, courseId, null, false);

        CourseContentEditor courseEditor = new CourseContentEditor(courseObject);

        Iterator<StandardsPackage> standardsItr = courseEditor.getStandardsPackageIterator();

        String packageIdToModify = null;
        String currentStandardsPackageVersion = null;

        //find the package id of the package we want to delete
        while (standardsItr.hasNext()) {
            StandardsPackage standardsPackage = standardsItr.next();
            if (standardsPackage.getName().equals(packageName) && standardsPackage.getSubjectArea().equals(subjectArea)) {
                packageIdToModify = standardsPackage.getStdPackageId();
                currentStandardsPackageVersion = standardsPackage.getVersion();
                break;
            }
        }

        StandardsDiff diff = getDiff(packageName, subjectArea, currentStandardsPackageVersion, version);

        //delete all tagging in lessons
        List<String> tocItemsCids = courseDataService.getAllTocItemCIdsFromCourse(publisherId, courseId);

        for (int i = 0; i < tocItemsCids.size(); i++) {
            String tocItemCid = tocItemsCids.get(i);

            TocItemCGSObject tocItemCGSObject = tocItemsManager.get(publisherId, tocItemCid, courseId, null, false);
            TocItemContentEditor tocItemEditor = new TocItemContentEditor(tocItemCGSObject);

            // delete tagging of lesson entities that are tagged with standards no longer available in new version
            tocItemEditor.deleteStandards(packageIdToModify, diff.getDeletedStandards());

            tocItemEditor.updateStandardsPackageId(packageName, subjectArea, version);

            // change version in lessons package definition
            tocItemEditor.updateStandardsPackageVersion(packageIdToModify, version);

            tocItemEditor.updateLearningObjectStandards(packageIdToModify, version);

            tocItemsManager.save(tocItemCGSObject, lockUser);
        }

        // delete tagging of lesson entities that are tagged with standards no longer available in new version
        courseEditor.deleteStandards(packageIdToModify, diff.getDeletedStandards(), false);

        // change version in lessons package definition
        courseEditor.updateStandardsPackageVersion(packageIdToModify, version);

        courseEditor.updateStandardsInCourseRoot(packageIdToModify, version);

        courseEditor.updateStandardsInCourseTocs(packageIdToModify, version);

        courseDataService.saveCourse(courseObject, lockUser, false);

        lockService.removeLocksOnCourse(courseId, publisherId, lockUser);
    }

    @Override
    public StandardsChange prepareForStandardsPackageDelete(LockUser lockUser, int publisherId, String courseId, String packageName, String subjectArea) throws DsException {
        if (logger.isDebugEnabled()) {
            logger.debug("prepareForStandardsPackageUpdate pubId" + publisherId + " courseId:" + courseId + " packageName:" + packageName + " subjectArea:" + subjectArea);
        }

        validateThatUserEditCourse(lockUser, publisherId, courseId);

        final StandardsChange change = new StandardsChange(publisherId, courseId);
        change.setPackageName(packageName);
        change.setSubjectArea(subjectArea);

        // acquire locks
        lockService.checkAndAcquireLocksOnCourse(publisherId, courseId, lockUser);

        //get current course version
        String currentStandardsPackageVersion = null;
        DBObject currentCoursePackageObject = null;
        boolean packageIsUsed = false;

        CourseCGSObject courseObject = this.courseDataService.getCourse(publisherId, courseId, null, false);
        BasicDBList coursePackages = (BasicDBList) courseObject.getContentData().get(STANDARD_PACKAGES_PROPERTY);

        for (int i = 0; i < coursePackages.size(); i++) {
            currentCoursePackageObject = (DBObject) coursePackages.get(i);
            String currentCoursePackageSubjectArea = (String) currentCoursePackageObject.get(STANDARD_PACKAGE_SUBJECT_AREA_PROPERTY);
            String currentCoursePackageName = (String) currentCoursePackageObject.get(STANDARD_PACKAGE_NAME_PROPERTY);
            currentStandardsPackageVersion = (String) currentCoursePackageObject.get(STANDARD_PACKAGE_VERSION_PROPERTY);

            if (subjectArea.equals(currentCoursePackageSubjectArea) &&
                    packageName.equals(currentCoursePackageName)) {

                packageIsUsed = true;

                break;
            }
        }

        //package not available for the course requested
        if (!packageIsUsed) {
            change.addErrorMessage(NO_SUCH_PACKAGE_ERROR_MSG);
            lockService.removeLocksOnCourse(courseId, publisherId, lockUser);
            return change;
        }

        //set version information of change object
        change.setVersion(currentStandardsPackageVersion);

        String changedPackageId = (String) currentCoursePackageObject.get(STANDARD_PACKAGE_ID_PROPERTY);

        List<String> tocItemCids = courseDataService.getAllTocItemCIdsFromCourse(change.getPublisherId(), change.getCourseId());

        for (final String tocItemCid : tocItemCids) {
            TocItemCGSObject tocItemObject = tocItemsManager.get(change.getPublisherId(), tocItemCid, change.getCourseId(), null, false);

            final String tocItemTitle = tocItemObject.getTitle();

            TocItemContentEditor editor = new TocItemContentEditor(tocItemObject);

            editor.traverseStandards(changedPackageId, new TocItemContentEditor.StandardsTraversalHandler() {
                @Override
                public Collection<String> handleStandardEncountered(Collection<String> pedagogicalIds, String sequenceCid, String sequenceName, String taskCid, String taskName) {
                    StandardsChangeInstance deletes = new StandardsChangeInstance();
                    deletes.setTocItemName(tocItemTitle);
                    deletes.setTocItemCid(tocItemCid);
                    deletes.setSequenceCid(sequenceCid);
                    deletes.setSequenceName(sequenceName);
                    deletes.setTaskCid(taskCid);
                    deletes.setTaskName(taskName);

                    for (String pedagogicalId : pedagogicalIds) {
                        deletes.addStandard(pedagogicalId);
                    }

                    if (deletes.getStandardIds().size() > 0) {
                        change.addDeleteChange(deletes);
                    }

                    //No need to delete anything
                    return Collections.emptyList();
                }
            });

            editor.getStandardsChangesInLearningObjects(change, null, changedPackageId, StandardsChangeMode.DELETE_ONLY, tocItemTitle, tocItemCid);
        }

        CourseContentEditor courseContentEditor = new CourseContentEditor(courseObject);

        courseContentEditor.getChangesListForStandardPackage(null, changedPackageId, change, StandardsChangeMode.DELETE_ONLY);

        // TODO: return toc Id's, Course Name and LO names.
        return change;
    }

    /***
     * validates:
     * a. the user & course are under same publisher
     * b. the user can lock this course or already locked it
     * c. there is not active transaction of this course
     * <p>
     * throws exception if validation fails
     *
     * @param lockUser    - user to validate action for
     * @param publisherId - publisher id of the course
     * @param courseId    - course id
     * @throws DsException
     */
    private void validateThatUserEditCourse(LockUser lockUser, int publisherId, String courseId) throws DsException {

        CourseCGSObject course = courseDataService.getCourse(publisherId, courseId, null, false);

        // if the course is not in DB, then the user can try to do whatever he wants with it,
        // so validation is OK
        if (course == null) {
            return;
        }

        // validate that the user is in the same publisher as the course
        if (course.getPublisherId() != lockUser.getPublisherId()) {
            String message = String.format("User %s from publisher %d cannot perform actions on course %s from publisher %d", lockUser.getUserName(), lockUser.getPublisherId(), course, publisherId);
            logger.error(message);
            throw new LockException(ErrorCodes.CONTENT_IS_NOT_OWNED_BY_USER, message);
        }

        /** Validate that the course doesn't have a transaction,
         * and that the current user has a lock or can take a lock on the course */
        if (transactionService.doesCourseHaveTransactions(courseId))
            throw new TransactionException(ErrorCodes.CONTENT_IS_TRANSACTION_LOCKED, "");

        // throws an exception if the user cannot take a lock on the course
        lockService.validateLocker(course, lockUser);
    }

    @Override
    public void deleteStandardsPackage(LockUser lockUser, int publisherId, String courseId, String packageName, String subjectArea) throws DsException, IOException {
        if (logger.isDebugEnabled()) {
            logger.debug(String.format("deleteStandardsPackage pubId%d courseId:%s packageName:%s subjectArea:%s", publisherId, courseId, packageName, subjectArea));
        }

        CourseCGSObject courseObject = this.courseDataService.getCourse(publisherId, courseId, null, false);

        CourseContentEditor courseEditor = new CourseContentEditor(courseObject);

        Iterator<StandardsPackage> standardsItr = courseEditor.getStandardsPackageIterator();

        String packageId = null;

        //find the package id of the package we want to delete
        while (standardsItr.hasNext()) {
            StandardsPackage standardsPackage = standardsItr.next();
            if (standardsPackage.getName().equals(packageName) && standardsPackage.getSubjectArea().equals(subjectArea)) {
                packageId = standardsPackage.getStdPackageId();
                break;
            }
        }

        List<String> tocItemsCids = courseDataService.getAllTocItemCIdsFromCourse(publisherId, courseId);

        for (int i = 0; i < tocItemsCids.size(); i++) {
            String tocItemCid = tocItemsCids.get(i);

            TocItemCGSObject tocItemCGSObject = tocItemsManager.get(publisherId, tocItemCid, courseId, null, false);
            TocItemContentEditor tocItemEditor = new TocItemContentEditor(tocItemCGSObject);

            //delete tagging of standards from lesson entities
            tocItemEditor.deleteStandards(packageId);

            tocItemEditor.deleteStandardsFromLearningObjects(packageId);

            //delete package reference in lesson
            tocItemEditor.deleteStandardsPackage(packageId);

            tocItemsManager.save(tocItemCGSObject, lockUser);
        }

        //delete tagging of standards from course entities
        courseEditor.deleteStandards(packageId);

        //delete package reference in course
        courseEditor.deleteStandardsPackage(packageId);

        courseDataService.saveCourse(courseObject, lockUser, false);

        lockService.removeLocksOnCourse(courseId, publisherId, lockUser);
    }

    @Override
    public void abortStandardsPackageChange(LockUser lockUser, int publisherId, String courseId, String packageName, String subjectArea) throws DsException {
        if (logger.isDebugEnabled()) {
            logger.debug(String.format("abortStandardsPackageChange pubId%d courseId:%s packageName:%s subjectArea:%s", publisherId, courseId, packageName, subjectArea));
        }

        lockService.removeLocksOnCourse(courseId, publisherId, lockUser);
    }

    @Override
    public void deleteStandardsPackage(String packName, String area) {
        logger.debug(String.format("Deleting Standard Package: %s, Area: %s ...", packName, area));
        this.standardsDao.deleteStandardPackageAllVersions(packName, area);
    }
}