package com.t2k.common.dbupgrader;

import atg.taglib.json.util.JSONException;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.cgs.dbupgrader.task.FixParagraphsOutsideDivsInTextViewer;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;

import static org.mockito.Mockito.when;
/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 09/06/14
 * Time: 14:22
 */
@ContextConfiguration("/applicationContext-manager.xml")
@Test(groups = "ignore")
public class FixParagraphsOutsideDivsInTextViewerTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private FixParagraphsOutsideDivsInTextViewer fixParagraphsOutsideDivsInTextViewer;

    @Test
     public void fixParagraphs() throws Exception {
        fixParagraphsOutsideDivsInTextViewer.executeUpInternal();
    }

    @Test
    public void getSepecificSequence(){
        String seqId = "8f3eed54-fba8-4f63-a6c4-184520174c7d";
        DBObject json = fixParagraphsOutsideDivsInTextViewer.getMigrationDao().getSequencesBySeqId(seqId);
    }
    @Test
    public void testSpecificSequence() throws JSONException, IOException {
        String seqId = "8f3eed54-fba8-4f63-a6c4-184520174c7d";
        String lessonCId =  "385f0f03-8ec1-4e82-850e-c72a68bc370a";
        String courseId  =  "1ae6cef2-2e27-46f7-bf8c-a044186b2aab";
        String seqBeforeJson = readResourcesAsString("sequences/seq1BeforeDivFix.json");
        String seqAfterJson = readResourcesAsString("sequences/seq1AfterDivFix.json");
        String basicLesson = readResourcesAsString("sequences/basicLesson.json");
        MigrationDao mockMigrationDao = Mockito.mock(MigrationDao.class);
        when(mockMigrationDao.getSequencesBySeqId(seqId)).thenReturn((DBObject) JSON.parse(seqBeforeJson));
        when(mockMigrationDao.getLessonById(courseId, lessonCId)).thenReturn((DBObject) JSON.parse(basicLesson));

        DBObject expectedSequenceAfterChange =  (DBObject) JSON.parse(seqAfterJson);
        fixParagraphsOutsideDivsInTextViewer.setMigrationDao(mockMigrationDao);

        DBObject actualSequenceAfterChange = fixParagraphsOutsideDivsInTextViewer.fixSpecificSequence(seqId);
        String expectedContent = expectedSequenceAfterChange.get("content").toString();
        String actualContent = actualSequenceAfterChange.get("content").toString();
        String expectedConverted = getConvertedDataString(expectedContent, seqId);
        String actualConverted = getConvertedDataString(actualContent, seqId);

        Assert.assertEquals(expectedConverted, actualConverted);    // Assert that converted data is indeed an its correct form
        Assert.assertEquals(expectedSequenceAfterChange.get("content"), actualSequenceAfterChange.get("content"));

    }

    public void convertedDataModificationTest() throws IOException {
        String convertedDataBefore = readResourcesAsString("sequences/convertedDataBefore.txt");
        String expectedConvertedDataAfter = readResourcesAsString("sequences/convertedDataAfter.txt");
        Document doc = Jsoup.parse(convertedDataBefore);
        String expectedConvertedDataAfterAsString = Jsoup.parse(expectedConvertedDataAfter).body().children().toString();
        fixParagraphsOutsideDivsInTextViewer.modifyConvertedData(doc);
        String actualConvertedDataAfterAsString = doc.body().children().toString();
        Assert.assertEquals(actualConvertedDataAfterAsString,expectedConvertedDataAfterAsString);

    }

    private String readResourcesAsString(String localPath) throws IOException {
        InputStream resourceAsStream;
        resourceAsStream = null;
        try {
            resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
            java.util.Scanner s = new java.util.Scanner(resourceAsStream).useDelimiter("\\A");

            return s.hasNext() ? s.next() : "";
        } finally {
            resourceAsStream.close();
        }
    }

    private String getConvertedDataString(String content, String seqId){
        String converted =  ((BasicDBObject)((BasicDBObject) JSON.parse(content)).get(seqId)).get("convertedData").toString();
        return Jsoup.parseBodyFragment(converted).body().toString();
    }


}
