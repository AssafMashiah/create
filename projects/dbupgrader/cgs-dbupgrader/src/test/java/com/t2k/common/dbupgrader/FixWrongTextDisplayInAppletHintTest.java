package com.t2k.common.dbupgrader;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.cgs.dbupgrader.task.FixWrongTextDisplayInAppletHint;
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
 * Created by elad.avidan on 31/07/2014.
 */
@ContextConfiguration("/applicationContext-manager.xml")
@Test(groups = "ignore")
public class FixWrongTextDisplayInAppletHintTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private FixWrongTextDisplayInAppletHint fixWrongTextDisplayInAppletHint;

    @Test
    public void fixWrongText() throws Exception {
        fixWrongTextDisplayInAppletHint.executeUpInternal();
    }

    @Test
    public void testSpecificSequence() throws JSONException, IOException {
        String seqId = "403d1c9a-6aef-46bc-9ebf-ae9f3a9d082b";
        String subSequenceIdToChange = "73e36085-b376-4b8c-869d-170afdf91c76";
        String lessonCId =  "61087881-1929-454c-a077-4c0183753b47"; // We need it for the mock
        String courseId  =  "377e28d0-39d3-4925-90e0-b6b43af95660"; // We need it for the mock
        String seqBeforeJson = readResourcesAsString("sequences/wrongTextDisplayInAplletHintBefore.json");
        String seqAfterJson = readResourcesAsString("sequences/wrongTextDisplayInAplletHintAfter.json");
        String basicLesson = readResourcesAsString("sequences/basicLesson.json"); // We need it for the mock
        MigrationDao mockMigrationDao = Mockito.mock(MigrationDao.class);
        when(mockMigrationDao.getSequencesBySeqId(seqId)).thenReturn((DBObject) JSON.parse(seqBeforeJson));
        when(mockMigrationDao.getLessonById(courseId, lessonCId)).thenReturn((DBObject) JSON.parse(basicLesson));

        DBObject expectedSequenceAfterChange =  (DBObject) JSON.parse(seqAfterJson);
        fixWrongTextDisplayInAppletHint.setMigrationDao(mockMigrationDao);

        DBObject actualSequenceAfterChange = fixWrongTextDisplayInAppletHint.fixSpecificSequence(seqId);
        String expectedContent = expectedSequenceAfterChange.get("content").toString();
        String actualContent = actualSequenceAfterChange.get("content").toString();

        String expectedSubSequenceHtmlTitle = getSubSequenceTitleHtmlString(expectedSequenceAfterChange, subSequenceIdToChange);
        String actualSubSequenceHtmlTitle = getSubSequenceTitleHtmlString(actualSequenceAfterChange, subSequenceIdToChange);
        Assert.assertEquals(actualSubSequenceHtmlTitle, expectedSubSequenceHtmlTitle);

        String expectedConvertedData = getConvertedDataString(expectedContent, seqId);
        String actualConvertedData = getConvertedDataString(actualContent, seqId);
        Assert.assertEquals(actualConvertedData, expectedConvertedData);    // Assert that converted data is indeed in its correct form
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

    private String getSubSequenceTitleHtmlString(DBObject sequence, String subSequenceId) throws JSONException {
        JSONObject content = new JSONObject(sequence.get("content").toString());
        String title = content.getJSONObject(subSequenceId).getJSONObject("data").getString("title");
        Document doc = Jsoup.parseBodyFragment(title);
        return doc.body().html().toString();
    }
}
