package org.t2k.cgs.model.packaging;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 19/11/12
 * Time: 10:44
 */
public enum PackagePhase {

    /**
     * Packaging phases of a package.
     * IMPORTANT !! - when changing , adding , removing entries to this enum- make sure that
     * you handle them in the packaging process.(like cleanups etc)
     */
    PENDING,
    IN_PROGRESS,
    FAILED,
    CANCELED,
    COMPLETED
}
