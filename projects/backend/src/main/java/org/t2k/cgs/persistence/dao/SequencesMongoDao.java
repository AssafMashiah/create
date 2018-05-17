package org.t2k.cgs.persistence.dao;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.mongodb.DBRef;
import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Component;
import org.t2k.cgs.domain.model.sequence.SequencesDao;
import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 05/12/12
 * Time: 15:55
 */
@Component("sequencesDao")
public class SequencesMongoDao extends MongoDao implements SequencesDao {

    private static Logger logger = Logger.getLogger(SequencesMongoDao.class);

    public static final String ID = "_id";
    protected static final String SEQUENCES_COLLECTION = "sequences";

    @Override
    public List<Sequence> getSequences(String tocItemCid, String courseId) {
        Query query = new Query(Criteria.where(Sequence.DB_LESSON_CID).is(tocItemCid).
                and(Sequence.DB_COURSE_ID).is(courseId).
                and(Sequence.DB_SEQ_DELETION_DATE_KEY).exists(false)); // get only sequences without a deletion date
        return getMongoTemplate().find(query, Sequence.class, SEQUENCES_COLLECTION);
    }

    @Override
    public List<Sequence> getSequencesBySequencesIdsLessonCIdAndCourseId(List<String> sequencesIds, String tocItemCid, String courseId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(Sequence.DB_LESSON_CID).is(tocItemCid).
                    and(Sequence.DB_COURSE_ID).is(courseId).
                    and(Sequence.DB_SEQ_ID_KEY).in(sequencesIds).
                    and(Sequence.DB_SEQ_DELETION_DATE_KEY).exists(false)); // get only sequences without a deletion date

            return getMongoTemplate().find(query, Sequence.class, SEQUENCES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void deleteSequence(String seqId, String tocItemCid, String courseId) throws DaoException {
        logger.info(String.format("deleteSequence: sequenceId: %s tocItemId: %s", seqId, tocItemCid));
        try {
            Query query = new Query(Criteria.where(Sequence.DB_LESSON_CID).is(tocItemCid).
                    and(Sequence.DB_SEQ_ID_KEY).is(seqId).
                    and(Sequence.DB_COURSE_ID).is(courseId));
            getMongoTemplate().remove(query, SEQUENCES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void deleteSequences(List<String> seqIds, String tocItemCid, String courseId) throws DaoException {
        logger.info(String.format("deleteSequence: sequences ids: %s, tocItemId: %s", seqIds, tocItemCid));
        try {
            Query query = new Query(Criteria.where(Sequence.DB_LESSON_CID).is(tocItemCid).
                    and(Sequence.DB_SEQ_ID_KEY).in(seqIds).
                    and(Sequence.DB_COURSE_ID).is(courseId));
            getMongoTemplate().remove(query, SEQUENCES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void saveSequences(List<Sequence> sequences) throws DaoException {
        logger.info(String.format("saveSequences: size: %s", sequences) != null ? sequences.size() : "NULL!!");
        try {
            for (Sequence sequence : sequences) {
                saveSequence(sequence);
            }
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void saveSequence(Sequence sequence) {
        Query query = new Query(Criteria.where(Sequence.DB_LESSON_CID).is(sequence.getLessonCId()).
                and(Sequence.DB_COURSE_ID).is(sequence.getCourseId()).and(Sequence.DB_SEQ_ID_KEY).is(sequence.getSeqId()));

        getMongoTemplate().remove(query, SEQUENCES_COLLECTION);
        getMongoTemplate().insert(sequence, SEQUENCES_COLLECTION);
    }

    public void saveSequenceDBObject(DBObject sequence) throws DaoException {
        try {
            getMongoTemplate().insert(sequence, SEQUENCES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public Sequence getSequence(String tocItemId, String courseId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(Sequence.DB_LESSON_CID).is(tocItemId).
                    and(Sequence.DB_COURSE_ID).is(courseId));
            return getMongoTemplate().findOne(query, Sequence.class, SEQUENCES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public Sequence getSequence(String seqId, String tocItemId, String courseId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(Sequence.DB_SEQ_ID_KEY).is(seqId).
                    and(Sequence.DB_LESSON_CID).is(tocItemId).
                    and(Sequence.DB_COURSE_ID).is(courseId));
            return getMongoTemplate().findOne(query, Sequence.class, SEQUENCES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    public DBRef getDBRefBySeqId(String courseId, String tocItemId, String seqId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(Sequence.DB_LESSON_CID).is(tocItemId).
                    and(Sequence.DB_COURSE_ID).is(courseId).and(Sequence.DB_SEQ_ID_KEY).is(seqId));

            DBObject seqObj = getMongoTemplate().findOne(query, DBObject.class, SEQUENCES_COLLECTION);
            DBRef result = null;

            if (seqObj != null) {
                result = new DBRef(getMongoTemplate().getDb(), SEQUENCES_COLLECTION, seqObj.get(ID));
            }

            return result;

        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void updateDeletionDateForSequencesByCourseIdTocItemIdAndSequencesIds(String courseId, String lessonCid, List<String> sequencesIds, Date deletionDate) throws DaoException {
        try {
            Query query;
            if (sequencesIds != null) { // Look only for the listed sequences
                query = new Query(Criteria.where(Sequence.DB_COURSE_ID).is(courseId).
                        and(Sequence.DB_LESSON_CID).is(lessonCid).
                        and(Sequence.DB_SEQ_ID_KEY).in(sequencesIds));
            } else { // Look for all the sequences
                query = new Query(Criteria.where(Sequence.DB_COURSE_ID).is(courseId).
                        and(Sequence.DB_LESSON_CID).is(lessonCid));
            }

            Update update = new Update();
            update.set(Sequence.DB_SEQ_DELETION_DATE_KEY, deletionDate);
            getMongoTemplate().updateMulti(query, update, SEQUENCES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public boolean isAllSequencesExistOnDB(String courseId, String tocItemId, List<String> sequencesIds) throws DaoException {
        try {
            Query query = new Query(Criteria.where(Sequence.DB_LESSON_CID).is(tocItemId).
                    and(Sequence.DB_SEQ_ID_KEY).in(sequencesIds).
                    and(Sequence.DB_COURSE_ID).is(courseId));
            long numberOfItems = getMongoTemplate().count(query, SEQUENCES_COLLECTION);
            return numberOfItems == sequencesIds.size();
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public boolean sequenceExists(String sequenceId, String tocItemId, String courseId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(Sequence.DB_SEQ_ID_KEY).is(sequenceId).
                    and(Sequence.DB_LESSON_CID).is(tocItemId).
                    and(Sequence.DB_COURSE_ID).is(courseId));

            long itemsFound = getMongoTemplate().count(query, SEQUENCES_COLLECTION);
            return (itemsFound != 0);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void deleteSequenceByCourseId(String courseId) throws DaoException {
        logger.info(String.format("delete sequence by course Id: %s", courseId));
        try {
            Query query = new Query(Criteria.where(Sequence.DB_COURSE_ID).is(courseId));
            getMongoTemplate().remove(query, SEQUENCES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void saveSequencesDBObject(List<DBObject> sequencesToInsert) throws DaoException {
        try {
            getMongoTemplate().insert(sequencesToInsert, SEQUENCES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }


    @Override
    public DBCursor getSequencesCursor(List<String> lessonCIds, String courseId) throws DaoException {
        try {
            BasicDBObject query = new BasicDBObject();
            query.put(Sequence.DB_LESSON_CID, new BasicDBObject("$in", lessonCIds));
            query.put(Sequence.DB_COURSE_ID, courseId);
            query.put(Sequence.DB_SEQ_DELETION_DATE_KEY, null);
            return getMongoTemplate().getCollection(SEQUENCES_COLLECTION).find(query);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public DBCursor getSequencesCursorBySequencesIdsLessonCIdAndCourseId(List<String> sequencesIds, String lessonCId, String courseId) throws DaoException {
        try {
            BasicDBObject query = new BasicDBObject();
            query.put(Sequence.DB_COURSE_ID, courseId);
            query.put(Sequence.DB_LESSON_CID, lessonCId);
            query.put(Sequence.DB_SEQ_ID_KEY, new BasicDBObject("$in", sequencesIds));
            query.put(Sequence.DB_SEQ_DELETION_DATE_KEY, null);
            return getMongoTemplate().getCollection(SEQUENCES_COLLECTION).find(query);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
        throw new IllegalAccessError();
    }
}
