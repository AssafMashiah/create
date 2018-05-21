package org.t2k.cgs.domain.model.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 06/11/12
 * Time: 09:27
 */

public class FileTooBigException extends DsException implements CGSException{

    private String errorData;


    public FileTooBigException(String errorData, String msg) {
        super(msg);
        this.errorData=errorData;
    }

    public FileTooBigException(String msg, Throwable e) {
        super(msg,e);
    }

    @Override
    public HttpStatus getHttpStatus() {
        return HttpStatus.REQUEST_ENTITY_TOO_LARGE;
    }

    @Override
    public int getErrorCode() {
        return ErrorCodes.FILE_TOO_BIG;
    }

    @Override
    public Object getErrorData() {
        return this.errorData;
    }
}
