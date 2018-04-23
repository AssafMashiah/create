package com.t2k.cgs.dbupgrader.dao;

import com.mongodb.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;
import java.util.regex.Pattern;

import static com.t2k.cgs.dbupgrader.dao.Collection.*;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 10/24/12
 * Time: 10:42 AM
 */
public class MigrationDao {

    private MongoTemplate mongoTemplate;


    public DB getDb() {
        return mongoTemplate.getDb();
    }

    public DBCursor getCursor(Collection collection) {
        BasicDBObject query = new BasicDBObject();
        return mongoTemplate.getCollection(collection.getName()).find(query);
    }

    /**
     * Saves an object to the given mongo collection
     * <p>
     * WARNING: Please be careful not to mix-up collections and save objects to collections they don't belong to!
     *
     * @param collection     collection to save the object to
     * @param courseDbObject object to be saved to database
     */
    public void save(Collection collection, DBObject courseDbObject) {
        mongoTemplate.save(courseDbObject, collection.getName());
    }

    public DBCursor getSequencesDbObjectsCursor() {
        BasicDBObject query = new BasicDBObject();
        return mongoTemplate.getCollection(SEQUENCES_COLLECTION.getName()).find(query);
    }

    public DBCursor getLessonsDbObjectsCursor() {
        BasicDBObject query = new BasicDBObject();
        return mongoTemplate.getCollection(LESSONS_COLLECTION.getName()).find(query);
    }

    public DBObject getLessonById(String courseId, String lessonId) {
        BasicDBObject query = new BasicDBObject();
        query.put("contentData.cid", lessonId);
        query.put("cgsData.courseId", courseId);
        return mongoTemplate.getCollection(LESSONS_COLLECTION.getName()).findOne(query);
    }

    public DBCursor getLessonsByIdsAndCourseId(String courseId, List<String> lessonIds) {
        BasicDBObject query = new BasicDBObject();
        query.put("contentData.cid", new BasicDBObject("$in", lessonIds));
        query.put("cgsData.courseId", courseId);
        return mongoTemplate.getCollection(LESSONS_COLLECTION.getName()).find(query);
    }

    public void saveSequencesDbObject(DBObject sequencesDbObject) {
        mongoTemplate.save(sequencesDbObject, SEQUENCES_COLLECTION.getName());
    }


    public List<DBObject> getCoursesDbObjects() {
        return mongoTemplate.findAll(DBObject.class, COURSES_COLLECTION.getName());
    }

    public List<DBObject> getCoursesDBObjectsByPublisherId(int publisherId) {
        Query query = Query.query(Criteria.where("cgsData.publisherId").is(publisherId));
        return mongoTemplate.find(query, DBObject.class, COURSES_COLLECTION.getName());
    }

    public DBCursor getCoursesDbCursor() {
        BasicDBObject query = new BasicDBObject();
        return mongoTemplate.getCollection(COURSES_COLLECTION.getName()).find(query);
    }

    public DBObject getCourseById(String courseId) {
        return mongoTemplate.findOne(Query.query(Criteria.where("_id").is(courseId)), DBObject.class, COURSES_COLLECTION.getName());
    }

    public void saveCourse(DBObject courseDbObject) {
        mongoTemplate.save(courseDbObject, COURSES_COLLECTION.getName());
    }

    public List<DBObject> getLessonsDbObjects() {
        return mongoTemplate.findAll(DBObject.class, LESSONS_COLLECTION.getName());
    }

    public List<DBObject> getAssessmentsDbObjects() {
        return mongoTemplate.findAll(DBObject.class, ASSESSMENT_COLLECTION.getName());
    }

    public void saveLesson(DBObject lessonDbObject) {
        mongoTemplate.save(lessonDbObject, LESSONS_COLLECTION.getName());
    }

    public void saveAssessment(DBObject lessonDbObject) {
        mongoTemplate.save(lessonDbObject, ASSESSMENT_COLLECTION.getName());
    }

    public List<DBObject> getAllPublishers() {

        return mongoTemplate.findAll(DBObject.class, PUBLISHER_COLLECTION.getName());
    }

    public void savePublisher(DBObject publisherDBObject) {
        mongoTemplate.save(publisherDBObject, PUBLISHER_COLLECTION.getName());
    }

    public List<DBObject> getAllUsers() {
        return mongoTemplate.findAll(DBObject.class, USERS_COLLECTION.getName());
    }

    public void saveUser(DBObject usersDBObject) {
        mongoTemplate.save(usersDBObject, USERS_COLLECTION.getName());
    }

    public List<DBObject> getAllGroups() {
        return mongoTemplate.findAll(DBObject.class, GROUPS_COLLECTION.getName());
    }

    public void saveGroup(DBObject groupDBObject) {
        mongoTemplate.save(groupDBObject, GROUPS_COLLECTION.getName());
    }

    public List<DBObject> getAllRoles() {
        return mongoTemplate.findAll(DBObject.class, ROLES_COLLECTION.getName());
    }

    public List<DBObject> getAllEbooks() {
        return mongoTemplate.findAll(DBObject.class, EBOOKS_COLLECTION.getName());
    }

    public void saveEbook(DBObject eBookDBObject) {
        mongoTemplate.save(eBookDBObject, EBOOKS_COLLECTION.getName());
    }


    ///////////////////////
    // Injection Setters //
    ///////////////////////
    public void setMongoTemplate(MongoTemplate mongoTemplate) {

        this.mongoTemplate = mongoTemplate;
    }

    public DBObject getSequencesBySeqId(String seqId) {
        BasicDBObject query = new BasicDBObject();
        query.put("seqId", seqId);
        return mongoTemplate.getCollection(SEQUENCES_COLLECTION.getName()).findOne(query);
    }

    public List<DBObject> getSequencesListWithContentContaining(String regex) {
        Pattern p = java.util.regex.Pattern.compile(regex);
        Query query = new Query(Criteria.where("content").regex(p));
        return mongoTemplate.find(query, DBObject.class, SEQUENCES_COLLECTION.getName());
    }

    public DBCursor getSequencesWithContentContaining(String regex) {
        BasicDBObject query = new BasicDBObject();
        query.put("content", java.util.regex.Pattern.compile(regex));
        return mongoTemplate.getCollection(SEQUENCES_COLLECTION.getName()).find(query);
    }

    public DBCursor getSequencesWithContentContaining(List<String> regexes) {
        BasicDBList andConditionsList = new BasicDBList();
        for (String regex : regexes) {
            andConditionsList.add(new BasicDBObject("content", java.util.regex.Pattern.compile(regex)));
        }

        DBObject query = new BasicDBObject("$and", andConditionsList);
        return mongoTemplate.getCollection(SEQUENCES_COLLECTION.getName()).find(query);
    }

    public List<DBObject> getAllStandards() {
        return mongoTemplate.find(new Query(), DBObject.class, STANDARDS_COLLECTION.getName());
    }

    public void saveStandard(DBObject standard) {
        mongoTemplate.save(standard, STANDARDS_COLLECTION.getName());
    }

    public DBCursor getCoursesByCustomizationPackLanguages(List<String> languages_to_be_modified) {
        DBObject query = BasicDBObjectBuilder.start()
                .push("contentData.customizationPack.language")
                .add("$in", languages_to_be_modified)
                .get();
        return mongoTemplate.getCollection(COURSES_COLLECTION.getName()).find(query);
    }

    public DBCursor getLessonsByQuery(BasicDBObject query) {
        return mongoTemplate.getCollection(LESSONS_COLLECTION.getName()).find(query);
    }

    public DBCursor getAssessmentsByQuery(BasicDBObject query) {
        return mongoTemplate.getCollection(ASSESSMENT_COLLECTION.getName()).find(query);
    }
}
