package org.t2k.standards;

import atg.taglib.json.util.JSONException;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.classification.ScormStandardsPackage;
import org.t2k.cgs.domain.model.classification.TaggedStandards;
import org.t2k.cgs.domain.model.course.CourseCGSObject;
import org.t2k.cgs.service.standards.parser.StandardsHelper;
import org.t2k.sample.dao.exceptions.DaoException;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 07/07/14
 * Time: 17:17
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
//@Test
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class StandardsHelperTest extends AbstractTestNGSpringContextTests {

    private static Logger logger = Logger.getLogger(StandardsHelperTest.class);

    @Autowired
    private TestUtils testUtils;

    @Autowired
    private StandardsHelper standardsHelper;

    private String standardsFolder;

    @BeforeClass
    public void classSetup() throws Exception {
        String standardsFolderName = "standards";
        URL standardsPath = this.getClass().getClassLoader().getResource(standardsFolderName);
        if (standardsPath == null) {
            throw new Exception(String.format("Courses directory %s does not exist.", standardsPath));
        }
        standardsFolder = new File(standardsPath.getPath()).getAbsolutePath() + File.separator;
    }

    private CourseCGSObject getDummyCourse() throws IOException {
        String courseAsString = testUtils.readResourcesAsString("courses/eb75ffe4-efeb-461c-872d-2f271bcb5c17.json");

        int publisherId = 1;
        return new CourseCGSObject(courseAsString, publisherId);

    }

    @Test
    public void getStandardsForTocItems1() throws DaoException, IOException {
        CourseCGSObject course = getDummyCourse();
        String tocItemCid = "4f2f8046-b79b-4e06-a3f4-e4caab435e85";
        Set<TaggedStandards> standards = standardsHelper.getTaggedStandardsFromRootToTocItem(course, tocItemCid);
        String packageName = "null_null_2.2";
        List<String> pedIds = Arrays.asList("1.1(A)", "1.1(B)", "3.3(A)", "2.2(A)", "2.2(B)");

        Assert.assertTrue(standardsSetContainsPackageId(standards, packageName));
        Assert.assertTrue(standardsByNameContainsOnlyThesePackageIds(standards, packageName, pedIds));
        logger.debug(String.format("Standards from ancestors: %s", Arrays.toString(standards.toArray())));
    }

    @Test
    public void getStandardsForTocItemsWithNonExistingTocItem() throws DaoException, IOException {
        CourseCGSObject course = getDummyCourse();
        String nonExistingTocItemCid = "nonExisting";
        Set<TaggedStandards> standards = standardsHelper.getTaggedStandardsFromRootToTocItem(course, nonExistingTocItemCid);
        Assert.assertTrue(standards.isEmpty());
        logger.debug(String.format("Standards from ancestors: %s", Arrays.toString(standards.toArray())));
    }

    @Test
    public void getStandardsForTocItems2() throws DaoException, IOException {
        CourseCGSObject course = getDummyCourse();
        String differentTocItemCid = "TestAssessmentId";
        Set<TaggedStandards> standards = standardsHelper.getTaggedStandardsFromRootToTocItem(course, differentTocItemCid);
        List<String> pedIds1 = Arrays.asList("ped1", "ped2");
        String packageName1 = "ddddd_2.2";

        String packageName2 = "test_1_2.2";
        List<String> pedIds2 = Arrays.asList("t1", "t1");
        Assert.assertTrue(standardsSetContainsPackageId(standards, packageName1));
        Assert.assertTrue(standardsByNameContainsOnlyThesePackageIds(standards, packageName1, pedIds1));

        Assert.assertTrue(standardsSetContainsPackageId(standards, packageName2));
        Assert.assertTrue(standardsByNameContainsOnlyThesePackageIds(standards, packageName2, pedIds2));
        logger.debug(String.format("Standards from ancestors: %s", Arrays.toString(standards.toArray())));
    }


    private boolean standardsByNameContainsOnlyThesePackageIds(Set<TaggedStandards> standards, String packageId, List<String> pedIds) {
        if (!standardsSetContainsPackageId(standards, packageId))
            return false;
        TaggedStandards tagged = getStandardByPackageId(standards, packageId);
        for (String pedId : pedIds) {
            if (!tagged.getPedagogicalIds().contains(pedId))
                return false;
        }
        return tagged.getPedagogicalIds().size() == pedIds.size();

    }

    private TaggedStandards getStandardByPackageId(Set<TaggedStandards> standards, String packageId) {
        for (TaggedStandards tagged : standards)
            if (tagged.getStdPackageId().equals(packageId))
                return tagged;
        return null;
    }

    private boolean standardsSetContainsPackageId(Set<TaggedStandards> standards, String packageId) {
        return getStandardByPackageId(standards, packageId) != null;
    }


    @Test
    public void extractingStandardPedIdNamesFromStandardsJsonSuccess() throws JSONException, DsException, IOException {
        String packId = "ccss_math_1.0";
        Map<String, String> pedIdToDescription = new HashMap<>();
        pedIdToDescription.put("6.EE", "Expressions and Equations");
        pedIdToDescription.put("6.EE.A", "Apply and extend previous understandings of arithmetic to algebraic expressions.");
        pedIdToDescription.put("7.RP.A.2d", "Explain what a point (x, y) on the graph of a proportional relationship means in terms of the situation, with special attention to the points (0, 0) and (1, r) where r is the unit rate.");
        Map<String, Collection<String>> m = new HashMap<>();
        m.put(packId, pedIdToDescription.keySet());
        List<ScormStandardsPackage> scormStandardsPackages = standardsHelper.getPedagogicalIdsDescriptionFromStandardsFolder(m, new File(standardsFolder));
        Assert.assertEquals(scormStandardsPackages.size(), 1);
        for (ScormStandardsPackage scormStandardsPackage : scormStandardsPackages) {
            Assert.assertEquals(scormStandardsPackage.getId(), packId);
            Assert.assertEquals(scormStandardsPackage.getStandards().size(), pedIdToDescription.size());
            for (Map.Entry standard : scormStandardsPackage.getStandards().entrySet()) {
                Assert.assertEquals(standard.getValue(), pedIdToDescription.get(standard.getKey()));
            }
        }
    }

    @Test
    public void extractingNonExistingPedIdNameFromStandardsJsonFailure() throws JSONException, DsException, IOException {
        DsException expectedException = null;
        String packId = "ccss_math_1.0";
        Map<String, String> pedIdToDescription = new HashMap<>();
        pedIdToDescription.put("non.existing", "Expressions and Equations");
        Map<String, Collection<String>> m = new HashMap<>();
        m.put(packId, pedIdToDescription.keySet());
        try {
            standardsHelper.getPedagogicalIdsDescriptionFromStandardsFolder(m, new File(standardsFolder));
        } catch (DsException dse) {
            expectedException = dse;
        }

        Assert.assertNotNull(expectedException);
    }

}
