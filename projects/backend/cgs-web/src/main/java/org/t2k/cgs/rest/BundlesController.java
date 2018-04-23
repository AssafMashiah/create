package org.t2k.cgs.rest;

import org.apache.commons.fileupload.FileItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.t2k.cgs.bundles.BundlesDataService;
import org.t2k.cgs.model.bundle.Bundle;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 05/08/14
 * Time: 13:37
 * To change this template use File | Settings | File Templates.
 */
@RestController
@RequestMapping("/publishers/{publisherId}/bundles")
@AllowedForAllUsers
public class BundlesController {

    @Autowired
    private BundlesDataService bundlesDataService;

    @RequestMapping(value = "/upload", method = RequestMethod.POST, headers = "content-type=multipart/*")
    public void uploadBundle(@PathVariable int publisherId,
                             @RequestParam(name = "file") CommonsMultipartFile[] multipartFiles) throws Exception {
        // extract FileItems from CommonsMultipartFile[] to keep the existing implementation of file save, after adding CommonsMultipartResolver bean to spring context
        List<FileItem> items = Arrays.stream(multipartFiles).map(CommonsMultipartFile::getFileItem).collect(Collectors.toList());
        for (FileItem item : items) {
            bundlesDataService.validateAndSave(publisherId, item);
        }
    }

    @RequestMapping(value = "/getBundles", method = RequestMethod.GET)
    public List<Bundle> getBundlesByPublisherId(@PathVariable int publisherId) throws Exception {
        return bundlesDataService.getBundlesByAccountId(publisherId);
    }


    @RequestMapping(value = "/{bundleId}/delete", method = RequestMethod.DELETE)
    public void removeBundle(@PathVariable int publisherId, @PathVariable String bundleId) throws Exception {
        bundlesDataService.deleteBundle(publisherId, bundleId);
    }
}