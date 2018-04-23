package org.t2k.cgs.packaging.executors;

import org.apache.log4j.Logger;
import org.springframework.util.Assert;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.packaging.ManifestHandler;
import org.t2k.cgs.packaging.PackageHandlerImpl;
import org.t2k.cgs.packaging.PackageStepsUpdater;
import org.t2k.cgs.packaging.TocItemsHandler;
import org.t2k.cgs.packaging.zippers.ScormPackageZipper;

/**
 * Instances of this class are created in {@link ExecutorConfiguration}
 */
public class ScormExecutor extends PackagePublishExecutor {

    private static final Logger logger = Logger.getLogger(ScormExecutor.class);

    private ScormPackageZipper scormPackageZipper;
    private PackageStepsUpdater packageStepsUpdater;

    public ScormExecutor(ScormPackageZipper scormPackageZipper,
                         PackageStepsUpdater packageStepsUpdater,
                         ManifestHandler blossomManifestHandler,
                         TocItemsHandler tocItemsHandler) {
        Assert.notNull(scormPackageZipper);
        Assert.notNull(packageStepsUpdater);
        Assert.notNull(blossomManifestHandler);
        Assert.notNull(tocItemsHandler);

        this.scormPackageZipper = scormPackageZipper;
        this.packageStepsUpdater = packageStepsUpdater;

        this.manifestHandler = blossomManifestHandler;
        this.tocItemsHandler = tocItemsHandler;
    }

    public void finalZippingAndSendingToTarget(PackageHandlerImpl packageHandler) throws Exception {
        CGSPackage cgsPackage = packageHandler.getCGSPackage();
        packageStepsUpdater.changePackagePhaseToInProgressPublishing(cgsPackage, 0);
        if (!packageHandler.isCanceled()) {
            logger.info("finalZippingAndSendingToTarget: publish to SCORM started.");
            String zippedPackage = scormPackageZipper.createPackage(packageHandler.getCGSPackage());
            packageHandler.getCGSPackage().setZippedFileToDownloadLocation(zippedPackage);
            logger.info("finalZippingAndSendingToTarget: publish to SCORM archive ended successfully.");
            packageStepsUpdater.changePackagePhaseToInProgressPublishing(cgsPackage, 100);
        } else {
            logger.info("finalZippingAndSendingToTarget cancelled.");
        }
    }
}