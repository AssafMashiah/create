package org.t2k.cgs.domain.model.exceptions;

import org.springframework.http.HttpStatus;

/**
 * Created by IntelliJ IDEA.
 * User: Ophir.Barnea
 * Date: 16/01/13
 * Time: 11:55
 */
public interface CGSException {

    HttpStatus getHttpStatus();

    int getErrorCode();

    Object getErrorData();
}