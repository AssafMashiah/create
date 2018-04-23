package org.t2k.lock.tests;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.dao.locks.LocksDao;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.locks.Lock;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.Arrays;
import java.util.UUID;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 01/11/12
 * Time: 18:07
 */


@ContextConfiguration("/springContext/applicationContext-MongoDaosTest.xml")
@Test(groups = "ignore")
public class LocksDaoTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private LocksDao locksDao;


    @BeforeClass
    public void setup() {
        cleanPersistenced();
    }


    @BeforeMethod
    private void cleanPersistenced() {
        locksDao.removeAllItems(null);
    }

    @Test
    public void insertNewLockTest() throws Exception {

        try {
            String itemId = UUID.randomUUID().toString();
//            String itemId = UUID.randomUUID().toString();

            Lock lock = new Lock(itemId, "cid", "1.0.0", EntityType.COURSE, "john.dao", "jho@dao.com", 1,"eName");
            locksDao.insertLock(lock);
            Lock lock1 = locksDao.getLock(itemId);
            Assert.assertNotNull(lock1);


        } catch (DataAccessException e) {
            throw e;
        }
    }


//    @Test(expectedExceptions = DuplicateKeyException.class)
//    public void duplicateLocksTest() throws Exception {
//
//        try {
//            String itemId = UUID.randomUUID().toString();
//            Lock lock = new Lock(itemId,  "cid","1.0.0",EntityType.COURSE, "john.dao", "jho@dao.com", 1,"eName");
//            locksDao.insertLock(lock);
//            locksDao.insertLock(lock);
//        } catch (DataAccessException e) {
//            throw e;
//        }
//    }

    @Test
    public void removeUserLockTest() throws Exception {

        try {
            String itemId = UUID.randomUUID().toString();
            Lock lock = new Lock(itemId, "cid","1.0.0", EntityType.COURSE, "john.dao", "jho@dao.com", 1,"eName");
            locksDao.insertLock(lock);
            Assert.assertNotNull(locksDao.getLock(itemId));
            locksDao.removeUserLock(lock);
            Assert.assertNull(locksDao.getLock(itemId));
        } catch (DataAccessException e) {
            throw e;
        }
    }


    @Test
    public void removeUserNotLockerTest() throws Exception {

        try {
            String itemId = UUID.randomUUID().toString();
            Lock lock = new Lock(itemId, "cid","1.0.0", EntityType.COURSE, "john.dao", "jho@dao.com", 1,"eName");
            locksDao.insertLock(lock);
            Assert.assertNotNull(locksDao.getLock(itemId));
            lock.setUserName("john.smooth");
            locksDao.removeUserLock(lock);
            Assert.assertNotNull(locksDao.getLock(itemId));
        } catch (DataAccessException e) {
            throw e;
        }
    }


    @Test
    public void removeForceLockTest() throws Exception {

        try {
            String itemId = UUID.randomUUID().toString();
            Lock lock = new Lock(itemId, "cid","1.0.0", EntityType.COURSE, "john.dao", "jho@dao.com", 1,"eName");
            locksDao.insertLock(lock);
            Assert.assertNotNull(locksDao.getLock(itemId));
            lock.setUserName("john.smooth");
            locksDao.forceRemoveLock(itemId);
            Assert.assertNull(locksDao.getLock(itemId));
        } catch (DataAccessException e) {
            throw e;
        }
    }


    @Test
    public void getAllLocksTest() throws Exception {

        String itemA = UUID.randomUUID().toString();
        String itemB = UUID.randomUUID().toString();

        try {
            Lock lock1 = new Lock(itemA, "cid","1.0.0", EntityType.COURSE, "john.dao", "jho@dao.com", 1,"eName");
            Lock lock2 = new Lock(itemB, "cid","1.0.0",EntityType.COURSE, "john.dao", "jho@dao.com", 1,"eName");
            locksDao.insertLock(lock1);
            locksDao.insertLock(lock2);
            Assert.assertEquals(locksDao.getLocks(1).size(), 2);
        } catch (DataAccessException e) {
            throw e;
        }
    }


    @Test
    public void removeLocksOfUserTest() throws Exception {

        String itemA = UUID.randomUUID().toString();
        String itemB = UUID.randomUUID().toString();
        String itemC = UUID.randomUUID().toString();

        try {
            String userNameA = "john.dao";
            String userNameB = "john.cao";

            Lock lock1 = new Lock(itemA, "cid","1.0.0", EntityType.COURSE, userNameA, "jho@dao.com", 1,"eName");
            Lock lock2 = new Lock(itemB, "cid","1.0.0", EntityType.COURSE, userNameA, "jho@dao.com", 1,"eName");
            Lock lock3 = new Lock(itemC, "cid","1.0.0", EntityType.COURSE, userNameB, "jho@cao.com", 1,"eName");


            locksDao.insertLock(lock1);
            locksDao.insertLock(lock2);
            locksDao.insertLock(lock3);

            Assert.assertEquals(locksDao.getLocks(1).size(), 3);
            locksDao.removeAllLocksOfUserOnEntities(userNameA, Arrays.asList(itemA, itemB, itemC));
            //check that only the locks of the user were removed - 2 out of 3
            Assert.assertEquals(locksDao.getLocks(1).size(), 1);
        } catch (DataAccessException e) {
            throw e;
        }
    }


    @Test
    public void removeAllLocksOfUserTest() throws Exception {

        String itemA = UUID.randomUUID().toString();
        String itemB = UUID.randomUUID().toString();
        String itemC = UUID.randomUUID().toString();
        String itemD = UUID.randomUUID().toString();

        try {
            String userNameA = "john.dao";
            String userNameB = "john.cao";

            Lock lock1 = new Lock(itemA, "cid","1.0.0", EntityType.COURSE, userNameA, "jho@dao.com", 1,"eName");
            Lock lock2 = new Lock(itemB, "cid","1.0.0", EntityType.COURSE, userNameA, "jho@dao.com", 1,"eName");
            Lock lock3 = new Lock(itemC, "cid","1.0.0", EntityType.COURSE, userNameB, "jho@cao.com", 1,"eName");
            Lock lock4 = new Lock(itemD, "cid","1.0.0", EntityType.COURSE, userNameB, "jho@cao.com", 1,"eName");


            locksDao.insertLock(lock1);
            locksDao.insertLock(lock2);
            locksDao.insertLock(lock3);
            locksDao.insertLock(lock4);

            Assert.assertEquals(locksDao.getLocks(1).size(), 4);
            locksDao.removeAllLocksOfUser(userNameB);
            Assert.assertEquals(locksDao.getLocks(1).size(), 2);
        } catch (DataAccessException e) {
            throw e;
        }
    }


}
