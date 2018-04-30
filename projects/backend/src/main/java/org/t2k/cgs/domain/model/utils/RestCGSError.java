package org.t2k.cgs.domain.model.utils;


import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.http.HttpStatus;

import java.io.Serializable;

/**
 * Created by IntelliJ IDEA.
 * User: Ophir.Barnea
 * Date: 16/01/13
 * Time: 14:01
 */
@JsonAutoDetect
public class RestCGSError implements Serializable {

    private int errorCode;
    private Object errorData;
    private HttpStatus httpStatus;
    private String message;


    public RestCGSError() {
    }

    public RestCGSError(int errorCode, Object errorData, HttpStatus httpStatus, String message) {
        this.errorCode = errorCode;
        this.errorData = errorData;
        this.httpStatus = httpStatus;
        this.message = message;
    }

    @JsonProperty(value = "errorId")
    public int getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(int errorCode) {
        this.errorCode = errorCode;
    }


    @JsonProperty(value = "data")
    public Object getErrorData() {
        return errorData;
    }

    public void setErrorData(Object errorData) {
        this.errorData = errorData;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public void setHttpStatus(HttpStatus httpStatus) {
        this.httpStatus = httpStatus;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * Returns a brief description of this RestCGSError. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * RestCGSError{"errorCode": 403, "errorData": "Access is denied", "httpStatus": 403}
     */
    @Override
    public String toString() {
        return "RestCGSError{" +
                "\"errorCode\": " + errorCode +
                ", \"errorData\": " + errorData +
                ", \"httpStatus\": " + httpStatus +
                ", \"message\": \"" + message + '\"' +
                '}';
    }
}
