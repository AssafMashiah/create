package org.t2k.cgs.domain.usecases.tocItem.tocimport;

import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.springframework.test.util.ReflectionTestUtils;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.usecases.AppletService;
import org.t2k.cgs.domain.usecases.CmsService;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.usecases.FileDao;
import org.t2k.cgs.domain.usecases.lock.LockService;
import org.t2k.cgs.domain.model.CGSResource;
import org.t2k.cgs.domain.model.applet.AppletData;
import org.t2k.cgs.domain.model.applet.AppletManifest;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.domain.model.tocItem.Lesson;
import org.t2k.cgs.domain.model.tocItem.LessonContentData;
import org.t2k.cgs.domain.usecases.SequenceService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemsManager;
import org.t2k.cgs.service.tocitem.ImportTocItemServiceImpl;
import org.t2k.cgs.domain.usecases.user.UserService;
import org.t2k.gcr.common.model.applet.GCRAppletArtifact;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import javax.inject.Inject;
import java.lang.reflect.InvocationTargetException;
import java.util.*;

/**
 * @author Alex Burdusel on 2017-02-13.
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
public class ImportTocItemServiceImplTest extends AbstractTestNGSpringContextTests {

    @Inject
    private FileDao fileDao;
    @Inject
    private CmsService cmsService;
    @Inject
    private CourseDataService courseDataService;
    @Inject
    private TocItemsManager tocItemsManager;
    @Inject
    private AppletService appletService;
    @Inject
    private SequenceService sequenceService;
    @Inject
    private JobService jobService;
    @Inject
    private LockService lockService;
    @Inject
    private UserService userService;

    private ImportTocItemServiceImpl importTocItemService;

    @BeforeClass
    public void init() {
        importTocItemService = new ImportTocItemServiceImpl(
                fileDao,
                cmsService,
                courseDataService,
                tocItemsManager,
                appletService,
                sequenceService,
                jobService,
                lockService,
                userService);
    }

    @Test
    public void validateAppletsOnTocItem() throws NoSuchMethodException, IllegalAccessException, InvocationTargetException, InstantiationException {
        Set<CGSResource> cgsResources = new HashSet<>();
        cgsResources.add(CGSResource.newInstance("applets/appletMissingFromCatalog/1", Collections.singletonList("some href"), ""));
        cgsResources.add(CGSResource.newInstance("applets/appletToBeUpdatedOnTocItem/1", Collections.singletonList("some href"), ""));
        cgsResources.add(CGSResource.newInstance("applets/appletToBeAddedOnCourse/1", Collections.singletonList("some href"), ""));
        cgsResources.add(CGSResource.newInstance("applets/appletsToBeUpdatedOnCourse/2", Collections.singletonList("some href"), ""));

        LessonContentData contentData = new LessonContentData.Builder("lesson cid")
                .addResources(cgsResources)
                .build();
        Lesson lesson = Lesson.newInstance("", 0, contentData);

        Map<String, GCRAppletArtifact> catalogApplets = new HashMap<>();
        catalogApplets.put("appletToBeUpdatedOnTocItem", buildGCRApplet("appletsToBeUpdatedOnTocItem", "2"));
        catalogApplets.put("appletToBeAddedOnCourse", buildGCRApplet("appletToBeAddedOnCourse", "1"));
        catalogApplets.put("appletsToBeUpdatedOnCourse", buildGCRApplet("appletsToBeUpdatedOnCourse", "2"));

        AppletManifest courseApplets = new AppletManifest();
        courseApplets.addApplet(new AppletData("appletToBeUpdatedOnTocItem", "2"));
        courseApplets.addApplet(new AppletData("appletsToBeUpdatedOnCourse", "1"));

        Object appletsValidationResponse = ReflectionTestUtils.invokeMethod(importTocItemService,
                "validateAppletsOnTocItem",
                lesson, catalogApplets, courseApplets);

        Assert.assertEquals(ReflectionTestUtils.getField(appletsValidationResponse, "tocItemCid"), "lesson cid");

        List appletsMissingInCatalog = (List) ReflectionTestUtils.getField(appletsValidationResponse, "appletsMissingInCatalog");
        Assert.assertEquals(appletsMissingInCatalog.size(), 1);
        Object appletMissingInCatalog = appletsMissingInCatalog.get(0);
        Assert.assertEquals(ReflectionTestUtils.getField(appletMissingInCatalog, "guid"), "appletMissingFromCatalog");

        List appletsToBeUpdatedOnTocItem = (List) ReflectionTestUtils.getField(appletsValidationResponse, "appletsToBeUpdatedOnTocItem");
        Assert.assertEquals(appletsToBeUpdatedOnTocItem.size(), 1);
        Object appletToBeUpdatedOnTocItem = appletsToBeUpdatedOnTocItem.get(0);
        Assert.assertEquals(ReflectionTestUtils.getField(appletToBeUpdatedOnTocItem, "guid"), "appletToBeUpdatedOnTocItem");

        List appletsToBeUpdatedOnCourse = (List) ReflectionTestUtils.getField(appletsValidationResponse, "appletsToBeUpdatedOnCourse");
        Assert.assertEquals(appletsToBeUpdatedOnCourse.size(), 1);
        Object appletToBeUpdatedOnCourse = appletsToBeUpdatedOnCourse.get(0);
        Assert.assertEquals(ReflectionTestUtils.getField(appletToBeUpdatedOnCourse, "guid"), "appletsToBeUpdatedOnCourse");

        List appletsToAddOnCourse = (List) ReflectionTestUtils.getField(appletsValidationResponse, "appletsToAddOnCourse");
        Assert.assertEquals(appletsToAddOnCourse.size(), 1);
        Object appletToBeAddedOnCourse = appletsToAddOnCourse.get(0);
        Assert.assertEquals(ReflectionTestUtils.getField(appletToBeAddedOnCourse, "guid"), "appletToBeAddedOnCourse");
    }

    private GCRAppletArtifact buildGCRApplet(String guid, String version) {
        GCRAppletArtifact gcrAppletToBeUpdatedOnCourse = new GCRAppletArtifact();
        gcrAppletToBeUpdatedOnCourse.put("guid", guid);
        gcrAppletToBeUpdatedOnCourse.put("version", version);
        return gcrAppletToBeUpdatedOnCourse;
    }
}
