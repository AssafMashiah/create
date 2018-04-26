package org.t2k.cgs.tocItem.tocimport;

import org.t2k.cgs.model.utils.ErrorCode;

/**
 * @author Alex Burdusel on 2016-11-28.
 */
public enum ImportTocItemError implements ErrorCode {
    LOCK_FAILED,
    INVALID_TOC_ITEM,
    MISSING_DIFFERENTIATION_LEVEL_MAPPING,
    TOC_DOES_NOT_EXIST,
    FAILED_TO_ADD_APPLETS,
    FAILED_TO_COPY_RESOURCES,
    LOCK_RELEASE_FAILED,

    STANDARDS_PACKAGE_MISMATCH,
    APPLETS_VALIDATION_ERROR;

    @Override
    public String getCode() {
        return toString();
    }
}
