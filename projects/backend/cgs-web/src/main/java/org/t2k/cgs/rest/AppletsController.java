package org.t2k.cgs.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.t2k.cgs.applet.AppletService;
import org.t2k.cgs.locks.LockUser;
import org.t2k.cgs.model.applet.AppletManifest;
import org.t2k.cgs.model.tocItem.Format;
import org.t2k.cgs.security.CGSUserDetails;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;
import org.t2k.gcr.common.model.applet.GCRAppletArtifact;
import org.t2k.gcr.common.model.applet.Type;
import org.t2k.utils.ISO8601DateFormatter;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 31/01/13
 * Time: 14:19
 */
@RestController
@AllowedForAllUsers
public class AppletsController {
    @Autowired
    private CGSUserDetails currentUser;

    @Autowired
    private AppletService appletService;

    @RequestMapping(value = "/publishers/{publisherId}/applets",
            method = RequestMethod.GET)
    public List<GCRAppletArtifact> getAppletsAllowedForPublisher(@PathVariable int publisherId,
                                                                 @RequestParam Format lessonFormat) throws Exception {
        return appletService.getAppletsAllowedForPublisher(publisherId, lessonFormat, null);
    }

    @RequestMapping(value = "/toolboxWidgets",
            method = RequestMethod.GET)
    public List<GCRAppletArtifact> getWidgetsForToolBox() throws Exception {
        return appletService.getAppletsAllowedForPublisher(currentUser.getRelatesTo().getId(), null, Type.WIDGET);
    }

    @RequestMapping(value = "/publishers/{publisherId}/courses/{courseId}/applets",
            method = RequestMethod.GET)
    public AppletManifest getAppletManifest(@PathVariable int publisherId,
                                            @PathVariable String courseId,
                                            @RequestParam(value = "last-modified", required = false) String lastModified)
            throws Exception {
        Date modifiedSince = null;
        if (lastModified != null && !lastModified.isEmpty())
            modifiedSince = ISO8601DateFormatter.toDate(lastModified);
        return appletService.getAppletManifest(courseId, modifiedSince);
    }

    @RequestMapping(value = "/publishers/{publisherId}/courses/{courseId}/applets/{appletId}",
            method = RequestMethod.POST)
    public void addApplet(@PathVariable int publisherId,
                          @PathVariable String courseId,
                          @PathVariable String appletId)
            throws Exception {
        appletService.addApplet(publisherId, courseId, appletId, new LockUser(currentUser));
    }

    @RequestMapping(value = "/publishers/{publisherId}/courses/{courseId}/applets/{appletId}",
            method = RequestMethod.PUT)
    public void updateApplet(@PathVariable int publisherId,
                             @PathVariable String courseId,
                             @PathVariable String appletId)
            throws Exception {
        appletService.updateApplets(publisherId, courseId, Arrays.asList(appletId), new LockUser(currentUser), null);
    }

    @RequestMapping(value = "/publishers/{publisherId}/courses/{courseId}/applets",
            method = RequestMethod.PUT)
    public void updateApplets(@PathVariable int publisherId,
                              @PathVariable String courseId,
                              @RequestBody AppletIds appletIds,
                              @RequestParam(value = "jobId", required = true) String jobId)
            throws Exception {
        appletService.updateApplets(publisherId, courseId, appletIds.getAppletIds(), new LockUser(currentUser), jobId);
    }

    private static class AppletIds {
        List<String> appletIds;

        public List<String> getAppletIds() {
            return appletIds;
        }
    }
}