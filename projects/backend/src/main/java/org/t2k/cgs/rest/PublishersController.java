package org.t2k.cgs.rest;

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.t2k.cgs.customIcons.PublisherCustomIconsPack;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.utils.CustomIconFiles;
import org.t2k.cgs.publisher.ExternalPartnersService;
import org.t2k.cgs.publisher.PublisherService;
import org.t2k.cgs.rest.dto.CustomIconCreationDTO;
import org.t2k.cgs.security.CGSUserDetails;
import org.t2k.cgs.security.ExternalPartnerSettings;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;
import org.t2k.cgs.cms.CmsService;

import java.io.File;
import java.io.IOException;
import java.util.List;


/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 3/1/15
 * Time: 6:29 PM
 */
@RestController
@AllowedForAllUsers
public class PublishersController {

    private Logger logger = Logger.getLogger(PublishersController.class);

    @Autowired
    private PublisherService publisherService;

    @Autowired
    private CGSUserDetails currentUser;

    @Autowired
    private ExternalPartnersService externalPartnersService;

    @Autowired
    private CmsService cmsService;

    @RequestMapping(value = "/publishers/{publisherId}", method = RequestMethod.GET)
    public String getPublisher(@PathVariable int publisherId) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("getPublisher. publisherId :" + publisherId);
        }
        return publisherService.getPublisher(publisherId);
    }

    @RequestMapping(value = "/publishers", method = RequestMethod.GET)
    public String getPublishers() throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("getPublishers");
        }
        return publisherService.getPublishers();

    }

    @RequestMapping(value = "/groups", method = RequestMethod.GET)
    public String getGroups() throws Exception {
        if (logger.isDebugEnabled()) {
            logger.debug("getGroups");
        }
        return publisherService.getGroups();
    }

    @RequestMapping(value = "publishers/{accountId}/search", method = RequestMethod.GET)
    public String getPublishersByGroupId(@RequestParam(value = "type", required = true) String type,
                                         @PathVariable int accountId) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("getPublishers");
        }

        try {
            return publisherService.getPublishersByRelatesTo(accountId, type);
        } catch (DsException e) {
            logger.error("getPublishers error.", e);
            throw e;
        }

    }

    @RequestMapping(value = "/publishers", method = RequestMethod.POST)
    public String createPublisher(@RequestBody String publisherJson) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("createPublisher");
        }

        try {
            return publisherService.createPublisher(publisherJson);
        } catch (DsException e) {
            logger.error("createPublisher error.", e);
            throw e;
        }

    }


    @RequestMapping(value = "/groups", method = RequestMethod.POST)
    public String createGroup(@RequestBody String groupJson) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("createGroup");
        }

        try {
            return publisherService.createGroup(groupJson);
        } catch (DsException e) {
            logger.error("createPublisher error.", e);
            throw e;
        }

    }


    @RequestMapping(value = "/publishers", method = RequestMethod.PUT)
    public void updatePublisher(@RequestBody String publisherJson) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("updatePublisher");
        }

        try {
            publisherService.updatePublisher(publisherJson);
        } catch (DsException e) {
            logger.error("updatePublisher error.", e);
            throw e;
        }

    }

    @RequestMapping(value = "/groups", method = RequestMethod.PUT)
    public void updateGroup(@RequestBody String groupJson) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("updateGroup");
        }

        try {
            publisherService.updateGroup(groupJson);
        } catch (DsException e) {
            logger.error("updateGroup error.", e);
            throw e;
        }

    }


    @RequestMapping(value = "/publishers/{publisherId}", method = RequestMethod.DELETE)
    public void deletePublisher(@PathVariable int publisherId) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("deletePublisher");
        }
        try {
            publisherService.deletePublisher(publisherId);
        } catch (DsException e) {
            logger.error("deletePublisher error.", e);
            throw e;
        }
    }


    @RequestMapping(value = "/groups/{groupId}", method = RequestMethod.DELETE)
    public void deleteGroup(@PathVariable int groupId) throws Exception {

        if (logger.isDebugEnabled()) {
            logger.debug("deleteGroup");
        }
        try {
            publisherService.deleteGroup(groupId);
        } catch (DsException e) {
            logger.error("deleteGroup error.", e);
            throw e;
        }
    }

    @RequestMapping(value = "/publishers/{publisherId}/externalId", method = RequestMethod.GET)
    public List<ExternalPartnerSettings> getExternalPartners(@PathVariable int publisherId) {
        return externalPartnersService.getExternalPartnersByPublisherId(publisherId);
    }

    @RequestMapping(value = "/publishers/{publisherId}/mediaTranscodingServiceEnabled", method = RequestMethod.GET)
    public boolean isMediaTranscodingEnabled() {
        return cmsService.isMediaTranscodingServiceAvailable();
    }

    @RequestMapping(value = "/publishers/{publisherId}/addCustomFontFile/{fontType}", method = RequestMethod.POST)
    public ResponseEntity<CustomIconCreationDTO> addCustomIconsFile(@RequestParam MultipartFile multiPartFile,
                                                                    @PathVariable int publisherId,
                                                                    @PathVariable String fontType) throws IOException {
        CustomIconFiles outputCustomIconFiles;
        PublisherCustomIconsPack addedToPublisher;
        List<String> errorStack;

        PublisherCustomIconsPack.Type type = PublisherCustomIconsPack.Type.forName(fontType);
        if (type == null) {
            String errors = "Invalid font type. It needs to be PLAYER or ENRICHMENT.";
            return new ResponseEntity<>(CustomIconCreationDTO.newInstance(errors, null),
                    HttpStatus.BAD_REQUEST);
        }

        File fontFile = publisherService.saveTemporaryCustomIconFile(multiPartFile);
        if (fontFile == null) {
            String errors = "Failed saving temporary font file.";
            return new ResponseEntity<>(CustomIconCreationDTO.newInstance(errors, null),
                    HttpStatus.BAD_REQUEST);
        }

        errorStack = publisherService.validateCustomIconFile(fontFile, type);
        if (errorStack.size() > 0) {
            FileUtils.forceDelete(fontFile);
            String errors = "CUSTOM_ERROR," + String.join(",", errorStack);
            return new ResponseEntity<>(CustomIconCreationDTO.newInstance(errors, null),
                    HttpStatus.BAD_REQUEST);
        }

        outputCustomIconFiles = publisherService.moveCustomIconFiles(fontFile, type, publisherId);
        if (outputCustomIconFiles == null) {
            String errors = "Failed moving font file to publisher directory.";
            return new ResponseEntity<>(CustomIconCreationDTO.newInstance(errors, null),
                    HttpStatus.BAD_REQUEST);
        }

        addedToPublisher = publisherService.addCustomIconPackToPublisher(publisherId, type, outputCustomIconFiles);
        if (addedToPublisher == null) {
            String errors = "Failed adding font file to publisher.";
            return new ResponseEntity<>(CustomIconCreationDTO.newInstance(errors, null),
                    HttpStatus.BAD_REQUEST);
        }

        return new ResponseEntity<>(CustomIconCreationDTO.newInstance(null, addedToPublisher), HttpStatus.OK);
    }

}
