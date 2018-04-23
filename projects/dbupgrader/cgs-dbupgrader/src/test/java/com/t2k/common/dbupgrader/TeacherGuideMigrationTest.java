package com.t2k.common.dbupgrader;

import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import com.t2k.cgs.dbupgrader.task.FixTeacherGuide;
import org.apache.commons.lang.StringEscapeUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.util.Arrays;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 06/08/13
 * Time: 11:02
 */
@ContextConfiguration("/applicationContext-MongoDBTest.xml")
@Test(groups = "ignore")
public class TeacherGuideMigrationTest extends AbstractTestNGSpringContextTests {

    @Autowired
     private FixTeacherGuide fixTeacherGuide;
    @Test
    public void testHtmlParsing() {
        String html = "<html><head><title>First parse</title></head>"
                + "<body><p>Parsed HTML into a doc.</p></body></html>";
        Document doc = Jsoup.parse(html);
        Element body = doc.body();
        String data = body.html();
        Assert.assertNotNull(data);
    }


    @Test
    public void testTgHtmlParsing() throws Exception {

        String html = readResourcesAsString("teacherGuides/teacherGuideStringUncoded.txt");
        String decode = StringEscapeUtils.unescapeHtml(html);
        decode = URLDecoder.decode(decode, "UTF-8");


        Document doc = Jsoup.parse(decode);


        Elements selectedAttrClass = doc.select("[class]");
        Assert.assertEquals(selectedAttrClass.size(), 3);
        selectedAttrClass.remove();
        Elements selectedRemovedClass = doc.select("[class]");
        Assert.assertEquals(selectedRemovedClass.size(), 0);

        Elements selectedAttrStyle = doc.select("[style]");
        Assert.assertEquals(selectedAttrStyle.size(), 7);
        selectedAttrStyle.remove();
        Elements selectedAttrStyleRemoved = doc.select("[style]");
        Assert.assertEquals(selectedAttrStyleRemoved.size(), 0);
        String data = doc.toString();
        Assert.assertNotNull(data);
    }

    @Test
    private void testCleanAttributes() throws Exception {
         String html = readResourcesAsString("teacherGuides/teacherGuideStringUncoded.txt");
         String cleanedHtml = fixTeacherGuide.cleanTGDataStringHtmlBody(html, Arrays.asList("class", "style"));
        Document doc = Jsoup.parse(URLDecoder.decode(cleanedHtml, "UTF-8"));
        Elements selectedAttrClass = doc.select("[class]");
        Assert.assertEquals(selectedAttrClass.size(), 0);
        Assert.assertNotNull(cleanedHtml);
    }

     @Test
     private void testCleanLesson() throws Exception {
         String lessonJson=  readResourcesAsString("teacherGuides/lessonWithTG.json");
         int lengthBefore = lessonJson.length();
         DBObject dbObject = (DBObject) JSON.parse(lessonJson);
         fixTeacherGuide.fixLessonDBObject(dbObject);
         String serializeLesson = JSON.serialize(dbObject);
         int lengthAfter = serializeLesson.length();
         Assert.assertTrue(lengthAfter<lengthBefore);
     }

//
//    Work ON real data !!
//     @Test
//     private void testActual() throws Exception {
//         fixTeacherGuide.fixTeacherGuides();
//     }



    private String readResourcesAsString(String localPath) throws IOException {
        InputStream resourceAsStream = null;
        try {
            resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
            java.util.Scanner s = new java.util.Scanner(resourceAsStream).useDelimiter("\\A");

            return s.hasNext() ? s.next() : "";
        } finally {
            resourceAsStream.close();
        }
    }

}
