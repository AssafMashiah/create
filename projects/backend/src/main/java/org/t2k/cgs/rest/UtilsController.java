package org.t2k.cgs.rest;

import atg.taglib.json.util.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.t2k.cgs.course.CourseDataService;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.job.Job;
import org.t2k.cgs.model.job.JobService;
import org.t2k.cgs.model.utils.CGSValidationReport;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: Ophir.Barnea
 * Date: 12/12/12
 * Time: 13:39
 */
@RestController
@AllowedForAllUsers
@RequestMapping("/utils")
public class UtilsController {

    @Autowired
    private JobService jobService;

    @Autowired
    private CourseDataService courseDataService;

    @RequestMapping(value = "/validateSingleCourse", method = RequestMethod.GET)
    public CGSValidationReport validateSingleCourse(@RequestParam String courseId, @RequestParam int publisherId) throws DsException {
        return courseDataService.validateCourseAndSubElements(publisherId, courseId);
    }

    @RequestMapping(value = "/validateAllCourses", method = RequestMethod.GET)
    public List<CGSValidationReport> validateAllCourses() throws DsException {
        return courseDataService.validateAllCourses();
    }


    @RequestMapping(value = "/validateAllTocItemsSchemas", method = RequestMethod.GET)
    public CGSValidationReport validateLessonSAndAssessmentSchemas() throws DsException, JSONException {
        return courseDataService.validateAllTocItemsWithSchema();
    }

    @RequestMapping(value = "/jobs/{jobId}", method = RequestMethod.GET)
    public Job getJob(@PathVariable String jobId) throws Exception {
        Job job = jobService.getJob(jobId);
        if (job == null) {
            job = new Job(jobId);
            job.setStatus(Job.Status.STARTED);
            job.setText("dummy");
        }
        return job;
    }
}