package org.t2k.cgs.packaging.executors;

import org.apache.log4j.Logger;
import org.springframework.util.Assert;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.packaging.ManifestHandler;
import org.t2k.cgs.packaging.PackageHandlerImpl;
import org.t2k.cgs.packaging.PackageStepsUpdater;
import org.t2k.cgs.packaging.TocItemsHandler;
import org.t2k.cgs.packaging.uploaders.BlossomUploader;
import org.t2k.cgs.packaging.zippers.ScormPackageZipper;

/**
 * Instances of this class are created in {@link ExecutorConfiguration}
 */
public class BlossomExecutor extends PackagePublishExecutor {

    private BlossomUploader blossomUploader;
    private ScormPackageZipper scormPackageZipper;
    private PackageStepsUpdater packageStepsUpdater;

    public BlossomExecutor(BlossomUploader blossomUploader,
                           ScormPackageZipper scormPackageZipper,
                           PackageStepsUpdater packageStepsUpdater,
                           ManifestHandler blossomManifestHandler,
                           TocItemsHandler tocItemsHandler) {
        Assert.notNull(blossomUploader);
        Assert.notNull(scormPackageZipper);
        Assert.notNull(packageStepsUpdater);
        Assert.notNull(blossomManifestHandler);
        Assert.notNull(tocItemsHandler);

        this.blossomUploader = blossomUploader;
        this.scormPackageZipper = scormPackageZipper;
        this.packageStepsUpdater = packageStepsUpdater;
        this.manifestHandler = blossomManifestHandler;
        this.tocItemsHandler = tocItemsHandler;
    }

    private static Logger logger = Logger.getLogger(BlossomExecutor.class);

    public void finalZippingAndSendingToTarget(PackageHandlerImpl packageHandler) throws Exception {
        CGSPackage cgsPackage = packageHandler.getCGSPackage();

        if (!packageHandler.isCanceled()) {
            logger.info("finalZippingAndSendingToTarget: publish to blossom started.");
            packageStepsUpdater.changePackagePhaseToInProgressPublishing(cgsPackage, 0);

            try {
                packageHandler.setZippedFileForScorm(scormPackageZipper.createPackage(packageHandler.getCGSPackage()));
            } catch (Exception e) {
                String msg = String.format("Error creating SCORM zip for packageId: %s, courseId: %s.\nReason: " + e.getMessage(), cgsPackage.getPackId(), cgsPackage.getCourseId());
                logger.error(msg, e);
                throw new Exception(msg, e);
            }

            blossomUploader.uploadPackage(packageHandler);
            packageStepsUpdater.changePackagePhaseToInProgressPublishing(cgsPackage, 100);
            logger.info("finalZippingAndSendingToTarget: publish to blossom ended successfully.");
        } else {
            logger.info("finalZippingAndSendingToTarget cancelled.");
        }
    }
}