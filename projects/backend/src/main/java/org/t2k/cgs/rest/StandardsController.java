package org.t2k.cgs.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.t2k.configurations.Configuration;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.io.IOUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.t2k.cgs.cms.CmsService;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.standards.StandardPackageDetails;
import org.t2k.cgs.model.standards.StandardsDeleteResponse;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;
import org.t2k.cgs.security.annotations.AllowedForContentDeveloper;
import org.t2k.cgs.standards.StandardsService;
import org.t2k.cgs.user.UserService;

import java.io.File;
import java.io.StringWriter;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 25/06/13
 * Time: 14:46
 */
@RestController
@AllowedForAllUsers
@RequestMapping("/standards")
public class StandardsController {

    private Logger logger = Logger.getLogger(StandardsController.class);

    @Autowired
    private UserService userService;

    @Autowired
    private StandardsService standardsService;

    @Autowired
    private CmsService cmsService;

    @Autowired
    private Configuration configuration;

    @RequestMapping(method = RequestMethod.GET)
    public String getStandardPackagesHeaders() throws Exception {
        logger.debug("getStandardPackagesHeaders");

        try {
            return standardsService.getStandardPackagesHeaders();
        } catch (DsException e) {
            logger.error("getStandardsPackage error.", e);
            throw e;
        }
    }

    @RequestMapping(value = "{packageName}/subjectAreas/{subjectArea}", method = RequestMethod.GET)
    public String getStandardsPackage(@PathVariable String packageName, @PathVariable String subjectArea, @RequestParam(required = false) String version) throws Exception {
        logger.debug(String.format("getStandardsPackage packageName: %s, subjectArea: %s", packageName, subjectArea));

        try {
            return standardsService.getStandardsPackage(packageName, subjectArea, version);
        } catch (DsException e) {
            logger.error("getStandardsPackage error.", e);
            throw e;
        }
    }

    @RequestMapping(method = RequestMethod.DELETE)
    @AllowedForContentDeveloper
    public List<StandardsDeleteResponse> deleteStandardPackage(@RequestParam(value = "name", required = true) String packName, @RequestParam(value = "subjectArea", required = true) String subjectArea) throws Exception {
        logger.debug(String.format("Delete Standard Package.  Name: %s, Area: %s", packName, subjectArea));
        List<StandardsDeleteResponse> deleteResponses = standardsService.getStandardsDeleteResponseList(packName, subjectArea);
        if (deleteResponses.isEmpty()) {
            standardsService.deleteStandardsPackage(packName, subjectArea);
            return null;
        } else {
            return deleteResponses;
        }
    }

    @RequestMapping(method = RequestMethod.POST, headers = "content-type=multipart/*")
    @AllowedForContentDeveloper
    public void addStandardPackage(@RequestParam("file") CommonsMultipartFile multipartFile,
                                   @RequestParam("data") String dataString) throws Exception {
        logger.debug("About to add standard package.");
        File tmpDir = new File(cmsService.getTmpLocation());
        int thresholdSizeInBytes = Integer.parseInt(configuration.getProperty("cms.buffer_size_in_kb")) * 1024;
        // extract FileItems from CommonsMultipartFile[] to keep the existing implementation of file save, after adding CommonsMultipartResolver bean to spring context
        FileItem file = multipartFile.getFileItem();
        if (!file.getName().endsWith(".txt")) {
            throw new IllegalArgumentException("Wrong standards package file type - only *.txt files are allowed.");
        }

        StringWriter writer = new StringWriter();
        IOUtils.copy(file.getInputStream(), writer, "UTF-8");
        String standardPackageText = writer.toString();

        StandardPackageDetails standardPackageDetails = new ObjectMapper().readValue(dataString, StandardPackageDetails.class);

        standardsService.loadStandards(standardPackageText, standardPackageDetails);
    }
}