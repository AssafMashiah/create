package org.t2k.cgs.domain.model.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Created by IntelliJ IDEA.
 * User: Ophir.Barnea
 * Date: 20/01/13
 * Time: 18:10
 */
public class ConflictException extends DsException implements CGSException{

    private String errorData;


     public ConflictException(String errorData,String message) {
        super(message);
        this.errorData=errorData;
    }


    @Override
    public HttpStatus getHttpStatus() {
        return HttpStatus.CONFLICT;
    }

    @Override
    public int getErrorCode() {
         return ErrorCodes.CONTENT_IS_NOT_IN_SYNC;
    }

    @Override
    public Object getErrorData() {
        return errorData;
    }
}
