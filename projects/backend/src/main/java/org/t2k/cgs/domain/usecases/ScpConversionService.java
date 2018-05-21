package org.t2k.cgs.domain.usecases;

import java.util.Map;

/**
 * Created by thalie.mukhtar on 19/11/2015.
 */
public interface ScpConversionService {
    Map<String, Object> convertLessonToScpFormat(int publisherId, String courseId, String lessonJson) throws Exception;
}
