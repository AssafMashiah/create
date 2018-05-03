//package org.t2k.cgs.rest;
//
//import org.apache.log4j.Logger;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.*;
//import org.t2k.cgs.domain.model.usernotifications.UserNotification;
//import org.t2k.cgs.domain.model.usernotifications.UserNotifications;
//import org.t2k.cgs.security.CGSUserDetails;
//import org.t2k.cgs.security.annotations.AllowedForAll;
//import org.t2k.cgs.usernotifications.UserNotificationsService;
//
//import java.util.List;
//
///**
// * Created by IntelliJ IDEA.
// * User: elad.avidan
// * Date: 29/10/14
// * Time: 15:52
// */
//@Controller
//@RequestMapping("/notifications")
//public class NotificationsController {
//
//    private static Logger logger = Logger.getLogger(NotificationsController.class);
//
//    @Autowired
//    private CGSUserDetails currentCgsUserDetails;
//
//    @Autowired
//    private UserNotificationsService userNotificationsService;
//
//    @AllowedForAll
//    @RequestMapping(method = RequestMethod.GET)
//    public
//    @ResponseBody
//    List<UserNotification> getNotifications() throws Exception {
//        try {
//            if (logger.isDebugEnabled()) {
//                logger.debug("getNotifications. username: " + currentCgsUserDetails.getUsername());
//            }
//
//            List<UserNotification> notificationsToShow = userNotificationsService.getNotificationsToShow(currentCgsUserDetails.getUsername());
//            return notificationsToShow;
//        } catch (Exception e) {
//            logger.error("getNotifications error.", e);
//            throw e;
//        }
//    }
//
//    @AllowedForAll
//    @RequestMapping(value = "hide", method = RequestMethod.PUT)
//    public
//    @ResponseBody
//    void hidePackage(@PathVariable String notificationId) throws Exception {
//        try {
//            if (logger.isDebugEnabled()) {
//                logger.debug("hidePackage. notificationId: " + notificationId);
//            }
//
//            userNotificationsService.hidePackage(currentCgsUserDetails.getUsername(), notificationId);
//        } catch (Exception e) {
//            logger.error("hidePackage error.", e);
//            throw e;
//        }
//    }
//}
