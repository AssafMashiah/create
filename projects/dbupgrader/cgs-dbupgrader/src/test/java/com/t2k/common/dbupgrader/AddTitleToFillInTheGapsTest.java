package com.t2k.common.dbupgrader;

import atg.taglib.json.util.JSONException;
import com.t2k.cgs.dbupgrader.task.AddTitleToFillInTheGaps;
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
public class AddTitleToFillInTheGapsTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private AddTitleToFillInTheGaps addTitleToFillInTheGaps;

    @Test
     public void fixTitles() throws Exception {
        addTitleToFillInTheGaps.executeUpInternal();

    }

    @Test
    public void changeLessonLastModified(){
        String courseId="03f5876c-2e68-4afa-b11e-bd2d34172849";
        String lessonId="97c91f7a-15a1-44eb-a407-4e91ce47315d";
        addTitleToFillInTheGaps.updateLessonLastModified(courseId,lessonId);
    }


    @Test
    public void mmcTaskTest() throws JSONException {
        String seqId = "24a69c19-e7ae-4ae8-b776-a2550559366a";
        addTitleToFillInTheGaps.fixSpecificSequence(seqId);

    }
}
