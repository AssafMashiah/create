package org.t2k.cgs.locks;


import org.apache.commons.io.IOUtils;
import org.apache.log4j.PropertyConfigurator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.dataServices.exceptions.LockException;
import org.t2k.cgs.lock.LockServiceImpl;
import org.t2k.cgs.model.ContentItemBase;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.Date;
import java.util.Properties;
import java.util.UUID;

//
///**
// * Created by IntelliJ IDEA.
// * User: ophir.barnea
// * Date: 04/11/12
// * Time: 09:58
// */
//
//
@Test(groups = "ignore")
@ContextConfiguration(("/springContext/LocksServiceTest-context.xml"))
public class LocksServiceTest extends AbstractTestNGSpringContextTests {


    @Autowired
    private LockServiceImpl lockService;

    @Autowired
    private LocksDaoDummy locksDaoDummy;


    @BeforeClass
    private void setUp() {
        cleanDao();
    }

    private void initLog() {
        // logger:
        Properties conf = new Properties();
        conf.put("log4j.rootLogger", "debug, myAppender");
        conf.put("log4j.appender.myAppender", "org.apache.log4j.ConsoleAppender");
        conf.put("log4j.appender.myAppender.layout", "org.apache.log4j.SimpleLayout");
        PropertyConfigurator.configure(conf);
    }

    @BeforeMethod
    private void cleanDao() {
        locksDaoDummy.removeAllItems(null);
    }


    @Test()
    public void acquireLockBaseCheck() throws Exception {
        LockUser lockUser = new LockUser("ophir.b", "ophir", "barnea", "some@email.com", 1);
        final String cid = UUID.randomUUID().toString();
        final String entityId = UUID.randomUUID().toString();
        ContentItemBase contentItem = new ContentItemBase() {


            @Override
            public String getContentId() {
                return cid;
            }

            @Override
            public EntityType getEntityType() {
                return EntityType.COURSE;
            }

            @Override
            public void setContentId(String cid) {
                //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public String getEntityId() {
                return entityId;
            }

            @Override
            public String getContentVersionNumber() {
                return "8.8.8";
            }

            @Override
            public String getTitle() {
                return "s";
            }

            @Override
            public Date getLastModified() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }


        };

        lockService.acquireLock(contentItem, lockUser);
    }


    @Test(expectedExceptions = LockException.class)
    public void acquireLockedObjectByDiffUsers() throws Exception {

        LockUser lockUser = new LockUser("ophir.b", "ophir", "barnea", "some@email.com", 1);
        ContentItemBase contentItem = new ContentItemBase() {
            final String id = UUID.randomUUID().toString();

            @Override
            public String getContentId() {
                return id;
            }

            @Override
            public void setContentId(String cid) {
                //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public EntityType getEntityType() {
                return EntityType.COURSE;
            }

            @Override
            public String getEntityId() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public String getContentVersionNumber() {
                return "8.8.8";  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public String getTitle() {
                return "name";  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public Date getLastModified() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }


        };

        lockService.acquireLock(contentItem, lockUser);
        LockUser lockUser2 = new LockUser("daniR.b", "dan", "dough", "some2@email.com", 1);
        lockService.acquireLock(contentItem, lockUser2);

    }


    @Test()
    public void acquireLockedObjectBySameUser() throws Exception {


        LockUser lockUser = new LockUser("ophir.b", "ophir", "barnea", "some@email.com", 1);
        ContentItemBase contentItem = new ContentItemBase() {
            final String id = UUID.randomUUID().toString();

            @Override
            public String getContentId() {
                return id;
            }

            @Override
            public void setContentId(String cid) {
                //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public EntityType getEntityType() {
                return EntityType.COURSE;
            }

            @Override
            public String getEntityId() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public String getContentVersionNumber() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public String getTitle() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public Date getLastModified() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

        };

        lockService.acquireLock(contentItem, lockUser);
        lockService.acquireLock(contentItem, lockUser);

    }


    @Test()
    public void releaseLockedObjectBySameUser() throws Exception {

        LockUser lockUser = new LockUser("ophir.b", "ophir", "barnea", "some@email.com", 1);

        ContentItemBase contentItem = new ContentItemBase() {
            final String id = UUID.randomUUID().toString();

            @Override
            public String getContentId() {
                return id;
            }

            @Override
            public void setContentId(String cid) {
                //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public EntityType getEntityType() {
                return EntityType.COURSE;
            }

            @Override
            public String getEntityId() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public String getContentVersionNumber() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public String getTitle() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public Date getLastModified() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }


        };

        lockService.acquireLock(contentItem, lockUser);
        lockService.releaseLock(contentItem, lockUser);

    }


    @Test(expectedExceptions = LockException.class)
    public void releaseLockedObjectByDiffUser() throws Exception {

        LockUser lockUser1 = new LockUser("ophir.b", "ophir", "barnea", "some@email.com", 1);
        ContentItemBase contentItem = new ContentItemBase() {
            final String cid = UUID.randomUUID().toString();
            final String entityId = UUID.randomUUID().toString();


            @Override
            public String getContentId() {
                return cid;
            }

            @Override
            public void setContentId(String cid) {
                //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public EntityType getEntityType() {
                return EntityType.COURSE;
            }

            @Override
            public String getEntityId() {
                return entityId;
            }

            @Override
            public String getContentVersionNumber() {
                return "6.2.2";
            }

            @Override
            public String getTitle() {
                return "some name";
            }

            @Override
            public Date getLastModified() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }


        };


        LockUser lockUser2 = new LockUser("jack.t", "jacko", "ten", "some1@emails.com", 1);
        lockService.acquireLock(contentItem, lockUser1);
        lockService.releaseLock(contentItem, lockUser2);

    }


    @Test
    public void getLocks() throws Exception {

        LockUser lockUser = new LockUser("ophir.b", "ophir", "barnea", "some@email.com", 1);

        ContentItemBase contentItem = new ContentItemBase() {
            final String id = UUID.randomUUID().toString();

            @Override
            public String getContentId() {
                return id;
            }

            @Override
            public EntityType getEntityType() {
                return EntityType.COURSE;
            }

            @Override
            public void setContentId(String cid) {
                //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public String getEntityId() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public Date getLastModified() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public String getContentVersionNumber() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public String getTitle() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }


        };


        ContentItemBase contentItem2 = new ContentItemBase() {
            final String id = UUID.randomUUID().toString();

            @Override
            public String getContentId() {
                return id;
            }

            @Override
            public void setContentId(String cid) {
                //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public EntityType getEntityType() {
                return EntityType.COURSE;
            }

            @Override
            public String getEntityId() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public String getContentVersionNumber() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public String getTitle() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }

            @Override
            public Date getLastModified() {
                return null;  //To change body of implemented methods use File | Settings | File Templates.
            }


        };

        lockService.acquireLock(contentItem, lockUser);
        lockService.acquireLock(contentItem2, lockUser);
        Assert.assertEquals(lockService.getLocks(1).size(), 2);
    }


    private String readResourcesAsString(String localPath) throws IOException {
        InputStream resourceAsStream = getClass().getClassLoader().getResourceAsStream(localPath);
        StringWriter writer = new StringWriter();
        IOUtils.copy(resourceAsStream, writer);
        resourceAsStream.close();
        return writer.toString();
    }

}
