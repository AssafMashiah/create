package org.t2k.cgs.persistence.lessons.tests;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.domain.model.sequence.SequencesDao;
import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.sample.dao.exceptions.DaoException;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.*;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 05/12/12
 * Time: 16:16
 */
@ContextConfiguration("/springContext/applicationContext-MongoDaosTest.xml")
@Test(groups = "ignore")
public class SequencesDaoTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private SequencesDao sequencesDao;

    @Test
    private void testMultiSave() throws Exception {
        String lessonCid = UUID.randomUUID().toString();
        String courseId = UUID.randomUUID().toString();
        String seqId = UUID.randomUUID().toString();
        logger.debug("testMultiSave");
        Sequence sequence = new Sequence(seqId, lessonCid, courseId, "zxxxxxxxxxxxx");

        sequencesDao.saveSequences(Arrays.asList(sequence));
        sequencesDao.saveSequences(Arrays.asList(sequence));
        Assert.assertEquals(sequencesDao.getSequences(lessonCid, courseId).size(), 1);
    }

    @Test
    private void testFindSequence() throws Exception {
        String lessonCid = UUID.randomUUID().toString();
        String courseId = UUID.randomUUID().toString();
        String seqId = UUID.randomUUID().toString();
        Sequence sequence = new Sequence(seqId, lessonCid, courseId, "content");
        sequence.setDeletionDate(new Date());
        sequencesDao.saveSequence(sequence);
        Sequence s = sequencesDao.getSequence(lessonCid,courseId);
        sequencesDao.deleteSequence(seqId,lessonCid,courseId);
        Assert.assertEquals(s.getContent(),sequence.getContent());
        Assert.assertEquals(s.getCourseId(),sequence.getCourseId());
        Assert.assertEquals(s.getLastModified(),sequence.getLastModified());
        Assert.assertEquals(s.getSeqId(),sequence.getSeqId());
        Assert.assertEquals(s.getLessonCId(),sequence.getLessonCId());


    }

    private List<Sequence> testSequences;
    private String mockLessonId = "mockLessonId";
    private String mockCourseId = "mockCourseId";

    @BeforeMethod
    private void addTestSequences() throws DaoException {
        testSequences = createSequenceObjects(5);
        sequencesDao.saveSequences(testSequences);
}

    @AfterMethod
    private void removeTestSequences() throws DaoException {
        for (Sequence s: testSequences){
             sequencesDao.deleteSequence(s.getSeqId(), s.getLessonCId(), s.getCourseId());
        }

    }

    @Test
    private void allSequencesExistSuccessTest() throws Exception {
        int itemsFoundByIteration = 0;
        List<String> seqIds = new ArrayList<>();

        for (Sequence s : testSequences){
            if (sequencesDao.getSequence(s.getSeqId(),s.getLessonCId(),s.getCourseId())!= null){
                itemsFoundByIteration++;
                seqIds.add(s.getSeqId());
            }
        }
        Assert.assertEquals(testSequences.size(), itemsFoundByIteration); // assert this to continue with test.
        // if this is not true - it means that the function should fail
        Assert.assertTrue(sequencesDao.isAllSequencesExistOnDB(mockCourseId, mockLessonId, seqIds));

    }

    @Test
    private void allSequencesExistFailureTest() throws Exception {
        int itemsFoundByIteration = 0;
        List<String> seqIds = new ArrayList<>();
        String idToDelete = null;
        for (Sequence s : testSequences){
            if (sequencesDao.getSequence(s.getSeqId(),s.getLessonCId(),s.getCourseId())!= null){
                itemsFoundByIteration++;
                seqIds.add(s.getSeqId());
                idToDelete = s.getSeqId();
            }
        }
        sequencesDao.deleteSequence(idToDelete,mockLessonId,mockCourseId); // delete sequence, so the validation will fail
        Assert.assertEquals(testSequences.size(), itemsFoundByIteration); // assert this to continue with test.
        // if this is not true - it means that the function should fail
        Assert.assertFalse(sequencesDao.isAllSequencesExistOnDB(mockCourseId, mockLessonId, seqIds));

    }


    private List<Sequence> createSequenceObjects(int numberToCreate) {
        List<Sequence> result = new ArrayList<>();

        for (int i=0;i<numberToCreate;i++){
            result.add(new Sequence("mockId"+i, mockLessonId,mockCourseId,"mockContent"+i));
        }
        return result;
    }

}

