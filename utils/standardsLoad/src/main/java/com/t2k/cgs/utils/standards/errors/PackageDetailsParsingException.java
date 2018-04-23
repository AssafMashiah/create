package com.t2k.cgs.utils.standards.errors;

/**
 * Exception indicating we failed to extract package information from the
 * CSV structure
 *
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 11:24 AM
 */
public class PackageDetailsParsingException extends StandardsLoadingException {

    public PackageDetailsParsingException() {
    }

    public PackageDetailsParsingException(String message) {
        super(message);
    }

    public PackageDetailsParsingException(String message, Throwable cause) {
        super(message, cause);
    }

    public PackageDetailsParsingException(Throwable cause) {
        super(cause);
    }


}
