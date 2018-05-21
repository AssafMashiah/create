package org.t2k.cgs.domain.usecases.packaging;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 19/11/12
 * Time: 10:44
 */
public enum PackageStep {

    /**
     * ./
     * Packaging phases of a package.
     * IMPORTANT !! - when changing , adding , removing entries to this enum- make sure that
     * you handle them in the packaging process.(like cleanups etc)
     */
    PREPARATION("preparation"),
    UPDATING_MANIFESTS_REFERENCES("updatingManifestsReferences"),
    IN_PROGRESS("inProgress"),
    PACKAGING("packaging"),
    PUBLISHING("publishing"),
    UPLOADING("uploading");

    public static PackageStep forName(String name) {
        for (PackageStep type : PackageStep.values()) {
            if (type.getName().equalsIgnoreCase(name)) {
                return type;
            }
        }
        return null;
    }

    private String name;

    PackageStep(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }
}
