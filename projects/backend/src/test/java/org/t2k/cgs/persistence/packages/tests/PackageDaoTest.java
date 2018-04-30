package org.t2k.cgs.persistence.packages.tests;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.domain.usecases.packaging.PackagingDao;
import org.t2k.cgs.domain.usecases.packaging.CGSPackage;
import org.t2k.cgs.domain.usecases.packaging.PackagePhase;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.Arrays;
import java.util.Date;
import java.util.UUID;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 02/12/12
 * Time: 14:45
 */
@ContextConfiguration("/springContext/applicationContext-MongoDaosTest.xml")
@Test(groups = "ignore")
public class PackageDaoTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private PackagingDao packagingDao;

    @BeforeClass
    public void setup() {
        cleanPersistenced();
    }

    @BeforeMethod
    private void cleanPersistenced() {
        packagingDao.removeAllItems(null);
    }

    @Test
    public void testInOutById() throws Exception {
        CGSPackage cgsPackage = new CGSPackage(UUID.randomUUID().toString(), UUID.randomUUID().toString(), 1, "jef.k","foo", "0.0", "name", Arrays.asList("FR_fr"));
        cgsPackage.getPackId();
        packagingDao.saveCGSPackage(cgsPackage);
        packagingDao.saveCGSPackage(cgsPackage);
        // get it back
        Assert.assertNotNull(packagingDao.getCGSPackage(cgsPackage.getPackId()));
    }

    @Test
    public void testGetByCourseRev() throws Exception {
        String courseId = UUID.randomUUID().toString();
        CGSPackage cgsPackage = new CGSPackage(courseId, UUID.randomUUID().toString(), 1, "jef.k", "0.0", "name","foo", Arrays.asList("FR_fr"));
        cgsPackage.getPackId();
        packagingDao.saveCGSPackage(cgsPackage);
        // check with the correct rev
        Assert.assertNotNull(packagingDao.getCGSPackage(courseId, "0.0"));
        Assert.assertNull(packagingDao.getCGSPackage(courseId, "0.1"));
    }

    @Test
    public void testGetByPhase() throws Exception {
        String courseId = UUID.randomUUID().toString();
        CGSPackage cgsPackage = new CGSPackage(courseId, UUID.randomUUID().toString(), 1, "jef.k", "0.0.0", "name","foo", Arrays.asList("FR_fr"));
        cgsPackage.setPackagePhase(PackagePhase.IN_PROGRESS);

        cgsPackage.getPackId();
        packagingDao.saveCGSPackage(cgsPackage);

        // check with the correct rev
        Assert.assertEquals(packagingDao.getPackagesByPhase(courseId, Arrays.asList(PackagePhase.IN_PROGRESS.name())).size(), 1);
        Assert.assertEquals(packagingDao.getPackagesByPhase(courseId, Arrays.asList(PackagePhase.PENDING.name(), PackagePhase.COMPLETED.name())).size(), 0);
    }

    @Test
    public void testGetByUser() throws Exception {
        String courseId = UUID.randomUUID().toString();
        String userName = "jef.k";
        CGSPackage cgsPackage = new CGSPackage(courseId, UUID.randomUUID().toString(), 1, userName, "0.1", "name","foo", Arrays.asList("FR_fr"));

        packagingDao.saveCGSPackage(cgsPackage);
        // check from earlier date - one
        Assert.assertEquals(packagingDao.getPackagesByUserFromSpecificDate(userName, new Date(0)).size(), 1);
        // check from post date - none
        Assert.assertEquals(packagingDao.getPackagesByUserFromSpecificDate(userName, new Date()).size(), 0);
        // check from earlier date diff name - none
        Assert.assertEquals(packagingDao.getPackagesByUserFromSpecificDate("otherName", new Date(0)).size(), 0);
    }
}
