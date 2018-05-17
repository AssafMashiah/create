package org.t2k.cgs.security.annotations;

import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.context.WebApplicationContext;

import java.lang.annotation.*;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 10/10/12
 * Time: 4:44 PM
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@PreAuthorize("isAuthenticated() and hasAnyAuthority('EDITOR', 'SYSTEM_ADMIN')")
@Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public @interface AllowedForContentDeveloper {
}
