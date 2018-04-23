package com.t2k.common.dbupgrader;

import com.t2k.cgs.dbupgrader.task.SeparatorImageSizeUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

@ContextConfiguration("/applicationContext-manager.xml")
@Test(groups = "ignore")
public class SeparatorImageSizeUpdateTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private SeparatorImageSizeUpdate separatorImageSizeUpdate;


    @Test
    public void test1() throws  Exception{
        separatorImageSizeUpdate.precessSeqs();
    }
}
