package org.t2k.cgs.domain.usecases.publisher;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.testUtils.TestUtils;
import org.testng.Assert;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.util.Arrays;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 1/6/15
 * Time: 10:52 PM
 */
//@ContextConfiguration("/springContext/applicationContext-allServices.xml")
@ActiveProfiles("test")
@SpringApplicationConfiguration(classes = Application.class)
public class ExternalPartnersServiceTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private ExternalPartnersService externalPartnersService;

    @Autowired
    private TestUtils testUtils;

    Integer mockPublisherId = null;

    @BeforeClass
    public void initMockPublisherId() throws DsException {
        mockPublisherId = testUtils.getANonExistingPublisherId();
        externalPartnersService.deleteAllDataRegardingPublisherId(mockPublisherId);
        externalPartnersService.deleteAllDataRegardingPublisherId(0); // TODO: remove this!!!!
    }

    @AfterClass
    public void removeAllDataRelatedToMockPublisher(){
        if (mockPublisherId!=null)
            externalPartnersService.deleteAllDataRegardingPublisherId(mockPublisherId);
    }

    @Test
    public void externalPartnersFullCycleTest() throws DsException {

        // test inserting of new data
        externalPartnersService.addBaseExternalPartnersDataForPublisherId(mockPublisherId);

        // test get by publisher ID
        List<ExternalPartnerSettings> externalPartnersData = externalPartnersService.getExternalPartnersByPublisherId(mockPublisherId);
        Assert.assertEquals(externalPartnersData.size(),1,"When creating base data for publisher only 1 object should be created");
        Assert.assertNotNull(externalPartnersData.get(0).getExternalAccountId(), "When creating base data for publisher an external ID should be created");
        Assert.assertNotNull(externalPartnersData.get(0).getSecretKey(), "When creating base data for publisher a secret key should be created");
        Assert.assertEquals(externalPartnersData.get(0).getAccountId(), (int) mockPublisherId, "When creating base data for publisher a publisherId field should exist with the same publisher Id");

        // test get by external account ID
        String externalAccountId = externalPartnersData.get(0).getExternalAccountId();
        List<ExternalPartnerSettings> externalPartnersDataByExternalAccountId = externalPartnersService.getExternalPartnersByExternalAccountId(externalAccountId);
        Assert.assertEquals(externalPartnersDataByExternalAccountId.size(),1, String.format("Get data by external account ID should return exactly same data as getting it by publisherId, received data: %s", Arrays.toString(externalPartnersDataByExternalAccountId.toArray())));
        Assert.assertEquals(externalPartnersData.get(0).getExternalAccountId(),externalPartnersDataByExternalAccountId.get(0).getExternalAccountId(),"all parameters should be the same when getting data by externalAccountId and by publisherid");
        Assert.assertEquals(externalPartnersData.get(0).getAccountId(),externalPartnersDataByExternalAccountId.get(0).getAccountId(),"all parameters should be the same when getting data by externalAccountId and by publisherid");
        Assert.assertEquals(externalPartnersData.get(0).getFileUploadSettings(),externalPartnersDataByExternalAccountId.get(0).getFileUploadSettings(),"all parameters should be the same when getting data by externalAccountId and by publisherid");
        Assert.assertEquals(externalPartnersData.get(0).getSecretKey(),externalPartnersDataByExternalAccountId.get(0).getSecretKey(),"all parameters should be the same when getting data by externalAccountId and by publisherid");

        // test deletion
        externalPartnersService.deleteAllDataRegardingPublisherId(mockPublisherId);
        List<ExternalPartnerSettings> externalPartnersDataAfterDelete = externalPartnersService.getExternalPartnersByPublisherId(mockPublisherId);
        Assert.assertEquals(externalPartnersDataAfterDelete.size(),0,"After deletion there should not be any data");

    }
}