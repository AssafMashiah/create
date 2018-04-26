package org.t2k.cgs.audit;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 03/12/12
 * Time: 08:55
 *
 * Annotate parameters in order for their value to be ignored while logging
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface DontAuditMe {
}
