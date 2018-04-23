package com.t2k.common.dbupgrader;

import com.t2k.cgs.dbupgrader.task.AddTextToExistingEbookPages;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

@ContextConfiguration("/applicationContext-manager.xml")
@Test(groups = "ignore")
public class AddTextToExistingEbookPagesTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private AddTextToExistingEbookPages addTextToExistingEbookPages;

    @Test
    public void runTaskTest() throws Exception {
        addTextToExistingEbookPages.fixEbooks();
    }

}
