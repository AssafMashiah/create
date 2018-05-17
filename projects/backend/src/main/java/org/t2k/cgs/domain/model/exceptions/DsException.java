package org.t2k.cgs.domain.model.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 03/10/12
 * Time: 15:32
 */

//@ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
public class DsException extends Exception implements CGSException{

    public DsException() {
        super();
    }

    public DsException(String message) {
        super(message);
    }

    public DsException(String message, Throwable cause) {
        super(message, cause);
    }

    public DsException(Throwable cause) {
        super(cause);
    }
    
    @Override
    public HttpStatus getHttpStatus() {
       return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    @Override
    public int getErrorCode() {
        return ErrorCodes.INTERNAL_SERVER_ERROR;
    }

    @Override
    public Object getErrorData() {
        return getMessage();
    }
}