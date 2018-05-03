package org.t2k.cgs.domain.usecases.tocItem;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.usecases.tocitem.TocItemsManager;
import org.testng.annotations.Test;

/**
 * @author Alex Burdusel on 2016-05-06.
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
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
