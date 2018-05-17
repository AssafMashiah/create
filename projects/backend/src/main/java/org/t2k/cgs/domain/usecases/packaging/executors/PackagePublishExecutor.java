package org.t2k.cgs.domain.usecases.packaging.executors;

import org.t2k.cgs.domain.usecases.packaging.ManifestHandler;
import org.t2k.cgs.service.packaging.PackageHandlerImpl;
import org.t2k.cgs.domain.usecases.packaging.TocItemsHandler;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 22/06/14
 * Time: 15:05
 */
public abstract class PackagePublishExecutor {

    protected ManifestHandler manifestHandler;

    protected TocItemsHandler tocItemsHandler;

    /***
     * Zip the package again if necessary and send it to the remote destination\file system
     * add any necessary files such as manifests, xmls, etc.
     * @param packageHandler - package handler that has a cgs package to be published
     * @throws Exception if the process failed
     */
    public abstract void finalZippingAndSendingToTarget(PackageHandlerImpl packageHandler) throws Exception;

    /***
     * Creates a manifest for the entire package and copies it into a manifest file
     * @param packageHandler - package handler that has a cgs package to be published
     * @throws Exception
     */
    public void handlePackageManifest(PackageHandlerImpl packageHandler) throws Exception {
        manifestHandler.handlePackageManifest(packageHandler);
    }

    /***
     * Perform modifications in the toc item manifests, for example - go over the files and remove unnecessary resources from them
     * @param packageHandler - package handler that has a cgs package to be published
     * @throws Exception
     */
    public void handleTocItems(PackageHandlerImpl packageHandler) throws Exception {
        tocItemsHandler.modifyTocItemsAndHandleStandards(packageHandler);
    }
}
