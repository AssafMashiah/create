package org.t2k.cgs.web.rest;

import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;
import org.t2k.cgs.domain.usecases.packaging.CGSPackage;
import org.t2k.cgs.domain.usecases.packaging.CoursePackageParams;
import org.t2k.cgs.domain.usecases.packaging.PackageManager;
import org.t2k.cgs.domain.usecases.packaging.PackagingService;
import org.t2k.cgs.domain.usecases.packaging.packageResponses.*;
import org.t2k.cgs.domain.model.user.CGSUserDetails;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 27/11/12
 * Time: 17:12
 */
@RestController
@AllowedForAllUsers
@RequestMapping("/publishers/{publisherId}/packages")
public class PackagingController {

    private static Logger logger = Logger.getLogger(PackagingController.class);
    private static Logger publishLog = Logger.getLogger("publishing");

    @Autowired
    private PackageManager packageManager;

    @Autowired
    private PackagingService packagingService;

    @Autowired
    private CGSUserDetails currentCgsUserDetails;

    @RequestMapping(value = "{packageId}/download", method = RequestMethod.GET)
    // If this URL is changed, you MUST(!!!) update the bean etagHeaderFilter in the excludedUrls property in applicationContext-web-common.xml file.
    public void downloadPackagedCourseZip(@PathVariable String packageId, HttpServletRequest request, HttpServletResponse response) throws Exception {
        publishLog.debug("Starting --> downloadPackageCourseZip().  From IP: " + request.getRemoteUser());

        publishLog.debug(getClientInfo(request));
        logger.debug(String.format("downloadPackagedCourseZip. About to download the zipped file of packageId %s", packageId));
        CGSPackage cgsPackage = packagingService.getPackage(packageId);
        File file = new File(cgsPackage.getZippedFileToDownloadLocation());

        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", file.getName()));
        ServletOutputStream outputStream = response.getOutputStream();

        if (!file.exists()) {
            String errorMsg = String.format("No file to download for packageId %s", packageId);
            logger.warn(String.format("downloadPackagedCourseZip: %s", errorMsg));
            throw new Exception(errorMsg);
        }

        try {
            BufferedInputStream in = new BufferedInputStream(new FileInputStream(file));
            IOUtils.copy(in, outputStream);
        } catch (IOException e) {
            logger.error("getPackagedCourseZip: IO Error.", e);
            throw e;
        } finally {
            if (file.exists()) {
                try { // cleanup
                    Files.deleteIfExists(Paths.get(file.getPath().replace(".zip", "")));
                } catch (Exception e) {
                    logger.error(String.format("getPackagedCourseZip: Package delete failed: %s", file.getPath().replace(".zip", "")), e);
                    new File(file.getPath().replace(".zip", "")).deleteOnExit();
                }
            }
        }
    }

    @RequestMapping(method = RequestMethod.POST)
    public CGSPackage packageCourse(@PathVariable int publisherId,
                                    @RequestBody CoursePackageParams params,
                                    HttpServletRequest request) throws Exception {
        publishLog.debug("START packageCourse()");
        publishLog.debug(String.format("Course ID ...: %s", params.getCourseId()));
        publishLog.debug(String.format("Version .....: %s", params.getVersion()));
        publishLog.debug(getClientInfo(request));

        if (logger.isDebugEnabled()) {
            logger.debug(String.format("packageCourse. courseId: %s", params.getCourseId()));
        }

        try {
            return packageManager.createPackageAndAddToPendingQueue(publisherId, params, currentCgsUserDetails);
        } catch (Exception e) {
            logger.error("packageCourse error.", e);
            throw e;
        }
    }

    @RequestMapping(value = "{packageId}", method = RequestMethod.GET)
    public CGSPackage getCGSPackage(@PathVariable int publisherId, @PathVariable String packageId) throws Exception {
        try {
            return packagingService.getPackage(packageId);
        } catch (Exception e) {
            logger.error(String.format("getCGSPackage. packageId: %s, publisherId: %d. Error: ", packageId, publisherId), e);
            throw e;
        }
    }

    @RequestMapping(value = "{packageId}", method = RequestMethod.PUT)
    public void cancelPackageProcess(@PathVariable int publisherId, @PathVariable String packageId, @RequestParam(required = true) String action, HttpServletRequest request) throws Exception {

        publishLog.debug("Starting cancelPackageProcess().  From IP: " + request.getRemoteUser());

        publishLog.debug(getClientInfo(request));

        try {
            if (logger.isDebugEnabled()) {
                logger.debug("cancelPackageProcess. packageId: " + packageId);
            }

            Assert.isTrue("cancel".equalsIgnoreCase(action));
            packageManager.stopPackage(packageId);
        } catch (Exception e) {
            logger.error("cancelPackageProcess error.", e);
            throw e;
        }
    }

    @RequestMapping(value = "courses/{courseId}", method = RequestMethod.GET)
    public List<CGSPackage> getCGSPackagesByCourse(@PathVariable int publisherId, @PathVariable String courseId) throws Exception {
        try {
            if (logger.isDebugEnabled()) {
                logger.debug("getCGSPackagesByCourse. publisherId: " + publisherId);
            }

            return packagingService.getPackagesByCourse(courseId);
        } catch (Exception e) {
            logger.error("getCGSPackagesByCourse error.", e);
            throw e;
        }
    }

    @RequestMapping(method = RequestMethod.GET)
    public List<PackageResponseBase> getActiveCgsPackagesBySessionUser(@PathVariable int publisherId) throws Exception {
        String username = currentCgsUserDetails.getUsername();
        try {
            List<CGSPackage> cgsPackages = packagingService.getCgsPackagesToDisplayByUsername(username);
            List<PackageResponseBase> packagesResponse = new ArrayList<>(cgsPackages.size());
            for (CGSPackage cgsPackage : cgsPackages) {
                switch (cgsPackage.getPublishTarget()) {
                    case COURSE_TO_CATALOG:
                        packagesResponse.add(new PackageResponseBase(cgsPackage));
                        break;
                    case LESSON_TO_CATALOG:
                        packagesResponse.add(new PackageResponseWithSelectedTocItems(cgsPackage));
                        break;
                    case COURSE_TO_FILE:
                        packagesResponse.add(new PackageResponseWithZip(cgsPackage));
                        break;
                    case LESSON_TO_FILE:
                        packagesResponse.add(new PackageResponseWithZipAndSelectedTocItems(cgsPackage));
                        break;
                    case COURSE_TO_URL:
                        packagesResponse.add(new PackageResponseTinyKey(cgsPackage));
                        break;
                    case LESSON_TO_URL:
                        packagesResponse.add(new PackageResponseTinyKey(cgsPackage));
                        break;
                }
            }
            return packagesResponse;
        } catch (Exception e) {
            logger.error("getActiveCgsPackagesBySessionUser error.", e);
            throw e;
        }
    }

    @RequestMapping(value = "{packageId}/hide", method = RequestMethod.PUT)
    public void hidePackage(@PathVariable String packageId) throws Exception {
        if (logger.isDebugEnabled()) {
            logger.debug("hidePackage. packageId: " + packageId);
        }

        try {
            packageManager.hidePackage(packageId);
        } catch (Exception e) {
            logger.error("hidePackage error.", e);
            throw e;
        }
    }

    public String getClientInfo(HttpServletRequest request) {

        Principal userPrincipal = request.getUserPrincipal();
        String principalName = null;
        if (userPrincipal != null) {
            principalName = userPrincipal.getName();
        }
        String username = currentCgsUserDetails.getUsername();

        StringBuilder sb = new StringBuilder();

        sb.append(NEW_LINE).append("---[ REQUEST INFO ]---").append(NEW_LINE);
        sb.append("Remote User ..........................: ").append(request.getRemoteUser()).append(NEW_LINE);
        sb.append("Remote IP ............................: ").append(request.getRemoteAddr()).append(NEW_LINE);
        sb.append("Remote Host:Port .....................: ").append(request.getRemoteHost()).append(":").append(request.getRemotePort()).append(NEW_LINE);
        sb.append("Session Id ............................: ").append(request.getRequestedSessionId()).append(NEW_LINE);
        sb.append("Path Info ............................: ").append(request.getPathInfo()).append(NEW_LINE);
        sb.append("Context Path ............................: ").append(request.getContextPath()).append(NEW_LINE);
        sb.append("Query String ............................: ").append(request.getQueryString()).append(NEW_LINE);
        sb.append("Request URI ............................: ").append(request.getRequestURI()).append(NEW_LINE);
        sb.append("Servlet Path ............................: ").append(request.getServletPath()).append(NEW_LINE);
        sb.append("Principal Name ............................: ").append(principalName).append(NEW_LINE);
        sb.append("User Name ...............................: ").append(username).append(NEW_LINE);
        sb.append("Request Schema  ............................: ").append(request.getScheme()).append(NEW_LINE);
        sb.append("Server Name:Port ..........................: ").append(request.getServerName()).append(":").append(request.getServerPort()).append(NEW_LINE);
//        sb.append(getAllRequestParams(request)).append(NEW_LINE);

        return sb.toString();
    }

    private String getAllRequestParams(HttpServletRequest request) {

        Map paramsMap = request.getParameterMap();
        Set keys = paramsMap.keySet();

        StringBuilder sb = new StringBuilder();
        sb.append(NEW_LINE).append(" ---[  Request Parameters ]---:").append(NEW_LINE);

        for (Object key : keys) {
            Object value = paramsMap.get(key);
            sb.append(key).append(": ").append(value).append(NEW_LINE);
        }

        sb.append(NEW_LINE);

        return sb.toString();
    }

    public static final String NEW_LINE = System.getProperty("line.separator", "\n");
}