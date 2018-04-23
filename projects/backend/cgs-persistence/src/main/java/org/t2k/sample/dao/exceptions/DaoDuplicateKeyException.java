package org.t2k.sample.dao.exceptions;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/3/13
 * Time: 6:01 PM
 */
public class DaoDuplicateKeyException extends DaoException {

    private String violatingField = "unknown";

    public DaoDuplicateKeyException(String violatingFiled, Throwable cause) {
        super("Duplicate field constraint violated in field: " + violatingFiled, cause);
        this.violatingField = violatingFiled;
    }

    public DaoDuplicateKeyException(String violatingFiled) {
        super("Duplicate field constraint violated in field: " + violatingFiled);
        this.violatingField = violatingFiled;
    }

    public String getViolatingField() {
        return violatingField;
    }
}
