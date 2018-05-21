package org.t2k.cgs.domain.model.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 19/11/12
 * Time: 16:39
 */

public class PackagingException extends DsException implements CGSException{

    private int errorCode;
    private String errorData;
    private  HttpStatus _status=null;

    public PackagingException() {
         super();
     }


     public PackagingException(int errorCode,String errorData,String message) {
         super(message);
         this.errorCode=errorCode;
         this.errorData=errorData;
     }


    public PackagingException(int errorCode,String errorData,String message, HttpStatus status) {
        super(message);
        this.errorCode=errorCode;
        this.errorData=errorData;
        this._status=status;
    }

    @Override
    public HttpStatus getHttpStatus() {
        if(this._status!=null)
            return this._status;

        return HttpStatus.NOT_ACCEPTABLE;
    }


    @Override
    public int getErrorCode() {
        return errorCode;
    }

    @Override
    public Object getErrorData() {
        return this.errorData;
    }
}
