package com.t2k.cgs.utils.standards.errors;

/**
 * Exception indicating we failed to create an in memory tree structure from a
 * given CSV
 *
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/19/12
 * Time: 10:18 AM
 */
public class TreeParsingException extends StandardsLoadingException {

    public TreeParsingException() {
    }

    public TreeParsingException(String message) {
        super(message);
    }

    public TreeParsingException(String message, Throwable cause) {
        super(message, cause);
    }

    public TreeParsingException(Throwable cause) {
        super(cause);
    }

}
