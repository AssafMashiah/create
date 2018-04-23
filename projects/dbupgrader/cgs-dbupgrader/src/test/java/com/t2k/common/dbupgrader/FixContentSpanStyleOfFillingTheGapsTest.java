package com.t2k.common.dbupgrader;

import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import com.t2k.cgs.dbupgrader.dao.MigrationDao;
import com.t2k.cgs.dbupgrader.task.FixContentSpanStyleOfFillingTheGaps;
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
 * Created by elad.avidan on 28/07/2014.
 */
@ContextConfiguration("/applicationContext-manager.xml")
@Test(groups = "ignore")
public class FixContentSpanStyleOfFillingTheGapsTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private FixContentSpanStyleOfFillingTheGaps fixContentSpanStyleOfFillingTheGaps;

    @Test
    public void fixFillingTheGaps() throws Exception {
        fixContentSpanStyleOfFillingTheGaps.executeUpInternal();
    }

    @Test
    public void testSpecificSequence() throws JSONException, IOException {
        String seqId = "0116b546-ae56-4f96-bcb6-f8c901bc60e5";
        String subSequenceIdToChange_1 = "029f7fe5-54bc-45b9-9838-cddb539cd51e";
        String subSequenceIdToChange_2 = "2971f3f0-0c8b-416f-a54a-eec875486cc9";
        String lessonCId =  "a7dff15a-06fd-4f23-a5f0-8b8d6bc8ee5d"; // We need it for the mock
        String courseId  =  "2a4650d5-bfc8-4ec5-9af6-9f8ace760d85"; // We need it for the mock
        String seqBeforeJson = readResourcesAsString("sequences/fillingTheGapsSeqBefore.json");
        String seqAfterJson = readResourcesAsString("sequences/fillingTheGapsSeqAfter.json");
        String basicLesson = readResourcesAsString("sequences/basicLesson.json"); // We need it for the mock
        MigrationDao mockMigrationDao = Mockito.mock(MigrationDao.class);
        when(mockMigrationDao.getSequencesBySeqId(seqId)).thenReturn((DBObject) JSON.parse(seqBeforeJson));
        when(mockMigrationDao.getLessonById(courseId, lessonCId)).thenReturn((DBObject) JSON.parse(basicLesson));

        DBObject expectedSequenceAfterChange =  (DBObject) JSON.parse(seqAfterJson);
        fixContentSpanStyleOfFillingTheGaps.setMigrationDao(mockMigrationDao);

        DBObject actualSequenceAfterChange = fixContentSpanStyleOfFillingTheGaps.fixSpecificSequence(seqId);
        String expectedContent = expectedSequenceAfterChange.get("content").toString();
        String actualContent = actualSequenceAfterChange.get("content").toString();
        String expectedConverted = getConvertedDataString(expectedContent, seqId);
        String actualConverted = getConvertedDataString(actualContent, seqId);

        Assert.assertEquals(actualConverted, expectedConverted);    // Assert that converted data is indeed in its correct form

        String expectedSubSequenceHtmlTitle_1 = getSubSequenceTitleHtmlString(expectedSequenceAfterChange, subSequenceIdToChange_1);
        String actualSubSequenceHtmlTitle_1 = getSubSequenceTitleHtmlString(actualSequenceAfterChange, subSequenceIdToChange_1);
        Assert.assertEquals(actualSubSequenceHtmlTitle_1, expectedSubSequenceHtmlTitle_1);

        String expectedSubSequenceHtmlTitle_2 = getSubSequenceTitleHtmlString(expectedSequenceAfterChange, subSequenceIdToChange_2);
        String actualSubSequenceHtmlTitle_2 = getSubSequenceTitleHtmlString(actualSequenceAfterChange, subSequenceIdToChange_2);
        Assert.assertEquals(actualSubSequenceHtmlTitle_2, expectedSubSequenceHtmlTitle_2);
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
