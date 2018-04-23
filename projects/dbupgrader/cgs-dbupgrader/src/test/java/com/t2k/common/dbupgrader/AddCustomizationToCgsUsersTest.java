package com.t2k.common.dbupgrader;

import com.t2k.cgs.dbupgrader.task.AddCustomizationToCgsUsers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

@ContextConfiguration("/applicationContext-manager.xml")
@Test(groups = "ignore")
public class AddCustomizationToCgsUsersTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private AddCustomizationToCgsUsers addCustomizationToCgsUsers;


    @Test
    public void addCustomizationForSpecificUsers() throws  Exception{
        addCustomizationToCgsUsers.fixUsers();
    }
}
