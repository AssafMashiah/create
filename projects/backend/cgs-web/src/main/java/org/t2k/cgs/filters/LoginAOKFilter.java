//package org.t2k.cgs.filters;
//
//import org.apache.log4j.Logger;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import javax.servlet.FilterChain;
//import javax.servlet.ServletException;
//import javax.servlet.annotation.WebFilter;
//import javax.servlet.http.Cookie;
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//import java.io.IOException;
//
///**
// * Created with IntelliJ IDEA.
// * User: alex.zaikman
// * Date: 08/04/14
// * Time: 11:50
// */
////@Component(value = "loginAOKFilter")
//@WebFilter(filterName = "loginAOKFilter", urlPatterns = "/*", asyncSupported = true)
//public class LoginAOKFilter extends OncePerRequestFilter {
//
//    public static final String HTTP_HTTPS_FLOW = "asz";
//
//    private static Logger logger = Logger.getLogger(LoginAOKFilter.class);
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//
//        boolean aok = false;
//        Cookie[] cookies = request.getCookies();
//        if (cookies != null) {
//            for (Cookie ck : cookies) {
//                if (ck.getName().equals(HTTP_HTTPS_FLOW)) {
//                    aok = true;
//                    break;
//                }
//            }
//        }
//        if (!aok) {
//            logger.info("adding http to https corec flow tag");
//            Cookie foo = new Cookie(HTTP_HTTPS_FLOW, "this.setQuestion(_2b||!_2b)"); //bake cookie
//            foo.setMaxAge(-1);
//            response.addCookie(foo);
//        }
//
//        filterChain.doFilter(request, response);
//    }
//}
