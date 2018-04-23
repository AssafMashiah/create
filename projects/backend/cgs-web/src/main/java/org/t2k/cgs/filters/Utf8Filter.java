package org.t2k.cgs.filters;

import javax.servlet.*;
import java.io.IOException;

public class Utf8Filter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        //if(request.getCharacterEncoding() == null)
        request.setCharacterEncoding("UTF8");
        response.setCharacterEncoding("UTF8");
        chain.doFilter(request, response);
    }

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
    }

    @Override
    public void destroy() {
    }

}
