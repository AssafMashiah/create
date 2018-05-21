package org.t2k.cgs.persistence.dao;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.model.tocItem.TocItemDao;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 09/11/12
 * Time: 16:29
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
@Test(groups = "ignore")
public class TocItemDaoTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private TocItemDao lessonsDao;

    private String courseId = "this is a test courseId";
    private int publisherId = 1000;

    @BeforeMethod
    @AfterClass
    private void clean() {
        lessonsDao.deleteByCourseIdAndPublisherId(courseId, publisherId);
    }

    @Test
    public void testInsert() throws Exception {
        String lessonId = "69bb10b0-26a6-11e2-81c1-0800200c9a61";
        String lessonJs = readResouresAsString("jsons/lessons/lesson1.json");
        lessonsDao.save(new TocItemCGSObject(lessonJs, publisherId, courseId, EntityType.LESSON));
        TocItemCGSObject lesson = lessonsDao.get(publisherId, lessonId, courseId, null, false);
        Assert.assertNotNull(lesson);
    }

    @Test
    public void testSave() throws Exception {
        String lessonId = "69bb10b0-26a6-11e2-81c1-0800200c9a61";
        String lessonJs = readResouresAsString("jsons/lessons/lesson1.json");
        lessonsDao.save(new TocItemCGSObject(lessonJs, publisherId, courseId, EntityType.LESSON));
        lessonsDao.save(new TocItemCGSObject(lessonJs, publisherId, courseId, EntityType.LESSON));
        List<TocItemCGSObject> lessonOfCourse = lessonsDao.getByCourse(publisherId, courseId, false);
        Assert.assertEquals(lessonOfCourse.size(), 1);
    }

    @Test
    public void testFind() throws Exception {
        String lessonId = "69bb10b0-26a6-11e2-81c1-0800200c9a61";
        String lessonJs = readResouresAsString("jsons/lessons/lesson1.json");
        lessonsDao.save(new TocItemCGSObject(lessonJs, publisherId, courseId, EntityType.LESSON));
        TocItemCGSObject lesson = lessonsDao.get(publisherId, lessonId, courseId, null, false);
        Assert.assertNotNull(lesson);
    }

    @Test
    public void testFindByCourseId() throws Exception {
        String lesson1Id = "69bb10b0-26a6-11e2-81c1-0800200c9a61";
        String lesson2Id = "69bb10b0-26a6-11e2-81c1-0800200c9a77";
        String lessonJs = readResouresAsString("jsons/lessons/lesson2.json");
        lessonsDao.save(new TocItemCGSObject(lessonJs, publisherId, courseId, EntityType.LESSON));
        lessonJs = readResouresAsString("jsons/lessons/lesson1.json");
        lessonsDao.save(new TocItemCGSObject(lessonJs, publisherId, courseId, EntityType.LESSON));
        List<TocItemCGSObject> lessonsOfCourse = lessonsDao.getByCourse(publisherId, courseId, true);
        Assert.assertEquals(lessonsOfCourse.size(), publisherId);
    }

    private String readResouresAsString(String localPath) throws IOException {
        InputStream resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
        StringWriter writer = new StringWriter();
        IOUtils.copy(resourceAsStream, writer);
        resourceAsStream.close();
        return writer.toString();
    }
}
