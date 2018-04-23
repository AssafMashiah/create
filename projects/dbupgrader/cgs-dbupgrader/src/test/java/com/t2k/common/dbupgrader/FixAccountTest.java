package com.t2k.common.dbupgrader;

import com.t2k.cgs.dbupgrader.task.FixAccountsAndUsers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 27/08/13
 * Time: 15:56
 */
@ContextConfiguration("/applicationContext-MongoDBTest.xml")
@Test(groups = "ignore")
public class FixAccountTest extends AbstractTestNGSpringContextTests {

    @Autowired
     private FixAccountsAndUsers fixAccountsAndUsers;


    @Test
    private void testFixAccountsAndUsers(){
       fixAccountsAndUsers.fixPublishers();
        fixAccountsAndUsers.fixUsers();
    }
}
