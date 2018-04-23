package org.t2k.cgs.packaging.executors;

import org.apache.log4j.Logger;
import org.springframework.util.Assert;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.packaging.ManifestHandler;
import org.t2k.cgs.packaging.PackageHandlerImpl;
import org.t2k.cgs.packaging.PackageStepsUpdater;
import org.t2k.cgs.packaging.TocItemsHandler;
import org.t2k.cgs.packaging.uploaders.CatalogueUploader;

/**
 * Instances of this class are created in {@link ExecutorConfiguration}
 */
public class CatalogueExecutor extends PackagePublishExecutor {

    private CatalogueUploader catalogueUploader;
    private PackageStepsUpdater packageStepsUpdater;

    private static Logger logger = Logger.getLogger(CatalogueExecutor.class);

    public CatalogueExecutor(CatalogueUploader catalogueUploader,
                             PackageStepsUpdater packageStepsUpdater,
                             ManifestHandler blossomManifestHandler,
                             TocItemsHandler tocItemsHandler) {
        Assert.notNull(catalogueUploader);
        Assert.notNull(packageStepsUpdater);
        Assert.notNull(blossomManifestHandler);
        Assert.notNull(tocItemsHandler);

        this.catalogueUploader = catalogueUploader;
        this.packageStepsUpdater = packageStepsUpdater;

        this.manifestHandler = blossomManifestHandler;
        this.tocItemsHandler = tocItemsHandler;
    }

    public void finalZippingAndSendingToTarget(PackageHandlerImpl packageHandler) throws Exception {
        CGSPackage cgsPackage = packageHandler.getCGSPackage();
        packageStepsUpdater.changePackagePhaseToInProgressUploading(cgsPackage, 0);
        if (!packageHandler.isCanceled()) {
            logger.info("finalZippingAndSendingToTarget: publish to catalogue started.");
            catalogueUploader.uploadPackage(packageHandler);
            logger.info("finalZippingAndSendingToTarget: publish to catalogue ended successfully.");
            packageStepsUpdater.changePackagePhaseToInProgressUploading(cgsPackage, 100);
        } else {
            logger.info("finalZippingAndSendingToTarget cancelled.");
        }
    }
}
