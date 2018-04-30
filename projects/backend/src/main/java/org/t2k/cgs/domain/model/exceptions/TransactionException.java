package org.t2k.cgs.domain.model.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 31/10/12
 * Time: 10:05
 */
//@ResponseStatus(value = HttpStatus.LOCKED)
public class TransactionException extends DsException implements CGSException {

    private int errorCode;

    public TransactionException() {
        super();
    }

    public TransactionException(String message) {
        super(message);
    }


    public TransactionException(int errorCode, String message) {
        super(message);
        this.errorCode=errorCode;
    }


     public TransactionException(int errorCode) {
        super();
        this.errorCode=errorCode;
    }

    public TransactionException(String message, Throwable cause) {
        super(message, cause);
    }

    public TransactionException(Throwable cause) {
        super(cause);
    }



    @Override
    public HttpStatus getHttpStatus() {
        return HttpStatus.LOCKED;
    }

    @Override
    public int getErrorCode() {
        return errorCode;
    }


}
