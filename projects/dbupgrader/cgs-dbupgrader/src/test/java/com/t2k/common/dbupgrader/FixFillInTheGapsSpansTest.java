package com.t2k.common.dbupgrader;

import atg.taglib.json.util.JSONException;
import com.t2k.cgs.dbupgrader.task.FixFillInTheGapsSpans;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 09/06/14
 * Time: 14:22
 */
@ContextConfiguration("/applicationContext-manager.xml")
@Test(groups = "ignore")
public class FixFillInTheGapsSpansTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private FixFillInTheGapsSpans fixFillInTheGapsSpans;

    @Test
     public void fixSpans() throws Exception {
        fixFillInTheGapsSpans.executeUpInternal();

    }



    @Test
    public void mmcTaskTest() throws JSONException {
        String seqId = "24a69c19-e7ae-4ae8-b776-a2550559366a";
        fixFillInTheGapsSpans.fixSpecificSequence(seqId);

    }
}
