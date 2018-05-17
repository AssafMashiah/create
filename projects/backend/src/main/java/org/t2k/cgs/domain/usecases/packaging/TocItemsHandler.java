package org.t2k.cgs.domain.usecases.packaging;

import org.t2k.cgs.service.packaging.PackageHandlerImpl;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 19/06/14
 * Time: 16:24
 */
public interface TocItemsHandler {

    /**
     * Handles the tocItems json for the package managed by the package handler
     */
    void modifyTocItemsAndHandleStandards(PackageHandlerImpl packageHandler) throws Exception;
}