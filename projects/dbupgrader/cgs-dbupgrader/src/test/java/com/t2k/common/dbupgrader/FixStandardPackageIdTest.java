package com.t2k.common.dbupgrader;

import com.t2k.cgs.dbupgrader.task.FixStandardPackageId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

/**
 * Created by IntelliJ IDEA.
 * User: efrat.gur
 * Date: 11/09/13
 * Time: 14:47
 */

@ContextConfiguration("/applicationContext-MongoDBTest.xml")
@Test(groups = "ignore")
public class FixStandardPackageIdTest extends AbstractTestNGSpringContextTests {

    @Autowired
     private FixStandardPackageId fixStandardPackageId;


    @Test
    private void testFixStandardPackageId() throws Exception{
       fixStandardPackageId.fixCoursesStandardPackageId();
       fixStandardPackageId.fixLessonsStandardPackageId();
    }
}



