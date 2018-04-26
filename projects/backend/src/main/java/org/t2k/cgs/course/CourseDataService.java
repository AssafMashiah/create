package org.t2k.cgs.course;

import atg.taglib.json.util.JSONException;
import com.mongodb.DBObject;
import com.mongodb.DBRef;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.locks.LockUser;
import org.t2k.cgs.model.ContentItemBase;
import org.t2k.cgs.model.course.Course;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.model.course.CourseContentData;
import org.t2k.cgs.model.course.CourseToc;
import org.t2k.cgs.model.ebooks.EBook;
import org.t2k.cgs.model.ebooks.EBookConversionData;
import org.t2k.cgs.model.packaging.PublishTarget;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.model.utils.CGSValidationReport;
import org.t2k.cgs.security.CGSUserDetails;
import org.t2k.cgs.security.TinyKey;

import java.io.IOException;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 21/10/12
 * Time: 14:19
 */
public interface CourseDataService {

    /**
     * Saves the given Course to the store.
     * if the Course is new , adds as new Course , else updates the stored Course.
     * - the service will acquire a lock on the Course if in case of new created Course.
     * - the method validates that the users is the locking (owner) of the course
     * The service is responsible to change the version if needed??
     *
     * @param course
     * @param cgsUserDetails
     * @throws DsException
     * @Retuen Date : if course is saved, returns the modification dated.
     */
    CourseCGSObject saveCourse(CourseCGSObject course, LockUser cgsUserDetails, boolean isNewCourse) throws DsException;

    Course saveCourse(Course existing, CourseContentData newContentData, LockUser lockUser) throws DsException;

    /**
     * Saves the course to the database. This involves no locking mechanism and should be used only for internal
     * operations, that are not requested by client.
     *
     * @param course course to be saved
     * @return course saved to the database
     */
    Course save(Course course);

    /**
     * Saves the course to the database. This involves no locking mechanism and should be used only for internal
     * operations, that are not requested by client.
     *
     * @param course course to be saved
     * @return course saved to the database
     */
    Course saveCourseCGSObject(CourseCGSObject course);

    /**
     * Saves the course to the database. This involves no locking mechanism and should be used only for internal
     * operations, that are not requested by client.
     *
     * @param course course to be saved
     * @return course saved to the database
     */
    Course saveCourseDBObject(DBObject course);

    /**
     * Removes a course from the database by its mongo ref ID object. This involves no locking mechanism and should be used only for internal
     * operations, that are not requested by client.
     *
     * @param dbref mongo ref ID object
     */
    void deleteById(DBRef dbref);

    Course getCourse(int publisherId, String courseId);

    Course getCourse(int publisherId, String courseId, boolean updateCustomIcons);

    /**
     * Returns a course by version Id only id the modification date is different from stored version.
     * if lastModified value is not null, the method will check the stored copy of this
     * course and if not equal , returns the stored copy. else , returns NULL.
     *
     * @param publisherId
     * @param courseId
     * @param lastModified : the client instance modification time  @return
     */
    CourseCGSObject getCourse(int publisherId, String courseId, Date lastModified, boolean isPropertiesOnly);

    /**
     * Returns all the courses by the given publisher (last versions only).
     *
     * @param publisherAccountId
     * @return List of CGSObject (book) of the last version
     * @throws DsException
     */
    List<CourseCGSObject> getCoursesPropertiesByPublisher(int publisherAccountId) throws DsException;

    /**
     * Returns all the course's relevant toc items (lessons, assessments) by the given publisher.
     * relevant toc items are items that weren't deleted and still connected to their course
     *
     * @param publisherId
     * @param courseId
     * @return List of TocItemCGSObject with course's relevant toc items
     * @throws DsException
     */
    List<TocItemCGSObject> getTocItemsBasicDataForCourseLessonsMenu(int publisherId, String courseId) throws DsException;

    /**
     * Returns all the courses by the given publisher (last versions only).
     * In the courses include the toc and in each toc the lesson headers
     *
     * @param publisherAccountId
     * @param courseId
     * @param tocItemContentType
     * @return List of CGSObject (book) of the last version
     * @throws DsException
     */
    CourseCGSObject getCourseTocItemsInStructureByPublisher(int publisherAccountId, String courseId, String tocItemContentType) throws DsException;

    HashMap<String, EntityType> getAllTocItemCIdsAndEntityTypeFromCourse(int publisherId, String courseId);

    List<String> getAllTocItemCIdsFromCourse(int publisherId, String courseId);

    ContentItemBase getContentItemBase(String courseId);

    /**
     * Clone course
     *
     * @param publisherId
     * @param courseId
     * @param newName     - if 'null' copy will be appended to the end of the original name
     * @param jobId       - describes the
     * @return
     * @throws DsException
     */
    String cloneCourse(int publisherId, String courseId, String newName, String jobId) throws DsException;

    String createNewCourseEdition(int publisherId, String courseId, String jobId) throws DsException;

    void removeLocale(int publisherId, String courseId, String locale, LockUser cgsUserDetails) throws DsException;

    List<CourseCGSObject> getSavedCoursesPropertiesByPublisher(int publisherId) throws DsException;

    CGSValidationReport validateCourseAndSubElements(int publisherId, String courseId) throws DsException;

    List<CGSValidationReport> validateAllCourses() throws DsException;

    List<String> getAllCourses(Integer publisherId);

    /**
     * @param publisherId
     * @return a list of all courses for the given publisher ID
     */
    List<Course> getAllNotHidden(Integer publisherId);

    List<Course> getCourses(int publisherId, List<String> courseIds);

    /**
     * @param pageRequest pagination information to return data by
     * @return a page containing courses for the given {@code pageRequest}
     */
    Page<Course> getPagedCourses(int publisherId, Pageable pageRequest);

    /**
     * @param pageRequest pagination information to return data by
     * @return a page containing courses for the given {@code pageRequest}
     */
    Page<Course> getCourses(int publisherId, List<String> courseIds, Pageable pageRequest);

    /**
     * Retrieves a list of courses that contain the given text in their title, one of their table of contents elements'
     * title or in one of their lessons or assessments title
     *
     * @param publisherId publisher id owning the courses
     * @param searchText  the text to search for
     * @param pageRequest pagination information to return data by
     * @return a list of courses matching the given criteria
     */
    Page<Course> searchCoursesByText(int publisherId, String searchText, Pageable pageRequest);

    /**
     * Retrieves a list of courses that contain the given text in their title
     *
     * @param publisherId publisher id owning the courses
     * @param searchText  the text to search for in the courses' title
     * @param pageRequest pagination information to return data by
     * @return a list of courses matching the given criteria
     */
    Page<Course> searchCoursesByTitle(int publisherId, String searchText, Pageable pageRequest);

    /**
     * @param publisherId publisher to search the courses on
     * @param eBookId     eBook to find the courses using it by
     * @return a list of all the courses using the eBook for the given publisher
     */
    List<Course> getByPublisherAndEBookId(Integer publisherId, String eBookId);

    void updateDifferentiationLevels(int publisherId, String courseId, String diffLevels, CGSUserDetails currentCgsUserDetails) throws DsException, JSONException, IOException;

    CGSValidationReport validateAllTocItemsWithSchema() throws DsException;

    Course createNewCourse(int publisherId, String courseTitle, CGSUserDetails userDetails, String contentLocale);

    /**
     * @param courseId       a pre-generated course ID (UUID)
     * @param eBook          a converted EBook, saved to DB
     * @param conversionData data used for ebook conversion
     * @param courseToc      toc generated based on the converted ebook, containing references to the lessons
     * @return a newly created course
     */
    Course createNewCourseFromEBookTOC(String courseId, EBook eBook, EBookConversionData conversionData, CourseToc courseToc);

    List<CourseCGSObject> getCoursesByStandardPackage(String packageName, String subjectArea);

    TinyKey getTinyKey(Integer publisherId, String courseId, String lessonId, PublishTarget lessonToUrl);
}
