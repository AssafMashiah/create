package org.t2k.cgs.model.ebooks;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 21/12/2015
 * Time: 10:08
 */
public class EBookThumbnail {

    private String url;
    private String outputLocation;

    public EBookThumbnail(String url, String outputLocation) {
        this.url = url;
        this.outputLocation = outputLocation;
    }

    public String getUrl() {
        return this.url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getOutputLocation() {
        return this.outputLocation;
    }
}