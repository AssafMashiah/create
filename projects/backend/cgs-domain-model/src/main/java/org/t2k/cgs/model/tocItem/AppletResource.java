package org.t2k.cgs.model.tocItem;

import org.t2k.cgs.model.CGSResource;

/**
 * Wrapper class to manipulate an applet resource
 * <p>
 * An Applet {@code {@link CGSResource}} has the baseDir with the following pattern
 * {@code "applets/{applet guid}/{applet version}"}
 *
 * @author Alex Burdusel on 2016-11-29.
 */ //TODO: 12/8/16 test
public class AppletResource {

    private String guid;
    private String version;
    private CGSResource resource;

    /**
     * @param resource the resource to convert to an applet resource
     * @return a new instance of an {@link AppletResource} from the given {@link CGSResource} or null if the {@code resource}
     * is not an applet resource
     */
    public static AppletResource newInstance(CGSResource resource) { //todo test
        if (resource.getBaseDir() == null) {
            return null;
        }
        String[] dirString = resource.getBaseDir().split("/");
        if (!resource.getBaseDir().startsWith("applets") || dirString.length < 3) {
            // not an applet resource or a corrupted one
            return null;
        }
        AppletResource appletResource = new AppletResource();
        appletResource.resource = resource;
        appletResource.guid = dirString[1];
        appletResource.version = dirString[2];
        return appletResource;
    }

    /**
     * Factory static method to build a new CGSResource instance from the one given as parameter, but
     * with the given version
     *
     * @param resource   the {@code CGSResource} from which to create the new instance with the new version
     * @param newVersion the new version for the {@code CGSResource}
     * @return a new instance of a {@code CGSResource} from the given parameters
     * @throws IllegalArgumentException in case the given resource basedir does not have the structure of an applet resource:
     *                                  {@code "applets/{applet guid}/{applet version}"}
     */
    public static CGSResource newCGSResource(CGSResource resource, String newVersion) {
        String[] dirString = resource.getBaseDir().split("/");
        if (!resource.getBaseDir().startsWith("applets") || dirString.length < 3) {
            throw new IllegalArgumentException("The given resource does not have a correct applet resource basedir structure");
        }
        return CGSResource.newInstance(
                dirString[0] + "/" + dirString[1] + "/" + newVersion,
                resource.getHrefs(),
                resource.getType());
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (obj == this) {
            return true;
        }
        if (obj.getClass() != getClass()) {
            return false;
        }
        AppletResource other = (AppletResource) obj;
        return this.guid.equals(other.guid) && this.version.equals(other.version);
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + this.guid.hashCode();
        result = 31 * result + this.version.hashCode();
        return result;
    }

    public String getGuid() {
        return guid;
    }

    public String getVersion() {
        return version;
    }

    public CGSResource getResource() {
        return resource;
    }
}
