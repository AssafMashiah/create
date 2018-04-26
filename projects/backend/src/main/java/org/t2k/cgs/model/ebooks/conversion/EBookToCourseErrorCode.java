package org.t2k.cgs.model.ebooks.conversion;

import org.t2k.cgs.model.utils.ErrorCode;

/**
 * @author Alex Burdusel on 2016-06-28.
 */
public enum EBookToCourseErrorCode implements ErrorCode {
    INVALID_PAGES_ORDER;

    public String getCode() {
        return toString();
    }
}
