package com.t2k.common.dbupgrader;

import com.t2k.cgs.dbupgrader.task.FixHebrewLocale;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 17/11/13
 * Time: 16:03
 */
@ContextConfiguration("/applicationContext-manager.xml")
@Test(groups = "ignore")
public class FixHebrewLocaleTest  extends AbstractTestNGSpringContextTests {
    @Autowired
    FixHebrewLocale fixHebrewLocale;

    public void testFixPublishers(){
          fixHebrewLocale.fixPublishers();
    }
    public void testCourses(){
          fixHebrewLocale.fixCourses();
    }
    public void testGroups(){
          fixHebrewLocale.fixGroups();
    }

}
