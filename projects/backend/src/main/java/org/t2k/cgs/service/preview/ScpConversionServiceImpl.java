package org.t2k.cgs.service.preview;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.course.CourseDataService;
import org.t2k.cgs.domain.usecases.ScpConversionService;

import javax.inject.Inject;
import java.util.Map;

/**
 * Created by thalie.mukhtar on 18/11/2015.
 */
@Service("scpConversionService")
public class ScpConversionServiceImpl implements ScpConversionService {

    private CourseDataService courseDataService;

    @Autowired
    private ApplicationContext appContext;

    @Inject
    public ScpConversionServiceImpl(CourseDataService courseDataService,
                                    ApplicationContext appContext) {
        this.courseDataService = courseDataService;
        this.appContext = appContext;
    }

    public Map<String, Object> convertLessonToScpFormat(int publisherId, String courseId, String lessonJson) throws Exception {
        ScpConverter converter = (ScpConverter) appContext.getBean("scpConverter"); // FIXME: 1/5/17 bad implementation
        return converter.convertLessonToScpFormat(publisherId, courseId, lessonJson, courseDataService);
    }
}
