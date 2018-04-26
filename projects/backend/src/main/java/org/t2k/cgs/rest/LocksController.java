package org.t2k.cgs.rest;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.t2k.cgs.course.CourseDataService;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.lock.LockService;
import org.t2k.cgs.locks.Lock;
import org.t2k.cgs.locks.LockWrapper;
import org.t2k.cgs.model.ContentItemBase;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.security.CGSUserDetails;
import org.t2k.cgs.security.annotations.AllowedForAllUsers;
import org.t2k.cgs.security.annotations.AllowedForT2KAdmin;
import org.t2k.cgs.tocItem.TocItemsManager;

import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 12/2/12
 * Time: 10:17 AM
 */
@RestController
@AllowedForT2KAdmin
@RequestMapping(value = "/publishers/{publisherId}")
public class LocksController {

    private static final Logger logger = Logger.getLogger(LocksController.class);

    @Autowired
    private LockService lockService;

    @Autowired
    private CourseDataService courseDataService;

    @Autowired
    private TocItemsManager tocItemsManager;

    @Autowired
    private CGSUserDetails currentUser;

    @RequestMapping(value = "/locks", method = RequestMethod.GET)
    public List<LockWrapper> getLocks(@PathVariable int publisherId) throws Exception{
        logger.info("Getting list of locks publisherId: " + publisherId);
        List<Lock> locks = lockService.getLocks(publisherId);
        //wrap locks with wrappers
        List<LockWrapper> wrappedLocksList = new LinkedList<>();
        String lessonName=null;
        String courseName=null;
        for(Lock lock : locks){
            try {
                if(lock.getEntityType().equals(EntityType.LESSON)){
                    TocItemCGSObject lesson = tocItemsManager.getServiceByType(EntityType.LESSON).get(lock.getEntityId(), true);
                    String courseId = lesson.getCourseId();
                    ContentItemBase contentItemBase = courseDataService.getContentItemBase(courseId);
                    lessonName=lesson.getTitle();
                    courseName=contentItemBase.getTitle();
                }else if(lock.getEntityType().equals(EntityType.COURSE)){
                    courseName=lock.getEntityName();
                }
            } catch (DsException e) {
                logger.error("getLocks .. . error while getting names  /SKIPPING/ . for lock : "+lock.toString());
            }

            wrappedLocksList.add(new LockWrapper(lock,courseName,lessonName));
        }

        return wrappedLocksList;

    }

    @AllowedForAllUsers
    @RequestMapping(value = "/locks/course/{courseId}", method = RequestMethod.GET)
    public List<Lock> getLocksByCourse(@PathVariable int publisherId, @PathVariable String courseId) throws Exception {
        logger.info(String.format("Getting list of locks for publisherId: %s, courseId: %s", publisherId, courseId));
        List<Lock> locks = lockService.checkNonSystemUsersLocksOnCourse(publisherId, courseId);
        if (locks == null) {
            return new ArrayList<>();
        }
        return locks;
    }

    @RequestMapping(value = "/locks/{entityType}/{entityId}", method = RequestMethod.DELETE)
    public void releaseLock(@PathVariable int publisherId, @PathVariable String entityType, @PathVariable String entityId) throws Exception {

        logger.info("Releasing lock entityType: " + entityType + " entityId:" + entityId + " publisherId:" + publisherId);
        lockService.forceReleaseLock(entityId);
    }
}
