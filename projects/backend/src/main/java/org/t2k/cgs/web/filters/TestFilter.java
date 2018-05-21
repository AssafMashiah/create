package org.t2k.cgs.web.filters;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * A filter used for debugging URL paths/mappings.
 * NOTE: Comment out the @Component annotation when not doing debugging, as this should not be used in production environment
 *
 * @author Alex Burdusel on 2016-08-08.
 */
//@WebFilter(filterName = "testFilter", urlPatterns = "/*") // this is in the servlet context
//@Component(value = "testFilter") // this is in spring root context
@Order(0)
public class TestFilter extends OncePerRequestFilter {

    private static Logger logger = Logger.getLogger(TestFilter.class);

    @Autowired
    private Authentication authentication;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String url = request.getRequestURL().toString();
        logger.info(String.format("URL accessed: %s; Current user: %s", url, authentication.getPrincipal()));
        doFilter(request, response, filterChain);
    }
}
