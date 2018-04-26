package org.t2k.cgs.packaging.executors;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.t2k.cgs.model.packaging.CatalogName;
import org.t2k.cgs.model.packaging.PublishTarget;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 22/06/14
 * Time: 15:30
 */
@Service
public class PackageExecutorsFactory {

    @Autowired
    private BlossomExecutor blossomLessonExecutor;

    @Autowired
    private BlossomExecutor blossomCoursesExecutor;

    @Autowired
    private CatalogueExecutor catalogueExecutor;

    @Autowired
    private StandAloneExecutor standAloneExecutor;

    @Autowired
    private ScormExecutor scormExecutor;

    @Autowired
    private PublishToURLExecutor publishToURLExecutor;

    private Logger logger = Logger.getLogger(PackageExecutorsFactory.class);


    public PackagePublishExecutor get(PublishTarget type, CatalogName catalogName){
        switch (type) {
            case COURSE_TO_FILE:
                return standAloneExecutor;

            case LESSON_TO_FILE:
                return scormExecutor;

            case LESSON_TO_CATALOG:
                return blossomLessonExecutor;

            case COURSE_TO_CATALOG:
                if (catalogName == CatalogName.BLOSSOM)
                    return blossomCoursesExecutor;
                else
                    return catalogueExecutor;

            case COURSE_TO_URL:
            case LESSON_TO_URL:
                return publishToURLExecutor;

            default:
                logger.error(String.format("Cannot get a publisher executor for type %s. %s is not a valid PublishTarget", type, type));
                return null;
        }
    }
}
