package org.t2k.cgs.sequences;

import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.DBRef;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dao.sequences.SequencesDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.sequence.Sequence;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 14/01/2015
 * Time: 18:28
 */
@Service
public class SequenceServiceImpl implements SequenceService {

    private static Logger logger = Logger.getLogger(SequenceServiceImpl.class);

    @Autowired
    private SequencesDao sequencesDao;

    @Override
    public List<Sequence> getSequences(String lessonCId, String courseId) {
        logger.debug(String.format("getSequences. About to get all sequences for lessonId: %s, courseId: %s", lessonCId, courseId));
        return sequencesDao.getSequences(lessonCId, courseId);
    }

    @Override
    public void saveSequences(List<Sequence> lessonSequences) throws DsException {
        logger.debug("saveSequences. About to save a list of sequences.");
        try {
            sequencesDao.saveSequences(lessonSequences);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public void saveSequence(Sequence sequence) {
        logger.debug(String.format("saveSequence. About to save sequence %s.", sequence.toString()));
        sequencesDao.saveSequence(sequence);
    }

    @Override
    public DBCursor getSequencesCursor(List<String> lessonCIds, String courseId) throws DsException {
        logger.debug(String.format("getSequencesCursor. About to get all sequences for lessons %s and course %s.", lessonCIds, courseId));
        try {
            return sequencesDao.getSequencesCursor(lessonCIds, courseId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public DBCursor getSequencesCursorBySequencesIdsLessonCIdAndCourseId(List<String> sequencesIds, String lessonCId, String courseId) throws DsException {
        logger.debug(String.format("getSequencesCursorBySequencesIdsLessonCIdAndCourseId. About to get a list of specific sequences of lesson %s and course %s.", lessonCId, courseId));
        try {
            return sequencesDao.getSequencesCursorBySequencesIdsLessonCIdAndCourseId(sequencesIds, lessonCId, courseId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public List<Sequence> getSequencesBySequencesIdsLessonCIdAndCourseId(List<String> sequencesIds, String lessonCId, String courseId) throws DsException {
        logger.debug(String.format("getSequencesBySequencesIdsLessonCIdAndCourseId. About to get a list of specific sequences of lesson %s and course %s.", lessonCId, courseId));
        try {
            return sequencesDao.getSequencesBySequencesIdsLessonCIdAndCourseId(sequencesIds, lessonCId, courseId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public Sequence getSequence(String tocItemId, String courseId) throws DsException {
        logger.debug(String.format("getSequence. About to get a random sequence of tocItem: %s, course: %s.", tocItemId, courseId));
        try {
            return sequencesDao.getSequence(tocItemId, courseId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public Sequence getSequence(String seqId, String tocItemId, String courseId) throws DsException {
        logger.debug(String.format("getSequence. About to get sequence: %s of tocItem: %s, course: %s.", seqId, tocItemId, courseId));
        try {
            return sequencesDao.getSequence(seqId, tocItemId, courseId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }



    @Override
    public void deleteSequence(String seqId, String tocItemCid, String courseId) throws DsException {
        logger.debug(String.format("deleteSequence. About to delete a sequence: %s of lesson: %s, course: %s", seqId, tocItemCid, courseId));
        try {
            sequencesDao.deleteSequence(seqId, tocItemCid, courseId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public void deleteSequences(List<String> seqIds, String tocItemCid, String courseId) throws DsException {
        logger.debug(String.format("deleteSequences. About to delete a list of specific sequences of tocItem: %s, course: %s", tocItemCid, courseId));
        try {
            sequencesDao.deleteSequences(seqIds, tocItemCid, courseId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public void saveSequenceDBObject(DBObject sequence) throws DsException {
        logger.debug(String.format("saveSequenceDBObject. About to save sequence: %s of tocItem: %s, course: %s", sequence.get("seqId").toString(), sequence.get("lessonCId").toString(), sequence.get("courseId").toString()));
        try {
            sequencesDao.saveSequenceDBObject(sequence);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public DBRef getDBRefBySeqId(String courseId, String tocItemId, String seqId) throws DsException {
        logger.debug(String.format("getDBRefBySeqId. About to get the DBRef of sequence: %s of tocItem: %s, course: %s", seqId, tocItemId, courseId));
        try {
            return sequencesDao.getDBRefBySeqId(courseId, tocItemId, seqId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }


    @Override
    public void updateDeletionDateForSequencesByCourseIdTocItemIdAndSequencesIds(String courseId, String lessonCid, List<String> sequencesIds, Date deletionDate) throws DsException {
        logger.debug(String.format("updateDeletionDateForSequencesByCourseIdTocItemIdAndSequencesIds. About to update a list of sequences with a deletion date of lessonId: %s, course: %s", lessonCid, courseId));
        try {
            sequencesDao.updateDeletionDateForSequencesByCourseIdTocItemIdAndSequencesIds(courseId, lessonCid, sequencesIds, deletionDate);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public boolean isAllSequencesExistOnDB(String courseId, String tocItemId, List<String> sequencesIds) throws DsException {
        logger.debug(String.format("isAllSequencesExistOnDB. Check if a list of sequences of tocItemId: %s, courseId: %s exists in DB.", tocItemId, courseId));
        try {
            return sequencesDao.isAllSequencesExistOnDB(courseId, tocItemId, sequencesIds);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public boolean sequenceExists(String sequenceId, String tocItemId, String courseId) throws DsException {
        logger.debug(String.format("sequenceExists. Check if sequence %s of tocItemId: %s, courseId: %s exists in DB.", sequenceId, tocItemId, courseId));
        try {
            return sequencesDao.sequenceExists(sequenceId, tocItemId, courseId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public void deleteSequenceByCourseId(String courseId) throws DsException {
        try {
            sequencesDao.deleteSequenceByCourseId(courseId);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public void saveSequencesDBObject(List<DBObject> sequencesToInsert) throws DsException {
        logger.debug(String.format("saveSequenceDBObject. About to save %d sequences", sequencesToInsert.size()));
        try {
            sequencesDao.saveSequencesDBObject(sequencesToInsert);
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

}