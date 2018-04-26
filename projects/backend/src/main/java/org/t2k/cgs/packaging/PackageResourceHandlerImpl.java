package org.t2k.cgs.packaging;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import org.t2k.cgs.course.CourseDataService;
import org.t2k.cgs.dao.courses.CoursesDao;
import org.t2k.cgs.dao.tocItem.TocItemDao;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.dataServices.exceptions.ResourceNotFoundException;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.model.packaging.PackagingLocalContext;
import org.t2k.cgs.model.publishing.PublishError;
import org.t2k.cgs.model.publishing.PublishErrors;
import org.t2k.cgs.model.sequence.Sequence;
import org.t2k.cgs.model.tocItem.Format;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.sequences.SequenceService;
import org.t2k.cgs.tocItem.TocItemDataService;
import org.t2k.cgs.validation.ContentItemValidation;
import org.t2k.sample.dao.exceptions.DaoException;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 10/09/14
 * Time: 15:53
 */
@Service
@Scope("prototype")
public class PackageResourceHandlerImpl implements PackageResourceHandler {

    private static Logger logger = Logger.getLogger(PackageResourceHandlerImpl.class);

    public static final String COURSE_MISSING_RESOURCE_TEMPLATE = "Course \"%s\" [%s] is missing resources.";

    @Autowired
    private PackagingService packagingService;

    @Autowired
    private CourseDataService courseDataService;

    @Autowired
    private TocItemDao lessonsDao;

    @Autowired
    private TocItemDao assessmentsDao;

    @Autowired
    private SequenceService sequenceService;

    @Autowired
    private Configuration configuration;

    @Autowired
    private CoursesDao coursesDao;

    @Autowired
    private ContentItemValidation contentItemValidation;

    @Autowired
    @Qualifier("lessonsDataServiceBean")
    private TocItemDataService tocItemDataService;

    @Autowired
    private PackageStepsUpdater packageStepsUpdater;

    private final String UNKNOWN = "Unknown";

    private boolean isCanceled;
    private int logConstant = 200;
    private ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Create a working directory for this package
     *
     * @param cgsPackage
     * @throws java.io.IOException
     */
    private void applyPackageOutputLocation(CGSPackage cgsPackage) {
        logger.info(String.format("applyPackageOutputLocation. courseId :%s", cgsPackage.getCourseId()));

        String cmsPublisherCourseHome = String.format("%s/publishers/%d/courses/%s", configuration.getProperty("cmsHome"), cgsPackage.getPublisherId(), cgsPackage.getCourseId());
        cgsPackage.setCmsPublisherHomeLocation(cmsPublisherCourseHome);
        String outDir = configuration.getProperty("packagedOutputLocation");
        String packBaseDir = String.format("%s/resources/%s", outDir, cgsPackage.getPackId());
        File tempDir = new File(packBaseDir);
        if (!tempDir.exists()) {
            logger.info(String.format("creating directory: %s", packBaseDir));
            tempDir.mkdirs();
        }

        PackagingLocalContext packagingLocalContext = new PackagingLocalContext(packBaseDir);
        logger.debug("Created for "+cgsPackage+"\n packagingLocalContext : "+packagingLocalContext);
        File sequencesDir = new File(packagingLocalContext.getSequencesPath());
        if (!sequencesDir.exists()) {
            logger.info(String.format("creating directory: %s", sequencesDir));
            sequencesDir.mkdirs();
        }

        File lessonsDir = new File(packagingLocalContext.getLessonsPath());
        if (!lessonsDir.exists()) {
            logger.info(String.format("creating directory: %s", lessonsDir));
            lessonsDir.mkdirs();
        }

        File assessmentsDir = new File(packagingLocalContext.getAssessmentsPath());
        if (!assessmentsDir.exists()) {
            logger.info(String.format("creating directory: %s", assessmentsDir));
            assessmentsDir.mkdirs();
        }

        cgsPackage.setLocalResourcesLocation(packagingLocalContext);
    }

    /**
     * Allocates a working directory and Copies the necessary resources into it
     *
     * @param cgsPackage
     * @throws IOException
     * @throws org.t2k.cgs.dataServices.exceptions.DsException
     */
    public void copyCourseResourcesForPublish(CGSPackage cgsPackage) throws Exception {
        logger.info(String.format("copyCourseResourcesForPublish. packId: %s", cgsPackage.getPackId()));

        try {
            packageStepsUpdater.changePackagePhaseToInProgressPreparation(cgsPackage, 0);
            applyPackageOutputLocation(cgsPackage);
            if (isCanceled)
                return;

            packageStepsUpdater.changePackagePhaseToInProgressPreparation(cgsPackage, 5);
            validateAndCopyCourseResourcesToTempLocation(cgsPackage);
        } catch (Exception e) {
            logger.error(String.format("Validation and copy of resources failed for packageId; %s, courseId: %s", cgsPackage.getPackId(),cgsPackage.getCourseId()), e);
            File tempFilesPath = new File(cgsPackage.getPackageOutputLocation());
            File localResourceLocation = new File(cgsPackage.getLocalResourcesLocation().getBasePath());
            try {
                String message = String.format("Failed to copy CGS toc items for packageId; %s, courseId: %s", cgsPackage.getPackId(),cgsPackage.getCourseId());
                logger.error(message, e);
                if (tempFilesPath.exists()) {
                    FileUtils.forceDelete(tempFilesPath);
                }
                if (localResourceLocation.exists()){
                    FileUtils.forceDelete(localResourceLocation);
                }
                if (e.getMessage() == null){ //handling a case that a null pointer exception was thrown, and its message property is null.
                                            //in that case - we want the user to have some kind of indication of what happened.
                    throw new Exception(message,e);
                }
                throw e;
            } catch (IOException ex) {
                logger.error(String.format("Failed to delete CGS package %s directory from %s", cgsPackage.getPackId(), cgsPackage.getCmsPublisherHomeLocation()), ex);
                throw ex;
            }
        }
    }

    private void validateAndCopyCourseResourcesToTempLocation(CGSPackage cgsPackage) throws DsException, DaoException {
        logger.debug(String.format("validateAndCopyCourseResourcesToTempLocation: packId: %s", cgsPackage.getPackId()));

        List<String> tocItemsIds;
        HashMap<String, EntityType> tocItems = new HashMap<>();
        try {
            List<String> selectedTocItemsIds = cgsPackage.getScormSelectedTocItemsIds(); // The selected toc items not including the hidden toc items they depend on.
            if (!selectedTocItemsIds.isEmpty()) { // Toc items were selected - find any hidden toc items they depend on and add them to the list of toc items.
                logger.info(String.format("Getting hidden toc items for selected toc items, in  course: %s", cgsPackage.getCourseId()));
                List<String> hiddenTocItemsIds = tocItemDataService.getHiddenTocItemsIdsOfSelectedTocItems(cgsPackage.getCourseId(), selectedTocItemsIds);

                // Add the toc items ids to the tocItems hash-map and define its type
                for (String selectedTocItemsId : selectedTocItemsIds) {
                    tocItems.put(selectedTocItemsId, EntityType.TOC_ITEM); // We can't Know whether this is a lesson or an assessment
                }
                if (isCanceled()) {
                    logger.debug(String.format("validateAndCopyCourseResourcesToTempLocation: The publish process has been cancelled. packageId: %s", cgsPackage.getPackId()));
                    return;
                }

                for (String hiddenTocItemId : hiddenTocItemsIds) {
                    tocItems.put(hiddenTocItemId, EntityType.LESSON); // Only lessons can be hidden
                }
                if (isCanceled()) {
                    logger.debug(String.format("validateAndCopyCourseResourcesToTempLocation: The publish process has been cancelled. packageId: %s", cgsPackage.getPackId()));
                    return;
                }

                // Add the hidden toc items to the selected items and remove them from the exclude list
                cgsPackage.addHiddenTocItemsToScormSelectedTocItems(hiddenTocItemsIds);
                cgsPackage.getScormExcludeTocItemsIds().removeAll(hiddenTocItemsIds);
                logger.debug(String.format("validateAndCopyCourseResourcesToTempLocation: packId %s set its selected and excluded toc items.", cgsPackage.getPackId()));
            } else { // No toc items were selected - find all toc items for this course
                logger.debug(String.format("Getting all toc items for course %s.", cgsPackage.getCourseId()));
                tocItems = courseDataService.getAllTocItemCIdsAndEntityTypeFromCourse(cgsPackage.getPublisherId(), cgsPackage.getCourseId());
            }
        } catch (DsException e) {
            logger.error(String.format("Error while trying to get toc items of packageId: %s, courseId %s", cgsPackage.getPackId(),cgsPackage.getCourseId()), e);
            throw new DsException(e);
        }
        tocItemsIds = new ArrayList<>(tocItems.keySet());

        List<PublishError> errors = new ArrayList<>();
        HashMap<String, List<String>> sequencesIdsPerTocItemId = new HashMap<>();
        HashMap<String, EntityType> tocItemsFound = new HashMap<>();
        HashMap<String, EntityType> missingTocItems;
        List<TocItemCGSObject> allTocItems = new ArrayList<>();
        Set<String> eBooksIds = new HashSet<>();
        int numberOfLessonsCopied = 0;
        int numberOfAssessmentsCopied = 0;

        // Handle lessons
        try {
            logger.debug(String.format("validateAndCopyCourseResourcesToTempLocation: About to save lessons to lessons directory: %s", cgsPackage.getLocalResourcesLocation().getLessonsPath()));
            DBCursor dbCursor = lessonsDao.getCursor(tocItemsIds, cgsPackage.getCourseId());
            while (dbCursor != null && dbCursor.hasNext()) {
                if (isCanceled()) {
                    logger.debug(String.format("validateAndCopyCourseResourcesToTempLocation: The publish process has been cancelled. packageId: %s", cgsPackage.getPackId()));
                    return;
                }

                DBObject next = dbCursor.next();
                TocItemCGSObject lessonCGSObject = new TocItemCGSObject(next);
                allTocItems.add(lessonCGSObject); // Add lesson objects to lessons list
                tocItemsFound.put(lessonCGSObject.getContentId(), EntityType.LESSON);
                sequencesIdsPerTocItemId.put(lessonCGSObject.getContentId(), tocItemDataService.getSequencesListFromResource(lessonCGSObject.getContentData())); // We'll use it later to check if all sequences exist
                File file = new File(cgsPackage.getLocalResourcesLocation().getLessonsPath(), lessonCGSObject.getContentId());
                FileUtils.writeStringToFile(file, lessonCGSObject.serializeContentData(), "UTF-8");
                numberOfLessonsCopied++;

                String format = lessonCGSObject.getContentData().get("format").toString();
                if (format.equals(Format.EBOOK.name()) && lessonCGSObject.getContentData().containsField("eBooks")) {
                    logger.debug(String.format("validateAndCopyCourseResourcesToTempLocation: getting the eBooksIds from lesson %s.", lessonCGSObject.getContentId()));
                    DBObject eBooks = (DBObject) lessonCGSObject.getContentData().get("eBooks");
                    for (String eBookId : eBooks.keySet()) {
                        eBooksIds.add(eBookId);
                    }
                }
            }
            logger.debug(String.format("validateAndCopyCourseResourcesToTempLocation: %d lessons were copied.", numberOfLessonsCopied));
        } catch (Exception e) {
            logger.error("validateAndCopyCourseResourcesToTempLocation: error while copying lessons from db to FS", e);
            throw new DsException(e);
        }

        // Handle EBooks
        if (!eBooksIds.isEmpty()) {
            File eBooksDir = new File(cgsPackage.getLocalResourcesLocation().getEBooksPath());
            if (!eBooksDir.exists()) {
                logger.info(String.format("creating directory: %s", eBooksDir));
                eBooksDir.mkdirs();
            }

            String publisherEBooksDir = String.format("%sebooks", cgsPackage.getCmsPublisherHomeLocation().replaceAll("courses.*", "")); // remove the courses folder from path
            for (String eBookId : eBooksIds) {
                File eBookDir = new File(publisherEBooksDir, eBookId);
                if (!eBookDir.exists()) {
                    logger.error(String.format("Validation error. Missing resource: ebooks/%s", eBookId));
                    errors.add(new PublishError(PublishErrors.MissingAssetReference, eBookId, String.format("Asset is missing at path: ebooks/%s", eBookId)));
                }
            }
        }

        packageStepsUpdater.changePackagePhaseToInProgressPreparation(cgsPackage, 20);

        // Handle assessments
        try {
            logger.debug(String.format("validateAndCopyCourseResourcesToTempLocation: About to save assessments to assessments directory: %s", cgsPackage.getLocalResourcesLocation().getAssessmentsPath()));
            DBCursor dbCursor = assessmentsDao.getCursor(tocItemsIds, cgsPackage.getCourseId());
            while (dbCursor != null && dbCursor.hasNext()) {
                if (isCanceled()) {
                    logger.debug(String.format("validateAndCopyCourseResourcesToTempLocation: The publish process has been cancelled. packageId: %s", cgsPackage.getPackId()));
                    return;
                }

                DBObject next = dbCursor.next();
                TocItemCGSObject assessmentCGSObject = new TocItemCGSObject(next);
                allTocItems.add(assessmentCGSObject); // Add assessment objects to assessments list
                tocItemsFound.put(assessmentCGSObject.getContentId(), EntityType.ASSESSMENT);
                sequencesIdsPerTocItemId.put(assessmentCGSObject.getContentId(), tocItemDataService.getSequencesListFromResource(assessmentCGSObject.getContentData())); // We'll use it later to check if all sequences exist
                File file = new File(cgsPackage.getLocalResourcesLocation().getAssessmentsPath() + "/" + assessmentCGSObject.getContentId());
                FileUtils.writeStringToFile(file, assessmentCGSObject.serializeContentData(), "UTF-8");
                numberOfAssessmentsCopied++;
            }
            logger.debug(String.format("validateAndCopyCourseResourcesToTempLocation: %d assessments were copied.", numberOfAssessmentsCopied));
        } catch (Exception e) {
            logger.error("validateAndCopyCourseResourcesToTempLocation: error while copying assessments from db to FS", e);
            throw new DsException(e);
        }

        packageStepsUpdater.changePackagePhaseToInProgressPreparation(cgsPackage, 35);

        // Handle missing lessons/assessments
        missingTocItems = findMissingTocItems(tocItems, tocItemsFound);
        if (!missingTocItems.isEmpty()) {
            logger.error(String.format("validateAndCopyCourseResourcesToTempLocation: Missing toc items were found in course %s: %s", cgsPackage.getCourseId(), missingTocItems.keySet()));
            for (Map.Entry<String, EntityType> missingTocItem : missingTocItems.entrySet()) {
                switch (missingTocItem.getValue()) {
                    case LESSON:
                        errors.add(new PublishError(PublishErrors.MissingLessonReference, missingTocItem.getKey(), UNKNOWN));
                        break;
                    case ASSESSMENT:
                        errors.add(new PublishError(PublishErrors.MissingAssessmentReference, missingTocItem.getKey(), UNKNOWN));
                        break;
                }
            }
        }

        validateAndCopySequencesToTempLocation(cgsPackage, sequencesIdsPerTocItemId, errors);
        if (isCanceled()) {
            return;
        }

        packageStepsUpdater.changePackagePhaseToInProgressPreparation(cgsPackage, 70);
        validateCourseAndTocItemsAssets(cgsPackage, allTocItems, errors);
        if (isCanceled()) {
            return;
        }

        packageStepsUpdater.changePackagePhaseToInProgressPreparation(cgsPackage, 100);
        if (!errors.isEmpty()) {
            cgsPackage.addErrors(errors);
            packagingService.saveCGSPackage(cgsPackage);
            String errorMsg = String.format(COURSE_MISSING_RESOURCE_TEMPLATE, cgsPackage.getCourseTitle(), cgsPackage.getCourseId());
            logger.error(errorMsg);
            throw new ResourceNotFoundException(errors.toString(), errorMsg);
        }
    }

    private void validateCourseAndTocItemsAssets(CGSPackage cgsPackage, List<TocItemCGSObject> allTocItems, List<PublishError> errors) throws DaoException {
        int publisherId = cgsPackage.getPublisherId();
        String courseId = cgsPackage.getCourseId();
        String cmsPublisherHomeDirectory = cgsPackage.getCmsPublisherHomeLocation(); // base path in file system

        CourseCGSObject course = coursesDao.getCourse(publisherId, courseId, null, false); // get course object
        contentItemValidation.doAllAssetsExistOnFileSystem(course, errors, cmsPublisherHomeDirectory); // validate course's assets

        for (TocItemCGSObject tocItem : allTocItems) {
            if (isCanceled()) {
                logger.debug("validateCourseAndTocItemsAssets: The publish process has been cancelled. packageId: " + cgsPackage.getPackId());
                return;
            }

            contentItemValidation.doAllAssetsExistOnFileSystem(tocItem, errors, cmsPublisherHomeDirectory); // validate each toc item's assets
        }
    }

    /**
     * Copying all sequences of the given lessons from DB to a tmp location as files.
     *
     * @param cgsPackage
     * @param sequencesIdsPerTocItemId
     * @throws DsException
     */
    private void validateAndCopySequencesToTempLocation(CGSPackage cgsPackage, HashMap<String, List<String>> sequencesIdsPerTocItemId, List<PublishError> errors) throws DsException {
        List<String> sequencesFound = new ArrayList<>();
        List<String> sequencesIds = new ArrayList<>();
        List<String> missingSequences;
        int numberOfSequencesCopied = 0;

        try {
            logger.debug(String.format("validateAndCopySequencesToTempLocation: About to save sequences to sequences directory: %s", cgsPackage.getLocalResourcesLocation().getSequencesPath()));
            for (Map.Entry<String, List<String>> entry : sequencesIdsPerTocItemId.entrySet()) {
                sequencesIds.addAll(entry.getValue()); // collect all the ids we want to find to compare later to those we'll actually find
                DBCursor dbCursor = sequenceService.getSequencesCursorBySequencesIdsLessonCIdAndCourseId(entry.getValue(), entry.getKey(), cgsPackage.getCourseId());
                while (dbCursor.hasNext()) {
                    if (isCanceled()) {
                        logger.debug("validateAndCopySequencesToTempLocation: The publish process has been cancelled. packageId: " + cgsPackage.getPackId());
                        return;
                    }

                    DBObject next = dbCursor.next();
                    String seqContent = (String) next.get(Sequence.DB_CONTENT_KEY);
                    String seqId = (String) next.get(Sequence.DB_SEQ_ID_KEY);
                    String seqContentToSave = getSequenceConvertedContent(seqId, seqContent);
                    sequencesFound.add(seqId);
                    File file = new File(cgsPackage.getLocalResourcesLocation().getSequencesPath() + seqId);
                    FileUtils.writeStringToFile(file, seqContentToSave, "UTF-8");
                    numberOfSequencesCopied++;
                    if (numberOfSequencesCopied % logConstant == 0) {
                        logger.info(String.format("validateAndCopySequencesToTempLocation: validated and copied %d sequences so far.", numberOfSequencesCopied));
                    }
                }
            }
            logger.debug(String.format("validateAndCopyCourseResourcesToTempLocation: %d sequences were copied.", numberOfSequencesCopied));
        } catch (Exception e) {
            logger.error("validateAndCopySequencesToTempLocation: error while copying sequences from db to FS", e);
            throw new DsException(e);
        }

        // Handle missing sequences
        missingSequences = findMissingItemsBetweenFirstAndSecondCollections(sequencesIds, sequencesFound);
        if (!missingSequences.isEmpty()) {
            logger.error(String.format("validateAndCopySequencesToTempLocation: %d Missing sequences were found in course %s: %s", missingSequences.size(), cgsPackage.getCourseId(), missingSequences));
            for (String missingSequence : missingSequences) {
                errors.add(new PublishError(PublishErrors.MissingSequenceReference, missingSequence, String.format("Missing sequence was found in course %s, courseId: %s", cgsPackage.getCourseTitle(), cgsPackage.getCourseId())));
            }
        }
    }

    /**
     * Returns only the sequence object from the sequence content.
     * the method parses the content and looks for the field Name ="seqName"
     * this object has to have a type of  value "sequence".
     *
     * @param seqId
     * @param seqContent
     * @return a string represents the sequence object node in the whole sequence content
     * @throws Exception
     */
    private String getSequenceConvertedContent(String seqId, String seqContent) throws Exception {
        JsonNode sequenceNode = objectMapper.readTree(seqContent);
        Iterator<Map.Entry<String, JsonNode>> fields = sequenceNode.fields();

        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> next = fields.next();
            if (!next.getKey().equals(seqId)) {
                fields.remove();
            }
        }
        JsonNode jsonNode = sequenceNode.get(seqId);
        if (jsonNode == null) {
            throw new Exception(String.format("getSequenceConvertedContent: could not find a sequence node , or type sequence .id =%s", seqId));
        }

        if (jsonNode.has("parent")){ // fixing bug: http://jira.timetoknow.com/browse/CREATE-2863, removing parent ID from the sequence JSON. needed for Teach's burned sequence
            ObjectNode changableJsonNode = (ObjectNode) jsonNode;
            changableJsonNode.remove("parent");
        }

        return sequenceNode.toString();
    }

    private List<String> findMissingItemsBetweenFirstAndSecondCollections(List<String> expectedTocItemsIds, List<String> tocItemsFound) {
        logger.debug("findMissingItemsBetweenFirstAndSecondCollections: Searching for missing toc items");

        // Get a list of all the missing toc items ids
        List<String> missingTocItemsIds = new ArrayList<>(expectedTocItemsIds);
        missingTocItemsIds.removeAll(tocItemsFound);

        return missingTocItemsIds;
    }

    private HashMap<String, EntityType> findMissingTocItems(HashMap<String, EntityType> expectedTocItemsIds, HashMap<String, EntityType> tocItemsFound) {
        logger.info("findMissingItemsBetweenFirstAndSecondCollections: Searching for missing toc items");

        // Get a list of all the missing toc items ids
        List<String> missingTocItemsIds = new ArrayList<>(expectedTocItemsIds.keySet());
        missingTocItemsIds.removeAll(tocItemsFound.keySet());

        // Build a hashmap of all the missing toc items with their type
        HashMap<String, EntityType> missingTocItems = new HashMap<>();
        for (String missingTocItemsId : missingTocItemsIds) {
            missingTocItems.put(missingTocItemsId, expectedTocItemsIds.get(expectedTocItemsIds));
        }
        if (missingTocItems.size() != 0) {
        logger.error(String.format("findMissingItemsBetweenFirstAndSecondCollections: %d Missing toc items",missingTocItems.size()));
        } else {
            logger.info("findMissingItemsBetweenFirstAndSecondCollections: all toc items were found");
        }
        return missingTocItems;
    }

    public boolean isCanceled() {
        return isCanceled;
}

    public void setCanceled(boolean isCanceled) {
        this.isCanceled = isCanceled;
    }
}