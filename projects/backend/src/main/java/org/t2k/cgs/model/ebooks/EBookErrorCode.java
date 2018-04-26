package org.t2k.cgs.model.ebooks;

import org.t2k.cgs.model.utils.ErrorCode;

/**
 * @author Alex Burdusel on 2016-09-01.
 */
public enum EBookErrorCode implements ErrorCode {
    FAILED_TO_UPLOAD_EBOOK_FILE,
    FAILED_TO_CONVERT_EBOOK_FILE,
    NO_COURSE_TO_UPDATE_EBOOK_SPECIFIED,
    SAME_EBOOK_VERSION,
    INVALID_UPDATED_EBOOK,
    INVALID_EBOOK_STRUCTURE,
    FAILED_TO_UPDATE_EBOOK_ON_COURSE,
    FAILED_TO_LOCK_EBOOKS,
    FAILED_TO_RELEASE_EBOOK_LOCK;

    public String getCode() {
        return toString();
    }
}
