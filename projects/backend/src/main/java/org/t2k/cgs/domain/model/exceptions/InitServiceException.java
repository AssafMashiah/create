package org.t2k.cgs.domain.model.exceptions;

/**
 * Created by IntelliJ IDEA.
 * User: Ophir.Barnea
 * Date: 13/12/12
 * Time: 10:57
 */
public class InitServiceException extends RuntimeException {

    public InitServiceException(String msg) {
        super(msg);
    }

    public InitServiceException(String msg, Throwable e) {
        super(msg, e);
    }
}
