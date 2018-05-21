package org.t2k.cgs.domain.usecases;

import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.DBRef;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.sequence.Sequence;

import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 14/01/2015
 * Time: 18:20
 */
public interface SequenceService {

    List<Sequence> getSequences(String lessonCId, String courseId);

    void saveSequences(List<Sequence> lessonSequences) throws DsException;

    void saveSequence(Sequence sequence);

    DBCursor getSequencesCursor(List<String> lessonCIds, String courseId) throws DsException;

    DBCursor getSequencesCursorBySequencesIdsLessonCIdAndCourseId(List<String> sequencesIds, String lessonCId, String courseId) throws DsException;

    List<Sequence> getSequencesBySequencesIdsLessonCIdAndCourseId(List<String> sequencesIds, String lessonCId, String courseId) throws DsException;

    Sequence getSequence(String tocItemId, String courseId) throws DsException;

    Sequence getSequence(String seqId, String tocItemId, String courseId) throws DsException;

    void deleteSequence(String seqId, String tocItemCid, String courseId) throws DsException;

    void deleteSequences(List<String> seqIds, String tocItemCid, String courseId) throws DsException;

    void saveSequenceDBObject(DBObject sequence) throws DsException ;

    DBRef getDBRefBySeqId(String courseId , String tocItemId, String seqId) throws DsException;

    void updateDeletionDateForSequencesByCourseIdTocItemIdAndSequencesIds(String courseId, String lessonCid, List<String> sequencesIds, Date deletionDate) throws DsException;

    boolean isAllSequencesExistOnDB(String courseId, String tocItemId, List<String> sequenceIds) throws DsException;

    boolean sequenceExists(String sequenceId, String tocItemId, String courseId) throws DsException;

    void deleteSequenceByCourseId(String courseId) throws DsException;

    void saveSequencesDBObject(List<DBObject> seqeuencesToInsert) throws DsException;

}
