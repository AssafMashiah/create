package org.t2k.cgs.utils;

import org.apache.log4j.Logger;
import org.t2k.cgs.packaging.PackageHandlerImpl;
import org.t2k.cgs.packaging.PackageStepsUpdater;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 28/05/14
 * Time: 17:29
 */

/* implementing the ProgressListener for  CountingMultipartRequestEntity
    The goal is to give this class a cgsPackage that has a job id,
    and make it update the job progress for task uploadingToBlossom with the estimated percentage
 */
public class UploadProgressListener implements CountingMultipartRequestEntity.ProgressListener{

    private PackageStepsUpdater packageStepsUpdater;

    private Logger logger = Logger.getLogger(UploadProgressListener.class);

    private final PackageHandlerImpl packageHandler;

    int howManyPercentsAreThere= 130;

    private final long totalSizeToBeSent;
    private int lastUpdated = 0;

    public UploadProgressListener(long totalSizeToBeSent, PackageHandlerImpl packageHandler, PackageStepsUpdater packageStepsUpdater) {
        this.totalSizeToBeSent = totalSizeToBeSent;
        this.packageHandler = packageHandler;
        this.packageStepsUpdater = packageStepsUpdater;
    }

    @Override
    public void transferred(long num)  {
        float estimatedPercentSent = 100f *num  / totalSizeToBeSent;
        float percentForProgress =   100f * estimatedPercentSent / howManyPercentsAreThere;
        int percentageInt = (int) percentForProgress;
        if (lastUpdated != percentageInt && percentageInt%3==0 ) {  //update only every 3 percent
            lastUpdated = percentageInt;
            try{
                packageStepsUpdater.changePackagePhaseToInProgressUploading(packageHandler.getCGSPackage(), lastUpdated);
            }
            catch (Exception e){
                logger.error(e);
            }
            logger.debug("bytes sent (estimated):" + num + "/" + totalSizeToBeSent + " ~= " + estimatedPercentSent + "%, percentage for job progress = " + percentageInt);
        }
    }
}