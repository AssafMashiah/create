package org.t2k.cgs.model.applet;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.t2k.cgs.model.Header;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 31/01/13
 * Time: 14:33
 */
public class AppletManifest {

    private String courseId;
    private Header header = new Header();
    private List<AppletData> applets;

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public List<AppletData> getApplets() {
        return applets;
    }

    public void setApplets(List<AppletData> applets) {
        this.applets = applets;
    }

    public void addApplet(AppletData applet) {
        if (applets == null)
            applets = new ArrayList<>();
        applets.add(applet);
    }

    public boolean hasApplet(String appletId) {
        return (getApplet(appletId) != null);
    }

    public AppletData getApplet(String appletId) {
        if (applets == null)
            return null;
        for (AppletData applet : applets) {
            if (applet.getGuid().equals(appletId))
                return applet;
        }
        return null;
    }

    public void removeApplet(String appletId) {
        AppletData theApplet = getApplet(appletId);
        if (theApplet != null) {
            applets.remove(theApplet);
        }
    }

    public Header getHeader() {
        return header;
    }

    /**
     * Updates the header with a new one for the given lastModified date
     * @author Alex Burdusel
     */
    @JsonIgnore
    public void setLastModified(Date lastModified) {
        this.header = Header.newInstance(this.header, lastModified);
    }
}
