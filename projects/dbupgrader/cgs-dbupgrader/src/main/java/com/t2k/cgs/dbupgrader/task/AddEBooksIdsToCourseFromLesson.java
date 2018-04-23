package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.cgs.dbupgrader.utils.CourseUtils;
import com.t2k.common.dbupgrader.task.common.CommonTask;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Moves eBooks Map object from lesson level to eBooksIds list; Adds eBooksIds to course level
 *
 * @author Alex Burdusel on 2016-09-16.
 */
public class AddEBooksIdsToCourseFromLesson extends CommonTask {

    private MigrationDao migrationDao;

    @Override
    protected void executeUpInternal() throws Exception {
        DBCursor coursesCursor = migrationDao.getCoursesDbCursor();
        while (coursesCursor.hasNext()) {
            DBObject course = coursesCursor.next();
            try {
                updateCourse(course);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        updateAssessmentsSchema();
    }

    private void updateCourse(DBObject course) {
        DBObject contentData = (DBObject) course.get("contentData");
        if (contentData == null) return;
        String courseId = (String) contentData.get("courseId");
        if (courseId == null) return;
        System.out.println(String.format("Updating course '%s'", courseId));
        List<String> lessonCids = CourseUtils.getLessonIds(course);
        Set<String> eBookIds = new HashSet<>();
        lessonCids.forEach(lessonCid -> eBookIds.addAll(updateLesson(courseId, lessonCid)));
        List<String> existingEBookIds = (List<String>) contentData.get("eBooksIds");
        if (existingEBookIds != null) eBookIds.addAll(existingEBookIds);
        contentData.put("eBooksIds", eBookIds);
        migrationDao.saveCourse(course);
    }

    /**
     * @return a set of eBookIds found on the lesson
     */
    private Set<String> updateLesson(String courseId, String lessonId) {
        Set<String> eBooksIDs = new HashSet<>();
        DBObject lesson = migrationDao.getLessonById(courseId, lessonId);
        if (lesson == null) return eBooksIDs;
        DBObject content = (DBObject) lesson.get("contentData");
        if (content == null) return eBooksIDs;
        System.out.println(String.format("Updating lesson '%s' on course '%s'", lessonId, courseId));
        content.put("schema", "course_v7");
        Map<String, String> eBooks = (Map<String, String>) content.get("eBooks");
        if (eBooks != null) {
            eBooksIDs.addAll(eBooks.keySet());
            content.removeField("eBooks");
            content.put("eBooksIds", eBooksIDs);
        }
        migrationDao.saveLesson(lesson);
        return eBooksIDs;
    }

    private void updateAssessmentsSchema() {
        DBCursor assessmentsCursor = migrationDao.getAssessmentsByQuery(new BasicDBObject());
        while (assessmentsCursor.hasNext()) {
            DBObject assessment = assessmentsCursor.next();
            DBObject contentData = (DBObject) assessment.get("contentData");
            if (contentData == null) return;
            System.out.println(String.format("Updating schema version for assessment '%s'", contentData.get("cid")));
            contentData.put("schema", "course_v7");
            migrationDao.saveAssessment(assessment);
        }
    }

    @Override
    protected void executeDownInternal() throws Exception {
    }

    public void setMigrationDao(MigrationDao migrationDao) {
        this.migrationDao = migrationDao;
    }
}
