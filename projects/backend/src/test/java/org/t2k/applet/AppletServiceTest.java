package org.t2k.applet;

import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.t2k.cgs.applet.AppletContentUpdater;
import org.t2k.cgs.applet.AppletService;
import org.t2k.cgs.dao.courses.CoursesDao;
import org.t2k.cgs.dao.publisher.AccountDao;
import org.t2k.cgs.dao.tocItem.TocItemDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.dataServices.exceptions.ResourceNotFoundException;
import org.t2k.cgs.locks.LockUser;
import org.t2k.cgs.model.applet.AppletData;
import org.t2k.cgs.model.applet.AppletManifest;
import org.t2k.cgs.model.applet.AppletResources;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.model.tocItem.Format;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.gcr.common.model.applet.GCRAppletArtifact;
import org.t2k.gcr.common.model.applet.Permission;
import org.t2k.sample.dao.exceptions.DaoException;
import org.testng.annotations.Test;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.testng.Assert.*;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 03/02/13
 * Time: 13:59
 */

@ContextConfiguration("/springContext/applicationContext-service.xml")
@Test(groups = "ignore")
public class AppletServiceTest extends AbstractTestNGSpringContextTests {

    @Autowired
    private AppletService appletService;

    @Autowired
    private CoursesDao coursesDao;

    @Autowired
    @Qualifier("lessonsDao")
    private TocItemDao lessonsDao;

    @Autowired
    private AccountDao publisherDao;

    @Autowired
    private Configuration configuration;

    private static ObjectMapper mapper = new ObjectMapper();

    //TODO: move it yo some kind utility
    public void saveCourse() throws DaoException, IOException {
        String courseId = "ab31a57e-2bfe-43cb-a281-2404d9645b33";
        CourseCGSObject course = coursesDao.getCourse(1, courseId, null, false);
        URL bookDirUrl = ClassLoader.getSystemResource("books");
        File bookDir = new File(bookDirUrl + "/" + courseId + "/");
        bookDir.mkdirs();
        PrintWriter file = new PrintWriter(bookDir + "/course.json");
        file.print(mapper.writeValueAsString(course));
        file.close();
        List<TocItemCGSObject> lessons = lessonsDao.getByCourse(1, courseId, false);
        for (TocItemCGSObject lesson : lessons) {
            file = new PrintWriter(bookDir + "/" + lesson.getContentId() + ".json");
            file.print(mapper.writeValueAsString(lesson));
            file.close();
        }
    }

    public void uploadCourse(String courseId) throws Exception {
        courseId = "3476563b-9a02-4908-afef-174ff42b2433";
        URL bookDirUrl = ClassLoader.getSystemResource("books");
        File bookDir = new File(bookDirUrl + "/" + courseId + "/");
        String courseJson = FileUtils.readFileToString(new File(bookDir + "/course.json"));
        CourseCGSObject course = mapper.readValue(courseJson, CourseCGSObject.class);
    }

    @Test
    public void testAddApplet() throws Exception {
        LockUser lock = new LockUser("test", "test", "test", "test", 1);
        String courseId = "id-for-add-applet";
        appletService.createAppletManifest(courseId, "1.0");

        List<GCRAppletArtifact> applets = appletService.getAppletsAllowedForPublisher(1, Format.NATIVE, null);
        AppletManifest appletManifest = appletService.getAppletManifest(courseId, null);
        assertEquals(courseId, appletManifest.getCourseId());
        for (GCRAppletArtifact applet : applets) {
            appletService.addApplet(1, appletManifest.getCourseId(), applet.getGuid(), lock);
        }
    }

    @Test
    public void testUpdateApplet() throws Exception {
        LockUser lock = new LockUser("test", "test", "test", "test", 1);
        String courseId = "3476563b-9a02-4908-afef-174ff42b2433";
        appletService.createAppletManifest(courseId, "1.0");

        List<GCRAppletArtifact> applets = appletService.getAppletsAllowedForPublisher(1, Format.NATIVE, null);
        AppletManifest appletManifest = appletService.getAppletManifest(courseId, null);
        assertEquals(courseId, appletManifest.getCourseId());
        boolean success = false;
        List<String> appletIds = new ArrayList<String>();

        appletIds.add(applets.get(0).getGuid());
//        for (GCRAppletArtifact applet : applets){
//            appletIds.add(applet.getGuid());
//        }

        try {
            appletService.updateApplets(1, appletManifest.getCourseId(), appletIds, lock, null);
        } catch (DsException e) {
            success = true;
        }
        if (!success)
            fail("Update of non existing applet succeeded");

        for (GCRAppletArtifact applet : applets) {
            appletService.addApplet(1, appletManifest.getCourseId(), applet.getGuid(), lock);
        }
        appletService.updateApplets(1, appletManifest.getCourseId(), appletIds, lock, null);

    }

    @Test
    public void testGetAppletManifest() throws DaoException, DsException {

        String courseId = "id-for-get-applet";
        appletService.createAppletManifest(courseId, "1.0");

        AppletManifest appletManifest = appletService.getAppletManifest(courseId, null);
        assertEquals(appletManifest.getCourseId(), courseId);
        Date manifestDate = appletManifest.getHeader().getLastModified();
        appletManifest = appletService.getAppletManifest(courseId, manifestDate);
        assertEquals(appletManifest.getCourseId(), courseId);
        appletManifest = appletService.getAppletManifest(courseId, new Date(manifestDate.getTime() - 5000));
        assertEquals(appletManifest.getCourseId(), courseId);
        appletManifest = appletService.getAppletManifest(courseId, new Date(manifestDate.getTime() + 5000));
        assertNull(appletManifest);
    }

    @Test
    public void testUpdateConvertedData() {
        AppletManifest appletManifest = new AppletManifest();
        AppletData appletData = new AppletData();
        appletData.setGuid("9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4");
        appletData.setResources(new AppletResources());
        appletData.getResources().setBaseDir("applets/9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4/1.81");
        appletManifest.addApplet(appletData);

        appletData = new AppletData();
        appletData.setGuid("43a85a09-812e-488e-9adf-43eb92c8b4b9");
        appletData.setResources(new AppletResources());
        appletData.getResources().setBaseDir("applets/43a85a09-812e-488e-9adf-43eb92c8b4b9/1.11");
        appletManifest.addApplet(appletData);

        String updated, orig;

        orig = "";
        updated = AppletContentUpdater.updateConvertedData(orig, Arrays.asList("9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4"), appletManifest);
        assertEquals(updated, "");

        orig = "<applet path=\"/applets/9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4/1.80\">";
        updated = AppletContentUpdater.updateConvertedData(orig, Arrays.asList("9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4"), appletManifest);
        assertEquals(updated, "<applet path=\"/applets/9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4/1.81\">");

        orig = "<answer><applet path=\"/applets/9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4/1.80\"></answer>";
        updated = AppletContentUpdater.updateConvertedData(orig, Arrays.asList("9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4"), appletManifest);
        assertEquals(updated, "<answer><applet path=\"/applets/9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4/1.81\"></answer>");

        orig = "<answer><applet path=\"/applets/9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4/1.80\"></answer> n<answer><applet path=\"/applets/43a85a09-812e-488e-9adf-43eb92c8b4b9/1.1\"></answer>\\n\\t";
        updated = AppletContentUpdater.updateConvertedData(orig, Arrays.asList("9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4"), appletManifest);
        assertEquals(updated, "<answer><applet path=\"/applets/9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4/1.81\"></answer> n<answer><applet path=\"/applets/43a85a09-812e-488e-9adf-43eb92c8b4b9/1.1\"></answer>\\n\\t");

        orig = "<answer><applet path=\"/applets/9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4/1.80\"></answer> n<answer><applet path=\"/applets/43a85a09-812e-488e-9adf-43eb92c8b4b9/1.1\"></answer>\\n\\t";
        updated = AppletContentUpdater.updateConvertedData(orig, Arrays.asList("9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4", "43a85a09-812e-488e-9adf-43eb92c8b4b9"), appletManifest);
        assertEquals(updated, "<answer><applet path=\"/applets/9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4/1.81\"></answer> n<answer><applet path=\"/applets/43a85a09-812e-488e-9adf-43eb92c8b4b9/1.11\"></answer>\\n\\t");

        orig = "<answer><applet path=\"/applets/9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4/1.80\"></answer> <applet path=\"/applets/43a85a09-812e-488e-9adf-43eb92c8b4b9/1.1\">n<answer><applet path=\"/applets/9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4/1.80\">";
        updated = AppletContentUpdater.updateConvertedData(orig, Arrays.asList("9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4", "43a85a09-812e-488e-9adf-43eb92c8b4b9"), appletManifest);
        assertEquals(updated, "<answer><applet path=\"/applets/9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4/1.81\"></answer> <applet path=\"/applets/43a85a09-812e-488e-9adf-43eb92c8b4b9/1.11\">n<answer><applet path=\"/applets/9daf4f48-762a-4ee5-b5cd-ef8e84dbcba4/1.81\">");

    }

    @Test
    public void testGetAllAllowedAppletsForEBookCourse() throws DsException, IOException {
        int publisherId = 1; //T2K account
        List<GCRAppletArtifact> publisherApplets = appletService.getAppletsAllowedForPublisher(publisherId, Format.EBOOK, null);
        List<String> whiteListApplets = Arrays.asList(configuration.getProperty("eBookCourseAppletsWhiteList").split(";"));

        for (GCRAppletArtifact gcrAppletArtifact : publisherApplets) {
            if (whiteListApplets.contains(gcrAppletArtifact.getGuid())) {
                continue;
            }
            fail(mapper.writeValueAsString(gcrAppletArtifact));
        }
    }

    public void testGetAppletsAllowedForPublisher() throws DsException, IOException {

        //test non-existent publisher
        boolean pass = false;
        try {
            List<GCRAppletArtifact> publisherApplets = appletService.getAppletsAllowedForPublisher(-1, Format.NATIVE, null);
        } catch (ResourceNotFoundException e) {
            pass = true;
        }
        assertTrue(pass, "Invalid publisher");

        //test that all applets that are  retrieved either belongs to T2K account or allowed for public usage
        int publisherId = 1; //T2K account
        String publisherName = publisherDao.getPublisherName(publisherId);
        List<GCRAppletArtifact> publisherApplets = appletService.getAppletsAllowedForPublisher(publisherId, Format.NATIVE, null);
        assertNotEquals(publisherApplets.size(), 0); //there is always applets for T2K account
        for (GCRAppletArtifact gcrAppletArtifact : publisherApplets) {
            if (gcrAppletArtifact.getPublisher().equals(publisherName)) {
                continue;
            }
            if (gcrAppletArtifact.getPermission().equals(Permission.PUBLIC)) {
                continue;
            }
            fail(mapper.writeValueAsString(gcrAppletArtifact));
        }
    }

}
