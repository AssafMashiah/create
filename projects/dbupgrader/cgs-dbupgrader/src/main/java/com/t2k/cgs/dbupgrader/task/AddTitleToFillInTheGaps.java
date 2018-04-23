package com.t2k.cgs.dbupgrader.task;

import atg.taglib.json.util.JSONArray;
import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import org.apache.log4j.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Required;

import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 13/07/14
 * Time: 16:26
 */
public class AddTitleToFillInTheGaps extends CommonTask  {

        public final static String DB_CONTENT_KEY = "content";
        public final static String DB_SEQ_ID_KEY = "seqId";
        public final static String DB_LESSON_CID = "lessonCId";
        public final static String DB_COURSE_ID = "courseId";
        public final static String DB_OBJECT_ID = "_id";
        public final String CONVERTED_DATA_KEY = "convertedData";
        public final String LINKING_TASK = "linking";
        public final String MATCHING_TASK = "matching";
        public final String MMC_TASK= "mmc";
        public final String MC_TASK = "mc";
        public final String CLOZE_TASK = "cloze";

        public final String MATCHING_ANSWER = "matchingAnswer";
        public final String LINKING_ANSWER = "linking";
        public final String SIMPLE_MC_ANSWER = "mc";
        public final String MMC_ANSWER = "mmc";
        public final String CLOZE_ANSWER = "cloze_answer";

        public final String MC_FRENCH_INSTRUCTIONS = "Clique sur la bonne r\u00E9ponse.";
        public final String MMC_FRENCH_INSTRUCTIONS = "Clique sur la ou les bonnes r\u00E9ponses.";
        public final String LINKING_FRENCH_INSTRUCTIONS = "Faites correspondre les sujets de la partie A aux sujets appropri\u00E9s de la partie B.";
        public final String MATCHING_FRENCH_INSTRUCTIONS = "D\u00E9place chaque \u00E9tiquette pour la faire correspondre \u00E0 la bonne d\u00E9finition.";
        public final String CLOZE_FRENCH_INSTRUCTIONS = "Compl\u00E9te la ou les parties manquantes.";
        private int changedCounter = 0;
        private static Logger logger = Logger.getLogger(AddTitleToFillInTheGaps.class);
        public List<String> typesOfSequencesToChange = Arrays.asList(CLOZE_TASK);

        private MigrationDao migrationDao;

        private HashSet<String> frenchCourses;
        private HashSet<String> taskTypes = new HashSet<>();

        @Override
        public void executeUpInternal() throws Exception {
            frenchCourses = getFrenchCourses();
            fixSequencesWithoutInstructions();
            logger.debug("Upgrade script finished. Updated "+changedCounter+" courses.");
        }

        private HashSet<String> getFrenchCourses() {
            HashSet<String> result = new HashSet<>();
            DBCursor cursor = migrationDao.getCoursesDbCursor();
            while (cursor.hasNext()) {
                DBObject course = cursor.next();
                Object locale = ((DBObject) course.get("contentData")).get("contentLocales");
                if ((locale != null) && locale.toString().toLowerCase().contains("fr_fr"))
                    result.add(course.get("_id").toString());
            }
            logger.debug("Found "+result.size()+" french courses.");
            return result;
        }


        public void updateLessonLastModified(String courseId,String lessonId){
            DBObject lesson = migrationDao.getLessonById(courseId,lessonId);
            ((DBObject) ((DBObject) lesson.get("contentData")).get("header")).put("last-modified", new Date());
            migrationDao.saveLesson(lesson);
            logger.debug("Updated LastModified date for lesson: "+lessonId);

        }

        public void fixSequencesWithoutInstructions() throws JSONException {
            DBCursor cursor = migrationDao.getSequencesDbObjectsCursor();
            while (cursor.hasNext()) {
                DBObject sequence = cursor.next();
                if (isFrench(sequence)) {
                    Boolean changed = fixEmptyInstructionFieldIfNeedes(sequence);
                    if (changed) {
                        sequence.put("lastModified", new Date());
                        migrationDao.saveSequencesDbObject(sequence);
                        DBObject lesson = migrationDao.getLessonById(sequence.get(DB_COURSE_ID).toString(),sequence.get(DB_LESSON_CID).toString());
                        if (lesson!=null)
                            updateLessonLastModified(sequence.get(DB_COURSE_ID).toString(),sequence.get(DB_LESSON_CID).toString());
                        else
                            System.out.println("Could not update lesson: "+sequence.get(DB_LESSON_CID).toString()+" from course "+sequence.get(DB_COURSE_ID).toString());
                        logger.debug("changed status for sequence: "+sequence.get(DB_SEQ_ID_KEY)+", _id:"+sequence.get(DB_OBJECT_ID));
                        System.out.println("changed status for sequence: " + sequence.get(DB_SEQ_ID_KEY) + ", _id:" + sequence.get(DB_OBJECT_ID));
                        changedCounter++;
                    }
                }
            }
        }

        public void fixSpecificSequence(String seqId) throws JSONException {
           frenchCourses = getFrenchCourses();
            DBObject sequence = migrationDao.getSequencesBySeqId(seqId);
            if (isFrench(sequence)) {
                Boolean changed = fixEmptyInstructionFieldIfNeedes(sequence);
                if (changed) {
                    sequence.put("lastModified", new Date());
                    migrationDao.saveSequencesDbObject(sequence);
                    updateLessonLastModified(sequence.get(DB_COURSE_ID).toString(),sequence.get(DB_LESSON_CID).toString());
                    System.out.println("changed status for sequence: "+sequence.get(DB_SEQ_ID_KEY)+", _id:"+sequence.get(DB_OBJECT_ID));
                }
            }
        }

        private boolean fixEmptyInstructionFieldIfNeedes(DBObject sequence) throws JSONException {
            Boolean jsonChanged = false;
            String courseId = sequence.get(DB_COURSE_ID).toString();
            String seqId = sequence.get(DB_SEQ_ID_KEY).toString();
            HashMap<String,String> textViewersToChange = new HashMap<>();
            JSONObject contentJson = new JSONObject(sequence.get(DB_CONTENT_KEY).toString());
            Iterator keys = contentJson.keys();
            while (keys.hasNext()) {    //iterating over all items in 'content'
                String taskID = keys.next().toString();
                JSONObject subSequence = contentJson.getJSONObject(taskID);
                if (subSequence.has("type") && subSequence.get("type").toString().equals("instruction")) {   // looking over the instruction nodes
                    String instructionId = subSequence.getString("id");
                    JSONObject parent = contentJson.getJSONObject(subSequence.get("parent").toString());
                    if (parent.has("type") && subSequence.has("children")) {
                        String parentType = getParentType(parent,contentJson);
                        if (typesOfSequencesToChange.contains(parentType)) {
                            // Reordering children so that the instructions will be the first child of the text viewer
                            if (!parent.getJSONArray("children").get(0).equals(instructionId)){
                                parent.getJSONArray("children").remove(instructionId);
                                parent.getJSONArray("children").add(0,instructionId);
                                contentJson.put(parent.getString("id"),parent);
                                jsonChanged = true;
                            }
                            JSONArray instructionsChildren = subSequence.getJSONArray("children");
                            if (!instructionsChildren.isEmpty()) {
                                JSONObject textViewer = contentJson.getJSONObject(instructionsChildren.get(0).toString());
                                if (textViewer.has("data") && textViewer.has("type")&& textViewer.has("id")) {
                                    String textViewerId = textViewer.getString("id");
                                    JSONObject viewerData = textViewer.getJSONObject("data");
                                    //  looking for the textViewers with and empty title and that exist in a specific type of sequence
                                    viewerData.put("disableDelete",true);    // remove the trash bin icon
                                    viewerData.put("stageReadOnlyMode", true);   // disable editing for the instruction
                                    viewerData.put("isValid", true);   // sets the validation flag to avoid errors in preview
                                    viewerData.put("styleOverride","instruction");
                                    viewerData.put("mode","singleStylePlainText");
                                    jsonChanged = true;

                                    if (textViewer.get("type").toString().equalsIgnoreCase("textViewer") && viewerData.has("title") && viewerData.get("title").toString().isEmpty()) {

                                        String newInstruction = getDefaultInstructionByType(parentType);

                                        textViewersToChange.put(textViewerId, newInstruction); //text viewers that needs update in the convertedData xml.

                                        viewerData.put("title", createInstructionTextForJson(newInstruction));

                                    }
                                    if (jsonChanged) {
                                        textViewer.put("data", viewerData);
                                        contentJson.put(textViewerId, textViewer);  //update text viewer with new answer
                                        String message = "Changed title for:\n Parent type: " + parentType + "\n" +
                                                "Course: " + courseId + "\n" +
                                                "Sequence: " + seqId + "\n" +
                                                "Task: " + taskID + "\n" +
                                                "Viewer: " + textViewerId;
                                        logger.debug(message);
                                        System.out.println(message);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (jsonChanged && contentJson.getJSONObject(seqId).has(CONVERTED_DATA_KEY)) {

                ModifyConvertedData(contentJson, textViewersToChange,seqId);
                String contentAfterEscaping = contentJson.toString().replaceAll("<\\\\/", "</");
                sequence.put(DB_CONTENT_KEY, contentAfterEscaping);  //update the sequence content containing new titles data xml only if changed
            }

            return jsonChanged;
        }


    /***
     * Modifies converted data inside @contentJson, returns true if a modification was made.
     * anyways, if the change was made - it updates it in the @contentJson.convertedData (stringified xml)
     * @param contentJson
     * @param textViewersToChange
     * @param seqId
     * @return
     * @throws JSONException
     */
    private Boolean ModifyConvertedData(JSONObject contentJson, HashMap<String, String> textViewersToChange, String seqId) throws JSONException {
        String xmlDoc = contentJson.getJSONObject(seqId).getString(CONVERTED_DATA_KEY);
        Boolean xmlChanged = false;
        Document doc = Jsoup.parse(xmlDoc);
        for (String textViewerId : textViewersToChange.keySet()){
            Element textViewerElement = doc.getElementById(textViewerId);
            if (textViewerElement!=null && textViewerElement.tagName().equalsIgnoreCase("textviewer")){
                doc.getElementById(textViewerId).html(createTextDiv(textViewersToChange.get(textViewerId)));
                xmlChanged = true;
            }
        }
        if (xmlChanged)   //update converted data xml only if changed
            contentJson.getJSONObject(seqId).put(CONVERTED_DATA_KEY,doc.body().children() );
        return xmlChanged;
    }

    private String createInstructionTextForJson(String newInstruction) {
            return "<div class=\"cgs instruction\" style=\"min-width: 28px;min-height: 28px;margin: 0 10px 0px 0px;padding: 0;outline: none;white-space:pre-wrap;clear:both; -webkit-user-select: auto\" contenteditable=\"false\" customStyle=\"instruction\">"+newInstruction+"</div>";
        }

        private String createTextDiv(String newInstruction) {
            return "<p><span class=\"instruction\">"+newInstruction+"</span></p>";
        }

        private String getParentType(JSONObject parent,JSONObject jsonObject) throws JSONException {
            if (!parent.has("type"))
                return null;
            String parentType = parent.get("type").toString();

            if (parentType.equals(CLOZE_TASK))
                return CLOZE_TASK;
            if (parentType.equals(MC_TASK)){
                for (Object child : parent.getJSONArray("children"))  {
                    JSONObject childNode = jsonObject.getJSONObject(child.toString());
                    if (childNode.getString("type").equals("mcAnswer") && childNode.has("data") && childNode.getJSONObject("data").has("answerMode")){
                        String childType =  childNode.getJSONObject("data").getString("answerMode");
                        if (childType.equals(SIMPLE_MC_ANSWER))
                            return SIMPLE_MC_ANSWER;
                        else if (childType.equals(MMC_ANSWER))
                            return MMC_ANSWER;
                    }
                }
            }
            else if (parentType.equals(MATCHING_TASK)){
                for (Object child : parent.getJSONArray("children"))  {
                    JSONObject childNode = jsonObject.getJSONObject(child.toString());
                    if (childNode.has("type") && childNode.getString("type").equals(LINKING_ANSWER)){
                        return LINKING_TASK;
                    }
                    else if (childNode.has("type") && childNode.getString("type").equals(MATCHING_ANSWER))
                        return MATCHING_TASK;
                }
            }
            return null;
        }

        private String getDefaultInstructionByType(String type) {
            switch (type) {
                case LINKING_TASK:
                    return LINKING_FRENCH_INSTRUCTIONS;
                case MC_TASK:
                    return MC_FRENCH_INSTRUCTIONS;
                case MATCHING_TASK:
                    return MATCHING_FRENCH_INSTRUCTIONS;
                case MMC_TASK:
                    return MMC_FRENCH_INSTRUCTIONS;
                case CLOZE_TASK:
                    return CLOZE_FRENCH_INSTRUCTIONS;
            }
            return null;
        }

        private boolean isFrench(DBObject sequence) {
            return frenchCourses.contains(sequence.get(DB_COURSE_ID).toString());
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


}
