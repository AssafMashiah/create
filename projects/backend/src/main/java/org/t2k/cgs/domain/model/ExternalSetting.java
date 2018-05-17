package org.t2k.cgs.domain.model;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 1/18/15
 * Time: 7:12 PM
 * To change this template use File | Settings | File Templates.
 */
public class ExternalSetting {
    private String type;
    private String url;

    public ExternalSetting(String catalogType, String catalogUrl) {
        this.type = catalogType;
        this.url = catalogUrl;
    }

    public ExternalSetting(){} // empty constructor for mongo mapping


    public String getType() {
        return type;
    }

    public String getUrl() {
        return url;
    }


    public void setUrl(String url) {
        this.url = url;
    }
}
