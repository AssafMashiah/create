package org.t2k.cgs.service.scheduling;

import com.t2k.configurations.Configuration;
import org.apache.log4j.Logger;
import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.model.course.CoursesDao;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.course.CourseCGSObject;
import org.t2k.cgs.domain.model.utils.CGSValidationReport;
import org.t2k.sample.dao.exceptions.DaoException;

import javax.annotation.PostConstruct;
import java.util.Date;
import java.util.List;

/**
 * Created by asaf.shochet on 08/10/2014.
 */
@Service
public class ValidationScheduler {

    private Logger logger = Logger.getLogger(ValidationScheduler.class);

    @Autowired
    private CourseDataService courseDataService;

    @Autowired
    private CoursesDao courseDao;

    @Autowired
    private Configuration configuration;

    private final String cronExpression = "0 0 23 1/1 * ?";     // Method executed at every day at 23:00 (server time)

    int daysBackInt;

    boolean enableScheduledValidation;

    final String ENABLE_SCHEDULED_VALIDATION_KEY = "enableScheduledValidation";

    final String DAYS_TO_LOOK_BACK_KEY = "daysToLookBackForModifiedCourses";

    //validates that all parameters exist on configurations and sets them to local variables
    @PostConstruct
    public void init() {
        if (configuration.getProperty(ENABLE_SCHEDULED_VALIDATION_KEY) == null)
            throw new ExceptionInInitializerError("Could not find parameters in configurations: " + ENABLE_SCHEDULED_VALIDATION_KEY);
        if (configuration.getProperty(DAYS_TO_LOOK_BACK_KEY) == null)
            throw new ExceptionInInitializerError("Could not find parameters in configurations: " + DAYS_TO_LOOK_BACK_KEY);

        enableScheduledValidation = configuration.getBooleanProperty(ENABLE_SCHEDULED_VALIDATION_KEY);
        daysBackInt = configuration.getIntProperty(DAYS_TO_LOOK_BACK_KEY);

    }

    @Scheduled(cron = cronExpression) // TODO: take from configuration somehow
    public void validateNewlySavedCourses() throws DsException, DaoException {
        if (enableScheduledValidation == false) {
            logger.debug("Aborting scheduled validation - it is disabled in config file.");
            return;
        }


        Date validationStart = new Date();
        Date earliestDateToCheck = new DateTime().minusDays(daysBackInt).toDate();
        List<CourseCGSObject> recentlySavedCourses = courseDao.getModifiedCoursesAfterDate(earliestDateToCheck);
        logger.debug(String.format("About to perform daily saved courses validation for %d courses.", recentlySavedCourses.size()));
        int passed = 0;
        int failed = 0;

        for (CourseCGSObject course : recentlySavedCourses) {
            int publisherId = course.getPublisherId();
            String courseId = course.getEntityId();
            CGSValidationReport validationReport = courseDataService.validateCourseAndSubElements(publisherId, courseId);
            if (validationReport.isSuccess()) {
                passed++;
            } else {
                failed++;
                logger.error(String.format("Validation failed for course %s, publisher %d.\nDetails: %s", courseId, publisherId, validationReport));
            }
        }
        Date validationFinish = new Date();

        logger.info(String.format("Scheduled courses validation complete: %d passed, %d failed. Started: %s, finished: %s.", passed, failed, validationStart, validationFinish));


    }

}
