package com.t2k.common.dbupgrader;

import com.t2k.cgs.dbupgrader.task.RemoveStandardsFromDifferentiatedSequence;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

@ContextConfiguration("/applicationContext-manager.xml")
@Test(groups = "ignore")
public class RemoveStandardsFromDifferentiatedSequenceTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private RemoveStandardsFromDifferentiatedSequence removeStandardsFromDifferentiatedSequence;


    @Test
    public void removeStandardsFromLessonsAndAssessmentDifferentiatedSequence() throws  Exception{
        removeStandardsFromDifferentiatedSequence.removeStandardsFromLessonsAndAssessmentDifferentiatedSequence();    }
}
