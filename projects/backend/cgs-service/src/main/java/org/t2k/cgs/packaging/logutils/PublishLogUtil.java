package org.t2k.cgs.packaging.logutils;

import org.springframework.stereotype.Service;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.model.publishing.PublishError;
import org.t2k.cgs.packaging.PackageHandlerImpl;

import java.util.List;

/**
 * Created by moshe.avdiel on 12/13/2015.
 */
@Service
public class PublishLogUtil {

    public static final String NEW_LINE = System.getProperty("line.separator", "\n");

    public PublishLogUtil() {
        // Empty
    }

    public String getLog(String msg, PackageHandlerImpl packageHandler) {

        StringBuilder sbMessage = new StringBuilder();
        sbMessage.append(NEW_LINE);
        sbMessage.append(msg);
        sbMessage.append(NEW_LINE);
        sbMessage.append(NEW_LINE);
        CGSPackage pack = packageHandler.getCGSPackage();

        if (pack != null) {
            sbMessage.append("Pack ID ..........................: ").append( pack.getPackId() ).append(NEW_LINE);
            sbMessage.append("getHostName ......................: ").append(pack.getHostName() ).append(NEW_LINE);
            sbMessage.append("getCatalogName ...................: ").append(pack.getCatalogName()).append(NEW_LINE);
            sbMessage.append("getCourseName ...................: ").append(pack.getCourseTitle() ).append(NEW_LINE);
            sbMessage.append("getCourseId ......................: ").append(pack.getCourseId() ).append(NEW_LINE);
            sbMessage.append("getCourseCId .....................: ").append(pack.getCourseCId()).append(NEW_LINE);
            sbMessage.append("getVersion .......................: ").append(pack.getVersion() ).append(NEW_LINE);
            sbMessage.append("getNewVersion_prod ...............: ").append(pack.getNewVersion_prod() ).append(NEW_LINE);
            sbMessage.append("getNewVersion_preProd ............: ").append(pack.getNewVersion_preProd() ).append(NEW_LINE);
            sbMessage.append("getUserName ......................: ").append(pack.getUserName()).append(NEW_LINE);
            sbMessage.append("getPublishModeEnum ...............: ").append(pack.getPublishModeEnum() ).append(NEW_LINE);
            sbMessage.append("getPublisherId ...................: ").append(pack.getPublisherId() ).append(NEW_LINE);
            sbMessage.append("getPublishTarget .................: ").append(pack.getPublishTarget() ).append(NEW_LINE);
            sbMessage.append("getZippedFileToDownloadLocation ..: ").append(pack.getZippedFileToDownloadLocation() ).append(NEW_LINE);
            sbMessage.append("getDescription ...................: ").append(pack.getDescription() ).append(NEW_LINE);
            sbMessage.append("getCmsPublisherHomeLocation ......: ").append(pack.getCmsPublisherHomeLocation()).append(NEW_LINE);
            sbMessage.append("getIsShow ........................: ").append(pack.getIsShow() ).append(NEW_LINE);
            sbMessage.append("getLocalResourcesLocation ........: ").append(pack.getLocalResourcesLocation().toString() ).append(NEW_LINE);
            sbMessage.append("getPackagePhase ..................: ").append(pack.getPackagePhase() ).append(NEW_LINE);
            sbMessage.append("getPackageOutputLocation .........: ").append(pack.getPackageOutputLocation() ).append(NEW_LINE);
            sbMessage.append("getPendingPlace ..................: ").append(pack.getPendingPlace() ).append(NEW_LINE);
            sbMessage.append("getComponentsProgressInPercent ...: ").append(pack.getComponentsProgressInPercent() ).append(NEW_LINE);
            sbMessage.append("getReleaseNote ...................: ").append(pack.getReleaseNote() ).append(NEW_LINE);
            sbMessage.append("getCsi ...........................: ").append(pack.getCsi() ).append(NEW_LINE);
            sbMessage.append("getNumberOfResourcesToPack .......: ").append(pack.getNumberOfResourcesToPack() ).append(NEW_LINE);
            sbMessage.append("getNumberOfResourcesDone .........: ").append(pack.getNumberOfResourcesDone() ).append(NEW_LINE);
            sbMessage.append("getPackStartDate .................: ").append(pack.getPackStartDate() ).append(NEW_LINE);
            sbMessage.append("getPackEndDate ...................: ").append(pack.getPackEndDate() ).append(NEW_LINE);
            sbMessage.append(getAllErrors( pack.getErrors()) ).append(NEW_LINE);
            sbMessage.append(getAllWarnings(pack.getWarnings()) ).append(NEW_LINE);
        }

        sbMessage.append(NEW_LINE);

        return sbMessage.toString();
    }

    private String getAllWarnings(List<String> warnings) {
        StringBuilder sb = new StringBuilder();

        if (warnings != null && !warnings.isEmpty()) {
            sb.append(NEW_LINE).append("---[  Warnings  ]---:").append(NEW_LINE);
            for (String warn : warnings) {
                sb.append(warn).append(NEW_LINE);
            }
            sb.append(NEW_LINE);
        }

        return sb.toString();
    }

    private String getAllErrors(List<PublishError> errors) {
        StringBuilder sb = new StringBuilder();

        if (errors != null && !errors.isEmpty()) {
            sb.append(NEW_LINE).append("---[  Errors ]---:").append(NEW_LINE);
            for (PublishError error : errors) {
                sb.append("getErrorId ...: ").append(error.getErrorId()).append(NEW_LINE)
                        .append("     getMessage ...: ").append(error.getMessage()).append(NEW_LINE)
                        .append("     getPublishError ...: ").append(error.getPublishError()).append(NEW_LINE)
                        .append("     getResourceId ...: ").append(error.getResourceId()).append(NEW_LINE);
            }
            sb.append(NEW_LINE);
        }

        return sb.toString();
    }


}
