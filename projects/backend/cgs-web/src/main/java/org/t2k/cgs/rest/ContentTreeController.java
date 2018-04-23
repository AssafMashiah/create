package org.t2k.cgs.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.tocItem.ContentTree;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;
import org.t2k.cgs.tocItem.ContentTreeService;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 13/11/13
 * Time: 12:20
 */
@Controller
@AllowedForAllUsers
public class ContentTreeController {
    @Autowired
    ContentTreeService contentTreeService;

    @RequestMapping(value = "/publishers/{publisherId}/courses/{courseId}/sequenceTreeOfHiddenLessons", method = RequestMethod.GET)
    public
    @ResponseBody
    ContentTree getSequenceTreeOfHiddenLessons(@PathVariable int publisherId, @PathVariable String courseId) throws DsException {
        return contentTreeService.getSequenceTreeOfHiddenLessons(publisherId, courseId);
    }

}
