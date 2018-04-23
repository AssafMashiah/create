package com.t2k.cgs.dbupgrader.task;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.apache.log4j.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Required;

import java.util.Date;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 13/07/14
 * Time: 16:26
 */
public abstract class SequenceUpdate extends CommonTask {

    public final static String DB_CONTENT_KEY = "content";
    public final static String DB_SEQ_ID_KEY = "seqId";
    public final static String DB_LESSON_CID = "lessonCId";
    public final static String DB_COURSE_ID = "courseId";
    public final static String DB_OBJECT_ID = "_id";
    public final String CONVERTED_DATA_KEY = "convertedData";
    public final String LINKING_TASK = "linking";
    public final String MATCHING_TASK = "matching";
    public final String MMC_TASK = "mmc";
    public final String MC_TASK = "mc";
    public final String CLOZE_TASK = "cloze";
    public final String DIV = "div";
    public final String SPAN = "span";

    public final String CLOZE_BANK_TYPE = "clozeBank";
    public final String TEXT_VIEWER_TYPE = "textViewer";
    public final String MATCHING_ANSWER = "matchingAnswer";
    public final String LINKING_ANSWER = "linking";
    public final String SIMPLE_MC_ANSWER = "mc";
    public final String MMC_ANSWER = "mmc";
    public final String CLOZE_ANSWER = "cloze_answer";

    private int changedSequences = 0;

    private static Logger logger = Logger.getLogger(SequenceUpdate.class);

    protected MigrationDao migrationDao;


    @Override
    public void executeUpInternal() throws Exception {
        fixSequences();
        logger.debug("Upgrade script finished. Updated " + changedSequences + " sequences.");
        System.out.println("Upgrade script finished. Updated " + changedSequences + " sequences.");
    }


    /***
     * Main method -
     * a. Goes to mongo and gets a list of sequences to scan and see if they need a fix
     * b. Modifies the the sequence if needed (using ModifySequenceIfNeccessery)
     * c. if a modification was made - the new sequence is saved and the lesson lastModified is updated.
     * @throws JSONException
     */
    public void fixSequences() throws JSONException {
        DBCursor cursor = getSequencesToScan();
        while (cursor.hasNext()) {
            DBObject sequence = cursor.next();

            Boolean changed = modifySequenceIfNecessary(sequence);
            if (changed) {
                sequence.put("lastModified", new Date());
                migrationDao.saveSequencesDbObject(sequence);
                DBObject lesson = migrationDao.getLessonById(sequence.get(DB_COURSE_ID).toString(), sequence.get(DB_LESSON_CID).toString());
                if (lesson != null)
                    updateLessonLastModified(sequence.get(DB_COURSE_ID).toString(), sequence.get(DB_LESSON_CID).toString());
                else
                    System.out.println("Could not update lesson: " + sequence.get(DB_LESSON_CID).toString() + " from course " + sequence.get(DB_COURSE_ID).toString());
                String message = String.format("changed sequenceId: %s, _id: %s", sequence.get(DB_SEQ_ID_KEY), sequence.get(DB_OBJECT_ID));
                logger.debug(message);
                System.out.println(message);
                changedSequences++;
            }
        }
    }

    private void updateLessonLastModified(String courseId, String lessonId) {
        DBObject lesson = migrationDao.getLessonById(courseId, lessonId);
        ((DBObject) ((DBObject) lesson.get("contentData")).get("header")).put("last-modified", new Date());
        migrationDao.saveLesson(lesson);
        logger.debug("Updated LastModified date for lesson: " + lessonId);
        System.out.println("Updated LastModified date for lesson: " + lessonId);
    }

    /**
     * returns a cursor of the the smallest collection of sequences to be scanned.
     * The smaller the cursor.size() is -> the faster the script will run.
     * For example - returns only sequences that are connected to a specific course
     *
     * @return
     */
    public abstract DBCursor getSequencesToScan();

    /**
     * Checks the sequence's content json, returns true iff this is a sequence that needs modification \ further investigation
     *
     * @param contentJson
     * @return
     * @throws atg.taglib.json.util.JSONException
     */
    public abstract Boolean sequenceContentNeedsModification(JSONObject contentJson) throws JSONException;


    /**
     * Checks if the sequence needs modification, if so - modifies the sequence.
     * returns true iff a change was made in the sequence
     *
     * @param sequence
     * @return
     * @throws atg.taglib.json.util.JSONException
     */
    public boolean modifySequenceIfNecessary(DBObject sequence) throws JSONException {
        Boolean jsonChanged = false;
        String courseId = sequence.get(DB_COURSE_ID).toString();
        String seqId = sequence.get(DB_SEQ_ID_KEY).toString();
        String lessonId = sequence.get(DB_LESSON_CID).toString();

        JSONObject contentJson = new JSONObject(sequence.get(DB_CONTENT_KEY).toString());
        Boolean isSequenceContentNeedsModification = sequenceContentNeedsModification(contentJson);
        if (isSequenceContentNeedsModification) {
            jsonChanged = true;
            modifyContentDataWithoutConvertedData(contentJson);
            if (contentJson.getJSONObject(seqId).has(CONVERTED_DATA_KEY)) {
                modifyConvertedData(contentJson, seqId);
                String contentAfterEscaping = contentJson.toString().replaceAll("<\\\\/", "</");
                sequence.put(DB_CONTENT_KEY, contentAfterEscaping);  //update the sequence content containing new titles data xml only if changed
                String message = "Modified sequence " +
                        "Course: " + courseId + "\n" +
                        "Lesson: " + lessonId + "\n" +
                        "Sequence: " + seqId + "\n";

                logger.debug(message);
                System.out.println(message);
            }
        }
        return jsonChanged;
    }

    /**
     * Modifies the Jsons of a sequence, but does not touch the convertedData value sent for DL.
     * This method will take care of the textViewer nodes, and other nodes in Json that are used only by CGS.
     *
     * @param contentJson
     */
    public abstract void modifyContentDataWithoutConvertedData(JSONObject contentJson) throws JSONException;


    public String getSubSequenceType(JSONObject subSequence) throws JSONException {
        if (subSequence.has("type"))
            return subSequence.get("type").toString();
        else
            return "";
    }

    /**
     * Modifies converted data inside @contentJson, returns true if a modification was made.
     * anyways, if the change was made - it updates it in the @contentJson.convertedData (stringified xml)
     *
     * @param contentJson
     * @param seqId
     * @return
     * @throws atg.taglib.json.util.JSONException
     *
     */
    public Boolean modifyConvertedData(JSONObject contentJson, String seqId) throws JSONException {
        String xmlDoc = contentJson.getJSONObject(seqId).getString(CONVERTED_DATA_KEY);
        Document doc = Jsoup.parse(xmlDoc).outputSettings(new Document.OutputSettings().prettyPrint(false));
        Boolean xmlChanged = modifyConvertedData(doc);
        if (xmlChanged)   //update converted data xml only if changed
            contentJson.getJSONObject(seqId).put(CONVERTED_DATA_KEY, doc.body().children());
        return xmlChanged;
    }

    /***
     * Modifies the converted data xml: @doc,
     * returns true if a change was made in the @doc
     * @param doc
     * @return
     */
    public abstract boolean modifyConvertedData(Document doc);


    public String getParentType(JSONObject parent, JSONObject jsonObject) throws JSONException {
        if (!parent.has("type"))
            return null;
        String parentType = parent.get("type").toString();

        if (parentType.equals(CLOZE_TASK))
            return CLOZE_TASK;
        if (parentType.equals(MC_TASK)) {
            for (Object child : parent.getJSONArray("children")) {
                JSONObject childNode = jsonObject.getJSONObject(child.toString());
                if (childNode.getString("type").equals("mcAnswer") && childNode.has("data") && childNode.getJSONObject("data").has("answerMode")) {
                    String childType = childNode.getJSONObject("data").getString("answerMode");
                    if (childType.equals(SIMPLE_MC_ANSWER))
                        return SIMPLE_MC_ANSWER;
                    else if (childType.equals(MMC_ANSWER))
                        return MMC_ANSWER;
                }
            }
        } else if (parentType.equals(MATCHING_TASK)) {
            for (Object child : parent.getJSONArray("children")) {
                JSONObject childNode = jsonObject.getJSONObject(child.toString());
                if (childNode.has("type") && childNode.getString("type").equals(LINKING_ANSWER)) {
                    return LINKING_TASK;
                } else if (childNode.has("type") && childNode.getString("type").equals(MATCHING_ANSWER))
                    return MATCHING_TASK;
            }
        }
        return null;
    }


    @Override
    protected void executeDownInternal() throws Exception {
        //To change body of implemented methods use File | Settings | File Templates.
    }


    ///////////////////////
    // Injection Setters //
    ///////////////////////
    @Required
    public void setMigrationDao(MigrationDao migrationDao) {
        this.migrationDao = migrationDao;
    }

    // Test method
    public DBObject fixSpecificSequence(String seqId) throws JSONException {
        DBObject sequence = migrationDao.getSequencesBySeqId(seqId);
        Boolean changed = modifySequenceIfNecessary(sequence);
        if (changed) {
            sequence.put("lastModified", new Date());
            migrationDao.saveSequencesDbObject(sequence);
            updateLessonLastModified(sequence.get(DB_COURSE_ID).toString(), sequence.get(DB_LESSON_CID).toString());
            System.out.println("changed status for sequence: " + sequence.get(DB_SEQ_ID_KEY) + ", _id:" + sequence.get(DB_OBJECT_ID));
        }
        return sequence;
    }

    public MigrationDao getMigrationDao() {
        return migrationDao;
    }

}
