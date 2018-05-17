package org.t2k.cgs.domain.usecases.packaging.zippers;

import org.t2k.cgs.domain.usecases.packaging.CGSPackage;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 22/06/14
 * Time: 16:25
 */
public interface PackageZipper {

    /**
     * creates a package and returns its file path as a string
     * @param cgsPackage
     * @return
     * @throws Exception
     */
    public String createPackage(CGSPackage cgsPackage) throws Exception;
 }
