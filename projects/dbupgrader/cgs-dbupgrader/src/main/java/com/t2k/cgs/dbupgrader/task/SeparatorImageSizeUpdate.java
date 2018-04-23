package com.t2k.cgs.dbupgrader.task;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.DBCursor;
import com.mongodb.DBObject;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.common.dbupgrader.task.common.CommonTask;
import com.t2k.configurations.Configuration;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Required;

import javax.swing.*;
import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: alex.zaikman
 * Date: 24/02/14
 * Time: 10:40
 */
public class SeparatorImageSizeUpdate extends CommonTask {

    public static class pair{
        public pair(String c,String l ){lid=l;cid=c;}
        public String lid;
        public  String cid;
    }

    private MigrationDao migrationDao;

    private Configuration configuration;

    public static final String CONTENT = "content";
    public static final String COURSE_ID = "courseId";
    public static final String CGS_DATA = "cgsData";

    private static List<pair> lessonsChanged;

    @Override
    protected void executeUpInternal() throws Exception {


        precessSeqs();

    }

    public void precessSeqs() throws JSONException {

        lessonsChanged = new ArrayList<>();
        DBCursor cursor = migrationDao.getSequencesDbObjectsCursor();

        if (cursor != null) {

            Iterator<DBObject> i = cursor.iterator();

            while (i.hasNext()) {
                DBObject sequencesDbObj = i.next();

                Object contentObj = sequencesDbObj.get(CONTENT);

                if (contentObj != null && !((String) contentObj).isEmpty()) {
                    String content = (String) contentObj;

                    assert (sequencesDbObj.get(COURSE_ID) != null) : "malstructured data:Sequences:" + sequencesDbObj.toString();

                    String courseId = (String) sequencesDbObj.get(COURSE_ID);
                    String lessonId = (String) sequencesDbObj.get("lessonCId");


                    JSONObject jsonObjContent = new JSONObject(content);

                    processContent(jsonObjContent, courseId, lessonId);

                    content = jsonObjContent.toString();
                    content = content.replaceAll("<\\\\/", "</");
                    sequencesDbObj.put(CONTENT, content);

                    assert (sequencesDbObj.get("lastModified") != null) : "malstructured data: no lastModified";

                    sequencesDbObj.put("lastModified", new Date());
                    migrationDao.saveSequencesDbObject(sequencesDbObj);
                }
            }

            for(pair p :lessonsChanged){

                DBObject lesson = migrationDao.getLessonById(p.cid,p.lid);
                ((DBObject) ((DBObject)lesson.get("contentData")).get("header")).put("last-modified",new Date());
                migrationDao.saveLesson(lesson);
            }


        }
    }

    private void processContent(JSONObject jsonObjContent, String courseId, String lessonId) throws JSONException {

        if (jsonObjContent != null && !JSONObject.NULL.equals(jsonObjContent)) {

            Iterator<String> keys = jsonObjContent.keys();

            if (keys.hasNext()) {

                JSONObject firstItem = (JSONObject) jsonObjContent.get(keys.next());

                if (firstItem.has("type") &&
                        firstItem.get("type").equals("separator")) {

                    while (keys.hasNext()) {

                        JSONObject item = (JSONObject) jsonObjContent.get(keys.next());
                        if (item.has("type") &&
                                item.get("type").equals("imageViewer")) {

                            List<Integer> dims = new ArrayList<>();
                            boolean imageSizeSet = processItem(item, courseId, dims);

                            if (imageSizeSet && firstItem.has("convertedData")) {

                                String convertedDataStr = firstItem.getString("convertedData");
                                convertedDataStr = precessConvertedData(convertedDataStr, dims);
                                firstItem.put("convertedData", convertedDataStr);

                                lessonsChanged.add(new pair(courseId,lessonId));

                            }
                        }
                    }
                }
            }


        }
    }

    private String precessConvertedData(String convertedDataStr, List<Integer> dims) {
        //To change body of created methods use File | Settings | File Templates.if (!convertedDataStr.equals("")) {
        Document document = Jsoup.parse(convertedDataStr);


        Elements elms = document.getElementsByTag("imageviewer");

        if (elms.size() > 0) {

            Element elm = elms.get(0);

            elm.attr("width", dims.get(0).toString());
            elm.attr("height", dims.get(1).toString());
        }


        return document.body().children().toString();
    }


    private boolean processItem(JSONObject item, String courseId, List<Integer> dims) throws JSONException {
       boolean imageSizeSet=false;
        if (item.has("type") &&
                item.get("type").equals("imageViewer") &&
                item.has("data")) {

            JSONObject data = (JSONObject) item.get("data");

            if (data.has("image")) {

                String imgPath = (String) data.get("image");

                if (imgPath != null && !imgPath.isEmpty()) {


                    String cmsLocation = configuration.getProperty("cmsHome");  //"C:/t2k/cgs-data/cms";

                    DBObject course = migrationDao.getCourseById(courseId);

                    if (course == null || !course.containsField(CGS_DATA))
                        return false;

                    assert (((DBObject) course.get(CGS_DATA)).get("publisherId") != null) : "malstructured data: no publisherId found";

                    int publisherId = (int) ((DBObject) course.get(CGS_DATA)).get("publisherId");

                    imgPath = cmsLocation.replace("\\", "/") + "/publishers/" + publisherId + "/courses/" + courseId + imgPath.replace("\\", "/");

                    if (new File(imgPath).exists()) {

                        ImageIcon imageIcon = new ImageIcon(imgPath);

                        int imgHeight = imageIcon.getIconHeight();
                        int imgWidth = imageIcon.getIconWidth();

                        dims.add(imgWidth);
                        dims.add(imgHeight);



                        int oldWidth = (int) data.get("imgWidth");
                        int oldHiight = (int) data.get("imgHeight");

                        if (oldWidth != imgWidth || oldHiight != imgHeight) {
                            imageSizeSet = true;
                            data.put("imgWidth", imgWidth);
                            data.put("imgHeight", imgHeight);

                        }
                    }
                }
            }
        }
        return imageSizeSet;
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

    @Required
    public void setConfiguration(Configuration configuration) {

        this.configuration = configuration;
    }


}
