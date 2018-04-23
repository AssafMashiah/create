package org.t2k.cgs.dao.courses;

import com.mongodb.*;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.t2k.cgs.dao.MongoDao;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.model.ContentItem;
import org.t2k.cgs.model.course.Course;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.sample.dao.exceptions.DaoException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 21/10/12
 * Time: 15:16
 */
@Component
public class CoursesMongoDao extends MongoDao implements CoursesDao {

    private static final Logger LOGGER = Logger.getLogger(CoursesMongoDao.class);

    // Course collection name in mongoDb
    protected static final String COURSES_COLLECTION = "courses";

    private Date dateForNewCourseSaveUponCreation = new Date(0);

    @Value("mongoScripts/searchCoursesByText.txt")
    private ClassPathResource searchCourseByTextResource;

    @Override
    public void saveCourseCGSObject(CourseCGSObject course) {
        DBObject data = course.getData();
        getMongoTemplate().save(data, COURSES_COLLECTION);
    }

    @Override
    public CourseCGSObject getCourse(int publisherId, String courseId, Date lastModified, boolean isPropertiesOnly) {
        Query query = new Query(Criteria.where(CourseCGSObject.CGS_CONTENT_DATA_COURSE_ID).is(courseId).
                and(CourseCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId));
        if (lastModified != null) {
            query.addCriteria(Criteria.where(ContentItem.CGS_LAST_MODIFIED).is(lastModified));
        }
        if (isPropertiesOnly) {
            query.fields().exclude(CourseCGSObject.CGS_COURSE_TOC_FIELD);
        }

        DBObject courseObj = getMongoTemplate().findOne(query, DBObject.class, COURSES_COLLECTION);
        return convertToCourseCGSObject(courseObj);
    }

    @Override
    public Course getCourse(int publisherId, String courseId) {
        Query query = new Query(Criteria.where(CourseCGSObject.CGS_CONTENT_DATA_COURSE_ID).is(courseId).
                and(CourseCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId));
        return getMongoTemplate().findOne(query, Course.class, COURSES_COLLECTION);
    }


    public DBRef getDBRefByCourseId(String courseId, int publisherId) throws DaoException {

        try {
            Query query = new Query(Criteria.where(CourseCGSObject.CGS_CONTENT_DATA_COURSE_ID).is(courseId).
                    and(CourseCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId));
            DBObject courseObj = getMongoTemplate().findOne(query, DBObject.class, COURSES_COLLECTION);
            DBRef result = null;

            if (courseObj != null) {
                result = new DBRef(getMongoTemplate().getDb(), COURSES_COLLECTION, courseObj.get("_id"));
            }

            return result;
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }


    @Override
    public CourseCGSObject getCourse(String courseId, boolean isPropertiesOnly) throws DaoException {
        try {
            Query query = new Query(Criteria.where(CourseCGSObject.CGS_CONTENT_DATA_COURSE_ID).is(courseId));
            if (isPropertiesOnly) {
                query.fields().exclude(CourseCGSObject.CGS_COURSE_TOC_FIELD);
            }
            DBObject courseObj = getMongoTemplate().findOne(query, DBObject.class, COURSES_COLLECTION);
            return convertToCourseCGSObject(courseObj);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }

    }


    public void saveCourseDBObject(DBObject course) {
        getMongoTemplate().insert(course, COURSES_COLLECTION);
    }


    public DBObject getCourse(String courseId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(CourseCGSObject.CGS_CONTENT_DATA_COURSE_ID).is(courseId));
            query.fields().exclude("_id").exclude(CourseCGSObject.CGS_CONTENT + ".header" + ".PUBLISHED_TO_PROD");

            return getMongoTemplate().findOne(query, DBObject.class, COURSES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public List<CourseCGSObject> getCoursesByStandardPackage(String packageName, String subjectArea) {

        Query query = new Query(Criteria.where(CourseCGSObject.CGS_CONTENT_DATA_PACKAGE_NAME).is(packageName)
                .and(CourseCGSObject.CGS_CONTENT_DATA_PACKAGE_SUBJECT_AREA).is(subjectArea));

        List<DBObject> dbObjects = getMongoTemplate().find(query, DBObject.class, COURSES_COLLECTION);

        List<CourseCGSObject> courseCGSObjects = convertToCourseCGSObjectArray(dbObjects);

        return courseCGSObjects;
    }


    @Override
    public List<CourseCGSObject> getCoursesPropertiesByPublisher(int publisherAccountId) {
        Query query = new Query(Criteria.where(CourseCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherAccountId));
        query.fields().exclude(CourseCGSObject.CGS_COURSE_TOC_FIELD);
        query.with(new Sort(Sort.Direction.DESC, ContentItem.CGS_LAST_MODIFIED));

        List<DBObject> dbObjects = getMongoTemplate().find(query, DBObject.class, COURSES_COLLECTION);
        return convertToCourseCGSObjectArray(dbObjects);
    }

    public CourseCGSObject getCoursesWithOnlyTocHierarchyByPublisher(int publisherAccountId, String courseId) throws DaoException {
        Query query = new Query(Criteria
                .where(CourseCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherAccountId)
                .and(CourseCGSObject.CGS_CONTENT_DATA_COURSE_ID).is(courseId));
        query.fields()
                .include(CourseCGSObject.CGS_CONTENT_DATA_COURSE_ID)
                .include(CourseCGSObject.CGS_TITLE)
                .include(CourseCGSObject.CGS_COURSE_TOC_FIELD + ".title")
                .include(CourseCGSObject.CGS_COURSE_TOC_FIELD + ".tocItemRefs")
                .include(CourseCGSObject.CGS_COURSE_TOC_FIELD + ".cid")
                .include(CourseCGSObject.CGS_COURSE_TOC_FIELD + ".tocItems");
        DBObject courseDBObject = getMongoTemplate().findOne(query, DBObject.class, COURSES_COLLECTION);
        return convertToCourseCGSObject(courseDBObject);
    }

    @Override
    public CourseCGSObject getCourseHeader(String courseId) throws DaoException {
        Query query = new Query(Criteria.where(CourseCGSObject.CGS_CONTENT_DATA_COURSE_ID).is(courseId));
        query.fields().include(CourseCGSObject.CGS_HEADER);
        DBObject dbObject = getMongoTemplate().findOne(query, DBObject.class, COURSES_COLLECTION);
        return convertToCourseCGSObject(dbObject);
    }


    @Override
    public CourseCGSObject getContentItemBase(String courseId) {
        Query query = new Query(Criteria.where(CourseCGSObject.CGS_CONTENT_DATA_COURSE_ID).is(courseId));

        query.fields().include("_id");
        query.fields().include(CourseCGSObject.CGS_TITLE);
        query.fields().include(CourseCGSObject.CGS_ID);
        query.fields().include(CourseCGSObject.CGS_CONTENT_DATA_VERSION);
        query.fields().include(CourseCGSObject.CGS_LAST_MODIFIED);
        query.fields().include(CourseCGSObject.CGS_DATA_PUBLISHER_ID);


        DBObject dbObject = getMongoTemplate().findOne(query, DBObject.class, COURSES_COLLECTION);
        return convertToCourseCGSObject(dbObject);
    }

    @Override
    public void deleteCourse(String courseId, int publisherId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(CourseCGSObject.CGS_CONTENT_DATA_COURSE_ID).is(courseId).
                    and(CourseCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId));
            getMongoTemplate().remove(query, COURSES_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }


    public void deleteById(DBRef dbref) {
        Query query = new Query(Criteria.where("_id").is(dbref.getId()));
        getMongoTemplate().remove(query, dbref.getRef());
    }

    @Override
    public List<CourseCGSObject> getSavedCoursesPropertiesByPublisher(int publisherId) {
        Query query = new Query(Criteria.where(CourseCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId)
                .and(ContentItem.CGS_LAST_MODIFIED).ne(dateForNewCourseSaveUponCreation)); // courses that their date is different then "new Date(0)"
        query.fields().exclude(CourseCGSObject.CGS_COURSE_TOC_FIELD);
        query.with(new Sort(Sort.Direction.DESC, ContentItem.CGS_LAST_MODIFIED));

        List<DBObject> dbObjects = getMongoTemplate().find(query, DBObject.class, COURSES_COLLECTION);
        return convertToCourseCGSObjectArray(dbObjects);
    }

    @Override
    public List<CourseCGSObject> getModifiedCoursesAfterDate(Date startDate) {
        Query query = new Query(Criteria.where(CourseCGSObject.CGS_LAST_MODIFIED).gt(startDate));
        List<DBObject> dbObjects = getMongoTemplate().find(query, DBObject.class, COURSES_COLLECTION);
        return convertToCourseCGSObjectArray(dbObjects);
    }

    @Override
    public List<Course> getCoursesTitlesIdVersionsAndCoverPicturesByPublisherId(int publisherId) {
        Query query = new Query(Criteria.where(CourseCGSObject.CGS_DATA_PUBLISHER_ID).is(publisherId)
                .and(ContentItem.CGS_LAST_MODIFIED).ne(dateForNewCourseSaveUponCreation)); // courses that their date is different then "new Date(0)"
        query.fields()
                .include(CourseCGSObject.CGS_DATA)
                .include(CourseCGSObject.CGS_CONTENT_DATA_COURSE_ID)
                .include(CourseCGSObject.CGS_TITLE)
                .include(CourseCGSObject.CGS_CONTENT_DATA_VERSION)
                .include(CourseCGSObject.CGS_COURSE_COVER_REF_ID)
                .include(CourseCGSObject.CGS_CONTENT_DATA_RESOURCES)
                .include(CourseCGSObject.CGS_CONTENT_DATA_AUTHOR)
                .include(CourseCGSObject.CGS_LAST_MODIFIED)
                .include(CourseCGSObject.CGS_COURSE_TOC_FIELD)
                .include("contentData.includeLo");
        return getMongoTemplate().find(query, Course.class, COURSES_COLLECTION);
    }

    private List<CourseCGSObject> convertToCourseCGSObjectArray(List<DBObject> dbObjects) {
        List<CourseCGSObject> cgsObjects = new ArrayList<>();
        for (DBObject dbObject : dbObjects) {
            cgsObjects.add(convertToCourseCGSObject(dbObject));
        }
        return cgsObjects;
    }

    private CourseCGSObject convertToCourseCGSObject(DBObject dbObject) {
        return dbObject == null ? null : new CourseCGSObject(dbObject);
    }

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
        throw new IllegalAccessError();
    }

    public List<CourseTitleSearchResult> getCoursesByTitleMatch(int publisherId, String searchText) throws IOException {
        List<CourseTitleSearchResult> courseList = new ArrayList<>();
        searchText = searchText.toLowerCase();
        DBCollection courses = getMongoTemplate().getDb().getCollection("courses");
        DBCollection lessonsC = getMongoTemplate().getDb().getCollection("lessons");
        DBCollection assessmentsC = getMongoTemplate().getDb().getCollection("assessments");

        BasicDBObject q = new BasicDBObject();
        q.put(CourseCGSObject.CGS_DATA_PUBLISHER_ID, publisherId);
        BasicDBObject qf = new BasicDBObject();
        qf.put(CourseCGSObject.CGS_TITLE, 1);
        qf.put("contentData.courseId", 1);
        qf.put(CourseCGSObject.CGS_COURSE_TOC_FIELD + ".title", 1);
        qf.put(CourseCGSObject.CGS_COURSE_TOC_FIELD + ".tocItemRefs", 1);
        qf.put(CourseCGSObject.CGS_COURSE_TOC_FIELD + ".cid", 1);
        qf.put(CourseCGSObject.CGS_COURSE_TOC_FIELD + ".tocItems", 1);

        Boolean included;
        DBCursor allCourses = courses.find(q, qf);

        while (allCourses.hasNext()) {
            included = false;
            DBObject course = allCourses.next();
            DBObject contentData = (DBObject) course.get("contentData");
            String courseId = (String) contentData.get("courseId");
            DBObject toc = (DBObject) contentData.get("toc");
            HashMap<String, Object> flatToc = flattenToc(toc, searchText);
            ArrayList lessons = (ArrayList) flatToc.get("lesson");
            ArrayList assessments = (ArrayList) flatToc.get("assessment");
            Boolean matched = (Boolean) flatToc.get("matched");
            if (matched && (lessons.size() > 0 || assessments.size() > 0)) {
                included = true;
            } else {
                Pattern p = java.util.regex.Pattern.compile(searchText, Pattern.CASE_INSENSITIVE);
                if (lessons.size() > 0) {
                    BasicDBObject ql = new BasicDBObject();
                    ql.put("contentData.title", p);
                    ql.put("contentData.cid", new BasicDBObject("$in", lessons));
                    ql.put("cgsData.courseId", courseId);
                    DBCursor allLessons = lessonsC.find(ql);
                    if (allLessons.count() > 0) {
                        included = true;
                    }
                }
                if (!included && assessments.size() > 0) {
                    BasicDBObject qa = new BasicDBObject();
                    qa.put("contentData.title", p);
                    qa.put("contentData.cid", new BasicDBObject("$in", assessments));
                    qa.put("cgsData.courseId", courseId);
                    DBCursor allAssessments = assessmentsC.find(qa);
                    if (allAssessments.count() > 0) {
                        included = true;
                    }
                }
            }

            if (included) {
                CourseTitleSearchResult courseSearchResult
                        = new CourseTitleSearchResult(courseId, null, true, (CourseTitleSearchResult.Toc) flatToc.get("tocItemData"));
                courseList.add(courseSearchResult);
            }
        }

        return courseList;
    }

    HashMap<String, Object> flattenToc(DBObject toc, String searchText) {

        ArrayList lesson = new ArrayList();
        ArrayList assessment = new ArrayList();
        HashMap<String, Object> flatToc = new HashMap<String, Object>();
        flatToc.put("lesson", lesson);
        flatToc.put("assessment", assessment);
        BasicDBList tocItemRefs = (BasicDBList) toc.get("tocItemRefs");
        BasicDBList tocItems = (BasicDBList) toc.get("tocItems");
        String title = (String) toc.get("title");

        String cid = (String) toc.get("cid");
        ArrayList<CourseTitleSearchResult.TocItemRef> resultTocItemRefs = new ArrayList<>();
        ArrayList<CourseTitleSearchResult.Toc> resultTocItems = new ArrayList<>();
        CourseTitleSearchResult.Toc resultTocItem = new CourseTitleSearchResult.Toc(cid, title, false, resultTocItems, resultTocItemRefs);

        Boolean matched = false;
        if (title != null && title.toLowerCase().contains(searchText)) {
            matched = true;
        }

        for (int i = 0; i < tocItemRefs.size(); i++) {
            DBObject tocItemRef = (DBObject) tocItemRefs.get(i);
            String type = (String) tocItemRef.get("type");
            cid = (String) tocItemRef.get("cid");
            EntityType entityType = null;
            if (type.equals("lesson")) {
                lesson.add(cid);
                entityType = EntityType.LESSON;
            }
            if (type.equals("assessment")) {
                assessment.add(cid);
                entityType = EntityType.ASSESSMENT;
            }
            CourseTitleSearchResult.TocItemRef tiref = new CourseTitleSearchResult.TocItemRef(cid, null, entityType, null, false);
            resultTocItemRefs.add(tiref);
        }

        for (int i = 0; i < tocItems.size(); i++) {
            DBObject tocItem = (DBObject) tocItems.get(i);
            HashMap<String, Object> childFlatToc = flattenToc(tocItem, searchText);
            CourseTitleSearchResult.Toc cresultToc = (CourseTitleSearchResult.Toc) childFlatToc.get("tocItemData");
            resultTocItems.add(cresultToc);
            lesson.addAll((ArrayList) childFlatToc.get("lesson"));
            assessment.addAll((ArrayList) childFlatToc.get("assessment"));
            Boolean cmatched = (Boolean) childFlatToc.get("matched");
            matched = (matched || cmatched);
        }

        flatToc.put("tocItemData", resultTocItem);
        flatToc.put("matched", matched);
        return flatToc;
    }
}
