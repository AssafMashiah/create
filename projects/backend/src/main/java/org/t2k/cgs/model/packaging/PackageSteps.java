package org.t2k.cgs.model.packaging;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 19/11/12
 * Time: 10:44
 */
public enum PackageSteps {


    /**
     * ./
     * Packaging phases of a package.
     * IMPORTANT !! - when changing , adding , removing entries to this enum- make sure that
     * you handle them in the packaging process.(like cleanups etc)
     */
    PREPARATION("preparation"),
    UPDATING_MANIFESTS_REFERENCES("updatingManifestsReferences"),
    PENDING("pending"),
    IN_PROGRESS("inProgress"),
    PACKAGING("packaging"),
    PUBLISHING("publishing"),
    UPLOADING("uploading");

    public static PackageSteps forName(String name) {

        for (PackageSteps type : PackageSteps.values()) {
            if (type.getName().equalsIgnoreCase(name)) {
                return type;
            }
        }
        return null;
    }

    private String name;

    PackageSteps(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }

}
