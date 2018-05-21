package org.t2k.cgs.domain.usecases.packaging.validators;

import atg.taglib.json.util.JSONArray;
import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.BasicDBList;
import com.mongodb.DBObject;
import org.apache.commons.io.FileUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.t2k.cgs.domain.model.classification.TaggedStandards;
import org.t2k.cgs.domain.model.course.CourseCGSObject;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.utils.ZipHelper;

import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 24/11/14
 * Time: 15:42
 */
public class PublishedStandAloneZipValidator {

    private static final String SCORM_MANIFEST = "imsmanifest.xml";
    private static final String SCP_FOLDER = "scp";
    private static final String COURSE_MANIFEST_FILE = "manifest";
    private static final String COVER_IMAGE_KEY = "coverHRef";

    private static final String TOC_ITEMS_KEY = "tocItems";
    private static final String ITEMS_KEY = "items";
    private static final String TYPE_KEY = "type";

    private static final String LEARNING_OBJECTS_KEY = "learningObjects";
    private static final String CONTENT_HREF_KEY = "contentHRef";
    private static final String CUSTOMIZATION_PACK_BASE_DIR_KEY = "customizationPackResourceBaseDir";
    private static final String SEQUENCES_KEY = "sequences";
    private static final String ITEM_KEY = "item";
    private static final String DATA_KEY = "data";

    public void validateAndExtractStandAlonePackage(File cgsPackedFile, File extractionDirectory) throws Exception {
        int numberOfFilesInExtractedDirectory = 3;
        ZipHelper.decompressZipFile(cgsPackedFile.getAbsolutePath(), extractionDirectory.getAbsolutePath());
        if (extractionDirectory.listFiles() == null)
            throw new Exception(String.format("Could not list files on the extracted zip directory %s", extractionDirectory));
        if (extractionDirectory.listFiles().length != numberOfFilesInExtractedDirectory)
            throw new Exception(String.format("The packed directory doesn't contain all the %d files.", numberOfFilesInExtractedDirectory));

//        File courseFolder = extractionDirectory.listFiles()[0];
        File courseFolder = getCourseFolder(extractionDirectory);
        validateExtractedStandAlonePackage(courseFolder);
    }

    public void validateExtractedStandAlonePackage(File courseFolder) throws Exception {
        File[] courseLevelFiles = courseFolder.listFiles();
        File courseManifest = null;
        if (courseLevelFiles == null)
            return;

        for (File f : courseLevelFiles) {
            if (f.getName().equals(COURSE_MANIFEST_FILE)) {
                courseManifest = f;
                break;
            }
        }

        if (courseManifest == null) {
            throw new Exception("Course folder in zip does not contain a manifest file");
        }

        validateCourseResourcesAndManifests(courseManifest, courseFolder);
    }

    private void validateCourseResourcesAndManifests(File courseManifest, File courseFolder) throws Exception {
        JSONObject course = new JSONObject(FileUtils.readFileToString(courseManifest));
        JSONObject courseData = course.getJSONObject(DATA_KEY);
        CourseCGSObject courseCGSObject = new CourseCGSObject(courseData.toString(), 1);

        validateAllResourcesExistsInCourse(courseData, courseFolder);
        validateLessonsAndAssessmentsAndTheirResourcesExist(courseFolder, course.getJSONObject("itemsData"));
        validateAllResourcesExistInSequences(courseFolder);
        validateTocItemAndCourseStandardsArrayDoeNotHaveDuplicates(courseFolder, course);
    }

    private void validateTocItemAndCourseStandardsArrayDoeNotHaveDuplicates(File courseFolder, JSONObject course) throws Exception {
        validateStandardsArrayDoeNotHaveDuplicates(course.getJSONObject("data"));

        for (File lesson : getLessonsFiles(courseFolder, course.getJSONObject("itemsData"))) {
            validateStandardsArrayDoeNotHaveDuplicates(new JSONObject(FileUtils.readFileToString(lesson)).getJSONObject(DATA_KEY));
        }
        for (File assessment : getAssessmentsFiles(courseFolder, course.getJSONObject("itemsData"))) {
            validateStandardsArrayDoeNotHaveDuplicates(new JSONObject(FileUtils.readFileToString(assessment)).getJSONObject(DATA_KEY));
        }
    }

    private void validateStandardsArrayDoeNotHaveDuplicates(JSONObject itemData) throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        if (!itemData.has("standards")) {
            return;
        }
        JSONArray standards = itemData.getJSONArray("standards");

        Set<String> stdPackageIdInItem = new HashSet();
        for (Object standard : standards) {
            // validating there are no duplicate standardTags with the same stdPackageId
            TaggedStandards taggedStandards = objectMapper.readValue(standard.toString(), TaggedStandards.class);
            if (stdPackageIdInItem.contains(taggedStandards.getStdPackageId())){
                throw new Exception(String.format("A duplicate found in standards section on item %s. Duplicate standard package id: %s", itemData.get("cid"), taggedStandards.getStdPackageId()));
            }
            stdPackageIdInItem.add(taggedStandards.getStdPackageId());

            // validating there are no duplicate pedagogical IDs inside a single standard of a stdPackageId
            Set<String> pedagogicalIdsInSpecificStandard = new HashSet<>();
            for (String pedId : taggedStandards.getPedagogicalIds()){
                if (pedagogicalIdsInSpecificStandard.contains(pedId)){
                    throw new Exception(String.format("A duplicate found in standards section on item %s. Duplicate standard pedagogical id: %s -> %s", itemData.get("cid"), taggedStandards.getStdPackageId(), pedId));
                }
                pedagogicalIdsInSpecificStandard.add(pedId);
            }
        }
    }

    private void validateAllResourcesExistsInCourse(JSONObject courseNode, File courseFolder) throws JSONException, DsException {
        // if the course has a cover image, check that it exists on file system
        if (courseNode.has(COVER_IMAGE_KEY)) {
            validateAllAssetsExist(courseFolder.getAbsolutePath(), Arrays.asList(courseNode.getString(COVER_IMAGE_KEY)));
        }
    }

    private void validateAllResourcesExistInSequences(File courseFolder) throws IOException, DsException, JSONException {
        Set<String> assetsUsedBySequences = getAssetPathsFromSequences(courseFolder);
        validateAllAssetsExist(courseFolder.getPath(), assetsUsedBySequences);
    }

    private Set<String> getAssetPathsFromSequences(File courseFolder) throws IOException, JSONException {
        File sequencesFolder = new File(courseFolder, "sequences");
        Set<String> paths = new HashSet<>();
        if (!sequencesFolder.exists()) {
            return paths;
        }

        for (File sequence : sequencesFolder.listFiles()) {
            addSequencesAssetsToSet(paths, sequence);
        }

        return paths;
    }

    private void addSequencesAssetsToSet(Set<String> paths, File sequence) throws IOException, JSONException {
        String sequenceText = FileUtils.readFileToString(sequence);
        String sequenceDecoded = URLDecoder.decode(sequenceText, "UTF-8"); // we use url decoding because some of the src attributes in the sequence are references to json objects.
        // for example: the narration sounds' src attributes are in format: {"en_US":"filename.mp3"}
        // also - this json appears url encoded in the sequence, so we need to decode it to know what its content is.
        // of course - this is not a valid file path, so we need to handle it in a different way

        // regex to get that PATH from tags like this: <bla src=[PATH] ></bla>
        Pattern pattern = Pattern.compile("src=\\\\\"s*(.+?)s*\\\\\"");
        Matcher matcher = pattern.matcher(sequenceDecoded);

        // Find all matches
        while (matcher.find()) {
            // Get the src=[PATH] matching string
            String path = matcher.group(1); // take the PATH without the "src=" part
            if (!isDataAValidJson(path)) { // add the path to paths collection only if it is not a json
                paths.add(path);
            } else { // if it is a json, take the first value as a path (this is what I saw happens during testing)
                JSONObject pathObject = new JSONObject(path);
                paths.add(pathObject.getString(pathObject.keys().next().toString()));
            }
        }
    }

    private boolean isDataAValidJson(String data) {
        try {
            new JSONObject(data);
        } catch (JSONException e) {
            return false;
        }

        return true;
    }

    private List<String> getAssessmentIdsFromCourse(JSONObject courseItems) throws JSONException {
        HashMap<EntityType, List<String>> tocItems = getTocItemsFromCourse(courseItems);
        return tocItems.get(EntityType.ASSESSMENT);
    }

    private List<String> getLessonIdsFromCourse(JSONObject courseItems) throws JSONException {
        HashMap<EntityType, List<String>> tocItems = getTocItemsFromCourse(courseItems);
        return tocItems.get(EntityType.LESSON);
    }

    private void validateLessonsAndAssessmentsAndTheirResourcesExist(File courseFolder, JSONObject courseItems) throws Exception {
        for (File lessonFile : getLessonsFiles(courseFolder, courseItems))
            validateAllResourcesExistsForTocItem(lessonFile, courseFolder.getAbsolutePath());

        for (File assessmentFile : getAssessmentsFiles(courseFolder, courseItems))
            validateAllResourcesExistsForTocItem(assessmentFile, courseFolder.getAbsolutePath());
    }

    private List<File> getLessonsFiles(File courseFolder, JSONObject courseItems) throws Exception {
        List<String> lessonsIds = getLessonIdsFromCourse(courseItems);
        List<File> lessons = new ArrayList<>();
        for (String lessonId : lessonsIds) {
            File lessonFile = new File(courseFolder, String.format("/lessons/%s", lessonId));
            if (!lessonFile.exists()) {
                throw new Exception(String.format("Lesson file not found: %s", lessonFile.getAbsoluteFile()));
            }
            lessons.add(lessonFile);
        }
        return lessons;
    }

    private List<File> getAssessmentsFiles(File courseFolder, JSONObject JSONObject) throws Exception {
        List<String> assessmentsIds = getAssessmentIdsFromCourse(JSONObject);
        List<File> assessments = new ArrayList<>();
        for (String assessmentId : assessmentsIds) {
            File assessmentFile = new File(courseFolder, String.format("/assessments/%s", assessmentId));
            if (!assessmentFile.exists()) {
                throw new Exception(String.format("Assessment file not found: %s", assessmentFile.getAbsoluteFile()));
            }
            assessments.add(assessmentFile);
        }
        return assessments;
    }

    private void validateAllResourcesExistsForTocItem(File lessonFile, String basePath) throws IOException, DsException, JSONException {
        List<String> resourcesRelativePaths = getAssetsPaths(new JSONObject(FileUtils.readFileToString(lessonFile)).getString(DATA_KEY));
        validateAllAssetsExist(basePath, resourcesRelativePaths);
    }

    private void validateAllAssetsExist(String basePath, Collection<String> resourcesRelativePaths) throws DsException {
        List<String> missingFiles = new ArrayList<>();
        for (String file : resourcesRelativePaths) {
            File f = new File(basePath, file);
            boolean found = f.exists();
            if (!found) {
                missingFiles.add(f.getAbsolutePath());
            }
        }
        if (!missingFiles.isEmpty()) {
            throw new DsException(String.format("Missing files in packed zip: %s.", Arrays.toString(missingFiles.toArray())));
        }
    }

    /**
     * Handles tocItem in the format of the gcr (after cgsToLms conversion)
     *
     * @param data - json data from the lesson \ assessment files
     * @return - the list of assets paths
     * @throws JSONException
     */
    private List<String> getAssetsPaths(String data) throws JSONException {
        List<String> paths = new ArrayList<>();
        JSONObject lesson = new JSONObject(data);

        // add customization pack if exists
        if (lesson.has(CUSTOMIZATION_PACK_BASE_DIR_KEY)) {
            paths.add(lesson.getString(CUSTOMIZATION_PACK_BASE_DIR_KEY));
        }

        if (!lesson.has(LEARNING_OBJECTS_KEY)) {
            return paths;
        }

        JSONArray learningObjects = lesson.getJSONArray(LEARNING_OBJECTS_KEY);
        for (Object lo : learningObjects) {
            JSONObject loJson = (JSONObject) lo;
            // add sequences inside items
            if (loJson.has(ITEM_KEY) && loJson.getJSONObject(ITEM_KEY).has(SEQUENCES_KEY)) {
                addSequencesIds(paths, loJson.getJSONObject(ITEM_KEY));
            }

            // add sequences in the base learningObject node
            if (loJson.has(SEQUENCES_KEY)) {
                addSequencesIds(paths, loJson);
            }
        }
        return paths;
    }

    private void addSequencesIds(List<String> paths, JSONObject jsonObject) throws JSONException {
        JSONArray sequences = jsonObject.getJSONArray(SEQUENCES_KEY);
        for (Object sequence : sequences) {
            JSONObject sequenceJson = (JSONObject) sequence;
            if (sequenceJson.has(CONTENT_HREF_KEY)) {
                paths.add(sequenceJson.getString(CONTENT_HREF_KEY));
            }
        }
    }

    // goes over the course's tocs & finds (recursively) all the lessons and assessments appear in it
    private HashMap<EntityType, List<String>> getTocItemsFromCourse(JSONObject courseItems) throws JSONException {
        HashMap<EntityType, List<String>> cids = new HashMap<>();
        cids.put(EntityType.ASSESSMENT, new ArrayList<String>());
        cids.put(EntityType.LESSON, new ArrayList<String>());
//        DBObject layer1 = (DBObject) course.getContentData().get("toc");
//        BasicDBList firstToc = new BasicDBList();
//        firstToc.add(layer1);
//        addLessonIdsToList(cids, firstToc);

        Iterator itemsCids = courseItems.keys();
        while (itemsCids.hasNext()) {
            String cid = itemsCids.next().toString();
            JSONObject courseItem = courseItems.getJSONObject(cid);
            JSONArray items = (JSONArray) (courseItem.get("items"));
            JSONObject item = (JSONObject)(items).get(0);
            if (item.getString(TYPE_KEY).equals("assessment")) {
                cids.get(EntityType.ASSESSMENT).add(cid);
            }
            if (item.get(TYPE_KEY).toString().equals("lesson")) {
                cids.get(EntityType.LESSON).add(cid);
            }
        }

        return cids;
    }

    private void addLessonIdsToList(HashMap<EntityType, List<String>> cids, BasicDBList layer1) {
        for (Object toc : layer1) {
            DBObject tocDbObject = (DBObject) toc;
            // tocItem can contain more tocItem(s), and simple "items" which are lessons or assessments

            if (tocDbObject.containsField(TOC_ITEMS_KEY)) {  // deal with another layer of tocItems inside the current tocItem
                addLessonIdsToList(cids, (BasicDBList) tocDbObject.get(TOC_ITEMS_KEY));
            }
            if (tocDbObject.containsField(ITEMS_KEY)) {  // deal with the items array that contains items with cids
                BasicDBList items = (BasicDBList) ((DBObject) toc).get(ITEMS_KEY);
                for (Object item : items) {
                    DBObject itemDBObject = (DBObject) item;
                    if (itemDBObject.containsField(TYPE_KEY)) {
                        if (itemDBObject.get(TYPE_KEY).toString().equals("assessment")) {
                            cids.get(EntityType.ASSESSMENT).add(itemDBObject.get("cid").toString());
                        }
                        if (itemDBObject.get(TYPE_KEY).toString().equals("lesson")) {
                            cids.get(EntityType.LESSON).add(itemDBObject.get("cid").toString());
                        }
                    }
                }
            }
        }
    }

    private File getCourseFolder(File extractionDirectory) {
        File[] filesOnRoot = extractionDirectory.listFiles();

        for (File f : filesOnRoot) {
            String filename = f.getName();
            if (!filename.equals(SCORM_MANIFEST) && !filename.equals(SCP_FOLDER)) {
                return f;
            }
        }
        return null;
    }
}