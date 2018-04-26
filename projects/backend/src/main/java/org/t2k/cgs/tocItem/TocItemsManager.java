package org.t2k.cgs.tocItem;

import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.locks.LockUser;
import org.t2k.cgs.model.ContentItemBase;
import org.t2k.cgs.model.Header;
import org.t2k.cgs.model.sequence.Sequence;
import org.t2k.cgs.model.tocItem.TocItem;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.model.tocItem.TocItemIndicationForScorm;
import org.t2k.cgs.security.CGSAccount;
import org.t2k.cgs.security.CGSUserDetails;

import java.io.IOException;
import java.util.Date;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 6/10/13
 * Time: 10:38 AM
 */
public interface TocItemsManager {

    TocItemDataService getServiceByType(String type);

    TocItemDataService getServiceByType(EntityType type);

    /**
     * Returns a toc item for the specified parameters
     *
     * @param publisherId
     * @param courseId    id of the course where the TOC item is found
     * @param tocItemCid  cid of the TOC item to retrieve
     * @param type        the type of the toc item: lesson or assessment
     * @return the TOC item if found, null otherwise
     * @throws IllegalArgumentException if type is not {@link EntityType#LESSON} or {@link EntityType#ASSESSMENT}
     */
    TocItem get(int publisherId, String courseId, String tocItemCid, EntityType type);

    TocItemCGSObject get(int publisherId, String tocItemCid, String courseId, Date lastModified, boolean isPropertiesOnly) throws DsException;

    List<TocItemIndicationForScorm> getTocItemsWithHiddenIndication(String courseId, List<String> tocItemsIds) throws DsException;

    List<TocItemCGSObject> getByCourse(int publisherId, String courseId, boolean isPropertiesOnly) throws DsException;

    List<TocItem> getByCourse(int publisherId, String courseId);

    List<TocItemCGSObject> getContentItemBases(int publisherId, List<String> tocItemCIds, String courseId);

    ContentItemBase getContentItemBase(String tocItemId) throws DsException;

    /**
     * Saves(update or insert) the tocItemId to the storage.
     * the method also validates locking and json correctness
     *
     * @param tocItem  - toc Item to save
     * @param lockUser - user that saves and locks
     * @throws DsException - thrown if validation fails , locking is not permitted. or problems on persistence
     * @throws IOException if any other I/O problem (unexpected end-of-input, network error) during the
     *                     json deserialization process
     */
    void save(TocItemCGSObject tocItem, LockUser lockUser) throws DsException, IOException;

    Header saveContents(int publisherId, String courseId, TocItem tocItem, List<Sequence> sequences, CGSUserDetails currentCgsUserDetails, String type) throws Exception;

    void delete(TocItemCGSObject tocItemCGSObject) throws DsException;

    void tocItemCleanUp(String courseId, TocItemCGSObject tocItem, String type, CGSUserDetails userDetails) throws DsException;

    List<TocItemCGSObject> getOnlyNameAndIdsByCourseOfNonHiddenItems(int publisherAccountId, String courseId, String tocItemContentType) throws DsException;

    boolean isPublisherAuthorizedToCreateLesson(CGSAccount publisher, TocItemCGSObject lesson);

    boolean isPublisherAuthorizedToCreateAssessment(CGSAccount publisher, TocItemCGSObject assessment);
}
