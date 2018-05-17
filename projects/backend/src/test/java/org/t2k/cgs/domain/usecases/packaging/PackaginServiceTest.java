package org.t2k.cgs.domain.usecases.packaging;

import com.t2k.configurations.Configuration;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: Elad.Avidan
 * Date: 12/03/2015
 * Time: 08:23
 */
@SpringApplicationConfiguration(classes = Application.class)
@ActiveProfiles("test")
public class PackaginServiceTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private PackagingService packagingService;

    @Autowired
    private Configuration configuration;

    private CGSPackage cgsPackage = null;

    @BeforeMethod
    public void init() {
        List<String> locales = Arrays.asList("en");
        this.cgsPackage = new CGSPackage("cb78e569-58f2-4fb1-991e-5114f4ccd074", "13597070-c881-11e4-8731-1681e6b88ec1", 1, "username", "publisherName", "cgsCourseVersion", "courseTitle", locales);
    }

    @AfterMethod
    public void removePackage() throws DsException {
        packagingService.removePackage(cgsPackage.getPackId());
    }

    @Test
    public void getOldHiddenPackagesTest() throws DsException {
        int numberOfDaysOfExpiredPackages = configuration.getIntProperty("numberOfDaysOfExpiredPackages");
        Date dateOfExpiredPackages = new DateTime().minusDays(numberOfDaysOfExpiredPackages).toDate();
        cgsPackage.setPackEndDate(dateOfExpiredPackages);
        cgsPackage.setIsShow(false);
        packagingService.saveCGSPackage(cgsPackage);

        Assert.assertNotNull(packagingService.getPackage(cgsPackage.getPackId()));

        List<CGSPackage> oldHiddenPackages = packagingService.getOldHiddenPackages(numberOfDaysOfExpiredPackages);
        boolean isOldHiddenPackageFound = false;
        for (CGSPackage oldPackages : oldHiddenPackages) {
            if (oldPackages.getPackId().equals(cgsPackage.getPackId())) {
                isOldHiddenPackageFound = true;
                break;
            }
        }

        Assert.assertTrue(isOldHiddenPackageFound, String.format("Old hidden package %s wasn't found.", cgsPackage.getPackId()));
    }
}