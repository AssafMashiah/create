package com.t2k.cgs.dbupgrader.utils;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.DBObject;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

import java.io.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by elad.avidan on 04/08/2014.
 */
public class CourseUtils {

    private static final String CONTENT_DATA = "contentData";
    private static final String TOC = "toc";
    private static final String TOC_ITEMS = "tocItems";
    private static final String TOC_ITEMS_REF = "tocItemRefs";
    private static final String TYPE = "type";
    private static final String LESSON = "lesson";
    private static final String CID = "cid";


    public static String getOldVersion(String targetDir) {
        String[] segments = targetDir.split("/");
        String oldVersion = segments[segments.length - 1];
        return oldVersion;
    }

    public static String generateNewVersion(String oldVersion) {
        Float oldVersionAsFloat = Float.parseFloat(oldVersion);
        //Removed because it doesn't increase the version if fractional part has length 1
        //String fractionalPart = oldVersion.substring(oldVersion.indexOf(".") + 1);
        Float nv = oldVersionAsFloat + 0.0001f;
        String newVersion = String.format("%." + 4 + "f", nv);
        return newVersion;
    }

    public static void updateCourseDocumentsVersion(DBObject course, String oldVersion, String newVersion) {
        DBObject contentData = ((DBObject) course.get("contentData"));
        DBObject customizationPack = (DBObject) contentData.get("customizationPack");
        customizationPack.put("version", newVersion);
        DBObject header = ((DBObject) contentData.get("header"));
        header.put("last-modified", new Date());
        updateResourceVersion(contentData, oldVersion, newVersion);
    }

    public static void updateResourceVersion(DBObject contentData, String oldVersion, String newVersion) {
        DBObject customizationPack = (DBObject) contentData.get("customizationPack");
        String resourceId = (String) customizationPack.get("resourceId");
        List<DBObject> resources = (List<DBObject>) contentData.get("resources");
        DBObject resourceToUpdate = null;
        for (DBObject resource : resources) {
            if (resourceId.equals(resource.get("resId"))) {
                resourceToUpdate = resource;
                break;
            }
        }

        assert resourceToUpdate != null;
        resourceToUpdate.put("baseDir", resourceToUpdate.get("baseDir").toString().replace(oldVersion, newVersion));
    }

    public static void updateManifest(String path, String oldVersion, String newVersion) throws IOException, JSONException {
        File manifestFile = new File(path, "manifest.json");
        InputStream is = new FileInputStream(manifestFile);
        String manifestTxt = IOUtils.toString(is);
        JSONObject manifest = new JSONObject(manifestTxt);

        String oldBaseDir = manifest.getString("baseDir");
        manifest.put("baseDir", oldBaseDir.replace(oldVersion, newVersion));
        manifest.put("version", newVersion);

        manifestFile.delete();
        manifestFile.createNewFile();
        try (FileWriter manifestFileWriter = new FileWriter(manifestFile, false)) {
            manifestFileWriter.write(manifest.toString());
        }
    }

    public static void createNewDirForNewVersion(String targetDir, String cmsLocation, String oldVersion, String newVersion) throws IOException, JSONException {
        String newTargetDir = targetDir.replace(oldVersion, newVersion);
        File baseDir = new File(cmsLocation, "publishers");
        assert baseDir.isDirectory() && baseDir.exists();
        File newCustomizationPackDir = new File(baseDir, newTargetDir);
        if (!newCustomizationPackDir.exists())
            newCustomizationPackDir.mkdirs();
        assert newCustomizationPackDir.isDirectory() && newCustomizationPackDir.exists();
        File oldCustomizationPackDir = new File(baseDir, targetDir);
        assert oldCustomizationPackDir.exists();
        FileUtils.copyDirectory(oldCustomizationPackDir, newCustomizationPackDir);
        updateManifest(newCustomizationPackDir.getPath(), oldVersion, newVersion);
    }

    public static List<String> getLessonIds(DBObject course) {
        List<DBObject> tocItemRefs = getCourseFlattenedTocItemRefs(course);
        return tocItemRefs.stream()
                .filter(tocItem -> tocItem.get(TYPE) != null && tocItem.get(CID) != null && tocItem.get(TYPE).equals(LESSON))
                .map(dbObject -> (String) dbObject.get(CID))
                .collect(Collectors.toList());
    }

    /**
     * @param course the course object as stored in mongo
     * @return a list of all flattened tocItemRefs on the course
     */
    public static List<DBObject> getCourseFlattenedTocItemRefs(DBObject course) {
        DBObject contentData = (DBObject) course.get(CONTENT_DATA);
        if (contentData == null) return new ArrayList<>(0);
        DBObject courseToc = (DBObject) contentData.get(TOC);
        if (courseToc == null) return new ArrayList<>(0);
        return getFlattenedTocItemRefs(courseToc);
    }

    /**
     * @param toc the course toc object as stored in mongo
     * @return a list of all flattened tocItemRefs on the TOC
     */
    public static List<DBObject> getFlattenedTocItemRefs(DBObject toc) {
        List<DBObject> flattenedTocItemRefs = new ArrayList<>((List<DBObject>) toc.get(TOC_ITEMS_REF));
        if (flattenedTocItemRefs == null) flattenedTocItemRefs = new ArrayList<>();
        List<DBObject> childTocItems = (List<DBObject>) toc.get(TOC_ITEMS);
        if (childTocItems != null)
            flattenedTocItemRefs.addAll(
                    childTocItems
                            .stream()
                            .flatMap(dbObject -> getFlattenedTocItemRefs(dbObject).stream())
                            .collect(Collectors.toList()));
        return flattenedTocItemRefs;
    }
}
