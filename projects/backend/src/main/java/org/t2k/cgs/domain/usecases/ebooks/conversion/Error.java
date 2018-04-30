package org.t2k.cgs.domain.usecases.ebooks.conversion;


import org.t2k.cgs.domain.model.utils.ErrorCode;

/**
 * @author Alex Burdusel on 2016-06-28.
 */
public class Error {

    private ErrorCode errorCode;
    private String errorMessage;

    public static Error newInstance(ErrorCode errorCode,
                                    String errorMessage) {
        Error error = new Error();
        error.errorCode = errorCode;
        error.errorMessage = errorMessage;
        return error;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}
