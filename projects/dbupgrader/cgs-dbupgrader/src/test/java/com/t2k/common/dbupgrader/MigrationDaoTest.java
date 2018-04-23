package com.t2k.common.dbupgrader;

import com.t2k.cgs.dbupgrader.task.LessonsRefMigration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 09/11/12
 * Time: 16:29
 */
@ContextConfiguration("/applicationContext-MongoDBTest.xml")
@Test(groups = "ignore")
public class MigrationDaoTest extends AbstractTestNGSpringContextTests {
    @Autowired
    private LessonsRefMigration lessonsRefMigration;

    @Test
    public void testSTAM() throws Exception {
        lessonsRefMigration.changeCourses();
    }

}
