package org.t2k.sample.dao.exceptions;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 03/10/12
 * Time: 16:21
 */
public class DaoException extends Exception {

	public DaoException() {
	}

	public DaoException(String message) {
		super(message);
	}

	public DaoException(String message, Throwable cause) {
		super(message, cause);
	}

	public DaoException(Throwable cause) {
		super(cause);
	}

}