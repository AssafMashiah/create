package org.t2k.cgs.persistence.dao.tinykeys;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.domain.usecases.packaging.TinyKeysDao;
import org.t2k.cgs.domain.usecases.packaging.PublishTarget;
import org.t2k.cgs.domain.usecases.packaging.TinyKey;
import org.t2k.sample.dao.exceptions.DaoException;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * Created by Moshe.Avdiel on 5/2/2016.
 */

@ContextConfiguration("/springContext/applicationContext-MongoDaosTest.xml")
@Test(groups = "ignore")
public class TinyKeyDaoTest extends AbstractTestNGSpringContextTests {

    public static String TINY_KEY_FOR_COURSE = "mycourse";
    public static String TINY_KEY_FOR_LESSON = "mylesson";
    public static String TITLE_FOR_COURSE = "Title For Course Only";
    public static String TITLE_FOR_LESSON = "Title For Lesson Only";
    public static String COURSE_ID = "abcd-efgh-ijkl-mnopq-rstuv-wxyz";
    public static String LESSON_ID = "lesson-id-123456-abcd";

    @Autowired
    private TinyKeysDao tinyKeysDao;

    TinyKey courseTinyKey = null;
    TinyKey lessonTinyKey = null;

    @BeforeClass
    public void prepareData() throws DaoException {

        courseTinyKey = new TinyKey(1, COURSE_ID, null, TINY_KEY_FOR_COURSE, PublishTarget.COURSE_TO_URL.getName(), TITLE_FOR_COURSE, TITLE_FOR_LESSON);
        lessonTinyKey = new TinyKey(1, COURSE_ID, LESSON_ID, TINY_KEY_FOR_LESSON, PublishTarget.LESSON_TO_URL.getName(),TITLE_FOR_COURSE ,TITLE_FOR_LESSON);
        tinyKeysDao.saveTinyKey(courseTinyKey);
        tinyKeysDao.saveTinyKey(lessonTinyKey);
        // Save for Lesson level.

    }


    @Test
    public void testTinyKeyNotFound() {
        TinyKey tinyKey = this.tinyKeysDao.getTinyKey(1, "CourseIdNotFound", null, PublishTarget.COURSE_TO_URL);
        Assert.assertNull(tinyKey);
    }


    @Test
    public void getTinyKeyforCourseToURL() {
        TinyKey tinyKey = this.tinyKeysDao.getTinyKey(courseTinyKey.getPublisherId(), courseTinyKey.getCourseId(), null, PublishTarget.COURSE_TO_URL);
        Assert.assertNotNull(tinyKey);
        Assert.assertEquals(tinyKey.getTinyKey(), TINY_KEY_FOR_COURSE);
    }

    @Test
    public void getTinyKeyForLessonToURL() {
        TinyKey tinyKey = this.tinyKeysDao.getTinyKey(lessonTinyKey.getPublisherId(), lessonTinyKey.getCourseId(), lessonTinyKey.getLessonId(), PublishTarget.LESSON_TO_URL);
        Assert.assertNotNull(tinyKey);
        Assert.assertEquals(tinyKey.getTinyKey(), TINY_KEY_FOR_LESSON);
    }

    @AfterClass
    public void cleanup() throws DaoException {
        this.tinyKeysDao.deleteTinyKey(courseTinyKey.getPublisherId(), courseTinyKey.getCourseId(), courseTinyKey.getLessonId(), PublishTarget.COURSE_TO_URL);
        this.tinyKeysDao.deleteTinyKey(lessonTinyKey.getPublisherId(), lessonTinyKey.getCourseId(), lessonTinyKey.getLessonId(), PublishTarget.LESSON_TO_URL);
    }
}
