package org.t2k.cgs.domain.usecases.course.utils;

import atg.taglib.json.util.JSONArray;
import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.DBObject;
import org.apache.log4j.Logger;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.context.ApplicationContext;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.model.sequence.SequencesDao;
import org.t2k.cgs.domain.model.tocItem.TocItemDao;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.course.CourseCGSObject;
import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.sample.dao.exceptions.DaoException;

import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: alex.zaikman
 * Date: 19/01/14
 * Time: 16:29
 */
public class RemoveLocale {

    private static Logger logger = Logger.getLogger(RemoveLocale.class);

    private static final String ENCODING_FORMAT = "UTF-8";

    private final int publisherId;
    private final String courseId;
    private final String localeStr;

    private CourseDataService courseDataService;
    private TocItemDao assessmentsDao;
    private TocItemDao lessonsDao;
    private SequencesDao sequencesDao;
    private List<String> lessonIds;

    private List<Exec> perform;
    private List<Exec> rollback;

    public RemoveLocale(int publisherId, String courseId, String locale, ApplicationContext appContext) { //fixme bad implementation using appContext
        this.publisherId = publisherId;
        this.courseId = courseId;
        this.localeStr = locale;

        this.courseDataService = (CourseDataService) appContext.getBean("courseDataService");
        this.lessonsDao = (TocItemDao) appContext.getBean("lessonsDao");
        this.assessmentsDao = (TocItemDao) appContext.getBean("assessmentsDao");
        this.sequencesDao = (SequencesDao) appContext.getBean("sequencesDao");

        this.lessonIds = new ArrayList<>();

        this.perform = new ArrayList<>();
        this.rollback = new ArrayList<>();
    }

    public void execute() throws Exception {
        if (logger.isDebugEnabled()) {
            logger.debug("RemoveLocale: started");
        }

        boolean rc = true;

        if (rc)
            rc &= rmCourse();

        if (rc)
            rc &= rmLessons();

        if (rc)
            rc &= rmAssessments();

        if (rc)
            rc &= rmConvertedData();

        if (!rc) {
            if (logger.isDebugEnabled()) {
                logger.debug("RemoveLocale: completed with failure ");
            }
            throw new DsException();
        }

        for (Exec o : this.perform) {
            try {
                o.execute();
            } catch (Exception e) {
                for (Exec rb : this.rollback) {
                    rb.execute();
                }
                throw new DsException(e);
            }
        }

        if (logger.isDebugEnabled()) {
            logger.debug("RemoveLocale: completed with success ");
        }
    }

    //--------------------------------------------------------
    //stages of the removal
    //--------------------------------------------------------
    private boolean rmCourse() {

        logger.debug("RemoveLocale: rmCourse");

        this.rollback.add(new Exec(courseDataService.getCourse(this.publisherId, this.courseId, null, false)) {
            @Override
            public void execute() throws Exception {

                ((CourseCGSObject) this.whatever).setLastModified(new Date());
                courseDataService.saveCourseCGSObject((CourseCGSObject) this.whatever);
            }
        });

        CourseCGSObject course = courseDataService.getCourse(this.publisherId, this.courseId, null, false);

        DBObject data = course.getData();
        DBObject contentData = (DBObject) data.get(JsonTags.CONTENT_DATA);
        List<String> supplementaryNarrationLocales = (List<String>) contentData.get(JsonTags.SUPPLEMENTARY_NARRATION_LOCALES);
        if (supplementaryNarrationLocales != null && supplementaryNarrationLocales.contains(this.localeStr)) {
            supplementaryNarrationLocales.remove(this.localeStr);
            perform.add(new Exec(course) {
                @Override
                public void execute() throws Exception {

                    ((CourseCGSObject) this.whatever).setLastModified(new Date());
                    courseDataService.saveCourseCGSObject((CourseCGSObject) this.whatever);
                }
            });

        }

        return true;
    }

    private boolean rmLessons() {

        logger.debug("RemoveLocale: rmLessons");
        try {

            this.rollback.add(new Exec(this.lessonsDao.getByCourse(this.publisherId, this.courseId, false)) {
                @Override
                public void execute() throws Exception {

                    for (TocItemCGSObject lesson : (List<TocItemCGSObject>) this.whatever) {
                        lesson.setLastModified(new Date());
                        lessonsDao.save(lesson);
                    }
                }
            });


            List<TocItemCGSObject> lessons = this.lessonsDao.getByCourse(this.publisherId, this.courseId, false);
            for (TocItemCGSObject lesson : lessons) {
                DBObject data = lesson.getData();
                DBObject contentData = (DBObject) data.get(JsonTags.CONTENT_DATA);
                if (processContentData(contentData)) {
                    this.lessonIds.add((String) contentData.get(JsonTags.CID));
                    perform.add(new Exec(lesson) {
                        @Override
                        public void execute() throws Exception {

                            ((TocItemCGSObject) this.whatever).setLastModified(new Date());
                            lessonsDao.save((TocItemCGSObject) this.whatever);
                        }
                    });

                }
            }
            return true;
        } catch (DaoException e) {
            return false;
        }
    }

    private boolean rmAssessments() {

        logger.debug("RemoveLocale: rmAssessments");
        try {


            this.rollback.add(new Exec(this.assessmentsDao.getByCourse(this.publisherId, this.courseId, false)) {
                @Override
                public void execute() throws Exception {

                    for (TocItemCGSObject assessment : (List<TocItemCGSObject>) this.whatever) {
                        assessment.setLastModified(new Date());
                        assessmentsDao.save(assessment);
                    }
                }
            });


            List<TocItemCGSObject> assessments = this.assessmentsDao.getByCourse(this.publisherId, this.courseId, false);
            for (TocItemCGSObject assessment : assessments) {

                DBObject data = assessment.getData();
                DBObject contentData = (DBObject) data.get(JsonTags.CONTENT_DATA);
                if (processContentData(contentData)) {
                    this.lessonIds.add((String) contentData.get(JsonTags.CID));
                    perform.add(new Exec(assessment) {
                        @Override
                        public void execute() throws Exception {

                            ((TocItemCGSObject) this.whatever).setLastModified(new Date());
                            assessmentsDao.save((TocItemCGSObject) this.whatever);
                        }
                    });

                }
            }
            return true;
        } catch (DaoException e) {
            return false;
        }
    }

    private boolean rmConvertedData() {

        logger.debug("RemoveLocale: rmConvertedData");

        for (String lcid : this.lessonIds) {


            this.rollback.add(new Exec(sequencesDao.getSequences(lcid, this.courseId)) {
                @Override
                public void execute() throws Exception {

                    for (Sequence s : (List<Sequence>) this.whatever) {
                        s.setLastModified(new Date());
                    }
                    sequencesDao.saveSequences((List<Sequence>) this.whatever);
                }
            });


            List<Sequence> sequences = sequencesDao.getSequences(lcid, this.courseId);
            for (Sequence sequence : sequences) {
                String content = sequence.getContent();
                content = processContent(content);
                if (content == null) return false;
                else
                    sequence.setContent(content);
            }
            perform.add(new Exec(sequences) {
                @Override
                public void execute() throws Exception {

                    for (Sequence s : (List<Sequence>) this.whatever) {
                        s.setLastModified(new Date());
                    }
                    sequencesDao.saveSequences((List<Sequence>) this.whatever);
                }
            });
        }
        return true;
    }

    //--------------------------------------------------------
    //helper funcs
    //--------------------------------------------------------
    private boolean processContentData(DBObject contentData) {

        boolean rc = false;

        ArrayList<String> resourceIds = new ArrayList<>();

        List<DBObject> resources = (List<DBObject>) contentData.get(JsonTags.RESOURCES);
        if (resources != null) {
            List<DBObject> ress = new ArrayList<>();
            for (DBObject resource : resources) { //1.1 collect resources for removal
                if (resource.containsField(JsonTags.LOCALE) &&
                        ((String) resource.get(JsonTags.LOCALE)).compareTo(this.localeStr) == 0) {
                    rc = true;
                    ress.add(resource);
                    resourceIds.add((String) resource.get(JsonTags.RES_ID));
                }
            }
            for (DBObject res : ress) {  //1.1 remove colected resources
                resources.remove(res);
            }

            if (contentData.containsField(JsonTags.LEARNING_OBJECTS)) {
                List<DBObject> learningObjects = (List<DBObject>) contentData.get(JsonTags.LEARNING_OBJECTS);
                for (DBObject lo : learningObjects) {
                    if (lo.containsField(JsonTags.SEQUENCES)) {
                        List<DBObject> sequences = (List<DBObject>) lo.get(JsonTags.SEQUENCES);
                        for (DBObject seq : sequences) {
                            if (seq.containsField(JsonTags.RESOURCE_REF_ID)) {
                                List<DBObject> resIds = (List<DBObject>) seq.get(JsonTags.RESOURCE_REF_ID);
                                for (String id : resourceIds) {
                                    resIds.remove(id);
                                }
                            }
                        }
                    }
                }
            }


            if (contentData.containsField(JsonTags.SUPPLEMENTARY_NARRATION_LOCALES)) {
                List<String> supplementaryNarrationLocales = (List<String>) contentData.get(JsonTags.SUPPLEMENTARY_NARRATION_LOCALES);
                if (supplementaryNarrationLocales.contains(this.localeStr)) {
                    supplementaryNarrationLocales.remove(this.localeStr);
                }
            }
        }
        return rc;
    }

    private String processContent(String content) {

        try {
            JSONObject jsonObj = new JSONObject(content);
            Iterator<String> keys = jsonObj.keys();

            while (keys.hasNext()) {

                JSONObject item = (JSONObject) jsonObj.get(keys.next());

                String type = (String) item.get(JsonTags.TYPE);
                if (type != null) switch (type) {
                    case JsonTags.SEQUENCE:
                        sequenceTypeHandler(item);
                        break;
                    case JsonTags.TEXT_VIEWER:
                        textViewerTypeHandler(item);
                        break;
                    case JsonTags.INLINE_NARRATION:
                        inlineNarrationTypeHandler(item);
                        break;
                    default:
                        break;
                }//switch
                //if
            } //while
            return jsonObj.toString();
        } catch (JSONException | IOException | ParserConfigurationException e) {
            e.printStackTrace();
            return null;
        }
    }//processContent

    private void inlineNarrationTypeHandler(JSONObject item) throws JSONException {

        tniTypeHandlerHelper(item, JsonTags.NARRATIONS, JsonTags.LOCALE);
    }

    private void textViewerTypeHandler(JSONObject item) throws JSONException {

        tniTypeHandlerHelper(item, JsonTags.MULTI_NARRATIONS, JsonTags.SRC_ATTR);
    }

    private void tniTypeHandlerHelper(JSONObject item, String narration, String attr) throws JSONException {

        JSONObject data = (JSONObject) item.get(JsonTags.DATA);

        //nairations
        if (data.has(narration) && !JSONObject.NULL.equals(data.get(narration))) {
            JSONObject multiNarrations = (JSONObject) data.get(narration);
            if (multiNarrations.has(this.localeStr)) {
                multiNarrations.remove(this.localeStr);
            }
        }//nairations

        //assetManager
        if (data.has(JsonTags.ASSET_MANAGER)) {
            Object assetManagerObj = data.get(JsonTags.ASSET_MANAGER);

            if (assetManagerObj!=null && !JSONObject.NULL.equals(assetManagerObj)) {
                JSONArray assetManager = (JSONArray) assetManagerObj;
                for (Object oi : assetManager) {
                    String locale = (String) ((JSONObject) oi).get(attr);
                    if (locale.endsWith(this.localeStr)) {
                        assetManager.remove(oi);
                        break; //only one can be  present
                    }
                }
            }
        }//assetManager
    }//tniTypeHandlerHelper

    private void sequenceTypeHandler(JSONObject item) throws JSONException, ParserConfigurationException, IOException {

        if (item.has(JsonTags.CONVERTED_DATA)) {
            String convertedData = (String) item.get(JsonTags.CONVERTED_DATA);

            Document document = Jsoup.parse(convertedData);

            Elements textviewernarration = document.getElementsByTag(JsonTags.TEXT_VIEWER_NARRATION);
            Elements inlinenarration = document.getElementsByTag(JsonTags.INLINE_NARRATION);

            precessNList(textviewernarration);
            precessNList(inlinenarration);

            convertedData = document.body().children().toString();
            convertedData = convertedData.replaceAll("<\\\\/","</");
            item.put(JsonTags.CONVERTED_DATA, convertedData);
        }
    }//sequenceTypeHandler


    private void precessNList(Elements narrationList) throws JSONException, UnsupportedEncodingException {

        if (narrationList != null && narrationList.size() > 0) {
            for (int i = 0; i < narrationList.size(); ++i) {
                Element node = narrationList.get(i);
                Attributes attributes = node.attributes();
                String src = attributes.get(JsonTags.SRC);
                if (src != null) {
                    //decode from uri
                    String json = URLDecoder.decode(src, ENCODING_FORMAT);
                    JSONObject jsonObj = new JSONObject(json);
                    jsonObj.remove(this.localeStr);
                    json = jsonObj.toString();
                    //encode back to uri
                    json = URLEncoder.encode(json, ENCODING_FORMAT);
                    attributes.put(JsonTags.SRC,json);
                }
            }
        }
    }//precessNList


    private abstract class Exec {

        protected Object whatever;

        public Exec(Object o) {

            this.whatever = o;
        }

        public abstract void execute() throws Exception;
    }


}  //EOF
