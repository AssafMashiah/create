package org.t2k.cgs.domain.model.exceptions;

/**
 * Created by IntelliJ IDEA.
 * User: Ophir.Barnea
 * Date: 16/01/13
 * Time: 15:21
 */
public class ErrorCodes {

    //validations
    public static int CONTENT_IS_NOT_VALID=1000;
    public static int CONTENT_URL_IS_NOT_VALID=1001;
    public static int SCHEMA_IO_ERROR=1002;
    public static int ID_MISSING=1003;
    public static int NO_ID_ALLOWED=1004;
    public static int ID_EXISTS=1005;
    public static int USER_NOT_VALID = 1006;
    public static int USERNAME_EXISTS=1007;
    public static int EMAIL_EXISTS=1008;
    public static int MISSING_MANDATORY_FIELDS=1009;
    public static int PUBLISHER_ID_DISCREPANCY=1010;
    public static int FIELD_NOT_VALID=1011;


    //locks
    public static int CONTENT_IS_LOCKED=2000;
    public static int CONTENT_IS_NOT_OWNED_BY_USER=2001;
    public static int CONTENT_IS_TRANSACTION_LOCKED=2002;


    //resources
    public static int RESOURCE_NOT_FOUND=3000;
    public static int FILE_TOO_BIG=3001;
    public static int FILE_IS_EMPTY_OR_NOT_IN_REQUEST=3002;
    public static int FILE_TYPE_NOT_ALLOWED=3003;


    //conflict
    public static int CONTENT_IS_NOT_IN_SYNC=4000;

    //other
    public static final int COURSE_ALREADY_IN_PACKAGING = 5000;

    //internal
    public static final int INTERNAL_SERVER_ERROR = 0;

}
