package com.t2k.common.dbupgrader;

import com.t2k.cgs.dbupgrader.task.EscapeCharactersInStandardPackageDescriptions;
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
public class EscapeCharactersInStandardPackageDescriptionsTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private EscapeCharactersInStandardPackageDescriptions escapeCharactersInStandardPackageDescriptions;

    @Test
     public void testRun() throws Exception {
        escapeCharactersInStandardPackageDescriptions.fixStandardPackageDescription();

    }

    @Test
    public void changeString(){
        String word = "\u201D;\",\"'\"),&quot;";
        String after = escapeCharactersInStandardPackageDescriptions.processString(word);
        logger.debug(after);
    }
//      @Test
//    public void mmcTaskTest() throws JSONException {
//        String seqId = "24a69c19-e7ae-4ae8-b776-a2550559366a";
//        fixFillInTheGapsSpans.fixSpecificSequence(seqId);
//
//    }
}
