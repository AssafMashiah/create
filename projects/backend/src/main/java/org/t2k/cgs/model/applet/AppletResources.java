package org.t2k.cgs.model.applet;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 31/01/13
 * Time: 14:41
 */
public class AppletResources {
    String baseDir;
    Set<String> hrefs;

    public AppletResources(){
    }

    public AppletResources(String baseDir){
        this.baseDir = baseDir;
    }
    public Set<String> getHrefs() {
        return hrefs;
    }

    public void setHrefs(Set<String> hrefs) {
        this.hrefs = hrefs;
    }

    public String getBaseDir() {
        return baseDir;
    }

    public void setBaseDir(String baseDir) {
        this.baseDir = baseDir;
    }
    public void addHref(String href){
        if (hrefs == null){
            hrefs = new HashSet<String> ();
        }
        hrefs.add(href);
    }
}
