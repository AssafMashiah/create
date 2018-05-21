package org.t2k.cgs.domain.usecases.packaging;

import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ArrayNode;
import org.t2k.cgs.domain.model.exceptions.DsException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 20/11/12
 * Time: 17:18
 */
public class ContentParseUtil {

    //doc field names
    public static final String TOC = "toc";
    public static final String TOC_ITEMS = "tocItems";
    //    public static final String LESSONS_REF = "lessonsRef";
    public static final String TOC_ITEM_REFS = "tocItemRefs";
    public static final String CONTENT_ID = "cid";
    public static final String LEARNING_OBJECTS = "learningObjects";
    public static final String SEQUENCES = "sequences";
    public static final String TASKS = "tasks";

    public static final String HEADER = "header";
    public static final String CGS_DATA = "cgsData";
    public static final String SOURCE = "source";
    public static final String EDITOR_STATE = "editorState";
    public static final String LESSON_TEMPLATES = "lessonTemplates";
    public static final String VERSION = "version";
    public static final String UPDATED = "updated";
    public static final String CUSTOMIZATIONPACK = "customizationPack";
    public static final String RESOURCE_ID = "resourceId";
    public static final String USS_TTS_SERVICES = "useTtsServices";
    public static final String TTS_SERVICES = "ttsServices";

    public static final String PUBLISHER = "publisher";
    public static final String TITLE = "title";
    public static final String OVERVIEW = "overview";
    public static final String SUBJECT_AREA = "subjectArea";
    public static final String GRADE_LEVEL = "gradeLevel";
    public static final String COVER_REF_ID = "coverRefId";
    public static final String RESOURCES = "resources";
    public static final String RES_ID = "resId";
    public static final String RESOURCE_HREF = "href";
    public static final String RESOURCE_BASE_DIR = "baseDir";
    public static final String RESOURCE_HREFS = "hrefs";
    public static final String RESOURCE_TYPE = "type";

    public static final String STANDARD_PACKAGES = "standardPackages";
    public static final String STANDARD_PACKAGE_NAME = "name";
    public static final String STANDARD_PACKAGE_SUBJECT_AREA = "subjectArea";
    public static final String STANDARD_PACKAGE_VERSION = "version";
    public static final String STANDARD_PACKAGE_ID = "stdPackageId";
    public static final String STANDARDS = "standards";
    public static final String PEDAGOGICAL_IDS = "pedagogicalIds";

    private static ObjectMapper mapper = new ObjectMapper();

    private static Logger logger = Logger.getLogger(ContentParseUtil.class);

    public static List<String> getTocItemsIdsFromCourseNode(JsonNode rootNode, boolean withTocId) throws IOException {
        List<String> results = new ArrayList<>();
        JsonNode tocNode = rootNode.path(TOC);
        JsonNode rootLessons = tocNode;
        addLessonsRef(results, rootLessons, withTocId);
        tocNode = rootNode.path(TOC).get(TOC_ITEMS);
        //check the toc items if exists
        if (tocNode != null) {
            results.addAll(getLessonIdsFromCourse(tocNode, withTocId));
        }

        return results;
    }

    public static List<String> getTocIdsFromCourseJson(String courseJson, boolean withTocId) throws DsException {
        try {
            return getTocItemsIdsFromCourseNode(mapper.readTree(courseJson), withTocId);
        } catch (IOException e) {
            logger.error(String.format("Error getting toc item ids from course node %s", courseJson), e);
            throw new DsException(e);
        }
    }

    public static List<String> getSequencesIdsFromLesson(String lessonJson) throws IOException {
        List<String> stringList = new ArrayList<String>();
        JsonNode lessonNode = mapper.readTree(lessonJson);
        JsonNode loNodes = lessonNode.get(LEARNING_OBJECTS);
        if (loNodes != null) {
            Iterator<JsonNode> loIter = loNodes.getElements();
            while (loIter.hasNext()) {
                JsonNode loNode = loIter.next();
                JsonNode seqNodes = loNode.get(SEQUENCES);
                Iterator<JsonNode> seqIter = seqNodes.getElements();
                while (seqIter.hasNext()) {
                    JsonNode seqNode = seqIter.next();
                    String seqId = seqNode.get(CONTENT_ID).getTextValue();
                    stringList.add(seqId);
                }
            }
        }

        return stringList;
    }

    public static List<String> getSequencesFromLesson(String lessonJson) throws IOException {
        List<String> stringList = new ArrayList<String>();
        JsonNode lessonNode = mapper.readTree(lessonJson);
        JsonNode loNodes = lessonNode.get(LEARNING_OBJECTS);
        if (loNodes != null) {
            Iterator<JsonNode> loIter = loNodes.getElements();
            while (loIter.hasNext()) {
                JsonNode loNode = loIter.next();
                JsonNode seqNodes = loNode.get(SEQUENCES);
                Iterator<JsonNode> seqIter = seqNodes.getElements();
                while (seqIter.hasNext()) {
                    JsonNode seqNode = seqIter.next();
                    stringList.add(seqNode.toString());
                }
            }
        }

        return stringList;
    }

    public static List<String> getTasksFromSequence(String sequenceJson) throws IOException {
        List<String> stringList = new ArrayList<String>();
        JsonNode sequenceNode = mapper.readTree(sequenceJson);
        JsonNode tasksNode = sequenceNode.get(TASKS);
        if (tasksNode != null) {
            Iterator<JsonNode> taskIter = tasksNode.getElements();
            while (taskIter.hasNext()) {
                JsonNode taskNode = taskIter.next();
                stringList.add(taskNode.toString());
            }
        }

        return stringList;
    }

    private static void addLessonsRef(List<String> results, JsonNode rootLessons, boolean withTocId) {
        if (withTocId) {
            String l_cid = rootLessons.get(CONTENT_ID).getTextValue();
            results.add(l_cid);
        }

        if (rootLessons.get(TOC_ITEM_REFS) != null) {
            Iterator<JsonNode> lessonsIter = ((ArrayNode) rootLessons.get(TOC_ITEM_REFS)).iterator();
            while (lessonsIter.hasNext()) {
                JsonNode lesson = lessonsIter.next();
                String l_cid = lesson.get(CONTENT_ID).getTextValue();
                results.add(l_cid);
            }
        }
    }

    private static List<String> getLessonIdsFromCourse(JsonNode tocNode, boolean withTocId) {
        List<String> result = new ArrayList<>();
        if (tocNode.isArray()) {
            Iterator<JsonNode> iterator = tocNode.iterator();
            while (iterator.hasNext()) {
                JsonNode next = iterator.next();
                if (next.get(TOC_ITEMS) != null) {
                    result.addAll(getLessonIdsFromCourse(next.get(TOC_ITEMS), withTocId));
                }

                addLessonsRef(result, next, withTocId);
            }
        }

        return result;
    }
}