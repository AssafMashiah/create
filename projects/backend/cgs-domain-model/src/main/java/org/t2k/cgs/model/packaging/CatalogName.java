package org.t2k.cgs.model.packaging;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 2/16/15
 * Time: 8:03 PM
 * To change this template use File | Settings | File Templates.
 */
public enum CatalogName {
    /**
     * Packaging phases of a package.
     * IMPORTANT !! - when changing , adding , removing entries to this enum- make sure that
     * you handle them in the packaging process.(like cleanups etc)
     */
    GCR,
    BLOSSOM
}
