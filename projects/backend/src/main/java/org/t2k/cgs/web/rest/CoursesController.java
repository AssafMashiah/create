package org.t2k.cgs.web.rest;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;
import com.t2k.configurations.Configuration;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.FileUploadBase;
import org.apache.commons.fileupload.FileUploadException;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.t2k.cgs.domain.usecases.course.CourseCleanupService;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.model.exceptions.*;
import org.t2k.cgs.domain.usecases.exportimport.ExportImportService;
import org.t2k.cgs.domain.usecases.lock.LockService;
import org.t2k.cgs.domain.model.lock.Lock;
import org.t2k.cgs.domain.model.lock.LockAction;
import org.t2k.cgs.domain.model.lock.LockUser;
import org.t2k.cgs.domain.model.ContentItemBase;
import org.t2k.cgs.domain.model.CourseItem;
import org.t2k.cgs.domain.model.Header;
import org.t2k.cgs.domain.model.classification.StandardsChange;
import org.t2k.cgs.domain.model.course.*;
import org.t2k.cgs.domain.usecases.packaging.PublishTarget;
import org.t2k.cgs.domain.model.sequence.Sequence;
import org.t2k.cgs.domain.usecases.packaging.TinyKeyForClient;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.model.utils.ContentJsonUtils;
import org.t2k.cgs.domain.usecases.publisher.PublisherService;
import org.t2k.cgs.web.rest.dto.CourseInfoDTO;
import org.t2k.cgs.web.rest.dto.PageDTO;
import org.t2k.cgs.domain.model.user.CGSUserDetails;
import org.t2k.cgs.domain.usecases.packaging.TinyKey;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;
import org.t2k.cgs.security.annotations.AllowedForContentDeveloper;
import org.t2k.cgs.security.annotations.AllowedForPublisherAdministrator;
import org.t2k.cgs.domain.usecases.standards.StandardsService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemDataService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemsManager;
import org.t2k.cgs.utils.ISO8601DateFormatter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 21/10/12
 * Time: 13:51
 */
@RestController
@RequestMapping("/publishers/{publisherId}/courses")
@AllowedForAllUsers
public class CoursesController {

    private static Logger logger = Logger.getLogger(CoursesController.class);

    @Autowired
    private CourseDataService courseDataService;

    @Autowired
    private CourseCleanupService courseCleanupService;

    @Autowired
    private CGSUserDetails currentCgsUserDetails;

    @Autowired
    private LockService lockService;

    @Autowired
    private TocItemsManager tocItemsManager;

    @Autowired
    private StandardsService standardsService;

    @Autowired
    private ExportImportService exportImportService;

    @Autowired
    private Configuration configuration;

    @Autowired
    private PublisherService publisherService;

    @AllowedForContentDeveloper
    @RequestMapping(method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CourseContentData> createNewCourse(@PathVariable int publisherId,
                                                             @RequestParam String title,
                                                             @RequestParam String contentLocale) throws Exception {
        String publisher = publisherService.getPublisher(publisherId);
        if (publisher == null) {
            logger.warn("Call to create course with invalid publisher ID rejected: " + publisherId);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Course course = courseDataService.createNewCourse(publisherId, title, currentCgsUserDetails, contentLocale);
        return ResponseEntity.ok(course.getContentData());
    }

    @AllowedForContentDeveloper
    @RequestMapping(value = "/{courseId}/locale/{locale}", method = RequestMethod.DELETE)
    public void removeLocale(@PathVariable int publisherId, @PathVariable String courseId, @PathVariable String locale) throws Exception {
        courseDataService.removeLocale(publisherId, courseId, locale, new LockUser(currentCgsUserDetails));
    }

    /**
     * Saves a given course(json) if permitted.
     *
     * @param publisherId       - course's publisher ID
     * @param courseId          - course ID
     * @param courseContentData - content of the course
     * @throws DsException in case the course is locked
     */
    @AllowedForContentDeveloper
    @RequestMapping(value = "/{courseId}",
            method = RequestMethod.PUT,
            consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Header> saveCourse(@PathVariable int publisherId,
                                             @PathVariable String courseId,
                                             @Valid @RequestBody CourseContentData courseContentData) throws DsException {
        logger.debug(String.format("saveCourseCGSObject. courseId:%s", courseId));
        Course existing = courseDataService.getCourse(publisherId, courseId);
        if (existing == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
//        courseDataService.saveCourse(courseCGSObject, new LockUser(currentCgsUserDetails), false);
        Course savedCourse = courseDataService.saveCourse(existing, courseContentData, new LockUser(currentCgsUserDetails));
        return new ResponseEntity<>(savedCourse.getContentData().getHeader(), HttpStatus.OK);
    }

    @AllowedForContentDeveloper
    @RequestMapping(value = "/{courseId}/updateDifferentiationLevels", method = RequestMethod.PUT)
    public void updateDifferentiationLevels(@PathVariable int publisherId, @PathVariable String courseId, @RequestBody String diffLevels) throws Exception {
        courseDataService.updateDifferentiationLevels(publisherId, courseId, diffLevels, currentCgsUserDetails);
    }

    /**
     * Returns a Course entity(json).
     * if last lastModified params is supplied, the method will return a course only
     * if the server's entity date is different.
     * if version is not supplied , the server will refer to the 'HEAD' version.
     *
     * @param publisherId  - course's publisher ID
     * @param courseId     - course ID
     * @param lastModified - lastModified date of the course that currently exists in the client's browser
     * @return course's json as string
     * @throws org.t2k.cgs.domain.model.exceptions.ResourceNotFoundException if entity does not exists
     */
    @RequestMapping(value = "/{courseId}", method = RequestMethod.GET)
    public ResponseEntity<CourseContentData> getCourse(@PathVariable int publisherId,
                                                       @PathVariable String courseId,
                                                       @RequestParam(value = "last-modified", required = false) String lastModified) throws Exception {
        logger.debug(String.format("getCourse. publisher id:%d courseId: %s", publisherId, courseId));
        Course course = courseDataService.getCourse(publisherId, courseId, true);
        if (course == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Date lastModifiedDate = ISO8601DateFormatter.toDate(lastModified);
        if (lastModifiedDate != null && course.getLastModified().equals(lastModifiedDate)) {
            return new ResponseEntity<>(HttpStatus.NOT_MODIFIED);
        }
        return ResponseEntity.ok(course.getContentData());
    }

    @RequestMapping(value = "/{courseId}/getTinyKey", method = RequestMethod.GET)
    public TinyKeyForClient getTinyKey(@PathVariable int publisherId, @PathVariable String courseId) throws Exception {
        TinyKey tinyKey = this.courseDataService.getTinyKey(publisherId, courseId, null, PublishTarget.COURSE_TO_URL);
        return getTinyKeyForClient(tinyKey, publisherId, courseId, null, PublishTarget.COURSE_TO_URL);
    }

    @RequestMapping(value = "/{courseId}/lesson/{lessonId}/getTinyKey", method = RequestMethod.GET)
    public TinyKeyForClient getTinyKey(@PathVariable int publisherId, @PathVariable String courseId, @PathVariable String lessonId) throws Exception {

        TinyKey tinyKey = this.courseDataService.getTinyKey(publisherId, courseId, lessonId, PublishTarget.LESSON_TO_URL);

        return getTinyKeyForClient(tinyKey, publisherId, courseId, lessonId, PublishTarget.LESSON_TO_URL);
    }

    private TinyKeyForClient getTinyKeyForClient(TinyKey tinyKey, int publisherId, String courseId, String lessonId, PublishTarget publishTarget) {
        TinyKeyForClient result;

        if (tinyKey == null) {
            TinyKey empty = new TinyKey(publisherId, courseId, lessonId, null, publishTarget.getName(), null, null);
            result = new TinyKeyForClient(empty);
        } else {
            result = new TinyKeyForClient(tinyKey);
        }

        return result;
    }

    @RequestMapping(value = "/basicInfo", method = RequestMethod.GET)
    public ResponseEntity<List<CourseInfoDTO>> getCoursesInfo(
            @PathVariable int publisherId,
            @RequestParam(required = false) List<String> courseIds,
            @RequestParam(required = false) boolean notEmpty) throws Exception {
        logger.info(String.format("Request to retrieve courses basic info for publisher %s with courseIds = %s, and notEmpty = %s",
                publisherId, courseIds, notEmpty));
        List<Course> courses = courseDataService.getAllNotHidden(publisherId);
        courses = courseIds == null // filters only courses in the given list
                ? courses
                : courses.stream().filter(course -> courseIds.contains(course.getCourseId())).collect(Collectors.toList());
        courses = notEmpty // filters out courses that don't have toc items
                ? courses.stream().filter(Course::hasTocItems).collect(Collectors.toList())
                : courses;
        return ResponseEntity.ok(courses.stream().map(CourseInfoDTO::of).collect(Collectors.toList()));
    }

    @RequestMapping(value = "/page", method = RequestMethod.GET)
    public ResponseEntity<PageDTO<CourseInfoDTO>> getPagedCourses(@PathVariable int publisherId,
                                                                  @RequestParam(required = false) List<String> courseIds,
                                                                  @RequestParam(required = false) String searchText,
                                                                  @RequestParam(required = false) Integer page,
                                                                  @RequestParam(required = false) Integer pageSize) {
        if (currentCgsUserDetails.getRelatesTo().getId() != publisherId) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        Pageable pageRequest = (page != null && pageSize != null)
                ? new PageRequest(page, Integer.min(pageSize, 100))
                : new PageRequest(0, 100);

        Page<Course> courses;
        if (courseIds != null && courseIds.size() > 0) {
            courses = courseDataService.getCourses(publisherId, courseIds, pageRequest);
        } else {
            courses = ((searchText == null || searchText.length() == 0)
                    ? courseDataService.getPagedCourses(publisherId, pageRequest)
                    : courseDataService.searchCoursesByTitle(publisherId, searchText, pageRequest));
        }

        PageDTO<CourseInfoDTO> pageDTO = new PageDTO<>(courses.getNumber(),
                courses.getSize(),
                courses.getTotalPages(),
                courses.getTotalElements(),
                courses.getContent().stream().map(CourseInfoDTO::of).collect(Collectors.toList())
        );
        return ResponseEntity.ok(pageDTO);
    }

    /**
     * Returns a list of all Courses of the given publisher.
     * NOTE: the returned list contains LITE jsons (no TOC field).
     *
     * @param publisherId - course's publisher ID
     * @return publisher's courses properties as a string
     * @throws Exception
     */
    @RequestMapping(method = RequestMethod.GET)
    public String getPublisherCoursesProperties(@PathVariable int publisherId) throws Exception {
        String result = null;
        try {
            List<CourseCGSObject> coursesByPublisher;
            if (logger.isDebugEnabled()) {
                logger.debug(String.format("getPublisherCoursesProperties. publisher id:%d", publisherId));
            }
            coursesByPublisher = courseDataService.getSavedCoursesPropertiesByPublisher(publisherId);
            //create a list of courses , (cant just use jackson with LIST since the CourseCGSObject
            //the does not hold a object model data of the book. it holds a string.
            if (coursesByPublisher != null && !coursesByPublisher.isEmpty()) {
                result = ContentJsonUtils.createContentDataJsonArrayForCourse(coursesByPublisher);
            }
        } catch (Exception e) {
            logger.error("getPublisherCoursesProperties error.", e);
            throw e;
        }
        return result;
    }

    @RequestMapping(value = "/{courseId}/itemsTree", method = RequestMethod.GET)
    public CourseItem getCourseItemsTree(@PathVariable int publisherId, @PathVariable String courseId) throws Exception {
        Course course = courseDataService.getCourse(publisherId, courseId);
        CourseItem courseItem = new CourseItem(course.getContentData().getCid(), course.getContentData().getTitle());

        List<TocItemCGSObject> allTocItems = tocItemsManager.getByCourse(publisherId, courseId, false);
        Map<String, TocItemCGSObject> allTocItemsMap = new HashMap<>(allTocItems.size());
        for (TocItemCGSObject tocItem : allTocItems) {
            allTocItemsMap.put(tocItem.getContentId(), tocItem);
        }

        CourseContentData contentData = course.getContentData();
        CourseToc toc = contentData.getToc();
        createCourseTree(courseItem, allTocItemsMap, toc);
        return courseItem;
    }

    private void createCourseTree(CourseItem courseItem, Map<String, TocItemCGSObject> allTocItemsMap, CourseToc toc) {
        List<CourseTocItemRef> tocItemRefs = toc.getTocItemRefs();
        if (!tocItemRefs.isEmpty()) {
            courseItem.setItems(new ArrayList<>());
            for (CourseTocItemRef tocItemRef : tocItemRefs) {
                TocItemCGSObject tocItem = allTocItemsMap.get(tocItemRef.getCid());
                CourseItem tocItemOfCourse = new CourseItem(tocItem.getContentId(), tocItem.getTitle());
                courseItem.getItems().add(tocItemOfCourse);
                switch (tocItemRef.getType()) {
                    case "lesson":
                        BasicDBList learningObjects = (BasicDBList) tocItem.getContentData().get("learningObjects");
                        if (learningObjects == null || learningObjects.isEmpty()) {
                            continue;
                        }

                        tocItemOfCourse.setItems(new ArrayList<CourseItem>());
                        for (Object lo : learningObjects) {
                            DBObject learningObject = (DBObject) lo;
                            CourseItem learningObjectOfCourse = new CourseItem(learningObject.get("cid").toString(), learningObject.get("title").toString());
                            tocItemOfCourse.getItems().add(learningObjectOfCourse);
                            BasicDBList sequences = (BasicDBList) learningObject.get("sequences");
                            if (sequences == null || sequences.isEmpty()) {
                                continue;
                            }

                            learningObjectOfCourse.setItems(new ArrayList<CourseItem>());
                            for (Object seq : sequences) {
                                DBObject sequence = (DBObject) seq;
                                if (((BasicDBObject) sequence).getString("type").equals("sequenceRef")) {
                                    continue;
                                }
                                CourseItem sequenceOfCourse = new CourseItem(sequence.get("cid").toString(), sequence.get("title").toString());
                                learningObjectOfCourse.getItems().add(sequenceOfCourse);
                                if (sequence.get("type").toString().equals("differentiatedSequenceParent")) {
                                    BasicDBList levels = (BasicDBList) sequence.get("levels");
                                    sequenceOfCourse.setItems(new ArrayList<CourseItem>());
                                    for (Object levelObject : levels) {
                                        DBObject level = (DBObject) levelObject;
                                        DBObject levelSequence = (DBObject) level.get("sequence");
                                        sequenceOfCourse.getItems().add(new CourseItem(levelSequence.get("cid").toString(), levelSequence.get("title").toString()));
                                    }
                                }
                            }
                        }
                        break;
                    case "assessment":
                        BasicDBList sequences = (BasicDBList) tocItem.getContentData().get("sequences");
                        if (sequences == null || sequences.isEmpty()) {
                            continue;
                        }

                        tocItemOfCourse.setItems(new ArrayList<CourseItem>());
                        for (Object seq : sequences) {
                            DBObject sequence = (DBObject) seq;
                            tocItemOfCourse.getItems().add(new CourseItem(sequence.get("cid").toString(), sequence.get("title").toString()));
                        }
                        break;
                }
            }
        }

        List<CourseToc> tocItems = toc.getTocItems();
        if (!tocItems.isEmpty()) {
            if (courseItem.getItems() == null) {
                courseItem.setItems(new ArrayList<CourseItem>());
            }

            for (CourseToc tocObject : tocItems) {
                CourseItem tocOfCourse = new CourseItem(tocObject.getCid(), tocObject.getTitle());
                createCourseTree(tocOfCourse, allTocItemsMap, tocObject);
                courseItem.getItems().add(tocOfCourse);
            }
        }
    }

    /**
     * The method tries to acquire a lock on the course by the requesting user.
     * The user details are contained in the request context(cookie).
     * On success , returns nothing (200OK) , else throws a LockException
     *
     * @param publisherId - course's publisher ID
     * @param courseId    - course ID
     * @throws Exception
     */
    @RequestMapping(value = "/{courseId}//lock", method = RequestMethod.POST)
    public void lockCourse(@PathVariable int publisherId, @PathVariable String courseId, @RequestParam(required = true) String action,
                           @RequestParam(value = "last-modified", required = false) String lastModified) throws Exception {
        try {
            Date lastModifiedDate = ISO8601DateFormatter.toDate(lastModified);

            LockAction lockAction = LockAction.forName(action);
            if (lockAction == null)
                throw new IllegalArgumentException(String.format("lockAction(action) is unknown. %s", lockAction));
            ContentItemBase contentItemBase = courseDataService.getContentItemBase(courseId);
            //TODO: Replace the authorization "if" here with a filter
            if (currentCgsUserDetails.getRelatesTo().getId() != publisherId)
                throw new LockException(ErrorCodes.CONTENT_IS_NOT_OWNED_BY_USER, String.format("User from publisher %d is not allowed to course owned by publisher %d", currentCgsUserDetails.getRelatesTo().getId(), publisherId));

            lockService.handleLockRequest(contentItemBase, new LockUser(currentCgsUserDetails), lockAction, lastModifiedDate);
        } catch (LockException lockErr) {
            logger.info("Lock action failed.", lockErr);
            throw lockErr;
        } catch (DsException dsException) {
            logger.error("Lock action failed.", dsException);
            throw dsException;
        }
    }

    /**
     * Returns the lock data(json) of the given course.
     *
     * @param publisherId - course's publisher ID
     * @param courseId    - course ID
     * @return Lock object when there is a lock , NULL when no lock on this course.
     * @throws Exception
     */
    @RequestMapping(value = "/{courseId}/lock", method = RequestMethod.GET)
    public Lock getCourseLock(@PathVariable int publisherId, @PathVariable String courseId) throws Exception {
        //TODO: Replace the authorization "if" here with a filter
        if (currentCgsUserDetails.getRelatesTo().getId() != publisherId)
            throw new LockException(ErrorCodes.CONTENT_IS_NOT_OWNED_BY_USER, String.format("User from publisher %d is not allowed to course owned by publisher %d", currentCgsUserDetails.getRelatesTo().getId(), publisherId));

        ContentItemBase contentItemBase = courseDataService.getContentItemBase(courseId);
        return lockService.getLock(contentItemBase);
    }

    @RequestMapping(value = "/{courseId}/sequences", method = RequestMethod.POST)
    public List<Sequence> getSequences(@PathVariable String courseId,
                                       @RequestBody String sequencesIds,
                                       @RequestParam String tocItemCid,
                                       @RequestParam String type) throws Exception {
        List<String> ids = new ObjectMapper().readValue(sequencesIds, new TypeReference<ArrayList<String>>() {
        });
        TocItemDataService service = tocItemsManager.getServiceByType(type);
        return service.getSequencesByIds(ids, tocItemCid, courseId);
    }

    @AllowedForPublisherAdministrator
    @RequestMapping(value = "/{courseId}", method = RequestMethod.DELETE)
    public void deleteCourseContents(@PathVariable int publisherId, @PathVariable String courseId) throws Exception {
        courseCleanupService.deleteCourse(publisherId, courseId);
    }

    @AllowedForContentDeveloper
    @RequestMapping(value = "/{courseId}/createNewEdition", method = RequestMethod.POST)
    public String createNewCourseEdition(@PathVariable int publisherId, @PathVariable String courseId, @RequestParam(value = "jobId", required = true) String jobId) throws Exception {
        return courseDataService.createNewCourseEdition(publisherId, courseId, jobId);
    }

    @AllowedForContentDeveloper
    @RequestMapping(value = "/{courseId}/clone", method = RequestMethod.POST)
    public String cloneCourse(@PathVariable int publisherId,
                              @PathVariable String courseId,
                              @RequestParam(required = false) String newName, @RequestParam(value = "jobId", required = true) String jobId) throws Exception {
        return courseDataService.cloneCourse(publisherId, courseId, newName, jobId);
    }

    @RequestMapping(value = "/{courseId}/export", method = RequestMethod.POST)
    public void exportCourse(@PathVariable int publisherId,
                             @PathVariable String courseId,
                             @RequestParam(value = "jobId", required = true) String jobId) throws Exception {
        exportImportService.exportCourse(publisherId, courseId, jobId, currentCgsUserDetails);
    }

    @RequestMapping(value = "/getExportedCourse", method = RequestMethod.GET)
    public void getExportedCourse(@RequestParam String exportedCourseFileName, HttpServletResponse response) throws Exception {
        logger.info(String.format("getExportedCourse: request for download a course. by zip file name: %s", exportedCourseFileName));
        exportImportService.downloadExportedCourse(exportedCourseFileName, response);
    }

    @RequestMapping(value = "/validationBeforeImport", method = RequestMethod.POST)
    public void validationBeforeImport(HttpServletRequest request,
                                       @RequestParam(name = "file") CommonsMultipartFile[] multipartFiles,
                                       @RequestParam(value = "jobId", required = true) String jobId) throws Exception {
        String outDir = configuration.getProperty("exportedCourseLocation");
        File outDirDirFile = new File(outDir);
        if (!outDirDirFile.exists() && !outDirDirFile.mkdirs()) {  //added to fix bug CGS-4885 (not being able to import a course)
            String m = String.format("Could not create directory: %s", outDirDirFile.getAbsoluteFile());
            logger.error(m);
            throw new DsException(m);
        }
        String zippedFilesDir = outDir + "/resources";
        File zippedFilesDirFile = new File(zippedFilesDir);

        if (!zippedFilesDirFile.exists() && !zippedFilesDirFile.mkdirs()) {  //added to fix bug CGS-4885 (not being able to import a course)
            String m = String.format("Could not create directory: %s", zippedFilesDirFile.getAbsoluteFile());
            logger.error(m);
            throw new DsException(m);
        }
        try {
            // extract FileItems from CommonsMultipartFile[] to keep the existing implementation of file save, after adding CommonsMultipartResolver bean to spring context
            List<FileItem> items = Arrays.stream(multipartFiles).map(CommonsMultipartFile::getFileItem).collect(Collectors.toList());
            String zipFileName = exportImportService.uploadFile(items, zippedFilesDir);

            exportImportService.validationBeforeImport(zipFileName, jobId);
        } catch (FileUploadBase.InvalidContentTypeException e) {
            logger.error("The request doesn't attach a file in a multipart form item", e);
            throw new FileIsEmptyOrNoFileInRequestException("validationBeforeImport",
                    "The upload request for validationBeforeImport" +
                            " doesn't attach a file, or attach a file in a wrong format", e);
        } catch (FileUploadException e) {
            if (e.getMessage().contains("Stream ended unexpectedly"))
                logger.warn("Course import failed, probably because the user closed/refreshed the browser", e);
            else
                logger.error("An error occurred when using apache fileUpload", e);
            throw new DsException("Failed parsing the request", e);
        } catch (FileTooBigException e) {
            logger.error("The uploaded file is too big (according to the limit configuration)", e);
            throw e;
        } catch (FileIsEmptyOrNoFileInRequestException e) {
            logger.error("The uploaded file is empty", e);
            throw e;
        } catch (DsException e) {
            logger.error("upload Failed", e);
            throw e;
        }
    }

    @AllowedForContentDeveloper
    @RequestMapping(value = "/import", method = RequestMethod.POST)
    public void importCourse(@PathVariable int publisherId,
                             @RequestParam(value = "validationId", required = true) String validationId,
                             @RequestParam(value = "jobId", required = true) String jobId) throws Exception {
        exportImportService.importCourse(publisherId, jobId, validationId, currentCgsUserDetails);
    }

    ////////////////////////////
    // Standards Manipulation //
    ////////////////////////////

    @AllowedForContentDeveloper
    @RequestMapping(value = "{courseId}/standards/{packageName}/subjectAreas/{subjectArea}/delete", method = RequestMethod.PUT)
    public StandardsChange prepareForStandardsPackageDelete(@PathVariable int publisherId,
                                                            @PathVariable String courseId,
                                                            @PathVariable String packageName,
                                                            @PathVariable String subjectArea) throws Exception {
        return standardsService.prepareForStandardsPackageDelete(new LockUser(currentCgsUserDetails), publisherId, courseId, packageName, subjectArea);
    }

    @AllowedForContentDeveloper
    @RequestMapping(value = "{courseId}/standards/{packageName}/subjectAreas/{subjectArea}/delete", method = RequestMethod.POST)
    public void deleteStandardsPackage(@PathVariable int publisherId,
                                       @PathVariable String courseId,
                                       @PathVariable String packageName,
                                       @PathVariable String subjectArea) throws Exception {
        standardsService.deleteStandardsPackage(new LockUser(currentCgsUserDetails), publisherId, courseId, packageName, subjectArea);
    }

    @AllowedForContentDeveloper
    @RequestMapping(value = "{courseId}/standards/{packageName}/subjectAreas/{subjectArea}/delete", method = RequestMethod.DELETE)
    public void abortDeleteStandardsPackage(@PathVariable int publisherId,
                                            @PathVariable String courseId,
                                            @PathVariable String packageName,
                                            @PathVariable String subjectArea) throws Exception {
        standardsService.abortStandardsPackageChange(new LockUser(currentCgsUserDetails), publisherId, courseId, packageName, subjectArea);
    }

    @AllowedForContentDeveloper
    @RequestMapping(value = "{courseId}/standards/{packageName}/subjectAreas/{subjectArea}/upgrade", method = RequestMethod.PUT)
    public StandardsChange prepareForStandardsPackageUpdate(@PathVariable int publisherId,
                                                            @PathVariable String courseId,
                                                            @PathVariable String packageName,
                                                            @PathVariable String subjectArea,
                                                            @RequestParam(required = true) String version) throws Exception {
        return standardsService.prepareForStandardsPackageUpdate(new LockUser(currentCgsUserDetails), publisherId, courseId, packageName, subjectArea, version);
    }

    @AllowedForContentDeveloper
    @RequestMapping(value = "{courseId}/standards/{packageName}/subjectAreas/{subjectArea}/upgrade", method = RequestMethod.POST)
    public void updateStandardsPackage(@PathVariable int publisherId,
                                       @PathVariable String courseId,
                                       @PathVariable String packageName,
                                       @PathVariable String subjectArea,
                                       @RequestParam(required = true) String version) throws Exception {
        standardsService.updateStandardsPackage(new LockUser(currentCgsUserDetails), publisherId, courseId, packageName, subjectArea, version);
    }

    @AllowedForContentDeveloper
    @RequestMapping(value = "{courseId}/standards/{packageName}/subjectAreas/{subjectArea}/upgrade", method = RequestMethod.DELETE)
    public void abortUpdateStandardsPackage(@PathVariable int publisherId,
                                            @PathVariable String courseId,
                                            @PathVariable String packageName,
                                            @PathVariable String subjectArea) throws Exception {
        standardsService.abortStandardsPackageChange(new LockUser(currentCgsUserDetails), publisherId, courseId, packageName, subjectArea);
    }
}