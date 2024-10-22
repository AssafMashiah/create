package org.t2k.cgs.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.course.CourseCGSObject;
import org.t2k.cgs.domain.model.exceptions.ValidationException;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.usecases.packaging.ContentValidator;
import org.t2k.cgs.persistence.dao.EntityType;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import static org.testng.Assert.assertTrue;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 14/11/13
 * Time: 16:24
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
@Test(groups = "ignore")
public class ContentValidatorTest extends AbstractTestNGSpringContextTests {

//    ContentValidator contentValidatorFromCommon;

    @Autowired
    @Qualifier("contentValidatorBean")
    private ContentValidator contentValidator;

    @BeforeClass
    protected void init() throws Exception {

//        contentValidator = contentValidatorFromCommon;
        //or
        //initValidatorWithTestSchema();
    }

//    private void initValidatorWithTestSchema() throws ValidationException, IOException {
//        contentValidator = new ContentValidator();
//        contentValidator.setActive(true);
//        contentValidator.setCourseJsonSchemaResource(new ClassPathResource("validation/course_v4.json"));
//        contentValidator.initValidators();
//    }

    public void testAll() throws Exception {
        {
            TocItemCGSObject lesson = new TocItemCGSObject(TestUtils.resource2String("validation/lessonWithSharedContent.json"), 1, "", EntityType.LESSON);
            contentValidator.validate(lesson);
        }
        {
            CourseCGSObject course = new CourseCGSObject(TestUtils.resource2String("validation/validCourse.json"), 1);
            contentValidator.validate(course);
        }
        {
            boolean pass = false;
            CourseCGSObject course = new CourseCGSObject(TestUtils.resource2String("validation/invalidCourse.json"), 1);
            try{
                contentValidator.validate(course);
            } catch (ValidationException e){
                pass = true;
            }
            assertTrue(pass);
        }
    }

    public void testLesson() throws Exception {
        TocItemCGSObject lesson = new TocItemCGSObject(TestUtils.resource2String("validation/lessonWithSharedContent.json"), 1, "", EntityType.LESSON);
        contentValidator.validate(lesson);
    }

    public void testCourse() throws Exception {
        CourseCGSObject course = new CourseCGSObject(TestUtils.resource2String("validation/newCustomizationPack.json"), 1);
        contentValidator.validate(course);
    }


}
