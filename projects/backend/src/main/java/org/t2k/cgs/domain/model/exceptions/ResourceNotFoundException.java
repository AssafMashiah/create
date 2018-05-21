package org.t2k.cgs.domain.model.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 05/11/12
 * Time: 11:18
 */

//@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends DsException implements CGSException {

    private String errorData;

    public ResourceNotFoundException() {
        super();
    }

    public ResourceNotFoundException(String errorData, String message) {
        super(message);
        this.errorData = errorData;
    }

    public ResourceNotFoundException(String errorData, String message, Throwable cause) {
        super(message, cause);
        this.errorData = errorData;
    }

    public ResourceNotFoundException(Throwable cause) {
        super(cause);
    }

    @Override
    public HttpStatus getHttpStatus() {
        return HttpStatus.NOT_FOUND;
    }

    @Override
    public int getErrorCode() {
        return ErrorCodes.RESOURCE_NOT_FOUND;
    }

    @Override
    public Object getErrorData() {
        return errorData;
    }
}
