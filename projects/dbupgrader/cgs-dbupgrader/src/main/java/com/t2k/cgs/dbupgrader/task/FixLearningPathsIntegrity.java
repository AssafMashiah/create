package com.t2k.cgs.dbupgrader.task;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.Collection;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.dao.IUpdateLogDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.apache.log4j.Logger;
import org.springframework.util.Assert;

import java.util.ArrayList;
import java.util.Date;

public class FixLearningPathsIntegrity extends CommonTask {

    private final static Logger LOGGER = Logger.getLogger(FixLearningPathsIntegrity.class);

    private MigrationDao migrationDao;

    public FixLearningPathsIntegrity(MigrationDao migrationDao, IUpdateLogDao updateLogDao) {
        Assert.notNull(migrationDao);
        this.migrationDao = migrationDao;
        Assert.notNull(updateLogDao);
        setUpdateLogDao(updateLogDao);
    }

    @Override
    protected void executeUpInternal() throws Exception {
        ArrayList<String> placementAssessments = getAllPlacementAssessments();
        updateLearningPaths(placementAssessments);
    }

    @Override
    protected void executeDownInternal() throws Exception {
    }


    private ArrayList<String> getAllPlacementAssessments() {
        ArrayList<String> placementAssessments = new ArrayList<>();
        DBCursor cursor = migrationDao.getCursor(Collection.ASSESSMENT_COLLECTION);
        while (cursor.hasNext()) {
            DBObject dbObject = cursor.next();
            DBObject contentData = (DBObject) dbObject.get("contentData");
            if (contentData.containsField("placement")) {
                boolean isPlacement = (boolean) contentData.get("placement");
                if (isPlacement) {
                    String assessmentId = (String) contentData.get("cid");
                    placementAssessments.add(assessmentId);
                }
            }
        }
        return placementAssessments;
    }

    private void updateLearningPaths(ArrayList<String> placementAssessments) {
        DBCursor cursor = migrationDao.getCursor(Collection.COURSES_COLLECTION);
        int noOfUpdateCourses = 0;
        while (cursor.hasNext()) {
            DBObject dbObject = cursor.next();
            DBObject contentData = (DBObject) dbObject.get("contentData");
            String courseId = (String) contentData.get("courseId");
            BasicDBList learningPaths = (BasicDBList)  contentData.get("learningPaths");
            int noOfLearningPathsDeleted = 0;
            if (learningPaths != null) {
                for (int i = learningPaths.size() - 1; i >= 0; i--) {
                    BasicDBObject learningPath = (BasicDBObject) learningPaths.get(i);
                    String assessmentCid = (String) learningPath.get("assessmentCid");
                    if (!placementAssessments.contains(assessmentCid)) {
                        learningPaths.remove(i);
                        noOfLearningPathsDeleted++;
                        LOGGER.debug(String.format("Learning path with unreferenced assessment found: %s on course: %s and marked as deleted", assessmentCid, courseId));
                    }
                }
            }
            if (noOfLearningPathsDeleted > 0) {
                try {
                    migrationDao.save(Collection.COURSES_COLLECTION, dbObject);
                    noOfUpdateCourses++;
                    LOGGER.error(String.format("Saved to database successful. No of deleted l.p.: %s", noOfLearningPathsDeleted));
                } catch (Exception e) {
                    LOGGER.error(String.format("Error saving to database collection object %s ", dbObject), e);
                }
            }
        }
        cursor.close();
        if (noOfUpdateCourses != 0) {
            LOGGER.debug(String.format("Update successful %s courses",
                    noOfUpdateCourses));
        } else {
            LOGGER.warn("No updated courses.");
        }
    }
}
