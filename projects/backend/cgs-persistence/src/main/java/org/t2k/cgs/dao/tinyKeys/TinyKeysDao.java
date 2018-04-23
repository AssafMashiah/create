package org.t2k.cgs.dao.tinyKeys;

import com.mongodb.DBRef;
import org.t2k.cgs.dao.util.GenericDaoOperations;
import org.t2k.cgs.model.packaging.PublishTarget;
import org.t2k.cgs.security.TinyKey;
import org.t2k.sample.dao.exceptions.DaoException;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 22/10/12
 * Time: 14:23
 */
public interface TinyKeysDao extends GenericDaoOperations {

    String TINY_KEYS = "tinyKeys";

    String ID = "id";
    String PUBLISHER_ID = "publisherId";
    String COURSE_ID = "courseId";
    String LESSON_ID = "lessonId";
    String TINY_KEY = "tinyKey";
    String TITLE = "title";
    String PUBLISH_TARGET = "publishTarget";

    // SAVE
    void saveTinyKey(TinyKey tinyKey) throws DaoException;

    // READ
    TinyKey getTinyKey(int publisherId, String courseId, String lessonId, PublishTarget publishTarget);

    // DELETE
    void deleteTinyKey(int publisherId, String courseId, String lessonId, PublishTarget publishTarget) throws DaoException;
    void deleteById(DBRef dbref) throws DaoException;
}