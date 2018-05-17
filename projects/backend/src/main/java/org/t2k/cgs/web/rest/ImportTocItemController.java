package org.t2k.cgs.web.rest;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;
import org.t2k.cgs.domain.usecases.AppletService;
import org.t2k.cgs.service.ebooks.WebsocketTopics;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.course.Course;
import org.t2k.cgs.domain.model.course.CourseCGSObject;
import org.t2k.cgs.domain.model.course.CourseListOfPaths;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.model.job.JobProperties;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.domain.model.tocItem.TocItem;
import org.t2k.cgs.domain.model.utils.ContentJsonUtils;
import org.t2k.cgs.domain.usecases.publisher.PublisherService;
import org.t2k.cgs.web.rest.dto.PageDTO;
import org.t2k.cgs.domain.model.user.CGSAccount;
import org.t2k.cgs.domain.model.user.CGSUserDetails;
import org.t2k.cgs.security.annotations.AllowedForContentDeveloper;
import org.t2k.cgs.domain.usecases.tocitem.TocItemsManager;
import org.t2k.cgs.domain.usecases.tocitem.tocimport.ImportTocItemService;
import org.t2k.cgs.domain.usecases.tocitem.tocimport.ImportTocItemsDTO;
import org.t2k.cgs.service.tocitem.TocItemValidationResponse;
import org.t2k.cgs.domain.usecases.tocitem.tocimport.TocItemsToImportDTO;
import org.t2k.gcr.common.model.applet.GCRAppletArtifact;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 03/06/13
 * Time: 15:42
 */

@RestController
@AllowedForContentDeveloper
@RequestMapping("/publishers/{publisherId}")
public class ImportTocItemController {

    private Logger logger = Logger.getLogger(ImportTocItemController.class);

    private ImportTocItemService importTocItemService;
    private CourseDataService courseDataService;
    private TocItemsManager tocItemsManager;
    private CGSUserDetails currentCgsUserDetails;
    private PublisherService publisherService;
    private AppletService appletService;
    private JobService jobService;

    @Autowired
    public ImportTocItemController(ImportTocItemService importTocItemService,
                                   CourseDataService courseDataService,
                                   TocItemsManager tocItemsManager,
                                   CGSUserDetails currentCgsUserDetails,
                                   PublisherService publisherService,
                                   AppletService appletService,
                                   JobService jobService) {
        Assert.notNull(importTocItemService);
        Assert.notNull(courseDataService);
        Assert.notNull(tocItemsManager);
        Assert.notNull(publisherService);
        Assert.notNull(appletService);
        Assert.notNull(jobService);

        this.importTocItemService = importTocItemService;
        this.courseDataService = courseDataService;
        this.tocItemsManager = tocItemsManager;
        this.currentCgsUserDetails = currentCgsUserDetails;
        this.publisherService = publisherService;
        this.appletService = appletService;
        this.jobService = jobService;
    }

    @RequestMapping(value = "/courses/{dcid}/import", method = RequestMethod.POST)
    public void copyAssets(
            @PathVariable int publisherId,      // copy is always within a specific publisher - so only one publisherId is needed
            @PathVariable(value = "dcid") String destinationCourseId,
            @RequestBody CourseListOfPaths courseListOfPaths
    ) throws DsException {

        List<String> pathsList = courseListOfPaths.getPathsList();
        String sourceCourseId = courseListOfPaths.getSourceCourseId();
        importTocItemService.copyAssets(publisherId, destinationCourseId, sourceCourseId, pathsList);
    }

    @RequestMapping(value = "/courses/{courseId}/tocTree", method = RequestMethod.GET)
    public String getTocItemsHierarchyForASingleCourse(@PathVariable int publisherId,
                                                       @PathVariable(value = "courseId") String courseId,
                                                       @RequestParam(required = false) String tocItemContentType) {
        String result = null;
        try {
            CourseCGSObject course = courseDataService.getCourseTocItemsInStructureByPublisher(publisherId, courseId, tocItemContentType);
            if (course != null) {
                result = ContentJsonUtils.createContentDataJsonArrayForCourse(Collections.singletonList(course));
            }
        } catch (DsException e) {
            logger.error("Error getTocItemsHierarchyForASingleCourse for publisher " + publisherId, e);
        }
        return result;
    }

    @RequestMapping(value = "/getValidatedTocItemsForImport", method = RequestMethod.GET)
    public ResponseEntity<PageDTO<CourseTreeDTO>> getValidatedTocItemsForImport(@PathVariable int publisherId,
                                                                             @RequestParam String destinationCourseId,
                                                                             @RequestParam(required = false) List<String> sourceCourseIds,
                                                                             @RequestParam(required = false) String searchText,
                                                                             @RequestParam(required = false) Integer page,
                                                                             @RequestParam(required = false) Integer pageSize)
            throws DsException {
        if (((sourceCourseIds == null || sourceCourseIds.size() == 0) && searchText == null)
                || ((sourceCourseIds != null && sourceCourseIds.size() > 0) && searchText != null)) {
            logger.error("Rest request for validated toc items with either both source courses ids list and search text or neither");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } else if (searchText != null && searchText.length() < 3) {
            logger.error("Rest request for validated toc items with search text < 3 chars");
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        Pageable pageRequest = page != null && pageSize != null
                ? new PageRequest(page, pageSize)
                : new PageRequest(0, 100);
        Page<Course> sourceCourses;
        if (searchText != null) {
            sourceCourses = courseDataService.searchCoursesByText(publisherId, searchText, pageRequest);
        } else {
            sourceCourseIds.remove(destinationCourseId);
            sourceCourses = courseDataService.getCourses(publisherId, sourceCourseIds, pageRequest);
        }

        Course destinationCourse = courseDataService.getCourse(publisherId, destinationCourseId);
        List<GCRAppletArtifact> catalogApplets = appletService.getAppletsAllowedForPublisher(publisherId);

        List<CourseTreeDTO> resultCourses = new ArrayList<>();
        for (Course sourceCourse : sourceCourses) {
            if (!sourceCourse.hasTocItems() || destinationCourseId.equals(sourceCourse.getCourseId())) {
                continue;
            }
            List<TocItem> tocItems = tocItemsManager.getByCourse(publisherId, sourceCourse.getCourseId());
            Map<String, TocItemValidationResponse> validationResponseMap = importTocItemService
                    .validateTocItemsForImport(destinationCourse, tocItems, catalogApplets);
            resultCourses.add(new CourseTreeDTO(sourceCourse, validationResponseMap));
        }
        PageDTO<CourseTreeDTO> pageDTO = new PageDTO<>(sourceCourses.getNumber(),
                sourceCourses.getSize(),
                sourceCourses.getTotalPages(),
                sourceCourses.getTotalElements(),
                resultCourses);
        return ResponseEntity.ok(pageDTO);
//        return ResponseEntity.ok(resultCourses);
    }

    @RequestMapping(value = "/importTocItem", method = RequestMethod.POST)
    public ResponseEntity importTocItem(@PathVariable int publisherId,
                                        @RequestBody ImportTocItemsDTO importTocItemsDTO) {
        CGSAccount currentPublisher = publisherService.getCurrentPublisherAccount();
        if (currentPublisher == null || currentPublisher.getAccountId() != publisherId) {
            logger.error(String.format("Used publisher ID (%s) does not match current logged-in publisher (%s)", publisherId, currentPublisher));
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<String> sourceCourseIds = importTocItemsDTO.getTocItemsToImport().stream()
                .map(TocItemsToImportDTO::getSourceCourseId)
                .distinct()
                .collect(Collectors.toList());
        List<Course> sourceCourses = courseDataService.getCourses(publisherId, sourceCourseIds);
        if (sourceCourseIds.size() != sourceCourses.size()) {
            sourceCourses.forEach(course -> {
                if (!sourceCourseIds.contains(course.getCourseId())) {
                    logger.error(String.format("No course with ID '%s' was found for publisher '%s'", course.getCourseId(), publisherId));
                }
            });
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        for (Course sourceCourse : sourceCourses) {
            //noinspection OptionalGetWithoutIsPresent - we already checked above
            List<String> tocItemCids = importTocItemsDTO.getTocItemsToImport().stream()
                    .filter(tocItemsToImportDTO -> tocItemsToImportDTO.getSourceCourseId().equals(sourceCourse.getCourseId()))
                    .findFirst()
                    .get()
                    .getTocItemCids();
            if (!sourceCourse.containsTocItemsRefs(tocItemCids)) {
                List<String> tocItemsNotContained = tocItemCids.stream().filter(s -> !sourceCourse.containsTocItemRef(s)).collect(Collectors.toList());
                logger.error(String.format("Course with ID '%s' on publisher '%s' does not contain toc items with cids %s",
                        sourceCourse.getCourseId(), publisherId, tocItemsNotContained));
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        }

        if (courseDataService.getCourse(publisherId, importTocItemsDTO.getDestinationCourseId()) == null) {
            logger.error(String.format("No course with ID '%s' was found for publisher '%s'", importTocItemsDTO.getDestinationCourseId(), publisherId));
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        String jobId = UUID.randomUUID().toString();
        JobProperties properties = new JobProperties();
        properties.setPublisherId(publisherId);
        properties.setUsername(currentCgsUserDetails.getUsername());
        Job job = new Job.Builder(jobId, Job.Type.IMPORT_TOC_ITEM, Job.Status.PENDING)
                .setRefEntityId(importTocItemsDTO.getDestinationCourseId())
                .setProperties(properties)
                .setWebsocketTopic(WebsocketTopics.JOB + jobId)
                .build();
        jobService.save(job);


        importTocItemService.importTocItems(job.getJobId(), currentCgsUserDetails.getUserId(), publisherId, importTocItemsDTO);
        return ResponseEntity.ok(job.getJobId());
    }
}
