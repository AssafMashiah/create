//package org.t2k.cgs.filters;
//
//import org.apache.log4j.Logger;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.core.env.Environment;
//import org.springframework.web.filter.OncePerRequestFilter;
//import org.t2k.cgs.config.SpringProfiles;
//
//import javax.servlet.FilterChain;
//import javax.servlet.ServletException;
//import javax.servlet.annotation.WebFilter;
//import javax.servlet.http.Cookie;
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//import java.io.IOException;
//import java.util.Arrays;
//
///**
// * Created with IntelliJ IDEA.
// * User: alex.zaikman
// * Date: 08/04/14
// * Time: 10:35
// */
//@WebFilter(filterName = "loginSecurityFilter", urlPatterns = "/auth/login", asyncSupported = true)
//public class LoginSecurityFilterChain extends OncePerRequestFilter {
//
//    @Autowired
//    private Environment env; // this will be null on production environment, as it is not autowired in servlet context. In spring-boot, for some reason, it is autowired
//
//    private static Logger logger = Logger.getLogger(LoginSecurityFilterChain.class);
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//
//        boolean aok = false;
//
//        String url = request.getRequestURL().toString();
//        String redirectUrl = url.toLowerCase().trim().replace("https", "http").replace("/auth/login/", "");
//        if (env != null && Arrays.asList(env.getActiveProfiles()).contains(SpringProfiles.DEVELOPMENT)) {
//            String httpPort = env.getProperty("server.port");
//            String httpsPort = env.getProperty("server.https.port");
//            redirectUrl = redirectUrl.replace(httpsPort, httpPort);
//        }
//
//        Cookie[] cookies = request.getCookies();
//        if (cookies != null) {
//
//            for (Cookie ck : cookies) {
//                if (ck.getName().equals(LoginAOKFilter.HTTP_HTTPS_FLOW)) {
//                    aok = true;
//                }
//            }
//
//            if (!aok) {
//                logger.info("should go throw http redirecting to " + redirectUrl);
//                response.sendRedirect(redirectUrl);
//            } else {
//                filterChain.doFilter(request, response);
//            }
//
//        } else {
//            logger.info("should go throw http redirecting to " + redirectUrl);
//            response.sendRedirect(redirectUrl);
//        }
//    }
//}
