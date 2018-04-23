package org.t2k.cgs.dataServices.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.validation.Errors;
import org.springframework.validation.ObjectError;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 22/11/12
 * Time: 13:49
 */

public class ValidationException extends DsException implements CGSException {

    //set as default code
    private int errorCode = ErrorCodes.CONTENT_IS_NOT_VALID;

    private String errorDataStr;
    private List<String> errorData;

    public ValidationException(Errors errors, int errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.errorData = new ArrayList<String>();

        /*StringBuilder str = new StringBuilder();
        boolean isFirst = true;
        str.append('[');*/
        for (ObjectError error : errors.getAllErrors()) {
           /* if(!isFirst){
                str.append(", ");
            }
            str.append('"' + error.getCode() + '"');
            isFirst = false;*/
            this.errorData.add(error.getCode());
        }
        /*str.append(']');
        this.errorData = str.toString();*/
    }

    public ValidationException(String errorFieldCode, int errorCode, String message) {
           super(message);
           this.errorCode = errorCode;
           this.errorData = Arrays.asList(errorFieldCode);
       }

    public ValidationException(Throwable cause, int errorCode, String message) {
        super(message, cause);
        this.errorCode = errorCode;
        this.errorDataStr = message;
    }

    public ValidationException(int errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.errorDataStr = message;
    }

    public ValidationException(int errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.errorDataStr = message;
    }

    @Override
    public HttpStatus getHttpStatus() {
        return HttpStatus.UNPROCESSABLE_ENTITY;
    }

    @Override
    public int getErrorCode() {
        return errorCode;
    }

    @Override
    public Object getErrorData() {
        if( errorData != null) {
            return errorData;
        }  else {
            return errorDataStr;
        }
    }
}
