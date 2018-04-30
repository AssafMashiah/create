package org.t2k.packaging;

import org.apache.commons.io.IOUtils;
import org.t2k.cgs.domain.usecases.packaging.ContentParseUtil;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 20/11/12
 * Time: 14:39
 */
@Test
public class ContentParseUtilTest {

    @Test
    public void parseTocItemsLessonIdsTest() throws Exception {
        String course = readResourcesAsString("jsons/course.json");
        List<String> lessonIds = ContentParseUtil.getTocIdsFromCourseJson(course,false);
        Assert.assertEquals(lessonIds.size(), 18);

    }

     @Test
    public void parseTocItemsTest() throws Exception {
        String course = readResourcesAsString("jsons/course.json");
        List<String> lessonIds = ContentParseUtil.getTocIdsFromCourseJson(course,true);
        Assert.assertEquals(lessonIds.size(), 24);

    }

    @Test
    public void getAllSequenceIdsFromLessonTest() throws Exception {
        String lesson = readResourcesAsString("jsons/lessonWithSeqsA.json");
        List<String> seqIds = ContentParseUtil.getSequencesIdsFromLesson(lesson);
        Assert.assertEquals(seqIds.size(), 4);

    }

    @Test
    public void checkSequenceOrderTest() throws Exception {
        String lessonA = readResourcesAsString("jsons/lessonWithSeqsA.json");
        String lessonB = readResourcesAsString("jsons/lessonWithSeqsB.json");
        List<String> seqIdsA = ContentParseUtil.getSequencesIdsFromLesson(lessonA);
        List<String> seqIdsB = ContentParseUtil.getSequencesIdsFromLesson(lessonB);
        Assert.assertEquals(seqIdsA.size(), 4);
        Assert.assertEquals(seqIdsB.size(), 4);
        StringBuffer seqBuffer = new StringBuffer();
        for (String sqId : seqIdsA) {
            seqBuffer.append(sqId);
        }
        String a = seqBuffer.toString();
        seqBuffer = new StringBuffer();
        for (String sqId : seqIdsB) {
            seqBuffer.append(sqId);
        }
        String b = seqBuffer.toString();
        Assert.assertNotEquals(a, b);
    }

    @Test
    public void checkGetSequenceFromLessonAndGetTaskFromSequence() throws Exception {
        String lessonWithStandards = readResourcesAsString("jsons/lessonWithStandards.json");

        List<String> sequences = ContentParseUtil.getSequencesFromLesson(lessonWithStandards);

        Assert.assertEquals(sequences.size(), 4);

        boolean isFirstSequence = true;

        for (String sequence : sequences) {

            List<String> tasks = ContentParseUtil.getTasksFromSequence(sequence);

            if (isFirstSequence) {
                Assert.assertEquals(tasks.size(), 1);
                isFirstSequence = false;
            } else {
                Assert.assertEquals(tasks.size(), 0);
            }

        }

    }

    @Test
    public void parseSequencesTest() throws Exception {
//        Sequence sequence1 = new Sequence("seqId-aaxds", "lessonsId", "aaaaaaaaaaa");
//        Sequence sequence2 = new Sequence("seqId-trhbh", "LessonId2", "somecontents....");
//        List<Sequence> sequences = Arrays.asList(sequence1, sequence2);
//        ObjectMapper objectMapper = new ObjectMapper();
//        StringWriter stringWriter = new StringWriter(1);
//        objectMapper.writeValue(stringWriter, sequences);
    }

    private String readResourcesAsString(String localPath) throws IOException {
        InputStream resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
        StringWriter writer = new StringWriter();
        IOUtils.copy(resourceAsStream, writer);
        resourceAsStream.close();
        return writer.toString();
    }
   
}
