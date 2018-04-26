package org.t2k.cgs.persistence.cources.tests;

import org.apache.commons.io.IOUtils;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.dao.courses.CoursesDao;
import org.t2k.cgs.dao.publisher.AccountDao;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.model.course.Course;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 04/11/12
 * Time: 18:36
 */
@ContextConfiguration("/springContext/applicationContext-MongoDaosTest.xml")
@Test(groups = "ignore")
public class CourseDaoTest extends AbstractTestNGSpringContextTests {


    @Autowired
    private CoursesDao coursesDao;

    @Autowired
    private AccountDao accountDao;

    int publisherId;

    @BeforeMethod
    public void initPublisherId() {
        publisherId = getUnusedAccountId();
    }


    @Test
    public void testInsert() throws Exception {
        String bookJs = readResouresAsString("jsons/courses/book1.json");
        CourseCGSObject courseToInsert = new CourseCGSObject(bookJs, publisherId);
        coursesDao.saveCourseCGSObject(courseToInsert);
        List<CourseCGSObject> coursesHeadersByPublisher = coursesDao.getCoursesPropertiesByPublisher(publisherId);
        Boolean insertedCourseFound = false;
        for (CourseCGSObject course : coursesHeadersByPublisher) {
            if (course.getContentId().equals(courseToInsert.getContentId()))
                insertedCourseFound = true;
        }

        Assert.assertTrue(insertedCourseFound);

    }


    @Test
    public void testUpdate() throws Exception {
        String bookJs = readResouresAsString("jsons/courses/book1.json");
        CourseCGSObject courseCGSObject =new CourseCGSObject(bookJs, publisherId);
        coursesDao.saveCourseCGSObject(courseCGSObject);
        coursesDao.saveCourseCGSObject(courseCGSObject);
        Course course = coursesDao.getCourse(publisherId, courseCGSObject.getEntityId());
        Assert.assertNotNull(course);
    }


//    public void testSaveDiffEdition() throws Exception {
//        int publisherId = 1;
//        String bookJs_e1 = readResouresAsString("jsons/courses/book1.json");
//        String bookJs_e2 = readResouresAsString("jsons/courses/book1_e2.json");
//        coursesDao.saveCourseCGSObject(new CourseCGSObject(bookJs_e1, publisherId));
//        coursesDao.saveCourseCGSObject(new CourseCGSObject(bookJs_e2, publisherId));
//        List<CourseCGSObject> coursesHeadersByPublisher = coursesDao.getCoursesPropertiesByPublisher(publisherId);
//        Assert.assertEquals(coursesHeadersByPublisher.size(), 2);
//    }


    @Test
    public void testSaves() throws Exception {
        int numberOfCoursesBeforeSaving = coursesDao.getCoursesPropertiesByPublisher(publisherId).size();
        String bookJs1 = readResouresAsString("jsons/courses/book1.json");
        CourseCGSObject c1 = new CourseCGSObject(bookJs1, publisherId);
        c1.setCourseId("courseId"+(new Date().toString())) ;
        c1.setContentId("courseId"+(new Date().toString()));
        coursesDao.saveCourseCGSObject(c1);
        String bookJs2 = readResouresAsString("jsons/courses/book2.json");
        CourseCGSObject c2 =  new CourseCGSObject(bookJs2, publisherId);
        c2.setCourseId("courseId"+(new Date().toString()+"a")) ;
        c2.setContentId("courseId"+(new Date().toString())+"a");
        coursesDao.saveCourseCGSObject(c2);
        List<CourseCGSObject> coursesHeadersByPublisher = coursesDao.getCoursesPropertiesByPublisher(publisherId);
        Boolean course1Found = false;
        Boolean course2Found = false;

        for (CourseCGSObject course : coursesHeadersByPublisher)  {
            if (course.getContentId().equals(c1.getContentId())){
                course1Found = true;
            }
            if (course.getContentId().equals(c2.getContentId())){
                course2Found = true;
            }
        }
        Assert.assertTrue(course1Found);
        Assert.assertTrue(course2Found);

    }


    @Test
    public void testLastUpdateValue() throws Exception {
        String bookJs1 = readResouresAsString("jsons/courses/book1.json");
        CourseCGSObject courseCGSObject = new CourseCGSObject(bookJs1, publisherId);
        Date lastModified = new Date();
        courseCGSObject.setLastModified(lastModified);
        coursesDao.saveCourseCGSObject(courseCGSObject);
        CourseCGSObject courseHeader = coursesDao.getCourseHeader("69bb10b0-26a6-11e2-81c1-0800200c9a61");
        Assert.assertEquals(lastModified, courseHeader.getLastModified());
    }


    @Test
    public void testGetByIdAndVersion() throws Exception {

        String bookJs1 = readResouresAsString("jsons/courses/book1.json");
        coursesDao.saveCourseCGSObject(new CourseCGSObject(bookJs1, publisherId));
        String bookJs2 = readResouresAsString("jsons/courses/book2.json");
        coursesDao.saveCourseCGSObject(new CourseCGSObject(bookJs2, publisherId));
        CourseCGSObject course = coursesDao.getCourse(publisherId, "69bb10b0-26a6-11e2-81c1-0800200c9a11", null, false);
        Assert.assertEquals(course.getEntityId(), "69bb10b0-26a6-11e2-81c1-0800200c9a11");
    }


//    @Test
//    public void testGetByIdAndVersion4() throws Exception {
//        int publisherId = 1;
//        String bookJs3 = readResouresAsString("jsons/courses/book3.json");
//        CourseCGSObject contentItem = new CourseCGSObject(bookJs3, publisherId);
//        Date now = new Date();
//        contentItem.setLastModified(now);
//        coursesDao.saveCourseCGSObject(contentItem);
//        CourseCGSObject course = coursesDao.getCourse(publisherId, "69bb10b0-26a6-11e2-81c1-0800200c9a55", now, false);
//        Assert.assertEquals(course.getContentId(), "69bb10b0-26a6-11e2-81c1-0800200c9a55");
//        course = coursesDao.getCourse(publisherId, "69bb10b0-26a6-11e2-81c1-0800200c9a55", new Date(0), false);
//        Assert.assertNull(course);
//    }


    @Test
    public void testCourseIsWithToc() throws Exception {

        String bookJs3 = readResouresAsString("jsons/courses/book3.json");
        coursesDao.saveCourseCGSObject(new CourseCGSObject(bookJs3, publisherId));
        String bookJs2 = readResouresAsString("jsons/courses/book2.json");
        coursesDao.saveCourseCGSObject(new CourseCGSObject(bookJs2, publisherId));
        CourseCGSObject course = coursesDao.getCourse(publisherId, "69bb10b0-26a6-11e2-81c1-0800200c9a55", null, false);
        Assert.assertEquals(course.getEntityId(), "69bb10b0-26a6-11e2-81c1-0800200c9a55");
        ObjectMapper m = new ObjectMapper();
        JsonNode rootNode = m.readTree(course.serializeContentData());
        JsonNode path = rootNode.path(CourseCGSObject.CGS_CONTENT + ".toc");

        Assert.assertNotNull(path.isObject(), "The returned course is lite. Not Containing the TOC");

    }



    @Test
    public void testGetOnlySavedCourses() throws Exception {

        String bookJs3 = readResouresAsString("jsons/courses/book3.json");
        CourseCGSObject savedCourse = new CourseCGSObject(bookJs3, publisherId);


        coursesDao.saveCourseCGSObject(savedCourse);
        String bookJs2 = readResouresAsString("jsons/courses/book2.json");
        CourseCGSObject newCourse = new CourseCGSObject(bookJs2, publisherId);
        newCourse.setLastModified(new Date(0));
        coursesDao.saveCourseCGSObject(newCourse);
        List<CourseCGSObject> onlySavedCourses = coursesDao.getSavedCoursesPropertiesByPublisher(publisherId);
        Boolean newCourseAppearedOnResults = false;
        Boolean savedCourseAppearedOnResults = false;

        for (CourseCGSObject course : onlySavedCourses)  {
             if (course.getContentId().equals(savedCourse.getContentId())){
                 savedCourseAppearedOnResults = true;
             }
            if (course.getContentId().equals(newCourse.getContentId())){
                newCourseAppearedOnResults = true;
            }
         }
        //check return of both item
        Assert.assertTrue(savedCourseAppearedOnResults);
        Assert.assertFalse(newCourseAppearedOnResults);
   }

    /**
     * checks that the course object handles the header
     *
     * @throws Exception
     */
    public void testHeaderAccess() throws Exception {

        String bookJs3 = readResouresAsString("jsons/courses/book3.json");
        CourseCGSObject courseCGSObject = new CourseCGSObject(bookJs3, publisherId);
        String headerData = courseCGSObject.serializeContentHeader();


        ObjectMapper m = new ObjectMapper();
        JsonNode sentData = m.readTree(courseCGSObject.serializeContentData());
        JsonNode headerParsed = m.readTree(headerData);
        JsonNode clientHeader = sentData.path("header");
        Assert.assertEquals(clientHeader, headerParsed);


    }


    private String readResouresAsString(String localPath) throws IOException {
        InputStream resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
        StringWriter writer = new StringWriter();
        IOUtils.copy(resourceAsStream, writer);
        resourceAsStream.close();
        return writer.toString();
    }

    public int getUnusedAccountId() {
        int publisherId = Integer.MAX_VALUE;
        while (accountDao.getPublisher(publisherId) != null) {
            publisherId--;
        }
        return publisherId;
    }
}
