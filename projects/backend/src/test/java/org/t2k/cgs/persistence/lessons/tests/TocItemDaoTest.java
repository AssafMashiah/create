package org.t2k.cgs.persistence.lessons.tests;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.dao.tocItem.TocItemDao;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.List;
import java.util.UUID;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 09/11/12
 * Time: 16:29
 */
@ContextConfiguration("/springContext/applicationContext-MongoDaosTest.xml")
@Test(groups = "ignore")
public class TocItemDaoTest extends AbstractTestNGSpringContextTests {


    @Autowired
    private TocItemDao lessonsDao;


    @BeforeMethod
    @AfterClass
    private void setUp() {
        clean();
    }

    @BeforeMethod
    private void clean() {
        lessonsDao.removeAllItems(null);
    }


    @Test
    public void testInsert() throws Exception {
        int publisherId = 2;
        String courseId = UUID.randomUUID().toString();
        String lessonId = "69bb10b0-26a6-11e2-81c1-0800200c9a61";
        String lessonJs = readResouresAsString("jsons/lessons/lesson1.json");
        lessonsDao.save(new TocItemCGSObject(lessonJs, publisherId, courseId, EntityType.LESSON));
        TocItemCGSObject lesson = lessonsDao.get(publisherId, lessonId, courseId, null, false);
        Assert.assertNotNull(lesson);
    }


    @Test
    public void testSave() throws Exception {
        int publisherId = 2;
        String courseId = UUID.randomUUID().toString();
        String lessonId = "69bb10b0-26a6-11e2-81c1-0800200c9a61";
        String lessonJs = readResouresAsString("jsons/lessons/lesson1.json");
        lessonsDao.save(new TocItemCGSObject(lessonJs, publisherId, courseId, EntityType.LESSON));
        lessonsDao.save(new TocItemCGSObject(lessonJs, publisherId, courseId, EntityType.LESSON));
        List<TocItemCGSObject> lessonOfCourse = lessonsDao.getByCourse(publisherId, courseId, false);
        Assert.assertEquals(lessonOfCourse.size(), 1);
    }


    @Test
    public void testFind() throws Exception {
        int publisherId = 2;
        String courseId = UUID.randomUUID().toString();
        String lessonId = "69bb10b0-26a6-11e2-81c1-0800200c9a61";
        String lessonJs = readResouresAsString("jsons/lessons/lesson1.json");
        lessonsDao.save(new TocItemCGSObject(lessonJs, publisherId, courseId, EntityType.LESSON));
        TocItemCGSObject lesson = lessonsDao.get(publisherId, lessonId, courseId, null, false);
        Assert.assertNotNull(lesson);
    }


    @Test
    public void testFindByCourseId() throws Exception {
        int publisherId = 2;
        String courseId = UUID.randomUUID().toString();
        String lesson1Id = "69bb10b0-26a6-11e2-81c1-0800200c9a61";
        String lesson2Id = "69bb10b0-26a6-11e2-81c1-0800200c9a77";
        String lessonJs = readResouresAsString("jsons/lessons/lesson2.json");
        lessonsDao.save(new TocItemCGSObject(lessonJs, publisherId, courseId, EntityType.LESSON));
        lessonJs = readResouresAsString("jsons/lessons/lesson1.json");
        lessonsDao.save(new TocItemCGSObject(lessonJs, publisherId, courseId, EntityType.LESSON));
        List<TocItemCGSObject> lessonsOfCourse = lessonsDao.getByCourse(2, courseId, true);
        Assert.assertEquals(lessonsOfCourse.size(), 2);

    }




    private String readResouresAsString(String localPath) throws IOException {
        InputStream resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
        StringWriter writer = new StringWriter();
        IOUtils.copy(resourceAsStream, writer);
        resourceAsStream.close();
        return writer.toString();
    }


}
