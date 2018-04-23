package org.t2k.cgs.model.logging.logLevels;

import org.apache.log4j.Level;


/**
 * This is a custom {@link org.apache.log4j.Level} for security logging. Nods to Jaikiran Pai for
 * his example code {@linkplain http://jaikiran.wordpress.com/2006/07/12/create-your-own-logging-level-in-log4j/} of which
 * this is a total bite. Also, thanks to Roman Hustad for helped me realize I should stop bitching about Log4j
 * not having one of these and make it myself.
 *
 * If you're getting a "No appenders could be found" error, make sure your log4j.xml or log4j.properties file
 * is on the classpath, because it isn't.
 *
 * @author Arshan Dabirsiaghi
 *
 */

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 14/08/14
 * Time: 09:51
 */



public class AuditLevel extends Level {

    /**
     * Value of security level. This value is slightly higher than {@link org.apache.log4j.Priority#INFO_INT}.
     */
    public static final int AUDIT_LEVEL_INT = Level.DEBUG_INT + 1;

    /**
     * {@link Level} representing my log level
     */
    public static final Level AUDIT = new AuditLevel(AUDIT_LEVEL_INT,"AUDIT",7);

    private static final String AUDIT_MSG = "AUDIT";

    /**
     * Default constructor.
     */
    protected AuditLevel(int arg0, String arg1, int arg2) {
        super(arg0, arg1, arg2);

    }

    /**
     * Checks whether <code>sArg</code> is "SECURITY" level. If yes then returns {@link AuditLevel#AUDIT},
     * else calls {@link AuditLevel#toLevel(String, Level)} passing it {@link Level#DEBUG} as the defaultLevel
     *
     * @see Level#toLevel(java.lang.String)
     * @see Level#toLevel(java.lang.String, org.apache.log4j.Level)
     *
     */
    public static Level toLevel(String sArg) {
        if (sArg != null && sArg.toUpperCase().equals(AUDIT_MSG)) {
            return AUDIT;
        }
        return (Level) toLevel(sArg, Level.DEBUG);
    }

    /**
     * Checks whether <code>val</code> is {@link AuditLevel#AUDIT_LEVEL_INT}. If yes then returns {@link AuditLevel#AUDIT},
     * else calls {@link AuditLevel#toLevel(int, Level)} passing it {@link Level#DEBUG} as the defaultLevel
     *
     * @see Level#toLevel(int)
     * @see Level#toLevel(int, org.apache.log4j.Level)
     *
     */
    public static Level toLevel(int val) {
        if (val == AUDIT_LEVEL_INT) {
            return AUDIT;
        }
        return (Level) toLevel(val, Level.DEBUG);
    }

    /**
     * Checks whether <code>val</code> is {@link AuditLevel#AUDIT_LEVEL_INT}. If yes then returns {@link AuditLevel#AUDIT},
     * else calls {@link Level#toLevel(int, org.apache.log4j.Level)}
     *
     * @see Level#toLevel(int, org.apache.log4j.Level)
     */
    public static Level toLevel(int val, Level defaultLevel) {
        if (val == AUDIT_LEVEL_INT) {
            return AUDIT;
        }
        return Level.toLevel(val,defaultLevel);
    }

    /**
     * Checks whether <code>sArg</code> is "SECURITY" level. If yes then returns {@link AuditLevel#AUDIT},
     * else calls {@link Level#toLevel(java.lang.String, org.apache.log4j.Level)}
     *
     * @see Level#toLevel(java.lang.String, org.apache.log4j.Level)
     */
    public static Level toLevel(String sArg, Level defaultLevel) {
        if(sArg != null && sArg.toUpperCase().equals(AUDIT_MSG)) {
            return AUDIT;
        }
        return Level.toLevel(sArg,defaultLevel);
    }


}
