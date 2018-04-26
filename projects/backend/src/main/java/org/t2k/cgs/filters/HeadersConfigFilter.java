package org.t2k.cgs.filters;

import org.joda.time.DateTime;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 15/07/13
 * Time: 17:25
 */
public class HeadersConfigFilter implements Filter {

    private FilterConfig filterConfig;

    private final String OVERRIDE_EXISTING_HEADER = "overrideExistingHeader";
    private final String TRUE = "true";

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        this.filterConfig = filterConfig;
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;
        Enumeration<String> initParameterNames = filterConfig.getInitParameterNames();
        HashMap<String, String> headersToAdd = new HashMap<>();
        while (initParameterNames.hasMoreElements()) {
            String headerName = initParameterNames.nextElement();
            String headerValue = filterConfig.getInitParameter(headerName);
            headersToAdd.put(headerName, headerValue);
        }

        if (headersToAdd.containsKey(OVERRIDE_EXISTING_HEADER)) {    // if the config has the overrideExisting flag - check its value
            String overrideExisting = headersToAdd.get(OVERRIDE_EXISTING_HEADER);
            headersToAdd.remove(OVERRIDE_EXISTING_HEADER);
            if (overrideExisting.equals(TRUE)) {   // override existing headers with the values passed
                for (Map.Entry<String, String> header : headersToAdd.entrySet()) {
                    response.setHeader(header.getKey(), header.getValue()); // use response.setHeader() to set the header, replaces current value if exists
                }                                                      // // header with the value passed to
                chain.doFilter(request, response);
                return;
            }
        }

        if (request.getPathInfo() != null && request.getPathInfo().contains("/ebooks/")) {
            addEBookAssetsToCache(headersToAdd);
        }

        // if the overrideExistingHeader flag is false, or doesn't exist - add headers to each parameter passed
        for (Map.Entry<String, String> header : headersToAdd.entrySet()) {
            response.addHeader(header.getKey(), header.getValue()); // use response.addHeader() that adds this header to existing one.
        }

        chain.doFilter(request, response);
    }

    /**
     * Adds the eBook asset to cache on client's browser by adding "Cache-Control" and "Expires" keys to response's header
     *
     * @param headersToAdd
     */
    private void addEBookAssetsToCache(HashMap<String, String> headersToAdd) {
        headersToAdd.put("Cache-Control", "maxage=604800, private");

        DateTime expiresDate = new DateTime().plusYears(2);
        String expires = new SimpleDateFormat("EEE, d MMM yyyy HH:mm:ss zzz", Locale.ENGLISH).format(expiresDate.toDate()); // HTTP header date format: Thu, 01 Dec 1994 16:00:00 GMT
        headersToAdd.put("Expires", expires);
    }

    @Override
    public void destroy() {
        //To change body of implemented methods use File | Settings | File Templates.
    }
}