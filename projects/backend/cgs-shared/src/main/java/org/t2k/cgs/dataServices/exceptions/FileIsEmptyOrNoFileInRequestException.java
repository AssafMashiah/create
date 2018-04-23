package org.t2k.cgs.dataServices.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 13/11/12
 * Time: 09:02
 */
public class FileIsEmptyOrNoFileInRequestException extends DsException implements CGSException {

    private String errorData;

    public FileIsEmptyOrNoFileInRequestException(String errorData, String msg) {
        super(msg);
        this.errorData = errorData;
    }

    public FileIsEmptyOrNoFileInRequestException(String errorData, String msg, Throwable e) {
        super(msg, e);
        this.errorData = errorData;
    }

    @Override
    public HttpStatus getHttpStatus() {
        return HttpStatus.UNPROCESSABLE_ENTITY;
    }

    @Override
    public int getErrorCode() {
        return ErrorCodes.FILE_IS_EMPTY_OR_NOT_IN_REQUEST;
    }

    @Override
    public Object getErrorData() {
        return this.errorData;
    }
}