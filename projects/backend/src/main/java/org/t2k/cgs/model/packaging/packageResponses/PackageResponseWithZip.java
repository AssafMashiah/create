package org.t2k.cgs.model.packaging.packageResponses;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.t2k.cgs.model.packaging.CGSPackage;

/**
 * Created with IntelliJ IDEA.
 * User: elad.avidan
 * Date: 03/11/2014
 * Time: 11:36
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public class PackageResponseWithZip extends PackageResponseBase {

    private String zippedFileToDownloadLocation;

    public PackageResponseWithZip(CGSPackage cgsPackage) {
        super(cgsPackage);
        this.zippedFileToDownloadLocation = cgsPackage.getZippedFileToDownloadLocation();
    }
}
