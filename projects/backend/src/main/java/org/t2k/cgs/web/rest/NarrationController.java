package org.t2k.cgs.web.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.t2k.cgs.domain.model.utils.IvonaBean;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;
import org.t2k.cgs.domain.usecases.NarrationService;

/**
 * Created by IntelliJ IDEA.
 * User: alex.zaikman
 * Date: 15/01/14
 * Time: 15:17
 */


@Controller
@AllowedForAllUsers
@RequestMapping(value = "/narrationService")
public class NarrationController {

    @Autowired
    NarrationService narrationService;


    @RequestMapping(value = "/ivonaService", method = RequestMethod.POST)
    public
    @ResponseBody
    byte[] ivona( @RequestBody IvonaBean bn) throws Exception {

       return  narrationService.ivona(bn);

    }


}
