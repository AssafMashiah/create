package org.t2k.cgs.domain.usecases.tocitem;

import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import org.codehaus.jackson.JsonNode;
import org.t2k.cgs.config.app.TocItemDataServiceConfiguration;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.ValidationException;
import org.t2k.cgs.domain.model.lock.LockUser;
import org.t2k.cgs.domain.model.ContentItem;
import org.t2k.cgs.domain.model.ContentItemBase;
import org.t2k.cgs.domain.model.cleanup.CleanupJob;
import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.cgs.domain.model.tocItem.TocItem;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.model.tocItem.TocItemIndicationForScorm;

import java.io.IOException;
import java.util.Date;
import java.util.List;

/**
 * Instances of this class are created in {@link TocItemDataServiceConfiguration}
 */
public interface TocItemDataService {

    /**
     * Returns a tocItemId by the tocItemId attributes. This method will evaluate the provided
     * lastModified , if the given lastModified is equals to the stored tocItemId value. the
     * method will return NULL.
     *
     * @param publisherId      - publisher Ids
     * @param tocItemCid       - toc Item CID (contentData.cid)
     * @param courseId         - courseId
     * @param lastModified     , if supplied (not null) , evaluates the value against the stored value.
     *                         if not provided (null) , returns the tocItemId from the storage.
     * @param isPropertiesOnly @return LessonCGSObject
     * @throws DsException
     */
    TocItemCGSObject get(int publisherId, String tocItemCid, String courseId, Date lastModified, boolean isPropertiesOnly) throws DsException;

    TocItemCGSObject get(String id, boolean isPropertiesOnly) throws DsException;

    TocItem get(int publisherId, String tocItemCid, String courseId);

    /**
     * Saves(update or insert) the tocItemId to the storage.
     * the method also validates locking and json correctness
     *
     * @param tocItem        - toc Item to save
     * @param cgsUserDetails - user that saves
     * @throws DsException - thrown if validation fails , locking is not permitted. or problems on persistence
     * @throws IOException if any other I/O problem (unexpected end-of-input, network error) during the
     *                     json deserialization process
     */
    void save(TocItemCGSObject tocItem, LockUser cgsUserDetails) throws DsException, IOException;

    /**
     * Saves(update or insert) the tocItemId to the storage.
     * the method also validates locking and json correctness
     *
     * @param tocItem        - toc Item to save
     * @param cgsUserDetails - user that saves
     * @return
     * @throws DsException - thrown if validation fails , locking is not permitted. or problems on persistence
     */
    TocItem save(TocItem tocItem, LockUser cgsUserDetails) throws DsException;

    /**
     * Updates only the the tocItemId properties . does not effect the  'lessonLearningActivities'
     *
     * @param publisherId
     * @param courseId
     * @param tocItem
     * @param lockUser
     * @return
     * @throws DsException
     */
    void updateTocItemProperties(int publisherId, String courseId, TocItemCGSObject tocItem, LockUser lockUser) throws DsException, IOException;

    /**
     * Returns a list of all sequences of the provided tocItemId
     *
     * @param tocItemCId
     * @param courseId
     * @throws DsException
     */
    List<Sequence> getSequences(String tocItemCId, String courseId) throws DsException;

    List<Sequence> getSequencesByIds(List<String> sequencesIds, String tocItemCId, String courseId) throws DsException;

    DBCursor getSequencesCursor(List<String> lessonCIds, String courseId) throws DsException;

    /**
     * Saves(updates) the sequences
     *
     * @param sequences
     * @throws DsException
     */
    void saveSequences(List<Sequence> sequences) throws DsException;

    /**
     * Returns a list of all tocItemId of the given courseId
     * ** note that the lessons are not necessarily are attached to the course.
     * they are lessons that were assigned to course at some stage but might was detached (removed)
     * from it (the service is not notified on removing lessons)
     *
     * @param publisherId
     * @param courseId
     * @param isPropertiesOnly @return
     * @throws DsException
     */
    List<TocItemCGSObject> getByCourse(int publisherId, String courseId, boolean isPropertiesOnly) throws DsException;

    ContentItemBase getContentItemBase(int publisherId, String tocItemCId, String courseId) throws DsException;

    List<TocItemCGSObject> getContentItemBases(int publisherId, List<String> tocItemCIds, String courseId);

    ContentItemBase getContentItemBase(String tocItemId);

    void delete(TocItemCGSObject tocItemCGSObject) throws DsException;

    void updateDeletionDateForSequencesByCourseIdLessonIdAndSequencesIds(String courseId, String lessonCid, List<String> sequencesIds, Date deletionDate) throws DsException;

    /**
     * @param courseId     ID of the course to update the toc Items on
     * @param tocItemsIds  cids of the toc items
     * @param deletionDate deletion date to set on toc items
     */
    void updateDeletionDateOnTocItems(String courseId, List<String> tocItemsIds, Date deletionDate);

    void addCleanupJob(CleanupJob cleanupJob) throws DsException;

    List<String> getHiddenTocItemsIdsOfSelectedTocItems(String courseId, List<String> tocItemsIds) throws DsException;

    List<TocItemIndicationForScorm> getTocItemsWithHiddenIndication(String courseId, List<String> tocItemsIds) throws DsException;

    /**
     * @param contentItem inside the toc item object
     * @return a list of all sequences on related to the toc item
     */
    List<String> getAllSequencesList(ContentItem contentItem);

    List<String> getSequencesListFromContentItem(ContentItem contentItem);

    List<String> getSequencesListFromResource(DBObject contentData);

    List<String> getAssetsPathsFromResource(DBObject baseNode);

    List<TocItemCGSObject> getOnlyNameAndIdsByCourseOfNonHiddenItems(int publisherId, String courseId) throws DsException;

    /***
     * returns a list of applet ids used by the tocItem
     * @param tocItemCGSObject  - the lesson\assessment that we need to know their use of applets
     * @return a list of applet ids used by the tocItem
     */
    List<String> getAppletIdsUsedInTocItem(TocItemCGSObject tocItemCGSObject);

    List<String> validateTocItemAgainstSchema(int publisherId, String courseId) throws DsException;

    DBCursor getSequencesCursor(String tocItemId, String courseId, List<String> sequenceIds) throws DsException;

    List<TocItemCGSObject> getByCourseAndIds(int publisherId, String courseId, List<String> tocItemIds);

    String getNextAvailableResourceId(JsonNode lessonJsonNode) throws ValidationException;

}
