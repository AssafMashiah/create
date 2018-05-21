package org.t2k.cgs.domain.usecases.packaging;

import org.apache.log4j.Logger;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.usecases.lock.TransactionService;
import org.t2k.cgs.domain.usecases.publisher.PublishError;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet +
 * Date: 21/09/14
 * Time: 11:17
 */
public class PackageStepsUpdater {
    private static Logger logger = Logger.getLogger(PackageStepsUpdater.class);

    private PackagingService packagingService;
    private TransactionService transactionService;

    public PackageStepsUpdater(PackagingService packagingService, TransactionService transactionService) {
        this.packagingService = packagingService;
        this.transactionService = transactionService;
    }

    public void changePackagePhaseToInProgressPreparation(CGSPackage cgsPackage, int percentage) throws DsException {
        logger.debug(String.format("changePackagePhaseToInProgressPreparation. Package id: %s, course id: %s", cgsPackage.getPackId(), cgsPackage.getCourseId()));
        cgsPackage.setPackagePhase(PackagePhase.IN_PROGRESS);
        cgsPackage.setComponentsProgressInPercent(PackageStep.PREPARATION, percentage);
        saveCgsPackage(cgsPackage);
    }

    public void changePackagePhaseToCanceled(CGSPackage cgsPackage) throws DsException {
        logger.debug(String.format("changePackagePhaseToCanceled: Package id: %s, course id: %s", cgsPackage.getPackId(), cgsPackage.getCourseId()));
        releaseTransaction(cgsPackage); // to be on the safe side - we will release the transaction any waCGSPackage.y
        cgsPackage.setPackagePhase(PackagePhase.CANCELED);
        saveCgsPackage(cgsPackage);
    }

    public void changePackagePhaseToInProgressUpdatingManifestsReferences(CGSPackage cgsPackage, int percentage) throws DsException {
        logger.debug(String.format("changePackagePhaseToInProgressUpdatingManifestsReferences: Package id: %s, course id: %s, percentage: %d", cgsPackage.getPackId(), cgsPackage.getCourseId(), percentage));
        cgsPackage.setPackagePhase(PackagePhase.IN_PROGRESS);
        cgsPackage.setComponentsProgressInPercent(PackageStep.UPDATING_MANIFESTS_REFERENCES, percentage);
        saveCgsPackage(cgsPackage);
    }

    public void changePackagePhaseToInProgressPackaging(CGSPackage cgsPackage, int percentage) throws DsException {
        logger.debug(String.format("changePackagePhaseToPackaging: Package id: %s, course id: %s, percentage: %d", cgsPackage.getPackId(), cgsPackage.getCourseId(), percentage));
        cgsPackage.setPackagePhase(PackagePhase.IN_PROGRESS);
        cgsPackage.setComponentsProgressInPercent(PackageStep.PACKAGING, percentage);
        saveCgsPackage(cgsPackage);
    }

    public void changePackagePhaseToInProgressUploading(CGSPackage cgsPackage, int percentage) throws DsException {
        logger.debug(String.format("changePackagePhaseToPackaging: Package id: %s, course id: %s, percentage: %d", cgsPackage.getPackId(), cgsPackage.getCourseId(), percentage));
        cgsPackage.setPackagePhase(PackagePhase.IN_PROGRESS);
        cgsPackage.setComponentsProgressInPercent(PackageStep.UPLOADING, percentage);
        saveCgsPackage(cgsPackage);
    }

    public void changePackagePhaseToInProgressPublishing(CGSPackage cgsPackage, int percentage) throws DsException {
        logger.debug(String.format("changePackagePhaseToInProgressPublishing: Package id: %s, course id: %s, percentage: %d", cgsPackage.getPackId(), cgsPackage.getCourseId(), percentage));
        cgsPackage.setPackagePhase(PackagePhase.IN_PROGRESS);
        cgsPackage.setComponentsProgressInPercent(PackageStep.PUBLISHING, percentage);
        saveCgsPackage(cgsPackage);
    }

    public void changePackagePhaseToPending(CGSPackage cgsPackage) throws DsException {
        logger.debug(String.format("changePackagePhaseToPending: Package id: %s, course id: %s", cgsPackage.getPackId(), cgsPackage.getCourseId()));
        cgsPackage.setPackagePhase(PackagePhase.PENDING);
        packagingService.saveCGSPackage(cgsPackage);
    }

    public void changePackagePhaseToCompleted(CGSPackage cgsPackage) throws DsException {
        logger.debug(String.format("changePackagePhaseToCompleted: Package id: %s, course id: %s", cgsPackage.getPackId(), cgsPackage.getCourseId()));
        cgsPackage.setPackagePhase(PackagePhase.COMPLETED);
        saveCgsPackage(cgsPackage);
    }

    public void changePackageToFailedPhase(CGSPackage cgsPackage) throws DsException {
        changePackagePhaseToFailed(cgsPackage, null);
    }

    public void changePackagePhaseToFailed(CGSPackage cgsPackage, String message) throws DsException {
        logger.debug(String.format("changePackagePhaseToFailed: Package id: %s, course id: %s", cgsPackage.getPackId(), cgsPackage.getCourseId()));
        cgsPackage.setPackagePhase(PackagePhase.FAILED);
        // TODO: add the isCancelled + success fail part
        if (message != null) {
            PublishError publishError = new PublishError("Error occurred: " + message);
            cgsPackage.addError(publishError);
        }

        saveCgsPackage(cgsPackage);
        releaseTransaction(cgsPackage); // to be on the safe side - we will release the transaction any way
    }

    private void saveCgsPackage(CGSPackage cgsPackage) throws DsException {
        packagingService.saveCGSPackage(cgsPackage);
    }

    /**
     * delete the transaction for the course in cgsPackage.getCourseId()
     *
     * @param cgsPackage
     * @throws DsException
     */
    public void releaseTransaction(CGSPackage cgsPackage) throws DsException {
        try {
            transactionService.stopTransaction(cgsPackage.getCourseId(), cgsPackage.getUserName());
        } catch (DsException e) {
            logger.error(String.format("Sever error: could not release transaction for course %s", cgsPackage.getCourseId()));
        }
    }
}