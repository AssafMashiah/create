package org.t2k.cgs.domain.usecases;

/**
 * Created by Asaf.Shochet on 12/9/2015.
 */
public class WebsiteValidationReport {
    boolean existsOnWeb;
    boolean canBeInAnIframe;
    String url;

    public WebsiteValidationReport(String url, boolean existsOnWeb, boolean canBeInAnIframe) {
        this.existsOnWeb = existsOnWeb;
        this.canBeInAnIframe = canBeInAnIframe;
        this.url = url;
    }

    public boolean isExistsOnWeb() {
        return existsOnWeb;
    }

    public boolean isCanBeInAnIframe() {
        return canBeInAnIframe;
    }

    public String getUrl() {
        return url;
    }
}

