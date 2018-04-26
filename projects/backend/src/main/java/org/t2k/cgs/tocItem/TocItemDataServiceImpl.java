package org.t2k.cgs.tocItem;

import com.mongodb.BasicDBList;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonNode;
import org.springframework.util.Assert;
import org.t2k.cgs.dao.cleanups.CleanupsDao;
import org.t2k.cgs.dao.tocItem.TocItemDao;
import org.t2k.cgs.dataServices.exceptions.*;
import org.t2k.cgs.lock.LockService;
import org.t2k.cgs.lock.TransactionService;
import org.t2k.cgs.locks.LockUser;
import org.t2k.cgs.locks.Transaction;
import org.t2k.cgs.model.ContentItem;
import org.t2k.cgs.model.ContentItemBase;
import org.t2k.cgs.model.Header;
import org.t2k.cgs.model.cleanup.CleanupJob;
import org.t2k.cgs.model.packaging.PackagingLocalContext;
import org.t2k.cgs.model.sequence.Sequence;
import org.t2k.cgs.model.tocItem.TocItem;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.model.tocItem.TocItemContentData;
import org.t2k.cgs.model.tocItem.TocItemIndicationForScorm;
import org.t2k.cgs.model.utils.ContentValidator;
import org.t2k.cgs.packaging.ContentParseUtil;
import org.t2k.cgs.sequences.SequenceService;
import org.t2k.cgs.tocItem.tocimport.TocItemDataServiceConfiguration;
import org.t2k.sample.dao.exceptions.DaoException;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Instances of this class are created in {@link TocItemDataServiceConfiguration}
 */
public class TocItemDataServiceImpl implements TocItemDataService {

    private static Logger logger = Logger.getLogger(TocItemDataService.class);

    private TocItemDao tocItemDao;
    private SequenceService sequenceService;
    private CleanupsDao cleanupsDao;
    private LockService lockService;
    private TransactionService transactionService;
    private ContentValidator contentValidator;

    public static final String RESOURCE_PERFIX = "resource_";

    public TocItemDataServiceImpl(TocItemDao tocItemDao,
                                  SequenceService sequenceService,
                                  CleanupsDao cleanupsDao,
                                  LockService lockService,
                                  TransactionService transactionService,
                                  ContentValidator contentValidator) {
        Assert.notNull(tocItemDao);
        Assert.notNull(sequenceService);
        Assert.notNull(cleanupsDao);
        Assert.notNull(lockService);
        Assert.notNull(transactionService);
        Assert.notNull(contentValidator);

        this.tocItemDao = tocItemDao;
        this.sequenceService = sequenceService;
        this.cleanupsDao = cleanupsDao;
        this.lockService = lockService;
        this.transactionService = transactionService;
        this.contentValidator = contentValidator;
    }

    @Override
    public TocItemCGSObject get(int publisherId, String tocItemCid, String courseId, Date lastModified, boolean isPropertiesOnly) throws DsException {
        try {
            TocItemCGSObject tocItem = tocItemDao.get(publisherId, tocItemCid, courseId, null, isPropertiesOnly);

            if (tocItem == null) {
                throw new ResourceNotFoundException(tocItemCid, String.format("can't find tocItemId %s for course %s on publisher %s",
                        tocItemCid, courseId, publisherId));
            }
            //return null if tocItemId has the same date
            if (lastModified != null && tocItem.getLastModified().equals(lastModified)) {
                return null;
            }
            return tocItem;
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public TocItemCGSObject get(String id, boolean isPropertiesOnly) throws DsException {
        try {
            return tocItemDao.get(id, isPropertiesOnly);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public TocItem get(int publisherId, String tocItemCid, String courseId) {
        return tocItemDao.get(publisherId, tocItemCid, courseId);
    }

    public void save(TocItemCGSObject tocItemCGSObject, LockUser cgsUserDetails) throws DsException, IOException {
        save(TocItem.newInstance(tocItemCGSObject), cgsUserDetails);
    }

    @Override
    public TocItem save(TocItem tocItem, LockUser cgsUserDetails) throws DsException {
        // block action if there is a transaction on this course (being published)
        TocItemContentData tocItemContentData = tocItem.getContentData();
        if (transactionService.doesCourseHaveTransactions(tocItem.getCourseId())) {
            List<Transaction> courseTransactions = transactionService.getTransactionForCourse(tocItem.getCourseId());
            String m = String.format("Element '%s' (%s) cannot be save, because its course (%s) is being published by %s.", tocItemContentData.getTitle(), tocItem.getId(), tocItem.getCourseId(), courseTransactions.get(0).getUserName());
            logger.warn(m);
            String data = transactionService.createValidationErrorMessage(tocItem.getCourseId(), courseTransactions.get(0).getUserName());
            throw new TransactionException(ErrorCodes.CONTENT_IS_TRANSACTION_LOCKED, data);
        }

        try {
            boolean rc; // false by default. handles the locking on the Toc Items - will throw an error on conflicts
            if (cgsUserDetails != null) {
                rc = transactionService.startTransaction(tocItem.getCourseId(), cgsUserDetails.getUserName(), new Date());
                if (!rc) {
                    List<Transaction> courseTransactions = transactionService.getTransactionForCourse(tocItem.getCourseId());
                    String m = String.format("Element '%s' (%s) cannot be save, because its course (%s) is being published by %s.", tocItemContentData.getTitle(), tocItem.getId(), tocItem.getCourseId(), courseTransactions.get(0).getUserName());
                    logger.warn(m);
                    String data = transactionService.createValidationErrorMessage(tocItem.getCourseId(), courseTransactions.get(0).getUserName());
                    throw new TransactionException(ErrorCodes.CONTENT_IS_TRANSACTION_LOCKED, data);
                }
                handleLockings(tocItem, cgsUserDetails);
            }
            tocItemContentData.setHeader(Header.newInstance(tocItem.getContentData().getHeader(), new Date()));
            tocItemDao.save(tocItem);

            return tocItem;
        } finally {
            if (cgsUserDetails != null) {
                transactionService.stopTransaction(tocItem.getCourseId(), cgsUserDetails.getUserName());
            }
        }
    }

    /***
     * returns a list of applet ids used by the tocItem
     *
     * @param tocItemCGSObject - the lesson\assessment that we need to know their use of applets
     * @return a list of applet ids used by the tocItem
     */
    public List<String> getAppletIdsUsedInTocItem(TocItemCGSObject tocItemCGSObject) {
        List<String> idsUsedInTocItem = new ArrayList<>();
        if (!tocItemCGSObject.getContentData().containsField(ContentParseUtil.RESOURCES))
            return idsUsedInTocItem;

        BasicDBList resources = (BasicDBList) tocItemCGSObject.getContentData().get(ContentParseUtil.RESOURCES);
        for (Object resource : resources) {
            DBObject resourceDbObj = ((DBObject) resource);
            if (resourceDbObj.containsField("baseDir")) {
                if (resourceDbObj.get("baseDir").toString().startsWith("applets/"))
                    // get the applet id from href, where it is written: "applets/{appletId}/{appletVersion}
                    idsUsedInTocItem.add(resourceDbObj.get("baseDir").toString().split("/")[1]);
            }
        }
        return idsUsedInTocItem;
    }

    @Override
    public List<String> validateTocItemAgainstSchema(int publisherId, String courseId) throws DsException {
        List<String> errors = new ArrayList<>();
        List<TocItemCGSObject> allItems = this.getByCourse(publisherId, courseId, true);
        for (TocItemCGSObject tocItem : allItems) {
            try {
                contentValidator.validate(tocItem);
            } catch (Exception e) {
                errors.add("Validation failed for tocItem: " + tocItem.getContentId() + ", courseId: " + courseId + ", publisher: " + publisherId + ".\t Reason: " + e.getMessage());
            }
        }

        return errors;
    }

    @Override
    public DBCursor getSequencesCursor(String tocItemId, String courseId, List<String> sequenceIds) throws DsException {
        return sequenceService.getSequencesCursorBySequencesIdsLessonCIdAndCourseId(sequenceIds, tocItemId, courseId);
    }

    @Override
    public List<TocItemCGSObject> getByCourseAndIds(int publisherId, String courseId, List<String> tocItemIds) {
        return tocItemDao.getByCourseAndIds(publisherId, courseId, tocItemIds);
    }

    @Override
    public String getNextAvailableResourceId(JsonNode lessonJsonNode) throws ValidationException {
        JsonNode resourcesNodes = lessonJsonNode.get(ContentParseUtil.RESOURCES);
        if (resourcesNodes == null) {
            return "resource_1";
        }
        int nexId = 0;
        Iterator<JsonNode> iterator = resourcesNodes.iterator();
        while (iterator.hasNext()) {
            JsonNode resourceNode = iterator.next();
            String[] resId = resourceNode.get(ContentParseUtil.RES_ID).getTextValue().split("_");
            if (resId.length != 2) {
//                throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, "Invalid resId format " + Arrays.toString(resId));
                continue; // resource does not fallow the pattern "resource_[0-9]"
            }
            nexId = Math.max(Integer.parseInt(resId[1]), nexId);
        }
        nexId++;
        return "resource_" + nexId;

    }

    @Override
    public void updateTocItemProperties(int publisherId, String courseId, TocItemCGSObject
            tocItem, LockUser lockUser) throws DsException, IOException {
        try {

            DBObject dbObject = tocItemDao.getLearningObjectsAndResources(publisherId, courseId, tocItem.getContentId());
            if (dbObject == null) {
                throw new ResourceNotFoundException();
            }
            DBObject content = (DBObject) dbObject.get(TocItemCGSObject.CGS_CONTENT);
            DBObject los = (DBObject) content.get(TocItemCGSObject.LEARNING_OBJECTS_FIELD);
            DBObject resources = (DBObject) content.get(TocItemCGSObject.RESOURCES);
            DBObject sequences = (DBObject) content.get(TocItemCGSObject.SEQUENCES_OBJECTS_FIELD);

            //use the storage data to update the request with existing LO's and Resources
            if (los != null) {
                tocItem.setLearningObjects(los);
            }
            if (resources != null) {
                tocItem.setResources(resources);
            }
            if (sequences != null) {
                tocItem.setSequences(sequences);
            }

        } catch (DaoException e) {
            throw new DsException(e);
        }
        //the save takes care of the locking check
        save(tocItem, lockUser);
    }

    @Override
    public List<Sequence> getSequences(String tocItemCId, String courseId) throws DsException {
        return sequenceService.getSequences(tocItemCId, courseId);
    }

    @Override
    public List<Sequence> getSequencesByIds(List<String> sequencesIds, String tocItemCId, String courseId) throws DsException {
        return sequenceService.getSequencesBySequencesIdsLessonCIdAndCourseId(sequencesIds, tocItemCId, courseId);
    }

    @Override
    public DBCursor getSequencesCursor(List<String> lessonCIds, String courseId) throws DsException {
        return sequenceService.getSequencesCursor(lessonCIds, courseId); //TODO: add filter by deletionDate
    }

    @Override
    public void saveSequences(List<Sequence> sequences) throws DsException {
        sequenceService.saveSequences(sequences);
    }

    @Override
    public void updateDeletionDateForSequencesByCourseIdLessonIdAndSequencesIds(String courseId, String lessonCid,
                                                                                List<String> sequencesIds, Date deletionDate) throws DsException {
        sequenceService.updateDeletionDateForSequencesByCourseIdTocItemIdAndSequencesIds(courseId, lessonCid, sequencesIds, deletionDate);
    }

    @Override
    public void updateDeletionDateOnTocItems(String courseId, List<String> tocItemsIds, Date deletionDate) {
        tocItemDao.updateDeletionDateForTocItemsByCourseIdAndTocItemsIds(courseId, tocItemsIds, deletionDate);
    }

    @Override
    public void addCleanupJob(CleanupJob cleanupJob) throws DsException {
        try {
            cleanupsDao.insertOrUpdateCleanup(cleanupJob);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public List<String> getHiddenTocItemsIdsOfSelectedTocItems(String courseId, List<String> tocItemsIds) throws DsException {
        HashSet<String> hiddenLessons = new HashSet<>();
        try {
            DBCursor tocItemCursor = tocItemDao.getCursor(tocItemsIds, courseId);
            while (tocItemCursor.hasNext()) {
                TocItemCGSObject selectedTocItem = new TocItemCGSObject(tocItemCursor.next());
                List<DBObject> sequences = selectedTocItem.getSequences();
                for (DBObject sequence : sequences) {
                    if (sequence.get("type").equals("sequenceRef"))
                        hiddenLessons.add(((DBObject) (sequence.get("sequenceRef"))).get("lessonCid").toString());
                }
            }
        } catch (DaoException e) {
            String errorMsg = String.format("getHiddenTocItemsIdsOfSelectedTocItems: Failed to get hidden lessons course id %s", courseId);
            logger.error(errorMsg);
            throw new DsException(errorMsg, e);
        }

        return new ArrayList<>(hiddenLessons);
    }

    @Override
    public List<TocItemIndicationForScorm> getTocItemsWithHiddenIndication(String courseId, List<String> tocItemsIds) throws DsException {
        try {
            return tocItemDao.getTocItemsWithHiddenIndication(courseId, tocItemsIds);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public List<TocItemCGSObject> getByCourse(int publisherId, String courseId, boolean isPropertiesOnly) throws DsException {
        try {
            return tocItemDao.getByCourse(publisherId, courseId, isPropertiesOnly);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }


    private void handleLockings(TocItem tocItem, LockUser cgsUserDetails) throws DsException {
        ContentItemBase contentItemBase = getContentItemBase(tocItem.getCgsData().getPublisherId(), tocItem.getContentId(), tocItem.getCourseId());
        if (contentItemBase == null) return;
        Date lastModified = contentItemBase.getLastModified();//getLastModified(tocItemId.getContentId(), tocItemId.getCourseId(), tocItemId.getContentVersionNumber());

        if (lastModified != null && !lastModified.equals(tocItem.getLastModified())) {
            throw new ConflictException(tocItem.getContentId(), String.format("The tocItemId date is not in sync with storage. date:%s", lastModified));
        }

        lockService.validateLocker(contentItemBase, cgsUserDetails);
    }

    @Override
    public ContentItemBase getContentItemBase(int publisherId, String tocItemCId, String courseId) throws DsException {
        TocItemCGSObject tocItem;
        try {
            tocItem = tocItemDao.getContentItemBase(publisherId, tocItemCId, courseId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
        return tocItem;
    }

    @Override
    public void delete(TocItemCGSObject tocItemCGSObject) throws DsException {
        try {
            tocItemDao.delete(tocItemCGSObject.getContentId(), tocItemCGSObject.getCourseId(), tocItemCGSObject.getPublisherId());
        } catch (DaoException e) {
            throw new DsException("Failed delete", e);
        }
    }

    @Override
    public ContentItemBase getContentItemBase(String tocItemId) {
        TocItemCGSObject tocItem;
        tocItem = tocItemDao.getContentItemBase(tocItemId);
        return tocItem;
    }

    @Override
    public List<TocItemCGSObject> getContentItemBases(int publisherId, List<String> tocItemCIds, String courseId) {
        return tocItemDao.getContentItemBases(publisherId, tocItemCIds, courseId);
    }

    @Override
    public List<String> getAllSequencesList(ContentItem contentItem) {
        Set<String> uniqueSequenceList = new HashSet<>();
        uniqueSequenceList.addAll(getSequencesListFromContentItem(contentItem));
        uniqueSequenceList.addAll(getSequencesListFromResource(contentItem.getContentData()));
        return new ArrayList<>(uniqueSequenceList);
    }

    @Override
    public List<String> getSequencesListFromContentItem(ContentItem contentItem) {
        DBObject contentData = contentItem.getContentData();
        List<DBObject> learningObjects = ((List<DBObject>) contentData.get(TocItemCGSObject.LEARNING_OBJECTS_FIELD));
        // get sequence ids from the sequences objects inside the learning objects
        List<String> sequencesIds = (learningObjects == null)
                ? new ArrayList<>(0)
                : learningObjects.stream()
                .map(dbObject -> {
                    List<String> sequencesCids = new ArrayList<>();
                    List<DBObject> sequences = (List<DBObject>) dbObject.get(TocItemCGSObject.SEQUENCES_OBJECTS_FIELD);
                    if (sequences != null) {
                        sequencesCids.addAll(sequences.stream()
                                .map(sequence -> (String) sequence.get(ContentItemBase.CID))
                                .collect(Collectors.toList()));
                    }
                    return sequencesCids;
                }).flatMap(Collection::stream)
                .collect(Collectors.toList());
        return sequencesIds;
    }

    @Override
    public List<String> getSequencesListFromResource(DBObject contentData) {
        boolean includeSequences = true;
        List<String> sequencesIds = new ArrayList<>();
        List<String> allResources = getResourcesIdsFromResource(contentData, includeSequences);
        for (String resource : allResources) {
            if (resource.startsWith(PackagingLocalContext.SEQUENCE_PATH_ELEMENT))
                sequencesIds.add(resource.split("/")[1]);
        }
        return sequencesIds;
    }

    /**
     * Assets can be in a lib, in that case, the method will return all the assets that are
     * in the 'hrefs' list.
     *
     * @param baseNode - the contentData node of a tocItem  or course, that contains the resources array
     * @return - list of the resource nodes. If the resource is a sequence - it will NOT be returned
     */
    @Override
    public List<String> getAssetsPathsFromResource(DBObject baseNode) {
        boolean includeSequences = false;
        return getResourcesIdsFromResource(baseNode, includeSequences);

    }

    @Override
    public List<TocItemCGSObject> getOnlyNameAndIdsByCourseOfNonHiddenItems(int publisherId, String courseId) throws DsException {
        try {
            return tocItemDao.getOnlyNameAndIdsByCourseOfNonHiddenItems(publisherId, courseId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    private List<String> getResourcesIdsFromResource(DBObject baseNode, boolean includeSequences) {
        List<String> resourcePathsList = new ArrayList<>();
        if (!baseNode.containsField(ContentParseUtil.RESOURCES)) {
            logger.debug("No resources found for resource");
            return resourcePathsList;
        }

        for (Object node : (BasicDBList) baseNode.get(ContentParseUtil.RESOURCES)) {   // iterate over all resources
            DBObject resourceNode = (DBObject) node;
            if (isResourceSequence(resourceNode)) {
                if (includeSequences) { //we want to include to sequences references
                    resourcePathsList.add(resourceNode.get(ContentParseUtil.RESOURCE_HREF).toString()); //add the sequence href
                }
//            } else if (resourceNode.get(ContentParseUtil.RESOURCE_TYPE) != null &&     // if this is a library
//                    resourceNode.get(ContentParseUtil.RESOURCE_TYPE).toString().equals("lib")) {
            } else if (resourceNode.get(ContentParseUtil.RESOURCE_HREFS) != null
                    && resourceNode.get("baseDir") != null) { // supports all resources that have hrefs
                String resourceBaseDir = resourceNode.get("baseDir").toString();
                BasicDBList hrefs = (BasicDBList) resourceNode.get(ContentParseUtil.RESOURCE_HREFS);
                for (Object href : hrefs) {
                    resourcePathsList.add(resourceBaseDir + "/" + href.toString());
                }
            } else if (resourceNode.get(ContentParseUtil.RESOURCE_HREF) != null) { // if it is not a lib type, and it is not a sequence
                resourcePathsList.add(resourceNode.get(ContentParseUtil.RESOURCE_HREF).toString());
            } else {
                throw new IllegalStateException(String.format("Resource %s does not adhere to any of the resource contracts", resourceNode));
            }
        }

        return resourcePathsList;
    }

    /**
     * @param resourceNode -  a single resource node from the resources array of the tocItem
     * @return true is the resource reference indicates it is a sequence
     */
    private Boolean isResourceSequence(DBObject resourceNode) {
        String[] sequence = new String[]{PackagingLocalContext.SEQUENCE_PATH_ELEMENT};
        return (resourceNode.containsField(ContentParseUtil.RESOURCE_HREF) &&
                StringUtils.startsWithAny(resourceNode.get(ContentParseUtil.RESOURCE_HREF).toString(), sequence));
    }
}
