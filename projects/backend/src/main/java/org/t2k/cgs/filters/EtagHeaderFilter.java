package org.t2k.cgs.filters;

import org.apache.log4j.Logger;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.ShallowEtagHeaderFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 17/12/13
 * Time: 07:45
 */
public class EtagHeaderFilter extends ShallowEtagHeaderFilter {
    private static Logger logger = Logger.getLogger(EtagHeaderFilter.class);

    private List<String> includedUrls = new ArrayList<String>(); //prevent NullPointerException if not set
    private List<String> excludedUrls = new ArrayList<String>();  //prevent NullPointerException if not set

    public void setExcludedUrls(List<String> excludedUrls) {
        this.excludedUrls = excludedUrls;
    }

    public void setIncludedUrls(List<String> includedUrls) {
        this.includedUrls = includedUrls;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String requestURI = request.getRequestURI().substring(request.getContextPath().length());
        if (shouldIgnore(requestURI)) {
            //logger.debug("Ignoring " + requestURI);
            filterChain.doFilter(request, response);

        } else {
            super.doFilterInternal(request, response, filterChain);
        }
    }

    boolean shouldIgnore(String path) {
        AntPathMatcher pathMatcher = new AntPathMatcher();

        boolean isIncluded = false;
        for (String included : includedUrls) {
            if (pathMatcher.match(included, path)) {
                isIncluded = true;
            }
        }
        if (!isIncluded) { //ignore if not included in this filter
            return true;
        }

        for (String excluded : excludedUrls) {
            if (pathMatcher.match(excluded, path)) {
                return true; //if explicitly excluded then ignore
            }
        }
        return false;
    }

}
