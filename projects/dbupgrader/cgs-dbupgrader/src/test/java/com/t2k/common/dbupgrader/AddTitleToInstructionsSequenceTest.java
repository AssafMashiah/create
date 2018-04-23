package com.t2k.common.dbupgrader;

import atg.taglib.json.util.JSONException;
import com.t2k.cgs.dbupgrader.task.AddTitleToInstructionsSequence;
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
public class AddTitleToInstructionsSequenceTest  extends AbstractTestNGSpringContextTests {

    @Autowired
    private AddTitleToInstructionsSequence addTitleToInstructionsSequence;

    @Test
     public void fixTitles() throws Exception {
        addTitleToInstructionsSequence.executeUpInternal();

    }

    @Test
    public void changeLessonLastModified(){
        String courseId="03f5876c-2e68-4afa-b11e-bd2d34172849";
        String lessonId="97c91f7a-15a1-44eb-a407-4e91ce47315d";
        addTitleToInstructionsSequence.updateLessonLastModified(courseId,lessonId);
    }


    @Test
    public void mmcTaskTest() throws JSONException {
        String seqId = "3c808c2a-6681-4279-8f6e-99fba3629c4f";
        addTitleToInstructionsSequence.fixSpecificSequence(seqId);

    }
}
