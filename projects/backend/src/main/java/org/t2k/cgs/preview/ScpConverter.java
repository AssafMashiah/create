package org.t2k.cgs.preview;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import com.t2k.dtp.courseutils.converter.gcr2lms.Gcr2LmsContentConverter;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import org.t2k.cgs.course.CourseDataService;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.ContentItemBase;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.packaging.ContentParseUtil;
import org.t2k.sample.dao.exceptions.DaoException;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * Created by thalie.mukhtar on 18/11/2015.
 */
@Service("scpConverter")
@Scope("prototype")
public class ScpConverter extends Gcr2LmsContentConverter {

    public static final String LESSONS = "lessons";
    public static final String DIFFERENTIATION = "differentiation";
    public static final String CNT_SEQUENCES = "cnt_sequences";
    public static final String LESSON_SEQUENCES_MAP = "lesson_sequences_map";
    public static final String MANIFEST = "manifest";
    public static final String LESSON = "lesson";
    public static final String CUSTOMIZATION_PACK_DEFAULT_RESOURCE_ID = "customization_pack_resource_id";
    public static final String DATA = "data";
    public static final String CGS_PREFIX = "cgs/";
    public static final String ORIGINAL = "original";
    public static final String LESSON_CID = "lessonCid";
    public static final String TYPE = "type";

    private Map<String, DBObject> cnt_sequences = new HashMap<>();
    private Map<String, Object> lesson_sequences_map = new HashMap<>();
    private String lessonId;

    public Map<String, Object> convertLessonToScpFormat(int publisherId, String courseId, String lessonString, CourseDataService courseDataService) throws Exception {

        HashMap<String, Object> convertedElements = new HashMap<>();
        DBObject lessonData = (DBObject) JSON.parse(lessonString);

        DBObject course = getCourseData(publisherId, courseId, courseDataService);
        DBObject differentiation = (DBObject) course.get(DIFFERENTIATION);
        String version = (String) course.get(ContentParseUtil.VERSION);
        String format = (String) course.get(ContentItemBase.FORMAT);

        this.lessonId = (String) lessonData.get(ContentParseUtil.CONTENT_ID);

        //init Gcr2LmsContentConverter
        init(courseId, version, format, differentiation);

        //prepare the lesson for conversion- copy the customization pack property and resource to the lesson
        handleCustomizationPackReference(course, lessonData);

        //use Gcr2LmsContentConverter function to convert the lesson
        DBObject convertedLesson = convertLessonContent(lessonData);

        HashMap<String, DBObject> lessonsMap = new HashMap<>();
        lessonsMap.put(this.lessonId, convertedLesson);
        addToItemsMap(this.lessonId, version,lessonData);

        convertedElements.put(LESSONS, lessonsMap);
        convertedElements.put(CNT_SEQUENCES, getCnt_sequences());
        convertedElements.put(LESSON_SEQUENCES_MAP, getLesson_sequences_map());

        //use Gcr2LmsContentConverter function to get the converted course manifest
        DBObject convertedCourse = convertCourse(course);
        manipulateCourseTocItem(convertedCourse);
        convertedElements.put(MANIFEST, convertedCourse);

        return convertedElements;
    }

    /*this method removes irrelevant lessons from the converted course, since we only need to preview one lesson at each time*/
    private void manipulateCourseTocItem(DBObject course) {
        DBObject tocItemRef = new BasicDBObject();
        tocItemRef.put(ContentParseUtil.CONTENT_ID, this.lessonId);
        tocItemRef.put(TYPE, LESSON);

        BasicDBList basicTocItemRefsList = new BasicDBList();
        basicTocItemRefsList.add(tocItemRef);

        if (course.get(DATA) != null) {
            DBObject courseData = (DBObject) course.get(DATA);
            if ((courseData).get(ContentParseUtil.TOC) != null) {
                DBObject toc = (DBObject) (courseData).get(ContentParseUtil.TOC);
                toc.put(ContentParseUtil.TOC_ITEM_REFS, basicTocItemRefsList);
                toc.removeField(ContentParseUtil.TOC_ITEMS);
            }
        }
    }

    private void handleCustomizationPackReference(DBObject course, DBObject lesson) {

        //get the customizationPack property and attach it to the lesson with a different resourceId- so it will not collide with other lesson resources
        if (course.get(ContentParseUtil.CUSTOMIZATIONPACK) != null) {
            DBObject customizationPackObject = (DBObject) course.get(ContentParseUtil.CUSTOMIZATIONPACK);
            if (customizationPackObject.get(ContentParseUtil.RESOURCE_ID) != null) {
                String customizationPackResourceId = (String) customizationPackObject.get(ContentParseUtil.RESOURCE_ID);
                if (lesson.get(ContentParseUtil.CUSTOMIZATIONPACK) == null) {
                    customizationPackObject.put(ContentParseUtil.RESOURCE_ID, CUSTOMIZATION_PACK_DEFAULT_RESOURCE_ID);
                    lesson.put(ContentParseUtil.CUSTOMIZATIONPACK, customizationPackObject);
                }

                if (course.get(ContentParseUtil.RESOURCES) != null) {

                    //find the customization pack resource in the course resources list
                    BasicDBList resourcesList = (BasicDBList) course.get(ContentParseUtil.RESOURCES);

                    DBObject customizationPackResource = null;
                    for (Object obj : resourcesList) {
                        DBObject resource = (DBObject) obj;
                        if (resource.get(ContentParseUtil.RES_ID) != null && resource.get(ContentParseUtil.RES_ID).equals(customizationPackResourceId)) {
                            customizationPackResource = resource;
                            break;
                        }
                    }

                    //add the customization pack resource to the lesson resources list
                    if (customizationPackResource != null && customizationPackResource.get(ContentParseUtil.RESOURCE_HREFS) != null) {
                        BasicDBList customizationPackHrefs = (BasicDBList) customizationPackResource.get(ContentParseUtil.RESOURCE_HREFS);

                        //remove the hrefs with the "cgs/" prefix, because it is not needed in the scp
                        BasicDBList customizationPackHrefsWithoutCGSPrefix = new BasicDBList();
                        for (Object href : customizationPackHrefs) {
                            if (!((String) href).startsWith(CGS_PREFIX)) {
                                customizationPackHrefsWithoutCGSPrefix.add(href);
                            }
                        }

                        customizationPackResource.put(ContentParseUtil.RESOURCE_HREFS, customizationPackHrefsWithoutCGSPrefix);
                        customizationPackResource.put(ContentParseUtil.RES_ID, CUSTOMIZATION_PACK_DEFAULT_RESOURCE_ID);
                        BasicDBList lessonResources = (BasicDBList) lesson.get(ContentParseUtil.RESOURCES);
                        if (lessonResources == null) {
                            lessonResources = new BasicDBList();
                        }
                        lessonResources.add(customizationPackResource);
                    }
                }
            }
        }
    }

    //get the course form the database
    private DBObject getCourseData(int publisherId, String courseId, CourseDataService courseDataService) throws DaoException, DsException {
        CourseCGSObject course = courseDataService.getCourse(publisherId, courseId, null, false);
        return course.getContentData();
    }

    public Map<String, Object> getLesson_sequences_map() {
        return lesson_sequences_map;
    }

    public Map<String, DBObject> getCnt_sequences() {
        return cnt_sequences;
    }

    //implement abstract methods of Gcr2LmsContentConverter

    @Override
    protected String getCourseCid(String cgsCourseCid, String courseVersion) {
        return cgsCourseCid;
    }

    @Override
    protected String getLessonCid(String cgsCourseCid, String cgsLessonCid, String courseVersion) {
        return cgsLessonCid;
    }

    @Override
    protected String getAssessmentCid(String cgsCourseCid, String cgsAssessmentCid, String courseVersion) {
        return cgsAssessmentCid;
    }

    @Override
    protected String getPageCid(String cgsCourseCid, String cgsLessonCid, String cgsLoCid, String courseVersion) {
        return UUID.randomUUID().toString();
    }

    @Override
    protected String getOverlayCid(String cgsCourseCid, String cgsLessonCid, String cgsLoCid, String sequenceCidForOverlay, String courseVersion) {
        return UUID.randomUUID().toString();
    }

    @Override
    protected void updateSequencePrefetchList(String sequenceCid, String sequenceVersion, String oldContentHRef, String newContentHRef) {
        throw new UnsupportedOperationException();
    }

    @Override
    protected void updateSequenceContentHRef(String sequenceCid, String sequenceVersion, String newContentHRef) throws Exception {
        throw new UnsupportedOperationException();
    }

    @Override
    protected String writeSequenceData(String seqHref, String sequenceData) throws Exception {
        throw new UnsupportedOperationException();
    }

    @Override
    protected String readSequenceData(String contentHRef) throws IOException {
        throw new UnsupportedOperationException();
    }

    @Override
    protected DBObject getSequence(String sequenceCid, String version) throws IOException {
        return this.cnt_sequences.get(sequenceCid);
    }

    @Override
    protected DBObject getSameSequence(String cgsCourseCid, String cgsItemCid, String cgsLoCid, String cgsSequenceCid, String courseVersion, String type, String sha1) {
        return null;
    }

    @Override
    protected void saveSequenceUpdateInfo(DBObject sequenceUpdateInfo) {
        throw new UnsupportedOperationException();
    }

    @Override
    protected Collection<String> getLessonSequences(String lessonCid, String version) throws Exception {
        throw new UnsupportedOperationException();
    }

    @Override
    protected Collection<String> getAssessmentSequences(String assessmentCid, String version) throws Exception {
        throw new UnsupportedOperationException();
    }

    @Override
    protected void updateLessonLos(DBObject lesson) throws Exception {
        throw new UnsupportedOperationException();
    }

    @Override
    protected DBObject getSequenceByCgs(String cgsCourseCid, String cgsLessonCid, String cgsSequenceCid, String version) throws IOException {
        throw new UnsupportedOperationException();
    }

    @Override
    protected List<DBObject> getLessons(Set<String> lessonsCids, String version) throws IOException {
        throw new UnsupportedOperationException();
    }

    @Override
    protected void insertSequencePrefetchList(DBObject sequencePrefetchList) {
        //do nothing
    }

    @Override
    protected void insertSequence(DBObject sequenceDocument) throws Exception {

        String sequenceId = (String) sequenceDocument.get(ContentParseUtil.CONTENT_ID);
        String sequenceVersion = (String) sequenceDocument.get(ContentParseUtil.VERSION);
        String sequenceLessonParentId = (String) ((DBObject) sequenceDocument.get(ORIGINAL)).get(LESSON_CID);

        //add sequence to lesson map only if its parent is the lesson in context
        if (sequenceLessonParentId.equals(this.lessonId)) {
            cnt_sequences.put(sequenceId, sequenceDocument);
            HashMap<String, String> lessonSequences;
            if (lesson_sequences_map.get(this.lessonId) != null) {
                lessonSequences = (HashMap<String, String>) lesson_sequences_map.get(this.lessonId);
            } else {
                lessonSequences = new HashMap<String, String>();
                lesson_sequences_map.put(this.lessonId,lessonSequences);
            }
            lessonSequences.put(sequenceId, sequenceVersion);
        }
    }

    @Override
    protected String getSequenceCid(String cgsCourseCid, String cgsItemCid, String cgsLoCid, String cgsSequenceCid, String courseVersion, String type) {
        return cgsSequenceCid;
    }

    @Override
    protected String getDifSequenceParentCid(String cgsCourseCid, String cgsLessonCid, String cgsLoCid, String cgsDifSequenceParentCid, String courseVersion) {
        return cgsDifSequenceParentCid;
    }

    @Override
    protected void insertLessonPrefetchList(DBObject lessonPrefetchList) {
        //do nothing
    }

    @Override
    protected void insertAssessmentPrefetchList(DBObject assessmentPrefetchList) {
        throw new UnsupportedOperationException();
    }

    @Override
    protected String getAssetsRoot() {
        return "";
    }

    @Override
    public void convert(File zipFile, File targetDir) throws Exception {
        throw new UnsupportedOperationException();
    }

    @Override
    protected boolean isSharedSequencesUpdated(String lessonCid, String lessonVersion, Set<String> updatedHiddenSequences) {
        return false;
    }

    @Override
    protected DBObject getLesson(String cid, String version) throws IOException {
        return null;
    }

    @Override
    protected void insertLesson(DBObject lesson) {
        // do nothing
    }
}