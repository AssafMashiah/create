package org.t2k.packaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.model.packaging.PackagePhase;
import org.t2k.cgs.model.packaging.PackageStep;
import org.t2k.cgs.model.packaging.PublishTarget;
import org.t2k.cgs.model.packaging.packageResponses.PackageResponseWithZip;
import org.t2k.cgs.model.publishing.PublishError;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Created by Elad.Avidan on 04/11/2014.
 */
//@ContextConfiguration("/springContext/PackagingServiceTest-context.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class PackageResponseParsingTest extends AbstractTestNGSpringContextTests {

    @Test
    public void parseSimplePackageResponseToJson() throws JsonProcessingException {
        CGSPackage cgsPackage = new CGSPackage("courseId", "courseCId", 1, "username", "myPublisherNamess", "cgsCourseVersion", "courseTitle", null);
        cgsPackage.setPackId("packageId");
        cgsPackage.setCourseTitle("course name");
        cgsPackage.setPackagePhase(PackagePhase.IN_PROGRESS);
        cgsPackage.setPublishTarget(PublishTarget.COURSE_TO_CATALOG);
        cgsPackage.setComponentsProgressInPercent(PackageStep.PACKAGING, 22);
        cgsPackage.addError(new PublishError("message"));
        PackageResponseWithZip packageResponse = new PackageResponseWithZip(cgsPackage);

        String packageResponseString = new ObjectMapper().writeValueAsString(packageResponse);
        Assert.assertNotNull(packageResponseString);
    }
}
