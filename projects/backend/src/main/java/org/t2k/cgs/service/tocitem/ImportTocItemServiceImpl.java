package org.t2k.cgs.service.tocitem;

import org.apache.commons.lang3.text.StrBuilder;
import org.apache.log4j.Logger;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.t2k.cgs.domain.usecases.AppletService;
import org.t2k.cgs.domain.usecases.CmsService;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.usecases.tocitem.tocimport.*;
import org.t2k.cgs.domain.usecases.FileDao;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.ResourceNotFoundException;
import org.t2k.cgs.domain.usecases.lock.LockService;
import org.t2k.cgs.domain.model.lock.LockUser;
import org.t2k.cgs.domain.model.CGSResource;
import org.t2k.cgs.domain.model.applet.AppletData;
import org.t2k.cgs.domain.model.applet.AppletManifest;
import org.t2k.cgs.domain.model.course.Course;
import org.t2k.cgs.domain.model.course.CourseToc;
import org.t2k.cgs.domain.model.course.CourseTocItemRef;
import org.t2k.cgs.domain.model.course.DifferentiationLevel;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.cgs.domain.model.sequence.SequenceContent;
import org.t2k.cgs.domain.model.tocItem.AppletResource;
import org.t2k.cgs.domain.model.tocItem.Lesson;
import org.t2k.cgs.domain.model.tocItem.TocItem;
import org.t2k.cgs.domain.model.tocItem.TocItemSequence;
import org.t2k.cgs.domain.model.tocItem.TocItemSequenceDifferential;
import org.t2k.cgs.domain.model.tocItem.TocItemSequenceRegular;
import org.t2k.cgs.domain.usecases.SequenceService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemsManager;
import org.t2k.cgs.domain.usecases.user.UserService;
import org.t2k.gcr.common.model.applet.GCRAppletArtifact;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ImportTocItemServiceImpl implements ImportTocItemService {

    private FileDao fileDao;
    private CmsService cmsService;
    private CourseDataService courseDataService;
    private TocItemsManager tocItemsManager;
    private AppletService appletService;
    private SequenceService sequenceService;
    private JobService jobService;
    private LockService lockService;
    private UserService userService;

    private static Logger logger = Logger.getLogger(ImportTocItemServiceImpl.class);

    @Inject
    public ImportTocItemServiceImpl(FileDao fileDao,
                                    CmsService cmsService,
                                    CourseDataService courseDataService,
                                    TocItemsManager tocItemsManager,
                                    AppletService appletService,
                                    SequenceService sequenceService,
                                    JobService jobService,
                                    LockService lockService,
                                    UserService userService) {
        Assert.notNull(fileDao);
        Assert.notNull(cmsService);
        Assert.notNull(courseDataService);
        Assert.notNull(tocItemsManager);
        Assert.notNull(appletService);
        Assert.notNull(sequenceService);
        Assert.notNull(jobService);
        Assert.notNull(lockService);
        Assert.notNull(userService);

        this.fileDao = fileDao;
        this.cmsService = cmsService;
        this.courseDataService = courseDataService;
        this.tocItemsManager = tocItemsManager;
        this.appletService = appletService;
        this.sequenceService = sequenceService;
        this.jobService = jobService;
        this.lockService = lockService;
        this.userService = userService;
    }

    @Override
    @Async
    public void importTocItems(String jobId,
                               int userId,
                               int publisherId,
                               ImportTocItemsDTO importTocItemsDTO) {
        logger.info(String.format("Starting import of TOC items (jobId '%s') for user '%d', publisher '%d': '%s'",
                jobId, userId, publisherId, importTocItemsDTO));

        LockUser lockUser = new LockUser(userService.getById(userId, false).toUserDetails());
        String destinationCourseId = importTocItemsDTO.getDestinationCourseId();
        Course destinationCourse = courseDataService.getCourse(publisherId, destinationCourseId);
        try {
            lockService.acquireLock(destinationCourse, lockUser);
        } catch (DsException e) {
            String msg = "Unable to acquire lock on course: " + destinationCourse;
            logger.error(msg, e);
            jobService.onJobFailure(jobId, ImportTocItemError.LOCK_FAILED, msg, null);
            return;
        }

        Optional<CourseToc> destinationToc = destinationCourse.getContentData().getToc()
                .getTocByCid(importTocItemsDTO.getDestinationTocCid());
        if (!destinationToc.isPresent()) {
            String errorMessage = "Toc with cid '" + importTocItemsDTO.getDestinationTocCid() + "' does not exist on course " + destinationCourseId;
            logger.error(errorMessage);
            jobService.addError(jobId, ImportTocItemError.TOC_DOES_NOT_EXIST, errorMessage, Job.Status.FAILED);
            releaseLock(jobId, lockUser, destinationCourseId, destinationCourse);
            return;
        }

        int sourceCoursesCount = importTocItemsDTO.getTocItemsToImport().size();
        List<ImportItemsHolder> itemsHolders = new ArrayList<>(sourceCoursesCount);
        int progress = 0;
        int tick = 100 / sourceCoursesCount;
        jobService.updateComponentProgress(jobId, ImportTocItemComponent.TRANSFORM_TOC_ITEMS, 0);
        for (TocItemsToImportDTO tocItemsToImport : importTocItemsDTO.getTocItemsToImport()) {
            ImportItemsHolder itemsHolder = prepareItemsForImport(jobId, publisherId, destinationCourse, tocItemsToImport);
            itemsHolders.add(itemsHolder);
            Job.Status jobStatus = jobService.getJob(jobId).getStatus();
            if (jobStatus != Job.Status.CANCELED && jobStatus != Job.Status.FAILED) {
                progress += tick;
                jobService.updateComponentProgress(jobId, ImportTocItemComponent.TRANSFORM_TOC_ITEMS, progress);
            } else {
                releaseLock(jobId, lockUser, destinationCourseId, destinationCourse);
                return;
            }
        }
        jobService.updateComponentProgress(jobId, ImportTocItemComponent.TRANSFORM_TOC_ITEMS, 100);

        jobService.updateComponentProgress(jobId, ImportTocItemComponent.COPY_ASSETS, 0);
        progress = 0;
        tick = 90 / itemsHolders.size();
        List<TocItemAndSequences> tocItemAndSequences = new ArrayList<>();
        for (ImportItemsHolder importItemsHolder : itemsHolders) {
            tocItemAndSequences.addAll(importItemsHolder.tocItemAndSequences);

            if (!addAppletsOnCourse(publisherId, jobId, destinationCourse.getCourseId(), importItemsHolder.appletsValidationResponses, lockUser)) {
                String errorMessage = "Error adding applets on on course: " + destinationCourse;
                logger.error(errorMessage);
                jobService.addError(jobId, ImportTocItemError.FAILED_TO_ADD_APPLETS, errorMessage, Job.Status.FAILED);
                releaseLock(jobId, lockUser, destinationCourseId, destinationCourse);
                return;
            }

            try {
                copyAssets(publisherId, destinationCourseId, importItemsHolder.sourceCourseId, importItemsHolder.resourcesToCopy);
            } catch (DsException e) {
                String errorMessage = "Error copying resources " + importItemsHolder.resourcesToCopy
                        + " from course " + importItemsHolder.sourceCourseId
                        + " to course: " + destinationCourse;
                logger.error(errorMessage, e);
                jobService.addError(jobId, ImportTocItemError.FAILED_TO_COPY_RESOURCES, errorMessage, Job.Status.FAILED);
                releaseLock(jobId, lockUser, destinationCourseId, destinationCourse);
                return;
            }

            // add ebooks to course
            destinationCourse.getContentData().addEBookIds(
                    itemsHolders.stream()
                            .flatMap(itemsHolder -> itemsHolder.eBooksIds.stream())
                            .collect(Collectors.toSet()));
            progress += tick;
            jobService.updateComponentProgress(jobId, ImportTocItemComponent.COPY_ASSETS, progress);
        }
        jobService.updateComponentProgress(jobId, ImportTocItemComponent.COPY_ASSETS, 90);

        // add refs to course
        List<CourseTocItemRef> tocItemRefs = tocItemAndSequences.stream()
                .map(itemAndSequences -> CourseTocItemRef.newInstance(itemAndSequences.tocItem.getContentId(),
                        itemAndSequences.tocItem.getEntityType().getName()))
                .collect(Collectors.toList());
        if (importTocItemsDTO.getIndex() == null) {
            destinationToc.get().addTocItemRefs(tocItemRefs);
        } else {
            destinationToc.get().addTocItemRefs(tocItemRefs, importTocItemsDTO.getIndex());
        }
        jobService.updateComponentProgress(jobId, ImportTocItemComponent.COPY_ASSETS, 93);

        logger.debug("Saving sequences to DB");
        for (TocItemAndSequences tocItemAndSequence : tocItemAndSequences) {
            for (Sequence sequence : tocItemAndSequence.sequences) {
                sequenceService.saveSequence(sequence);
            }
        }
        jobService.updateComponentProgress(jobId, ImportTocItemComponent.COPY_ASSETS, 96);

        logger.debug("Saving toc items (lessons and/or assessments) to DB");
        for (TocItemAndSequences tocItemAndSequence : tocItemAndSequences) {
            TocItem tocItem = tocItemAndSequence.tocItem;
            try {
                tocItemsManager.getServiceByType(tocItem.getEntityType())
                        .save(tocItem, lockUser);
            } catch (DsException e) {
                String errorMessage = "Error saving " + tocItem.getEntityType();
                logger.error(errorMessage + " " + tocItem, e);
                jobService.addError(jobId, ImportTocItemError.FAILED_TO_COPY_RESOURCES, errorMessage, Job.Status.FAILED);
                releaseLock(jobId, lockUser, destinationCourseId, destinationCourse);
                return;
            }
        }
        jobService.updateComponentProgress(jobId, ImportTocItemComponent.COPY_ASSETS, 98);

        destinationCourse.updateLastModified();
        courseDataService.save(destinationCourse);
        jobService.updateComponentProgress(jobId, ImportTocItemComponent.COPY_ASSETS, 99);

        releaseLock(jobId, lockUser, destinationCourseId, destinationCourse);
        jobService.updateComponentProgress(jobId, ImportTocItemComponent.COPY_ASSETS, 100);
        jobService.updateJobStatus(jobId, Job.Status.COMPLETED);
        logger.debug("Import of toc items finished successfully");
    }

    private void releaseLock(String jobId, LockUser lockUser, String destinationCourseId, Course destinationCourse) {
        try {
            lockService.releaseLock(destinationCourse, lockUser);
        } catch (DsException e) {
            String errorMessage = "Error releasing lock from course " + destinationCourseId;
            logger.debug(errorMessage, e);
            jobService.addError(jobId, ImportTocItemError.LOCK_RELEASE_FAILED, errorMessage);
        }
    }

    /**
     * Method that handles toc items transformation and resources preparation to be imported from one course to another
     *
     * @param jobId               ID of the {@code Job} tracking the process
     * @param publisherId         id of the publisher owning the courses
     * @param destinationCourse   course where the toc items will be imported
     * @param tocItemsToImportDTO info about the toc items to import from a course
     * @return an object containing all the toc items and the resources to be imported to the destination course,
     * or null if an error was encountered during the process
     */
    private ImportItemsHolder prepareItemsForImport(String jobId, int publisherId,
                                                    Course destinationCourse,
                                                    TocItemsToImportDTO tocItemsToImportDTO) {
        String sourceCourseId = tocItemsToImportDTO.getSourceCourseId();
        Course sourceCourse = courseDataService.getCourse(publisherId, sourceCourseId);

        logger.debug("Validating that the source course '" + sourceCourseId + "' contains all the requested toc items");
        List<String> tocItemCids = tocItemsToImportDTO.getTocItemCids();
        if (!sourceCourse.containsTocItemsRefs(tocItemCids)) {
            List<String> tocItemsNotContained = tocItemCids.stream().filter(s -> !sourceCourse.containsTocItemRef(s)).collect(Collectors.toList());
            String errMsg = String.format("Course with ID '%s' on publisher '%s' does not contain toc items with cids %s",
                    sourceCourseId, publisherId, tocItemsNotContained);
            jobService.addError(jobId, ImportTocItemError.INVALID_TOC_ITEM, errMsg, Job.Status.FAILED);
            return null;
        }

        List<TocItem> tocItems = sourceCourse.getTocItemsRefs(tocItemCids).stream()
                .map(tocItemRef -> {
                    EntityType tocItemType = EntityType.forName(tocItemRef.getType());
                    return tocItemsManager.get(publisherId, sourceCourseId, tocItemRef.getCid(), tocItemType);
                })
                .collect(Collectors.toList());

        logger.debug("Validating that standards packages from the toc items to be imported are found on the destination course");
        List<TocItemValidationResponse> standardsValidation = tocItems.stream()
                .map(tocItem -> validateStandardsPackages(destinationCourse, tocItem))
                .collect(Collectors.toList());
        for (TocItemValidationResponse validationResponse : standardsValidation) {
            if (validationResponse.getErrors().size() > 0) {
                String errMsg = "Validation for standard packages failed with errors: " + validationResponse.getErrors();
                jobService.addError(jobId, ImportTocItemError.STANDARDS_PACKAGE_MISMATCH, errMsg, Job.Status.FAILED);
                return null;
            }
        }

        List<AppletsValidationResponse> appletsValidationResponses;
        List<GCRAppletArtifact> catalogApplets = appletService.getAppletsAllowedForPublisher(destinationCourse.getCgsData().getPublisherId());
        appletsValidationResponses = validateApplets(destinationCourse, tocItems, catalogApplets);

        Map<Integer, Integer> diffMap = tocItemsToImportDTO.getDiffMap();
        boolean diffLevelsConflict = validateDifferentiationLevels(sourceCourse, destinationCourse);
        if (diffLevelsConflict && diffMap == null) {
            String errMsg = "Differentiation levels do not match between source and destination courses and mapping is missing";
            logger.error(errMsg);
            jobService.addError(jobId, ImportTocItemError.MISSING_DIFFERENTIATION_LEVEL_MAPPING, errMsg, Job.Status.FAILED);
            return null;
        } else if (!diffLevelsConflict
                && (diffMap == null || diffMap.size() == 0)
                && sourceCourse.getContentData().getDifferentiation() != null) {
            // diff levels match, but the user didn't provide any mapping, so we consider 1 to 1 mapping
            diffMap = new HashMap<>(sourceCourse.getContentData().getDifferentiation().getLevels().size());
            for (DifferentiationLevel diffLvl : sourceCourse.getContentData().getDifferentiation().getLevels()) {
                diffMap.put(diffLvl.getLevelId(), diffLvl.getLevelId());
            }
        }

        int tocItemsCount = tocItems.size();
        List<TocItemAndSequences> tocItemAndSequences = new ArrayList<>(tocItemsCount);
        for (TocItem tocItem : tocItems) {
            diffMap = validateDiffMap(destinationCourse, sourceCourse, diffMap);
            tocItemAndSequences.add(
                    transformTocItemAndSequences(tocItem, sourceCourse, destinationCourse, diffMap, appletsValidationResponses));
        }

        // ebooks to used on toc items to add to destination course
        List<String> eBooksIds = tocItems.stream()
                .filter(tocItem -> tocItem.getEntityType() == EntityType.LESSON)
                .flatMap(tocItem -> ((Lesson) tocItem).getEBooksIds().stream())
                .distinct()
                .collect(Collectors.toList());

        // resources to copy to destination course
        List<String> resourcesToCopy = tocItems.stream()
                .flatMap(tocItem -> tocItem.getContentData().getResources().stream())
                .filter(res -> res.getType().equals("attachment") || res.getType().equals("media"))
                .map(CGSResource::getHref)
                .collect(Collectors.toList());

        return new ImportItemsHolder(sourceCourseId, tocItemAndSequences, appletsValidationResponses, eBooksIds, resourcesToCopy);
    }

    /**
     * Checks that the provided diff map is valid within the differentiation levels on the destination course.
     *
     * @param destinationCourse course on which the the toc items are imported
     * @param sourceCourse      course from which the toc items are imported
     * @param diffMap           a mapping between the IDs of the differentiations levels on the destination
     *                          course, held as keys and the IDs of the differentiation levels on the source
     *                          course, held as values. Null value means that the level on the destination course
     *                          has no mapping. -1 key means that the destination course has no differentiation
     *                          levels, and only one of the differentiation levels sequences from the source course
     *                          will be imported (the one mapped to -1)
     * @return the validated diff map
     * @throws IllegalArgumentException if the given diffMap contains diff level IDs that are not found on either
     *                                  destination course or source course
     */
    private Map<Integer, Integer> validateDiffMap(Course destinationCourse,
                                                  Course sourceCourse,
                                                  Map<Integer, Integer> diffMap) {

        List<Integer> destinationDiffLevels = destinationCourse.getContentData().getDifferentiation() == null
                ? new ArrayList<>(0)
                : destinationCourse.getContentData().getDifferentiation().getLevels()
                .stream().map(DifferentiationLevel::getLevelId).collect(Collectors.toList());
        List<Integer> sourceDiffLevels = sourceCourse.getContentData().getDifferentiation() == null
                ? new ArrayList<>(0)
                : sourceCourse.getContentData().getDifferentiation().getLevels()
                .stream().map(DifferentiationLevel::getLevelId).collect(Collectors.toList());

        diffMap.keySet().forEach(destinationDiffLevel -> {
            if (destinationDiffLevel != -1 && !destinationDiffLevels.contains(destinationDiffLevel)) {
                throw new IllegalArgumentException(String.format("Differentiation level with ID '%d' does not exist on course '%s'",
                        destinationDiffLevel, destinationCourse));
            }
            Integer sourceDiffLevel = diffMap.get(destinationDiffLevel);
            if (sourceDiffLevel != null && !sourceDiffLevels.contains(sourceDiffLevel)) {
                throw new IllegalArgumentException(String.format("Differentiation level with ID '%d' does not exist on course '%s'",
                        sourceDiffLevel, sourceCourse));
            }
        });
        return diffMap;
    }

    /**
     * Method for validating that the differentiation levels on the source course match the ones on the destination course
     *
     * @param sourceCourse      course from where the toc items will be imported
     * @param destinationCourse course where the toc items will be imported
     * @return true if there is a diff levels conflict, false if there is no conflict
     */
    private boolean validateDifferentiationLevels(Course sourceCourse, Course destinationCourse) {
        logger.debug("Validating differentiation levels match between courses");
        boolean conflict = false;
        if (sourceCourse.getContentData().getDifferentiation() != null
                && !sourceCourse.getContentData().getDifferentiation().equals(destinationCourse.getContentData().getDifferentiation())) {
            logger.debug(String.format("Source course diff levels '%s' does not match with destination course diff levels '%s'",
                    sourceCourse.getContentData().getDifferentiation(), destinationCourse.getContentData().getDifferentiation()));
            conflict = true;
        }
        return conflict;
    }

    public Map<String, TocItemValidationResponse> validateTocItemsForImport(Course destinationCourse,
                                                                            List<TocItem> tocItems,
                                                                            List<GCRAppletArtifact> catalogApplets) {
        Map<String, TocItemValidationResponse> responsesMap = tocItems.stream()
                .map(TocItemValidationResponse::new)
                .collect(Collectors.toMap(TocItemValidationResponse::getCid, Function.identity()));
        Map<String, TocItem> tocItemsMap = tocItems.stream().collect(Collectors.toMap(TocItem::getContentId, Function.identity()));

        logger.debug("Validating that standards packages from the toc items to be imported are found on the destination course");
        tocItems.forEach(tocItem -> responsesMap.get(tocItem.getContentId())
                .addFrom(validateStandardsPackages(destinationCourse, tocItem)));

        // validating the applets
        validateApplets(destinationCourse, tocItems, catalogApplets).forEach(appletsValidationResponse -> {
            String tocItemCid = appletsValidationResponse.tocItemCid;
            TocItemValidationResponse validationResponse = responsesMap.get(tocItemCid);
            validationResponse.addFrom(AppletsValidationResponse.newTocItemValidationResponse(tocItemsMap.get(tocItemCid), appletsValidationResponse));
        });

        logger.debug("Validating that the sequences on the toc items are supported for import");
        tocItems.forEach(tocItem -> {
            tocItem.getContentData().getSequences()
                    .forEach(tocItemSequence -> {
                        if (tocItemSequence.getType() == EntityType.SEQUENCE_REF) {
                            responsesMap.get(tocItem.getContentId())
                                    .addError("Lesson contains reference to sequence, which is not supported for import");
                        }
                    });
        });
        return responsesMap;
    }

    /**
     * Method for validating that the standards packages on the toc item to be imported match the ones on the destination
     * course.
     *
     * @param destinationCourse course where the toc items will be imported
     * @param tocItem           toc item to be imported
     */
    private TocItemValidationResponse validateStandardsPackages(Course destinationCourse, TocItem tocItem) {
        TocItemValidationResponse tocItemValidationResponse = new TocItemValidationResponse(tocItem);
        tocItem.getContentData().getStandardPackages()
                .forEach(tocItemStandardsPackage -> destinationCourse.getContentData().getStandardPackages()
                        .forEach(courseStandardPackage -> {
                            if (courseStandardPackage.getName().equals(tocItemStandardsPackage.getName())
                                    && courseStandardPackage.getSubjectArea().equals(tocItemStandardsPackage.getSubjectArea())
                                    && !courseStandardPackage.getVersion().equals(tocItemStandardsPackage.getVersion())) {
                                tocItemValidationResponse
                                        .addError(String.format("Standards package %s (%s) version %s from imported toc item %s' does not match with the one on the destination course: %s",
                                                tocItemStandardsPackage.getName(),
                                                tocItemStandardsPackage.getSubjectArea(),
                                                tocItemStandardsPackage.getVersion(),
                                                tocItem.getTitle(), courseStandardPackage.getVersion()));
                            } else if (!courseStandardPackage.getName().equals(tocItemStandardsPackage.getName())
                                    || !courseStandardPackage.getSubjectArea().equals(tocItemStandardsPackage.getSubjectArea())) {
                                tocItemValidationResponse
                                        .addWarning(String.format("Standards package %s (%s) version %s will be removed from the imported toc item",
                                                tocItemStandardsPackage.getName(),
                                                tocItemStandardsPackage.getSubjectArea(),
                                                tocItemStandardsPackage.getVersion()));
                            }
                        }));
        return tocItemValidationResponse;
    }

    /**
     * Method for validating that the applets on the imported toc items match with the ones on the destination course
     * and the ones from the GCR catalog the publisher has access to
     *
     * @param destinationCourse course where the toc items will be imported
     * @param tocItems          toc items to be imported
     * @param catalogApplets    applets that allowed for publisher retrieved from GCR
     * @return a list of validation responses which includes information about the applets that need to be updated
     */
    private List<AppletsValidationResponse> validateApplets(Course destinationCourse,
                                                            List<TocItem> tocItems,
                                                            List<GCRAppletArtifact> catalogApplets) {
        logger.debug("Validating the applets on the toc items to be imported");
        AppletManifest courseAppletsManifest = appletService.getAppletManifest(destinationCourse.getCourseId(), null);

        return tocItems.stream()
                .map(tocItem -> validateAppletsOnTocItem(tocItem,
                        catalogApplets.stream()
                                .collect(Collectors.toMap(GCRAppletArtifact::getGuid, Function.identity(), (o, o2) -> o)),
                        courseAppletsManifest))
                .collect(Collectors.toList());
    }

    /**
     * Method for validating that the applets on the imported tocItem match with the ones on the destination course
     * and the ones from the GCR catalog the publisher has access to
     *
     * @param tocItem               the tocItem to be imported
     * @param catalogApplets        a map having as keys the guid of the applets and as values the applets from the
     *                              catalog available to the publisher for the type of the tocItem to be imported
     *                              (native or eBook)
     * @param courseAppletsManifest manifest of the applets on the course where the tocItem will be imported
     * @return appletsValidationResponse containing the errors and warnings after validation (if any)
     */
    private AppletsValidationResponse validateAppletsOnTocItem(TocItem tocItem,
                                                               Map<String, GCRAppletArtifact> catalogApplets,
                                                               AppletManifest courseAppletsManifest) {
        logger.debug(String.format("Validating applets on tocItem '%s' before import", tocItem.getContentId()));
        AppletsValidationResponse response = new AppletsValidationResponse(tocItem.getContentId());
        tocItem.getAppletsResources().forEach(tocItemApplet -> {
            logger.debug(String.format("Validating applet '%s' (version '%s')", tocItemApplet.getGuid(), tocItemApplet.getVersion()));
            AppletData courseApplet = courseAppletsManifest.getApplet(tocItemApplet.getGuid());
            GCRAppletArtifact catalogApplet = catalogApplets.get(tocItemApplet.getGuid());
            if (catalogApplet == null) {
                logger.error(String.format("Applet %s does not exist in catalog", tocItemApplet.getGuid()));
                response.appletsMissingInCatalog.add(new AppletReference(tocItemApplet.getGuid(), null));
            } else if (courseApplet == null) {
                logger.debug(String.format("Destination course does not contain applet %s. Will be added.", catalogApplet.getName()));
                response.appletsToAddOnCourse.add(new AppletReference(tocItemApplet.getGuid(), catalogApplet.getName()));
                if (!catalogApplet.getVersion().equals(tocItemApplet.getVersion())) {
                    logger.debug(String.format("Imported tocItem contains an older version of applet %s. Will be updated.", catalogApplet.getName()));
                    AppletReference appletReference = new AppletReference(tocItemApplet.getGuid(), catalogApplet.getName());
                    appletReference.oldVersion = tocItemApplet.getVersion();
                    appletReference.newVersion = catalogApplet.getVersion();
                    response.appletsToBeUpdatedOnTocItem.add(appletReference);
                }
            } else if (!courseApplet.getVersion().equals(catalogApplet.getVersion())) {
                logger.debug(String.format("Destination course contains an older version of applet '%s' (version '%s') than on catalog",
                        catalogApplet.getName(), courseApplet.getVersion()));
                response.appletsToBeUpdatedOnCourse.add(new AppletReference(tocItemApplet.getGuid(), catalogApplet.getName()));
            } else if (!courseApplet.getVersion().equals(tocItemApplet.getVersion())) {
                logger.debug(String.format("Imported tocItem contains an older version of applet %s. Will be updated.", catalogApplet.getName()));
                AppletReference appletReference = new AppletReference(tocItemApplet.getGuid(), catalogApplet.getName());
                appletReference.oldVersion = tocItemApplet.getVersion();
                appletReference.newVersion = courseApplet.getVersion();
                response.appletsToBeUpdatedOnTocItem.add(appletReference);
            }
        });
        return response;
    }

    /**
     * Method for altering the structure of the existing toc items and their sequences before being imported into the
     * given {@code destinationCourse}
     *
     * @param tocItem                    the toc item (lesson or assessment) to transform for the import process
     * @param sourceCourse               the course from which the toc item is imported
     * @param destinationCourse          the course to which the toc item is imported
     * @param diffLevelsMapping          a mapping between the IDs of the differentiations levels on the destination
     *                                   course, held as keys and the IDs of the differentiation levels on the source
     *                                   course, held as values. Null value means that the level on the destination course
     *                                   has no mapping. -1 key means that the destination course has no differentiation
     *                                   levels, and only one of the differentiation levels sequences from the source course
     *                                   will be imported (the one mapped to -1)
     * @param appletsValidationResponses the response of the applets validation, containing the list of applets to be
     *                                   updated on the toc item
     * @return an object containing the modified toc item and its modified sequences
     */ // TODO: 12/9/16 test
    private TocItemAndSequences transformTocItemAndSequences(TocItem tocItem,
                                                             Course sourceCourse,
                                                             Course destinationCourse,
                                                             Map<Integer, Integer> diffLevelsMapping,
                                                             List<AppletsValidationResponse> appletsValidationResponses) {
        String oldTocItemCid = tocItem.getContentId();
        tocItem = tocItem.transformForImport(sourceCourse, destinationCourse);

        Map<String, Sequence> sourceSequences = sequenceService.getSequences(oldTocItemCid, sourceCourse.getCourseId())
                .stream()
                .collect(Collectors.toMap(Sequence::getSeqId, Function.identity()));

        tocItem = updateAppletsOnTocItem(oldTocItemCid, tocItem, appletsValidationResponses);

        // sequences for widgets content
        List<Sequence> sequences = getSequencesForWidgetsContent(tocItem, destinationCourse, appletsValidationResponses, sourceSequences);

        // toc item sequences
        for (TocItemSequence tocItemSequence : new ArrayList<>(tocItem.getContentData().getSequences())) {
            TocItemSequence tocReplacementSequence;
            Set<CGSResource> replacementResources = new HashSet<>();

            if (tocItemSequence instanceof TocItemSequenceRegular) {
                Sequence sequence = sourceSequences.get(tocItemSequence.getCid());
                String newSeqId = UUID.randomUUID().toString();
                // we update the applets on the sequence
                String sequenceContent = updateAppletsOnSequenceContent(oldTocItemCid, sequence.getContent(), appletsValidationResponses);
                sequenceContent = sequenceContent
                        .replaceAll(sequence.getSeqId(), newSeqId)
                        .replaceAll(oldTocItemCid, tocItem.getContentId());

                Sequence replacementSequence = new Sequence(newSeqId, tocItem.getContentId(), destinationCourse.getCourseId(), sequenceContent);
                sequences.add(replacementSequence);

                CGSResource replacementResource = CGSResource.newInstance(replacementSequence);
                replacementResources.add(replacementResource);
                tocReplacementSequence = TocItemSequenceRegular.newInstance((TocItemSequenceRegular) tocItemSequence, newSeqId, replacementResource, tocItem);

            } else if (tocItemSequence instanceof TocItemSequenceDifferential) {
                TocItemSequenceDifferential tocSequenceToTransform = (TocItemSequenceDifferential) tocItemSequence;
                SequenceTransformationResult sequenceTransformationResult = transformDifferentialSequence(tocItem,
                        oldTocItemCid, destinationCourse, tocSequenceToTransform, diffLevelsMapping,
                        sourceSequences, appletsValidationResponses);
                if (sequenceTransformationResult != null) {
                    tocReplacementSequence = sequenceTransformationResult.tocItemSequence;
                    sequences.addAll(sequenceTransformationResult.sequences);
                    replacementResources.addAll(sequenceTransformationResult.resources);
                } else { // the user does not want to import any differentiated sequence
                    tocReplacementSequence = null;
                }
            } else {
                throw new UnsupportedOperationException("Unable to copy sequence of tye " + tocItemSequence.getClass());
            }
            if (tocReplacementSequence == null) { // the user does not want to import the sequence
                tocItem.getContentData().removeSequence(tocItemSequence);
            } else {
                tocItem.getContentData().replaceSequence(tocItemSequence, tocReplacementSequence, replacementResources);
            }
        }
        TocItem finalTocItem = tocItem;
        sequences = sequences.stream()
                .map(sequence -> updateSequenceParent(sequence, finalTocItem, destinationCourse, sourceCourse))
                .collect(Collectors.toList());
        return new TocItemAndSequences(tocItem, sequences);
    }

    /**
     * Get sequences for widgets content.
     * <p>
     * Widgets on book alive have content stored in sequences
     */
    private List<Sequence> getSequencesForWidgetsContent(TocItem tocItem, Course destinationCourse, List<AppletsValidationResponse> appletsValidationResponses, Map<String, Sequence> sourceSequences) {
        List<String> tocItemSequencesIds = tocItem.getContentData().getSequences()
                .stream()
                .map(TocItemSequence::getCid)
                .collect(Collectors.toList());
        List<String> tocItemResSequenceIds = tocItem.getContentData().getResources().stream()
                .filter(cgsResource -> cgsResource.getType().equals("sequence"))
                .map(cgsResource -> cgsResource.getHref().replaceAll("sequences/", ""))
                .collect(Collectors.toList());
        List<Sequence> sequences = sourceSequences.values().stream()
                .filter(sequence -> tocItemResSequenceIds.contains(sequence.getSeqId()) && !tocItemSequencesIds.contains(sequence.getSeqId()))
                .map(oldSeq -> oldSeq.copy(tocItem.getContentId(), destinationCourse.getCourseId()))
                .collect(Collectors.toList());
        sequences.forEach(sequence -> sequence
                .setContent(updateAppletsOnSequenceContent(tocItem.getContentId(),
                        sequence.getContent(),
                        appletsValidationResponses)));
        return sequences;
    }

    /**
     * Updates the parent cid of a sequence, depending on the source course and destination course "includeLo" property
     * match
     *
     * @return the updated sequence object
     */
    private Sequence updateSequenceParent(Sequence sequence, TocItem tocItem, Course destinationCourse, Course sourceCourse) {
        if (tocItem.getEntityType() == EntityType.ASSESSMENT) {
            return sequence;
        }
        if (destinationCourse.getContentData().includeLo() != sourceCourse.getContentData().includeLo()) {
            if (destinationCourse.getContentData().includeLo()) {
                String parentLoCid = tocItem.getContentData().getSequenceHolderCid(sequence.getSeqId());
                sequence.setParent(parentLoCid);
            } else {
                sequence.setParent(tocItem.getContentId());
            }
        }
        return sequence;
    }

    /**
     * @param tocItem                    toc item for which the sequence transformation is performed
     * @param oldTocItemCid              cid the toc item had before a new one was set during toc item transformation
     * @param destinationCourse          course to which the toc item is imported
     * @param tocSequenceToTransform     toc item sequence to transform
     * @param diffLevelsMapping          mapping for differentiation levels between the destination course and the old
     *                                   source course from which the toc item is imported. the map contains as keys
     *                                   the diff level ids from the destination course and as values the diff level
     *                                   ids from the source course. If the destination course has no diff levels,
     *                                   but the source course has, the map should contain only one entry, with key -1.
     *                                   if the a diff level from the destination course has no mapping, the value will
     *                                   be null, and an empty sequence will be created
     * @param sourceSequences            sequences from the source course with the actual sequence content
     * @param appletsValidationResponses applets validation result containing info for updating applets on the sequences
     * @return an object containing the transformed toc sequence, actual sequence and the resources associated to be
     * added on the toc item
     */
    private SequenceTransformationResult transformDifferentialSequence(TocItem tocItem,
                                                                       String oldTocItemCid,
                                                                       Course destinationCourse,
                                                                       TocItemSequenceDifferential tocSequenceToTransform,
                                                                       Map<Integer, Integer> diffLevelsMapping,
                                                                       Map<String, Sequence> sourceSequences,
                                                                       List<AppletsValidationResponse> appletsValidationResponses) {
        TocItemSequence tocReplacementSequence = TocItemSequenceDifferential.newInstance(tocSequenceToTransform.getTitle());
        Set<CGSResource> replacementResources = new HashSet<>();
        List<Sequence> sequences = new ArrayList<>();
        // we iterate on the diff levels on the destination course (and not on diff map keys) to make sure that all of
        // them are covered and ordered correctly
        List<Integer> destinationDiffLevels = destinationCourse.getContentData().getDifferentiation() == null
                ? Collections.singletonList(-1)
                : destinationCourse.getContentData().getDifferentiation().getLevels().stream()
                .map(DifferentiationLevel::getLevelId)
                .collect(Collectors.toList());
        for (Integer newDiffLevel : destinationDiffLevels) {
            Integer oldDiffLevel = diffLevelsMapping.get(newDiffLevel);

            if (oldDiffLevel == null && newDiffLevel == -1) {
                return null; // the user does not want to import any differentiated sequence
            } else if (oldDiffLevel == null) { // create an empty sequence for the unmapped diff level
                TocItemSequenceDifferential differentialReplacement = (TocItemSequenceDifferential) tocReplacementSequence;
                String newSeqId = UUID.randomUUID().toString();
                DifferentiationLevel diffLevel = destinationCourse.getContentData().getDifferentiation().getLevelById(newDiffLevel)
                        .orElseThrow(() -> new IllegalStateException(String.format("Differentiation level '%s' does not exist on course '%s'",
                                newDiffLevel, destinationCourse.getCourseId())));

                SequenceContent content = SequenceContent.newInstance(newSeqId, differentialReplacement.getCid(), diffLevel,
                        destinationCourse.getContentData().getDifferentiation().getDefaultLevelId());

                Sequence replacementSequence = new Sequence(newSeqId, tocItem.getContentId(), destinationCourse.getCourseId(), content);
                sequences.add(replacementSequence);

                CGSResource resource = CGSResource.newInstance(replacementSequence);
                replacementResources.add(resource);

                TocItemSequenceRegular tocItemSequenceRegular = TocItemSequenceRegular.newInstance(newSeqId, diffLevel.getName(), resource, tocItem);
                differentialReplacement.addLevelSequence(newDiffLevel, tocItemSequenceRegular);
            } else {
                TocItemSequenceRegular diffLevelSequence = tocSequenceToTransform.getSequenceByDiffLevelId(oldDiffLevel).orElseThrow(() ->
                        new IllegalArgumentException("Diff level " + oldDiffLevel + " not mapped to any sequence"));

                String newSeqId = UUID.randomUUID().toString();
                Sequence sourceSequence = sourceSequences.get(diffLevelSequence.getCid());
                String sequenceContent = updateAppletsOnSequenceContent(oldTocItemCid, sourceSequence.getContent(), appletsValidationResponses)
                        .replaceAll(sourceSequence.getSeqId(), newSeqId);
                Sequence replacementSequence = new Sequence(newSeqId, tocItem.getContentId(), destinationCourse.getCourseId(), sequenceContent);

                DifferentiationLevel diffLevel = (newDiffLevel == -1) ? null // destination course has no diff levels
                        : destinationCourse.getContentData().getDifferentiation().getLevelById(newDiffLevel)
                        .orElseThrow(() -> new IllegalStateException(String.format("Differentiation level '%s' does not exist on course '%s'",
                                newDiffLevel, destinationCourse.getCourseId())));

                String parentCid;
                if (newDiffLevel == -1) {
                    parentCid = destinationCourse.getContentData().includeLo()
                            ? tocItem.getContentData().getSequenceHolderCid(tocSequenceToTransform)
                            : tocItem.getContentId();
                } else {
                    parentCid = tocReplacementSequence.getCid();
                }
                String sequenceTitle = (diffLevel != null) ? diffLevel.getName() : tocSequenceToTransform.getTitle();
                replacementSequence.setTitleParentAndDiffLevel(sequenceTitle, parentCid,
                        diffLevel,
                        diffLevel == null ? -1 : destinationCourse.getContentData().getDifferentiation().getDefaultLevelId());

                CGSResource resource = CGSResource.newInstance(replacementSequence);
                replacementResources.add(resource);

                sequences.add(replacementSequence);

                if (diffLevel == null) { // destination course has no diff levels and this should be the only entry in the map
                    tocReplacementSequence = TocItemSequenceRegular.newInstance(diffLevelSequence, newSeqId, resource, tocItem);
                    break;
                } else {
                    TocItemSequenceDifferential differentialReplacement = (TocItemSequenceDifferential) tocReplacementSequence;
                    TocItemSequenceRegular tocItemSequenceRegular = TocItemSequenceRegular
//                            .newInstance(newSeqId, diffLevel.getName(), resource, tocItem);
                            .newInstance(diffLevelSequence, newSeqId, resource, tocItem);
                    differentialReplacement.addLevelSequence(newDiffLevel, tocItemSequenceRegular);
                }
            }
        }
        return new SequenceTransformationResult(tocReplacementSequence, sequences, replacementResources);
    }

    private static class SequenceTransformationResult {
        TocItemSequence tocItemSequence;
        List<Sequence> sequences;
        Set<CGSResource> resources;

        private SequenceTransformationResult(TocItemSequence tocItemSequence,
                                             List<Sequence> sequences,
                                             Set<CGSResource> resources) {
            this.tocItemSequence = tocItemSequence;
            this.sequences = sequences;
            this.resources = resources;
        }
    }


    /**
     * Method for updating the applets resources on a tocItem, after validation, to the version available on the course
     *
     * @param oldTocItemCid              the cid the toc item during the applets validation, which may have been changed
     *                                   during the toc item transformation
     * @param tocItem                    the tocItem on which to update the applets resources
     * @param appletsValidationResponses the response of the applets validation, containing the list of applets to be
     *                                   updated on the tocItem
     * @return the tocItem with the updated applets resources
     */
    private TocItem updateAppletsOnTocItem(String oldTocItemCid,
                                           TocItem tocItem,
                                           List<AppletsValidationResponse> appletsValidationResponses) {
        appletsValidationResponses
                .forEach(appletsValidationResponse -> {
                    if (appletsValidationResponse.tocItemCid.equals(oldTocItemCid)
                            && appletsValidationResponse.appletsToBeUpdatedOnTocItem.size() > 0) {
                        appletsValidationResponse.appletsToBeUpdatedOnTocItem
                                .forEach(appletReference -> {
                                    tocItem.getAppletsResources()
                                            .forEach(appletResource -> {
                                                if (appletResource.getGuid().equals(appletReference.guid)) {
                                                    CGSResource oldResource = appletResource.getResource();
                                                    // we remove the old resource from the tocItem and add a new one
                                                    tocItem.getContentData().getResources().remove(oldResource);
                                                    tocItem.getContentData().getResources()
                                                            .add(AppletResource.newCGSResource(oldResource, appletReference.newVersion));
                                                }
                                            });
                                });
                    }
                });
        return tocItem;
    }

    private String updateAppletsOnSequenceContent(String tocItemCid, String sequenceContent,
                                                  List<AppletsValidationResponse> appletsValidationResponses) {
        StrBuilder stringBuilder = new StrBuilder(sequenceContent);
        appletsValidationResponses
                .forEach(appletsValidationResponse -> {
                    if (appletsValidationResponse.tocItemCid.equals(tocItemCid)
                            && appletsValidationResponse.appletsToBeUpdatedOnTocItem.size() > 0) {
                        appletsValidationResponse.appletsToBeUpdatedOnTocItem
                                .forEach(appletReference -> {
                                    stringBuilder
                                            .replaceAll(
                                                    appletReference.guid + "/" + appletReference.oldVersion,
                                                    appletReference.guid + "/" + appletReference.newVersion)
                                            .replaceAll(
                                                    appletReference.guid + "&#x2F;" + appletReference.oldVersion,
                                                    appletReference.guid + "&#x2F;" + appletReference.newVersion);
                                });
                    }
                });
        return stringBuilder.toString();
    }

    /**
     * Method for adding applets on a course, after validation, to the version available on the course
     *
     * @param publisherId
     * @param jobId                      ID of the job tracking the toc items import progress
     * @param destinationCourseId
     * @param appletsValidationResponses
     * @return {@code TRUE} if all applets were successfully added on course, {@code FALSE} otherwise
     */
    private boolean addAppletsOnCourse(int publisherId, String jobId, String destinationCourseId,
                                       List<AppletsValidationResponse> appletsValidationResponses,
                                       LockUser user) {
        Set<AppletReference> appletsToAddOnCourse = appletsValidationResponses.stream()
                .flatMap(appletsValidationResponse -> appletsValidationResponse.appletsToAddOnCourse.stream())
                .collect(Collectors.toSet());
        for (AppletReference applet : appletsToAddOnCourse) {
            try {
                logger.debug(String.format("Adding applet '%s' to course '%s'", applet.name, destinationCourseId));
                appletService.addApplet(publisherId, destinationCourseId, applet.guid, user);
            } catch (Exception e) {
                String errMsg = String.format("Error adding applet '%s' with guid '%s' to course '%s' on publisher %s",
                        applet.name, applet.guid, destinationCourseId, publisherId);
                logger.error(errMsg, e);
                // todo rollback already saved applets
                return false;
            }
        }
        return true;
    }

    @Override
    public void copyAssets(int publisherId, String destinationCid, String sourceCid, List<String> pathsList) throws DsException {
        /**
         * initializations
         */

        // if the source course == destination course,
        // then there is no point in trying to copy the files to the same place they already exist.
        if (destinationCid.equals(sourceCid)) {
            logger.debug(String.format("Source & destination courses %s are the same, under publisher %d . Aborting copy assets process.", sourceCid, publisherId));
            return;
        }

        String cmsLocation = cmsService.getCmsLocation();
        //Importing is done within the same publisher

        String sourceCoursePath = cmsLocation + "/publishers/" + publisherId + "/courses/" + sourceCid;
        String destinationCoursePath = cmsLocation + "/publishers/" + publisherId + "/courses/" + destinationCid;
        List<String> missingPaths = new ArrayList<>();
        List<String> tmpPathsList = new ArrayList<>();
        try {
            for (String filePath : pathsList) {
                String sourceFullPath = sourceCoursePath + "/" + filePath;
                logger.debug("sourceFullPath = " + sourceFullPath);
                if (!fileDao.fileExists(sourceFullPath)) {
                    missingPaths.add(filePath);
                    logger.debug("sourceFullPath = " + sourceFullPath + " is missing");
                }
            }

            if (missingPaths.size() != 0) {
                logger.error(String.format("Error copying a lesson from course: %s to course %s. publisherID: %d missingPaths.size() != 0", sourceCid, destinationCid, publisherId));
                throw new ResourceNotFoundException(String.format("course: %s files: %s", sourceCid, missingPaths.toString()),
                        String.format("some files don't exist in course %s", sourceCid));
            }

            /**
             * copying
             */
            //first, don't copy assets that the destination course already have - delete those from the list.
            logger.debug("check what exists");

            for (String filePath : pathsList) {
                String destinationFullPath = destinationCoursePath + "/" + filePath;
                logger.debug("destinationFullPath = " + destinationFullPath);
                if (!fileDao.fileExists(destinationFullPath)) {
                    tmpPathsList.add(filePath); // the file doesn't exist on the destination copy, it needs to be copieds
                }
            }

        } catch (Exception e) {
            // Some of the files were not found. cannot proceed.
            String message = String.format("Error copying a lesson from course: %s to course %s. publisherID: %d.\nMissing files: %s", sourceCid, destinationCid, publisherId, Arrays.toString(missingPaths.toArray()));
            logger.error(message, e);
            throw new DsException(e);
        }

        try {
            //copy the non existing assets from source to destination
            for (String filePath : tmpPathsList) {
                String sourceFullPath = sourceCoursePath + "/" + filePath;
                String destinationFullPath = destinationCoursePath + "/" + filePath;
                fileDao.copy(sourceFullPath, destinationFullPath);
            }
        } catch (Exception e) {
            //rollback - delete all files that were created before
            for (String filePath : tmpPathsList) {
                fileDao.deleteFileIfExists(destinationCoursePath + "/" + filePath);
            }
            logger.error(String.format("Error copying files from %s to %s", sourceCoursePath, destinationCoursePath), e);
            throw new DsException(e);
        }
    }

    /**
     * Helper response object following applets validation on toc item import.
     */
    private static class AppletsValidationResponse {
        /**
         * ID (cid) of the toc item for which the validation was performed
         */
        String tocItemCid;
        /**
         * IDs (guid) of the applets that were found on the toc item, but are missing on the GCR catalog - error
         */
        List<AppletReference> appletsMissingInCatalog = new ArrayList<>();
        /**
         * IDs (guid) of the applets that should be updated on the course before retrying the import process
         */
        List<AppletReference> appletsToBeUpdatedOnCourse = new ArrayList<>();
        /**
         * IDs (guid) of the applets that will be added on the course during import process
         */
        List<AppletReference> appletsToAddOnCourse = new ArrayList<>();
        /**
         * IDs (guid) of the applets that will be updated on the toc item during the import process to the latest version
         */
        List<AppletReference> appletsToBeUpdatedOnTocItem = new ArrayList<>();

        AppletsValidationResponse(String tocItemCid) {
            this.tocItemCid = tocItemCid;
        }

        private static TocItemValidationResponse newTocItemValidationResponse(TocItem tocItem, AppletsValidationResponse appletsValidationResponse) {
            TocItemValidationResponse tocItemValidationResponse = new TocItemValidationResponse(tocItem);
            if (appletsValidationResponse.appletsMissingInCatalog.size() > 0) {
                List<String> errors = appletsValidationResponse.appletsMissingInCatalog.stream()
                        .map(appletReference -> String.format("Applet with guid '%s' does not exist in catalog", appletReference.guid))
                        .distinct()
                        .collect(Collectors.toList());
                tocItemValidationResponse.addErrors(errors);
            }
            if (appletsValidationResponse.appletsToBeUpdatedOnCourse.size() > 0) {
                List<String> errors = appletsValidationResponse.appletsToBeUpdatedOnCourse.stream()
                        .map(appletReference -> String.format("Update applet '%s' on course to the latest version before import", appletReference.name))
                        .distinct()
                        .collect(Collectors.toList());
                tocItemValidationResponse.addErrors(errors);
            }
            if (appletsValidationResponse.appletsToAddOnCourse.size() > 0) {
                List<String> warnings = appletsValidationResponse.appletsToAddOnCourse.stream()
                        .map(appletReference -> String.format("Applet '%s' will be added to course", appletReference.name))
                        .distinct()
                        .collect(Collectors.toList());
                tocItemValidationResponse.addWarnings(warnings);
            }
            if (appletsValidationResponse.appletsToBeUpdatedOnTocItem.size() > 0) {
                List<String> warnings = appletsValidationResponse.appletsToBeUpdatedOnTocItem.stream()
                        .map(appletReference -> String.format("Applet '%s' will be updated on %s", appletReference.name, tocItem.getEntityType()))
                        .distinct()
                        .collect(Collectors.toList());
                tocItemValidationResponse.addWarnings(warnings);
            }
            return tocItemValidationResponse;
        }
    }

    /**
     * Helper object to hold info about applets during the applets validation process
     */
    private static class AppletReference {
        String guid;
        String name;
        /**
         * existing, validated version of the applet
         */
        String oldVersion;
        /**
         * new version of the applet, in case an update is needed
         */
        String newVersion;

        AppletReference(String guid, String name) {
            this.guid = guid;
            this.name = name;
        }

        @Override
        public boolean equals(Object obj) {
            if (obj == null) {
                return false;
            }
            if (obj == this) {
                return true;
            }
            if (obj.getClass() != getClass()) {
                return false;
            }
            AppletReference other = (AppletReference) obj;
            return this.guid.equals(other.guid) && this.name.equals(other.name);
        }

        @Override
        public int hashCode() {
            int result = 17;
            result = 31 * result + this.guid.hashCode();
            result = 31 * result + this.name.hashCode();
            return result;
        }
    }

    private static class TocItemAndSequences {
        TocItem tocItem;
        List<Sequence> sequences;

        public TocItemAndSequences(TocItem tocItem,
                                   List<Sequence> sequences) {
            this.tocItem = tocItem;
            this.sequences = sequences;
        }
    }

    private static class ImportItemsHolder {
        String sourceCourseId;
        List<TocItemAndSequences> tocItemAndSequences;
        List<AppletsValidationResponse> appletsValidationResponses;
        List<String> eBooksIds;
        List<String> resourcesToCopy;

        ImportItemsHolder(String sourceCourseId,
                          List<TocItemAndSequences> tocItemAndSequences,
                          List<AppletsValidationResponse> appletsValidationResponses,
                          List<String> eBooksIds,
                          List<String> resourcesToCopy) {
            this.sourceCourseId = sourceCourseId;
            this.tocItemAndSequences = tocItemAndSequences;
            this.appletsValidationResponses = appletsValidationResponses;
            this.eBooksIds = eBooksIds;
            this.resourcesToCopy = resourcesToCopy;
        }
    }
}
