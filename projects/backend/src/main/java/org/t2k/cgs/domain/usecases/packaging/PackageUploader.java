package org.t2k.cgs.domain.usecases.packaging;

import org.t2k.cgs.service.packaging.PackageHandlerImpl;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 19/06/14
 * Time: 17:21
 */
public interface PackageUploader {

    /***
     * uploads the package zip to the desired location
     * @return Server response
     * @param packageHandler  - package handle that holds the cgsPackage data that needs uploading
     * @throws Exception
     */
    public String uploadPackage(PackageHandlerImpl packageHandler) throws Exception;
}
