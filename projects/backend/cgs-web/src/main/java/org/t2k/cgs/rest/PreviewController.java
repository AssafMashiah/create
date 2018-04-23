package org.t2k.cgs.rest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.t2k.cgs.preview.ScpConversionService;

import java.util.Map;


/**
 * Created by thalie.mukhtar on 18/11/2015.
 */
@Controller
@RequestMapping("/publishers/{publisherId}/courses/{courseId}/convertLessonToScp")
public class PreviewController {

    @Autowired
    private ScpConversionService scpConversionService;

    @RequestMapping(method = RequestMethod.POST)
    public
    @ResponseBody
    Map<String, Object> convertLessonToScp(@PathVariable int publisherId,
                                           @PathVariable String courseId,
                                           @RequestBody String lessonJson) throws Exception {

        return scpConversionService.convertLessonToScpFormat(publisherId, courseId, lessonJson);
    }
}