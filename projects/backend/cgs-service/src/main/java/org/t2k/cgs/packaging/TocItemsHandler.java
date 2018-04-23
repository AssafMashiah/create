package org.t2k.cgs.packaging;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 19/06/14
 * Time: 16:24
 */
public interface TocItemsHandler {

    /*
         handles the tocItems json for the package managed by the package handler
     */
    void modifyTocItemsAndHandleStandards(PackageHandlerImpl packageHandler) throws Exception;
}