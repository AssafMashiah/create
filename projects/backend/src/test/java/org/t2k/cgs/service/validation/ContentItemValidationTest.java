package org.t2k.cgs.service.validation;

import com.t2k.configurations.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.domain.model.course.CoursesDao;
import org.t2k.cgs.domain.model.tocItem.TocItemDao;
import org.t2k.cgs.domain.model.ContentItem;
import org.t2k.cgs.domain.usecases.publisher.PublishError;
import org.t2k.sample.dao.exceptions.DaoException;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 09/09/14
 * Time: 14:41
 * To change this template use File | Settings | File Templates.
 */
@ContextConfiguration("/springContext/all-context.xml")
@Test(groups = "ignore")
public class ContentItemValidationTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private ContentItemValidation contentItemValidation;

    @Autowired
    private Configuration configuration;

    @Autowired
    private CoursesDao coursesDao;

    @Autowired
    private TocItemDao lessonsDao;

    private String courseWithNoResources = "80de9bb1-5e89-438b-a9f2-8d39de531b46";
    private String publisherId13 = "13";

    private String courseWithResources = "06bc1e42-ab68-4233-87a0-61aa8ad175d3";
    private String publisherId1 = "1";


    @Test
    public void validateContentForCourseWithoutResources() throws DaoException {
        String cmsPublisherCourseHome = getCmsPublisherCourseHome(courseWithNoResources,publisherId13);
        List<PublishError> errors = new ArrayList<>();
        ContentItem contentItem = coursesDao.getCourse(courseWithNoResources, false);
        Boolean isValid = contentItemValidation.doAllAssetsExistOnFileSystem(contentItem, errors, cmsPublisherCourseHome);
        Assert.assertTrue(isValid);
        Assert.assertTrue(errors.isEmpty());

    }

    @Test
    public void validateContentForCourseWithResources() throws DaoException {

        String cmsPublisherCourseHome = getCmsPublisherCourseHome(courseWithResources,publisherId1);
        List<PublishError> errors = new ArrayList<>();
        ContentItem contentItem = coursesDao.getCourse(courseWithResources, false);
        Boolean isValid = contentItemValidation.doAllAssetsExistOnFileSystem(contentItem, errors, cmsPublisherCourseHome);
        Assert.assertTrue(isValid);
        Assert.assertTrue(errors.isEmpty());

    }

    private String lessonWithMissingResources = "cc4b562c-19f5-428c-9101-5782d115df58";
    private String lessonWithResourcesMissingCourseId = "43f7a05a-2d56-4b6e-af7b-6db49d0ae99d";
    private int publisherMissingResources = 1;

    @Test
    public void validateContentForLessonWithMissingResources() throws DaoException {

        String cmsPublisherCourseHome = getCmsPublisherCourseHome(courseWithResources,publisherId1);
        List<PublishError> errors = new ArrayList<>();
        ContentItem contentItem = lessonsDao.get(publisherMissingResources,lessonWithMissingResources, lessonWithResourcesMissingCourseId, null,false);
        Boolean isValid = contentItemValidation.doAllAssetsExistOnFileSystem(contentItem, errors, cmsPublisherCourseHome);
        Assert.assertFalse(isValid);
        Assert.assertFalse(errors.isEmpty());

    }

    private String lessonWithResources = "183f3b5e-8ad5-472d-9612-473c15649a8e";
    private String lessonWithResourcesCourseId = "e60281c2-6b1f-4683-8141-7a4c44bea301";
    private int publisherWithResources = 1;

    @Test
    public void validateContentForLessonWithResources() throws DaoException {

        String cmsPublisherCourseHome = getCmsPublisherCourseHome(lessonWithResourcesCourseId,publisherId1);
        List<PublishError> errors = new ArrayList<>();
        ContentItem contentItem = lessonsDao.get(publisherWithResources,lessonWithResources, lessonWithResourcesCourseId, null,false);
        Boolean isValid = contentItemValidation.doAllAssetsExistOnFileSystem(contentItem, errors, cmsPublisherCourseHome);
        Assert.assertTrue(isValid);
        Assert.assertTrue(errors.isEmpty());

    }
    private String getCmsPublisherCourseHome(String validCourse, String publisherId) {
        return configuration.getProperty("cmsHome") + "/publishers/" + publisherId+ "/courses/" + validCourse;
    }
}
