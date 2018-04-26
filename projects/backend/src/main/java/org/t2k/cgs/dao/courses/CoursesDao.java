package org.t2k.cgs.dao.courses;

import com.mongodb.DBObject;
import com.mongodb.DBRef;
import org.t2k.cgs.dao.util.GenericDaoOperations;
import org.t2k.cgs.model.course.Course;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 22/10/12
 * Time: 14:23
 */
public interface CoursesDao extends GenericDaoOperations {

    void saveCourseCGSObject(CourseCGSObject course);

    CourseCGSObject getCourse(int publisherId, String courseId, Date lastModified, boolean isPropertiesOnly);

    Course getCourse(int publisherId, String courseId);

    DBObject getCourse(String courseId) throws DaoException;

    List<CourseCGSObject> getCoursesPropertiesByPublisher(int publisherId);

    CourseCGSObject getCoursesWithOnlyTocHierarchyByPublisher(int publisherId, String courseId) throws DaoException;

    CourseCGSObject getCourse(String courseId, boolean isPropertiesOnly) throws DaoException;

    CourseCGSObject getCourseHeader(String courseId) throws DaoException;

    void deleteCourse(String courseId, int publisherId) throws DaoException;

    CourseCGSObject getContentItemBase(String courseId);

    void saveCourseDBObject(DBObject course);

    DBRef getDBRefByCourseId(String courseId, int publisherId) throws DaoException;

    void deleteById(DBRef dbref);

    List<CourseCGSObject> getSavedCoursesPropertiesByPublisher(int publisherId) throws DaoException;

    List<CourseCGSObject> getModifiedCoursesAfterDate(Date startDate);

    List<Course> getCoursesTitlesIdVersionsAndCoverPicturesByPublisherId(int publisherId);

    List<CourseCGSObject> getCoursesByStandardPackage(String packageName, String subjectArea);
}