package org.t2k.cgs.model.applet;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 31/01/13
 * Time: 14:36
 */
public class AppletData {
    private String guid;
    private String version;
    private String thumbnail;
    private AppletResources resources;

    public AppletData() {
    }

    public AppletData(String guid, String version) {
        this.guid = guid;
        this.version = version;
    }

    public String getGuid() {
        return guid;
    }

    public void setGuid(String guid) {
        this.guid = guid;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public AppletResources getResources() {
        return resources;
    }

    public void setResources(AppletResources resources) {
        this.resources = resources;
    }
}
