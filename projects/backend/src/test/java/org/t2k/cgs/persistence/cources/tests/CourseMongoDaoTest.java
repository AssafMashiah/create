package org.t2k.cgs.persistence.cources.tests;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.course.CoursesDao;
import org.testng.annotations.Test;

import java.io.IOException;

@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class CourseMongoDaoTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private CoursesDao coursesDao;

    @Test
    public void test() throws IOException {
//        coursesDao.getCoursesByTitleMatch(1, "Dest");
    }
}
