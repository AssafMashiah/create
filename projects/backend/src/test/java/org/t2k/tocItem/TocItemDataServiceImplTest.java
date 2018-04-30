package org.t2k.tocItem;

import com.mongodb.DBObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.usecases.tocitem.TocItemDataService;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 29/09/14
 * Time: 10:53
 */
//@ContextConfiguration("/springContext/PackagingServiceTest-context.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class TocItemDataServiceImplTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private TestUtils testUtils;

    @Autowired
    @Qualifier("lessonsDataServiceBean")
    private TocItemDataService tocItemDataService;

    private String contentItemJsonFileName = "jsons/contentDataWithResources.json";

    @Test
    public void findAllResourceRefsWithoutSequences() throws IOException {
        DBObject json = testUtils.readResourcesAsDBObject(contentItemJsonFileName);
        List<String> resources = tocItemDataService.getAssetsPathsFromResource(json);
        Assert.assertEquals(resources.size(), 152);

    }

    @Test
    public void findMediaResourceRefs() throws IOException {
        DBObject json = testUtils.readResourcesAsDBObject(contentItemJsonFileName);
        List<String> resources = tocItemDataService.getAssetsPathsFromResource(json);
        Boolean found = false;
        for (String res : resources) {
            if (res.contains("media/52/dc/52dc3e6869b49b03c94a6c10c6c8ea3cc9143af5.png"))
                found = true;
        }
        Assert.assertTrue(found);

    }

    @Test
    public void findPdfResourceRefs() throws IOException {
        DBObject json = testUtils.readResourcesAsDBObject(contentItemJsonFileName);
        List<String> resources = tocItemDataService.getAssetsPathsFromResource(json);
        Boolean found = false;
        for (String res : resources) {
            if (res.contains("cgsData/Grade_6_EOY_Benchmark.pdf"))
                found = true;
        }
        Assert.assertTrue(found);

    }

    @Test
    public void doesNotFindSequence() throws IOException {
        DBObject json = testUtils.readResourcesAsDBObject(contentItemJsonFileName);
        List<String> resources = tocItemDataService.getAssetsPathsFromResource(json);
        Boolean found = false;
        for (String res : resources) {
            if (res.contains("sequence"))
                found = true;
        }
        Assert.assertFalse(found);

    }

    @Test
    public void findsLibFileRefs() throws IOException {
        DBObject json = testUtils.readResourcesAsDBObject(contentItemJsonFileName);
        List<String> resources = tocItemDataService.getAssetsPathsFromResource(json);
        Boolean found = false;
        for (String res : resources) {
            if (res.contains("cgs/fonts/srasans2.0-bolditalic-webfont.svg"))
                found = true;
        }
        Assert.assertTrue(found);

    }

    @Test
    public void findsCustomizationPackFileRefs() throws IOException {
        DBObject json = testUtils.readResourcesAsDBObject(contentItemJsonFileName);
        List<String> resources = tocItemDataService.getAssetsPathsFromResource(json);
        Boolean found = false;
        for (String res : resources) {
            if (res.contains("cgs/config.json"))
                found = true;
        }
        Assert.assertTrue(found);
    }

    @Test
    public void getAllSequencesTest() throws IOException {
        DBObject json = testUtils.readResourcesAsDBObject(contentItemJsonFileName);
        List<String> sequences = tocItemDataService.getSequencesListFromResource(json);
        Assert.assertEquals(sequences.size(), 2);
    }

    @Test
    public void getAppletsUsedInTocItem() throws IOException {
        // toc items with 2 applets
        String lessonWithAppletsStr = testUtils.readResourcesAsString("jsons/lessonWithApplets.json");
        TocItemCGSObject lessonWithApplets = new TocItemCGSObject(lessonWithAppletsStr,1,"mockCourse", EntityType.LESSON);

        List<String> usedApplets = tocItemDataService.getAppletIdsUsedInTocItem(lessonWithApplets);
        Assert.assertEquals(usedApplets.size(),2,"There should be exactly 2 applets in the test lesson");
        Assert.assertTrue(usedApplets.contains("appletId1"), "There should be an applet with id appletId1 in the test lesson");
        Assert.assertTrue(usedApplets.contains("appletId2"), "There should be an applet with id appletId2 in the test lesson");

        // toc item without applets
        String lessonWithoutAppletsStr = testUtils.readResourcesAsString("jsons/lessonWithoutApplets.json");
        TocItemCGSObject lessonWithoutApplets = new TocItemCGSObject(lessonWithoutAppletsStr,1,"mockCourse", EntityType.LESSON);
        usedApplets = tocItemDataService.getAppletIdsUsedInTocItem(lessonWithoutApplets);
        Assert.assertEquals(usedApplets.size(),0,"There should be exactly 0 applets in the test lesson");

    }

}
