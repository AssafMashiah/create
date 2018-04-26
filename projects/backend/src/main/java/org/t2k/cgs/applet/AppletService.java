package org.t2k.cgs.applet;

import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.locks.LockUser;
import org.t2k.cgs.model.applet.AppletManifest;
import org.t2k.cgs.model.tocItem.Format;
import org.t2k.gcr.common.model.applet.GCRAppletArtifact;
import org.t2k.gcr.common.model.applet.Type;

import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 31/01/13
 * Time: 12:31
 */
public interface AppletService {

    /**
     * @param publisherId
     * @param tocFormat   format of the toc to do the filtering of the applets by or null if no filtering is needed
     * @param appletType  type of the applets to do filtering for, or null if no filtering is needed
     * @return a list of applets artifacts
     * @throws DsException
     */
    List<GCRAppletArtifact> getAppletsAllowedForPublisher(int publisherId, Format tocFormat, Type appletType) throws DsException;

    List<GCRAppletArtifact> getAppletsAllowedForPublisher(int publisherId);

    AppletManifest getAppletManifest(String courseId, Date modifiedSince);

    void createAppletManifest(String courseId, String courseVersion);

    void addApplet(int publisherId, String courseId, String appletId, LockUser cgsUserDetails) throws Exception;

    void updateApplets(int publisherId, String courseId, List<String> appletIds, LockUser cgsUserDetails, String jobId) throws Exception;

    void deleteAppletManifest(String courseId);
}