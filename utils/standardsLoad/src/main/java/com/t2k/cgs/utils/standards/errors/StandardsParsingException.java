package com.t2k.cgs.utils.standards.errors;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/27/12
 * Time: 11:50 AM
 */
public class StandardsParsingException extends StandardsLoadingException {

    public StandardsParsingException() {
    }

    public StandardsParsingException(String message) {
        super(message);
    }

    public StandardsParsingException(String message, Throwable cause) {
        super(message, cause);
    }

    public StandardsParsingException(Throwable cause) {
        super(cause);
    }


}
