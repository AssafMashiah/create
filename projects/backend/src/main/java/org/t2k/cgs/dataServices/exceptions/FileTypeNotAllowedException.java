package org.t2k.cgs.dataServices.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 17/01/13
 * Time: 11:53
 */
public class FileTypeNotAllowedException extends DsException implements CGSException {

    private String errorData;

    public FileTypeNotAllowedException(String errorData) {
        super();
        this.errorData = errorData;
    }

    public FileTypeNotAllowedException(String errorData, String msg) {
        super(msg);
        this.errorData = errorData;
    }

    public FileTypeNotAllowedException(String msg, Throwable e) {
        super(msg, e);
    }

    @Override
    public HttpStatus getHttpStatus() {
        return HttpStatus.UNSUPPORTED_MEDIA_TYPE;
    }

    @Override
    public int getErrorCode() {
        return ErrorCodes.FILE_TYPE_NOT_ALLOWED;
    }

    @Override
    public Object getErrorData() {
        return this.errorData;
    }
}