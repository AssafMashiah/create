package org.t2k.cgs.persistence.dao.util;

import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.Application;
import org.testng.annotations.Test;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/3/13
 * Time: 2:40 PM
 */
@SpringApplicationConfiguration(classes = Application.class)
@Test(groups = "ignore")
// fixme this class removes all the incrementals, causing loss of current incrementalId on the database
public class UniqueIdDaoTest extends AbstractTestNGSpringContextTests {

//    @Autowired
//    UniqueIdMongoDao uniqueIdDao;
//
//    @BeforeMethod
//    private void reset() throws Exception {
//        uniqueIdDao.reset();
//    }
//
//    @Test
//    private void testIdGeneration() throws Exception {
//
//        assertEquals(uniqueIdDao.getNextId("bbb"), 1);
//        assertEquals(uniqueIdDao.getNextId("ccc"), 1);
//        assertEquals(uniqueIdDao.getNextId("ddd"), 1);
//        assertEquals(uniqueIdDao.getNextId("bbb"), 2);
//        assertEquals(uniqueIdDao.getNextId("bbb"), 3);
//        assertEquals(uniqueIdDao.getNextId("ccc"), 2);
//    }

}
