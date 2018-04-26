package org.t2k.cgs.dataServices.exceptions;

import org.springframework.http.HttpStatus;
import org.t2k.cgs.locks.Lock;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 31/10/12
 * Time: 10:05
 */
//@ResponseStatus(value = HttpStatus.LOCKED)
public class LockException extends DsException implements CGSException {


    private List<Lock> locks=new ArrayList<Lock>();


    private int errorCode;

    public LockException() {
        super();
    }

    public LockException(String message) {
        super(message);
    }


    public LockException(int errorCode,String message) {
        super(message);
        this.errorCode=errorCode;
    }


     public LockException(int errorCode,List<Lock> locks,String message) {
        super(message);
        this.errorCode=errorCode;
        this.locks=locks;
    }

    public LockException(int errorCode,List<Lock> locks) {
       super();
       this.errorCode=errorCode;
       this.locks=locks;
   }

     public LockException(int errorCode) {
        super();
        this.errorCode=errorCode;
    }

    public LockException(String message, Throwable cause) {
        super(message, cause);
    }

    public LockException(Throwable cause) {
        super(cause);
    }

    public List<Lock> getLocks() {
        return locks;
    }


    @Override
    public HttpStatus getHttpStatus() {
        return HttpStatus.LOCKED;
    }

    @Override
    public int getErrorCode() {
        return errorCode;
    }

    @Override
    public Object getErrorData() {
        return locks;
    }
}
