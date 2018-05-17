package org.t2k.cgs.domain.usecases.packaging.executors;

import org.apache.log4j.Logger;
import org.springframework.util.Assert;
import org.t2k.cgs.domain.usecases.packaging.*;
import org.t2k.cgs.domain.usecases.packaging.PackageUploader;
import org.t2k.cgs.domain.usecases.packaging.zippers.ScormPackageZipper;
import org.t2k.cgs.domain.usecases.packaging.TinyKeysDao;
import org.t2k.cgs.service.packaging.PackageHandlerImpl;
import org.t2k.cgs.domain.usecases.packaging.TinyKey;

public class PublishToURLExecutor extends PackagePublishExecutor {

    private ScormPackageZipper scormPackageZipper;
    private PackageStepsUpdater packageStepsUpdater;
    private PackageUploader urlServerUploader;
    private TinyKeysDao tinyKeysDao;

    private static Logger logger = Logger.getLogger(BlossomExecutor.class);

    public PublishToURLExecutor(ScormPackageZipper scormPackageZipper,
                                PackageStepsUpdater packageStepsUpdater,
                                PackageUploader urlServerUploader,
                                TinyKeysDao tinyKeysDao,
                                ManifestHandler blossomManifestHandler,
                                TocItemsHandler tocItemsHandler) {
        Assert.notNull(scormPackageZipper);
        Assert.notNull(packageStepsUpdater);
        Assert.notNull(urlServerUploader);
        Assert.notNull(tinyKeysDao);
        Assert.notNull(blossomManifestHandler);
        Assert.notNull(tocItemsHandler);

        this.scormPackageZipper = scormPackageZipper;
        this.packageStepsUpdater = packageStepsUpdater;
        this.urlServerUploader = urlServerUploader;
        this.tinyKeysDao = tinyKeysDao;

        this.manifestHandler = blossomManifestHandler;
        this.tocItemsHandler = tocItemsHandler;
    }

    /***
     * Zip the package again if necessary and send it to the remote destination\file system
     * add any necessary files such as manifests, xmls, etc.
     *
     * @param packageHandler - package handler that has a cgs package to be published
     * @throws Exception if the process failed
     */
    @Override
    public void finalZippingAndSendingToTarget(PackageHandlerImpl packageHandler) throws Exception {

        CGSPackage cgsPackage = packageHandler.getCGSPackage();

        if (!packageHandler.isCanceled()) {
            logger.info("finalZippingAndSendingToTarget: publish Course To URL Server started.");
            packageStepsUpdater.changePackagePhaseToInProgressPublishing(cgsPackage, 0);

            try {
                packageHandler.setZippedFileForScorm(scormPackageZipper.createPackage(packageHandler.getCGSPackage()));
            } catch (Exception e) {
                String msg = String.format("Error creating SCORM zip for packageId: %s, courseId: %s.\nReason: " + e.getMessage(), cgsPackage.getPackId(), cgsPackage.getCourseId());
                logger.error(msg, e);
                throw new Exception(msg, e);
            }

            String tinyKeyStr = urlServerUploader.uploadPackage(packageHandler);

            int publisherId = packageHandler.getCGSPackage().getPublisherId();
            String courseId = packageHandler.getCGSPackage().getCourseId();

            String lessonId = PackageUtil.getFirstLessonId(cgsPackage);
            String lessonTitle = PackageUtil.getFirstLessonTitle(cgsPackage);
            String courseTitle = cgsPackage.getCourseTitle();

            TinyKey tinyKeyObj = new TinyKey(publisherId, courseId, lessonId, tinyKeyStr, cgsPackage.getPublishTarget().getName(), courseTitle, lessonTitle);

            // save to collection
            this.tinyKeysDao.saveTinyKey(tinyKeyObj);

            cgsPackage.setTinyUrl(tinyKeyStr);
            packageStepsUpdater.changePackagePhaseToInProgressPublishing(cgsPackage, 100);
            logger.info("finalZippingAndSendingToTarget: publish to URL Server ended successfully.");
        } else {
            logger.info("finalZippingAndSendingToTarget cancelled.");
        }

    }
}
