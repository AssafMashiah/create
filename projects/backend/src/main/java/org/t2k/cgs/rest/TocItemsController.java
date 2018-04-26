package org.t2k.cgs.rest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.t2k.cgs.course.CourseDataService;
import org.t2k.cgs.course.elasticsearch.CourseSearchService;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.dataServices.exceptions.ConflictException;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.dataServices.exceptions.ErrorCodes;
import org.t2k.cgs.dataServices.exceptions.LockException;
import org.t2k.cgs.lock.LockService;
import org.t2k.cgs.locks.Lock;
import org.t2k.cgs.locks.LockAction;
import org.t2k.cgs.locks.LockUser;
import org.t2k.cgs.model.ContentItem;
import org.t2k.cgs.model.ContentItemBase;
import org.t2k.cgs.model.Header;
import org.t2k.cgs.model.sequence.Sequence;
import org.t2k.cgs.model.tocItem.AssessmentContentData;
import org.t2k.cgs.model.tocItem.LessonContentData;
import org.t2k.cgs.model.tocItem.TocItem;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.model.tocItem.TocItemContent;
import org.t2k.cgs.model.tocItem.TocItemContentData;
import org.t2k.cgs.model.utils.ContentJsonUtils;
import org.t2k.cgs.publisher.PublisherService;
import org.t2k.cgs.security.CGSAccount;
import org.t2k.cgs.security.CGSUserDetails;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;
import org.t2k.cgs.security.annotations.AllowedForContentDeveloper;
import org.t2k.cgs.tocItem.TocItemDataService;
import org.t2k.cgs.tocItem.TocItemsManager;
import org.t2k.utils.ISO8601DateFormatter;

import javax.validation.ConstraintViolation;
import javax.validation.Valid;
import javax.validation.Validation;
import javax.validation.Validator;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Set;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 08/11/12
 * Time: 11:25
 */
@RestController
@AllowedForAllUsers
@RequestMapping("/publishers/{publisherId}/courses/{courseId}/tocItems")
public class TocItemsController {

    private static Logger logger = Logger.getLogger(TocItemsController.class);

    @Autowired
    private PublisherService publisherService;

    @Autowired
    private TocItemsManager tocItemsManager;

    @Autowired
    private CGSUserDetails currentCgsUserDetails;

    @Autowired
    private LockService lockService;

    @Autowired
    private CourseDataService courseDataService;
    @Autowired
    private CourseSearchService courseSearchService;

    private Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @RequestMapping(value = "{tocItemCid}", method = RequestMethod.GET)
    public String get(@PathVariable int publisherId,
                      @PathVariable String courseId,
                      @PathVariable String tocItemCid,
                      @RequestParam(value = "last-modified", required = false) String lastModified,
                      @RequestParam(value = "type", required = true) String type) throws Exception {
        ContentItem tocItem;
        TocItemDataService service = tocItemsManager.getServiceByType(type);
        try {
            if (logger.isDebugEnabled()) {
                logger.debug(String.format("get. publisher id:%d courseId: %stocItemCid: %s", publisherId, courseId, tocItemCid));
            }

            tocItem = service.get(publisherId, tocItemCid, courseId, ISO8601DateFormatter.toDate(lastModified), false);
        } catch (DsException e) {
            logger.error(String.format("get error, for tocItem with CId: %s", tocItemCid), e);
            throw e;
        }

        return tocItem == null ? null : tocItem.serializeContentData();
    }

//    @RequestMapping(value = "{tocItemCid}", method = RequestMethod.PUT)
//    public String saveNewTocItem(@PathVariable int publisherId,
//                                 @PathVariable String courseId,
//                                 @PathVariable String tocItemCid,
//                                 @RequestBody String tocItemJson,
//                                 @RequestParam(value = "type", required = true) String type) throws Exception {
//        TocItemCGSObject tocItemCGSObject;
//        TocItemDataService service = tocItemsManager.getServiceByType(type);
//        try {
//            if (logger.isDebugEnabled()) {
//                logger.debug(String.format("save. courseId :%s tocItemCid: %s tocItemJson: %s", courseId, tocItemCid, tocItemJson));
//            }
//
//            tocItemCGSObject = new TocItemCGSObject(tocItemJson, publisherId, courseId, EntityType.forName(type));
//            service.save(tocItemCGSObject, new LockUser(getCurrentCgsUserDetails()));
//        } catch (Exception e) {
//            logger.error("save error.", e);
//            throw e;
//        }
//        return tocItemCGSObject.serializeContentHeader();
//    }

    /**
     * Saves the tocItemJson contents - not only the tocItemJson json , the contents includes sequences
     *
     * @param publisherId    - publisher ID
     * @param courseId       - course ID
     * @param tocItemCid     - TocItem content ID
     * @param tocItemContent TocItemContent object
     * @return tocItemJson header ( with last modified)
     * @throws Exception
     */
    @RequestMapping(value = "{tocItemCid}/contents", method = RequestMethod.PUT)
    public ResponseEntity<Header> updateTocItem(@PathVariable int publisherId,
                                                @PathVariable String courseId,
                                                @PathVariable String tocItemCid,
                                                @RequestBody @Valid TocItemContent tocItemContent,
                                                @RequestParam(value = "type") String type) throws Exception {
        EntityType entityType = EntityType.forName(type);
        // we have to manually validate the received toc item, as we cannot use javax @Valid since we have both assessments and lessons
        TocItem tocItem;
        try {
            tocItem = TocItem.newInstance(courseId, publisherId, entityType, tocItemContent.getTocItemJson());
            Set<ConstraintViolation<TocItemContentData>> violations = validator.validate(tocItem.getContentData());
            if (violations.size() > 0) {
                logger.error(violations);
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        } catch (UnrecognizedPropertyException e) {
            logger.error(e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        String tocItemJson = tocItemContent.getTocItemJson();
        CGSAccount publisher = publisherService.getCurrentPublisherAccount();
        TocItemCGSObject tocItemCGSObject = new TocItemCGSObject(tocItemJson, publisherId, courseId, EntityType.forName(type));

        boolean authorized = true;
        if (tocItemCGSObject.isNew() && entityType == EntityType.LESSON) {
            authorized = tocItemsManager.isPublisherAuthorizedToCreateLesson(publisher, tocItemCGSObject);
        } else if (tocItemCGSObject.isNew() && entityType == EntityType.ASSESSMENT) {
            authorized = tocItemsManager.isPublisherAuthorizedToCreateAssessment(publisher, tocItemCGSObject);
        }
        if (!authorized) {
            logger.warn("Request to create TOC item without having the required privileges by user belonging to publisher " + publisher.getName());
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<Sequence> sequences = tocItemContent.getSequences();
        Header header = tocItemsManager.saveContents(publisherId, courseId, tocItem, sequences, currentCgsUserDetails, type);
        courseSearchService.index(courseDataService.getCourse(publisherId, courseId));
        return ResponseEntity.ok(header);
    }

    @AllowedForContentDeveloper
    @RequestMapping(value = "{tocItemCid}", method = RequestMethod.POST)
    public String updateProperties(@PathVariable int publisherId,
                                   @PathVariable String courseId,
                                   @RequestBody String tocItemJson,
                                   @RequestParam(value = "type", required = true) String type) throws Exception {
        TocItemCGSObject tocItemsCGSObject;
        TocItemDataService service = tocItemsManager.getServiceByType(type);
        try {
            tocItemsCGSObject = new TocItemCGSObject(tocItemJson, publisherId, courseId, EntityType.forName(type));
//            ContentValidator.validateIds(tocItemsCGSObject, tocItemCid);
            service.updateTocItemProperties(publisherId, courseId, tocItemsCGSObject, new LockUser(getCurrentCgsUserDetails()));
        } catch (DsException e) {
            logger.error("updateProperties error.", e);
            throw e;
        }

        return tocItemsCGSObject.serializeContentHeader();
    }

    /**
     * The method tries to acquire a lock on the tocItemJson by the requesting user.
     * The user details are contained in the request context(cookie).
     * On success , returns nothing (200OK) , else throws a LockException
     *
     * @param publisherId - publisher ID
     * @param tocItemCid  tocItem content ID
     * @throws Exception
     */
    @RequestMapping(value = "{tocItemCid}/lock", method = RequestMethod.POST)
    public void lockTocItem(@PathVariable int publisherId,
                            @PathVariable String courseId,
                            @PathVariable String tocItemCid,
                            @RequestParam(required = true) String action,
                            @RequestParam(value = "last-modified", required = false) String lastModified,
                            @RequestParam(value = "type", required = true) String type) throws Exception {
        TocItemDataService service = tocItemsManager.getServiceByType(type);
        try {
            Date lastModifiedDate = ISO8601DateFormatter.toDate(lastModified);
            LockAction lockAction = LockAction.forName(action);
            if (lockAction == null) {
                throw new IllegalArgumentException("lockAction(action) cannot be null");
            }

            ContentItemBase contentItemBase = service.getContentItemBase(publisherId, tocItemCid, courseId);
            //TODO: Replace the authorization "if" here with a filter
            if (currentCgsUserDetails.getRelatesTo().getId() != publisherId) {
                throw new LockException(ErrorCodes.CONTENT_IS_NOT_OWNED_BY_USER, String.format("User from publisher %d is not allowed to lock tocItem from publisher %d", currentCgsUserDetails.getRelatesTo().getId(), publisherId));
            }

            lockService.handleLockRequest(contentItemBase, new LockUser(getCurrentCgsUserDetails()), lockAction, lastModifiedDate);
        } catch (LockException lockErr) {
            logger.info("Lock action failed. LockException: ", lockErr);
            throw lockErr;
        } catch (ConflictException e) {
            logger.info("Lock action failed. ConflictException: ", e);
            throw e;
        } catch (Exception e) {
            logger.error("Lock action failed.", e);
            throw e;
        }
    }

    /**
     * Returns the lock data(json) of the given tocItemJson.
     *
     * @param publisherId - publisher ID
     * @param tocItemCid  tocItem content ID
     * @return Lock object when there is a lock , NULL when no lock on this course.
     * @throws Exception
     */
    @RequestMapping(value = "{tocItemCid}/lock", method = RequestMethod.GET)
    public Lock getTocItemLock(@PathVariable int publisherId,
                               @PathVariable String courseId,
                               @PathVariable String tocItemCid,
                               @RequestParam(value = "type", required = true) String type) throws Exception {
        TocItemDataService service = tocItemsManager.getServiceByType(type);
        ContentItemBase contentItemBase = service.getContentItemBase(publisherId, tocItemCid, courseId);
        //TODO: Replace the authorization "if" here with a filter
        if (currentCgsUserDetails.getRelatesTo().getId() != publisherId) {
            throw new LockException(ErrorCodes.CONTENT_IS_NOT_OWNED_BY_USER, String.format("User from publisher %d is not allowed to lock toItem from publisher %d", currentCgsUserDetails.getRelatesTo().getId(), publisherId));
        }

        return lockService.getLock(contentItemBase);
    }

    @RequestMapping(method = RequestMethod.GET)
    public String getTocItemsBasicDataForCourseLessonsMenu(@PathVariable int publisherId, @PathVariable String courseId) throws Exception {
        String result = null;
        List<TocItemCGSObject> tocItemCGSObjects;
        try {
            tocItemCGSObjects = courseDataService.getTocItemsBasicDataForCourseLessonsMenu(publisherId, courseId);
        } catch (DsException e) {
            logger.error("getTocItemsBasicDataForCourseLessonsMenu error", e);
            throw e;
        }

        if (!tocItemCGSObjects.isEmpty()) {
            result = ContentJsonUtils.createContentDataJsonArrayForLesson(tocItemCGSObjects);
        }
        return result;
    }

    protected CGSUserDetails getCurrentCgsUserDetails() {
        return currentCgsUserDetails;
    }

    /**
     * Validates a toc item JSON string versus {@link LessonContentData} or {@link AssessmentContentData}
     * using a {@link Validator}
     *
     * @param tocItemContentJson string representing the json of the toc item
     * @param entityType         type of the toc item: lesson or assessment
     * @return a set of encountered validation violations
     * @throws UnrecognizedPropertyException a JSON property that could not be mapped to an Object property
     * @throws IOException                   if any other I/O problem (unexpected end-of-input, network error) during
     *                                       the json deserialization process
     */
    private Set<ConstraintViolation<TocItemContentData>> validateTocItemContent(String tocItemContentJson, EntityType entityType)
            throws UnrecognizedPropertyException, IOException {
        TocItemContentData contentData = null;
        if (entityType == EntityType.LESSON) {
            contentData = new ObjectMapper().readValue(tocItemContentJson, LessonContentData.class);
        } else if (entityType == EntityType.ASSESSMENT) {
            contentData = new ObjectMapper().readValue(tocItemContentJson, AssessmentContentData.class);
        }
        return validator.validate(contentData);
    }
}