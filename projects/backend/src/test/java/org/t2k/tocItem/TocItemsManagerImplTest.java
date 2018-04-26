package org.t2k.tocItem;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.tocItem.TocItemsManager;
import org.testng.annotations.Test;

/**
 * @author Alex Burdusel on 2016-05-06.
 */
//@ContextConfiguration("/springContext/PackagingServiceTest-context.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class TocItemsManagerImplTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private TocItemsManager tocItemsManager;

    @Test(expectedExceptions = IllegalArgumentException.class)
    public void isPublisherAuthorizedToCreateLessonIllegalArgument() {
        tocItemsManager.isPublisherAuthorizedToCreateLesson(null, buildMockAssessmentToc());
    }

    @Test(expectedExceptions = IllegalArgumentException.class)
    public void isPublisherAuthorizedToCreateAssessmentIllegalArgument() {
        tocItemsManager.isPublisherAuthorizedToCreateAssessment(null, buildMockLessonToc());
    }

    private TocItemCGSObject buildMockLessonToc(){
        return new TocItemCGSObject(null, 0, "", EntityType.LESSON);
    }

    private TocItemCGSObject buildMockAssessmentToc(){
        return new TocItemCGSObject(null, 0, "", EntityType.ASSESSMENT);
    }

}
