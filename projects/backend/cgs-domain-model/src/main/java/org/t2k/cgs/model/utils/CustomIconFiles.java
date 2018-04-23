package org.t2k.cgs.model.utils;

import java.util.List;

/**
 * Created by Gabor on 7/6/2016.
 */
public class CustomIconFiles {
    private String baseDir;
    private List<String> hrefs;

    public CustomIconFiles(String baseDir, List<String> hrefs) {
        this.baseDir = baseDir;
        this.hrefs = hrefs;
    }

    public String getBaseDir() {
        return baseDir;
    }

    public List<String> getHrefs() {
        return hrefs;
    }

}
