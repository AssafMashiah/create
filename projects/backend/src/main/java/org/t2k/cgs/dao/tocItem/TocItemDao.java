package org.t2k.cgs.dao.tocItem;

import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.DBRef;
import org.t2k.cgs.dao.util.GenericDaoOperations;
import org.t2k.cgs.model.tocItem.TocItem;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.model.tocItem.TocItemIndicationForScorm;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 6/9/13
 * Time: 4:17 PM
 */
public interface TocItemDao extends GenericDaoOperations {

    void save(TocItemCGSObject tocItem) throws DaoException;

    void save(TocItem tocItem);

    TocItemCGSObject get(int publisherId, String tocItemCId, String courseId, Date lastModified, boolean isPropertiesOnly) throws DaoException;

    List<TocItemCGSObject> getByCourse(int publisherId, String courseId, boolean isPropertiesOnly) throws DaoException;

    DBObject getLearningObjectsAndResources(int publisherId, String courseId, String tocItemCId) throws DaoException;

    DBCursor getCursor(List<String> tocItemsIds, String courseId) throws DaoException;

    DBCursor getCursorOfAllTocItems(int publisherId, String courseId) throws DaoException;

    DBCursor getTocItemsByCidAndCourse(List<String> tocItemsIds, String courseId) throws DaoException;

    DBCursor getTocItemsByCid(List<String> tocItemsIds) throws DaoException;

    TocItemCGSObject getHeader(String tocItemCId, String courseId) throws DaoException;

    void delete(String tocItemCid, String courseId, int publisherId) throws DaoException;

    void deleteTocItems(List<String> tocItemCid, String courseId, int publisherId) throws DaoException;

    TocItemCGSObject get(String dbId, boolean propertiesOnly) throws DaoException;

    TocItem get(int publisherId, String tocItemCid, String courseId);

    TocItemCGSObject getContentItemBase(int publisherId, String tocItemCid, String courseId) throws DaoException;

    List<TocItemCGSObject> getContentItemBases(int publisherId, List<String> tocItemCids, String courseId);

    TocItemCGSObject getContentItemBase(String tocItemId);

    void saveTocItemDBObject(DBObject tocItem) throws DaoException;

    DBRef getDBRefByCId(String courseId, int publisherId, String tocItemCId) throws DaoException;

    List<TocItemCGSObject> getHiddenLessonsWithSequences(int publisherId, String courseId) throws DaoException;

    List<TocItemIndicationForScorm> getTocItemsWithHiddenIndication(String courseId, List<String> tocItemsIds) throws DaoException;

    void updateDeletionDateForTocItemsByCourseIdAndTocItemsIds(String courseId, List<String> lessonsIds, Date deletionDate);

    List<TocItemCGSObject> getOnlyNameAndIdsByCourseOfNonHiddenItems(int publisherId, String courseId) throws DaoException;

    void deleteByCourseIdAndPublisherId(String courseId, int publisherId);

    List<TocItemCGSObject> getByCourseAndIds(int publisherId, String courseId, List<String> allTocItemCIdsFromCourse);

}
