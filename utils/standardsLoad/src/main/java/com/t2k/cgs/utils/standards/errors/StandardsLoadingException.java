package com.t2k.cgs.utils.standards.errors;

/**
 * General exception in the standards loading process
 *
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/19/12
 * Time: 8:47 AM
 */
public class StandardsLoadingException extends Exception {

    public StandardsLoadingException() {
    }

    public StandardsLoadingException(String message) {
        super(message);
    }

    public StandardsLoadingException(String message, Throwable cause) {
        super(message, cause);
    }

    public StandardsLoadingException(Throwable cause) {
        super(cause);
    }

}
