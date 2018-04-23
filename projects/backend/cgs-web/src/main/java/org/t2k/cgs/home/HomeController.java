package org.t2k.cgs.home;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.CookieClearingLogoutHandler;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.t2k.cgs.security.CGSUserDetails;
import org.t2k.cgs.security.OAuthSecurityService;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import static org.t2k.cgs.config.WebSecurityConfig.ANONYMOUS_USER;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 10/30/12
 * Time: 9:53 AM
 */
@Controller
public class HomeController {

    private Logger logger = Logger.getLogger(HomeController.class);

    @Autowired
    private OAuthSecurityService authSecurityService;

    @Autowired
    private CGSUserDetails currentUser;

    @Autowired
    private Authentication authentication;

    @RequestMapping(value = {"", "/", "/client", "/client/home"})
    public String index() {
        return "redirect:/defaultEntry";
    }

//    @AllowedForContentDeveloper
    @RequestMapping(value = {"/home"}, method = RequestMethod.GET)
    public String openHomePage() throws Exception {
        if (authentication.isAuthenticated() && !ANONYMOUS_USER.equals(authentication.getName())) {
            return "index";
        } else {
            return "redirect:/defaultEntry";
        }
    }

    @RequestMapping(value = "/auth/login", method = RequestMethod.GET)
    public String loginSecure() {
        if (authentication.isAuthenticated() && !ANONYMOUS_USER.equals(authentication.getName())) {
            return "redirect:/defaultEntry";
        } else {
            return "auth/login"; //get /cgs/auth/login.jsp
        }
    }

    @RequestMapping(value = "/auth/login-strings", method = RequestMethod.GET)
    public String loginStrings() {
        return "auth/login-strings";
    }

    @RequestMapping(value = "/auth/logout-success", method = RequestMethod.GET)
    public String logoutSuccess() {
        return "redirect:/defaultEntry";
    }

    @RequestMapping(value = "/auth/login-oauth2", method = RequestMethod.GET)
    public String LoginOAuth2(HttpServletRequest request, HttpServletResponse response) {
        String jwt = request.getParameter("jwt"); // authentication token from url
        boolean success;
        try {
            success = authSecurityService.authenticate(jwt, request);
        } catch (Exception e) {
            logger.error(String.format("Error authenticating with jwt: %s", jwt), e);
            success = false;
        }
        String redirectString;
        if (success) {
            redirectString = "redirect:/defaultEntry";
            // creating another session in cookie that handles http (not *https*) login
            String jsessionId = request.getSession().getId();
            Cookie securedSessionCookie = new Cookie("JSESSIONID", jsessionId); //bake cookie
            securedSessionCookie.setPath(request.getContextPath());
            securedSessionCookie.setSecure(true);
            response.addCookie(securedSessionCookie);
        } else {
            authSecurityService.invalidateAuthentication();
            redirectString = "/auth/external-login-failed";
        }
        return redirectString;
    }

    @RequestMapping(value = "/auth/external-logout", method = RequestMethod.GET)
    public String logoutSuccessFromExternalSystem(HttpServletRequest request, HttpServletResponse response) {
        // perform logs out - clear cookie
        LogoutHandler handlerToInvalidateSessions = new SecurityContextLogoutHandler();
        handlerToInvalidateSessions.logout(request, null, null); // invalidates the session
        logger.debug("Invalidating session");

        LogoutHandler cookieClearingLogoutHandler = new CookieClearingLogoutHandler("jsessionid");
        cookieClearingLogoutHandler.logout(request, response, null);
        return "/auth/external-logout-success"; //redirection
    }


    /**
     * Redirect users to their default page based on their role
     *
     * @return url redirection
     */
    @RequestMapping(value = "/defaultEntry", method = RequestMethod.GET)
    public String defaultEntry() {
        if (authentication.isAuthenticated() && !ANONYMOUS_USER.equals(authentication.getName())) {
            if (currentUser.getRole().getName().equals("T2K_ADMIN")) {
                return "redirect:/admin/home"; // no longer in use
            } else {
                return "redirect:/client/home";      //redirect /cgs/client/home (absolute path)
            }
        } else {
            return "redirect:/auth/login";
        }
    }
}
