package com.t2k.common.dbupgrader;

import com.t2k.cgs.dbupgrader.task.AddStyleOverrideToTextViewer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

@ContextConfiguration("/applicationContext-manager.xml")
@Test(groups = "ignore")
public class AddStyleOverrideToTextViewerTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private AddStyleOverrideToTextViewer addStyleOverrideToTextViewer;


    @Test
    public void stageOne() throws  Exception{
      addStyleOverrideToTextViewer.executeUpgrade();
    }
}
