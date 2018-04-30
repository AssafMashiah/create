package org.t2k.cgs.domain.usecases.packaging;

import org.t2k.cgs.domain.model.exceptions.DsException;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 25/11/12
 * Time: 13:46
 */
public interface PackageHandler extends Cancellable, Runnable {

    void packageCourse() throws DsException;

    CGSPackage getCGSPackage();

    void init(CGSPackage cgsPackage);
}