package org.t2k.cgs.domain.model.sequence;

import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.DBRef;
import org.t2k.cgs.domain.model.utils.GenericDaoOperations;
import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 05/12/12
 * Time: 15:38
 */
public interface SequencesDao extends GenericDaoOperations {

    List<Sequence> getSequences(String lessonCId, String courseId);

    List<Sequence> getSequencesBySequencesIdsLessonCIdAndCourseId(List<String> sequencesIds, String lessonCId, String courseId) throws DaoException;

    void saveSequences(List<Sequence> lessonSequences) throws DaoException;

    void saveSequence(Sequence sequence);

    DBCursor getSequencesCursor(List<String> lessonCIds, String courseId) throws DaoException;

    DBCursor getSequencesCursorBySequencesIdsLessonCIdAndCourseId(List<String> sequencesIds, String lessonCId, String courseId) throws DaoException;

    Sequence getSequence(String tocItemId, String courseId) throws DaoException;

    Sequence getSequence(String seqId, String tocItemId, String courseId) throws DaoException;

    void deleteSequence(String seqId, String tocItemCid, String courseId) throws DaoException;

    void deleteSequences(List<String> seqIds, String tocItemCid, String courseId) throws DaoException;

    void saveSequenceDBObject(DBObject sequence) throws DaoException ;

    DBRef getDBRefBySeqId(String courseId, String tocItemId, String seqId) throws DaoException;

    void updateDeletionDateForSequencesByCourseIdTocItemIdAndSequencesIds(String courseId, String lessonCid, List<String> sequencesIds, Date deletionDate) throws DaoException;

    void saveSequencesDBObject(List<DBObject> sequencesToInsert) throws DaoException;

    boolean isAllSequencesExistOnDB(String courseId, String tocItemId, List<String> sequenceIds) throws DaoException;

    boolean sequenceExists(String sequenceId, String tocItemId, String courseId) throws DaoException;

    void deleteSequenceByCourseId(String courseId) throws DaoException;


}