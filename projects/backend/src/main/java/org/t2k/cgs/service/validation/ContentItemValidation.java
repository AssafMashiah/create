package org.t2k.cgs.service.validation;

import com.mongodb.DBObject;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.ContentItem;
import org.t2k.cgs.domain.usecases.publisher.PublishError;
import org.t2k.cgs.domain.usecases.publisher.PublishErrors;
import org.t2k.cgs.domain.usecases.SequenceService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemDataService;
import org.t2k.sample.dao.exceptions.DaoException;

import java.io.File;
import java.util.Arrays;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 09/09/14
 * Time: 14:15
 * To change this template use File | Settings | File Templates.
 */
@Service
public class ContentItemValidation {

    private static Logger logger = Logger.getLogger(ContentItemValidation.class);

    @Autowired
    private SequenceService sequenceService;

    @Autowired
    @Qualifier(value = "lessonsDataServiceBean")
    private TocItemDataService tocItemDataService;

    private List<EntityType> lessonAndAssessment = Arrays.asList(EntityType.LESSON, EntityType.ASSESSMENT);

    /**
     * Asserts that all the assets (images, audio, video) exists in the file system.
     * does not validates that all sequences exist in mongo.
     *
     * @param errors                   - will hold the errors (if exists)
     * @param cmsPublisherHomeLocation - base path in the file system for the publisher's files
     * @return true if all files exists, false otherwise.
     */
    public Boolean doAllAssetsExistOnFileSystem(ContentItem contentItem, List<PublishError> errors, String cmsPublisherHomeLocation) {
        DBObject contentData = contentItem.getContentData();
        String itemId = contentItem.getEntityId();
        logger.debug(String.format("Assets validation started for item: %s with type: %s", itemId, contentItem.getEntityType()));
        boolean doesAllAssetsExists = true;
        List<String> assetsPaths = tocItemDataService.getAssetsPathsFromResource(contentData);
        for (String assetRefPath : assetsPaths) {
            if (assetRefPath.startsWith("cgsData")) { // We don't publish cgsData files so skip them.
                continue;
            }

            String assetTruePath = getAbsolutePath(assetRefPath, cmsPublisherHomeLocation);
            File asset = new File(assetTruePath);
            if (!asset.exists()) {
                logger.error("Validation error. Missing resource: " + assetRefPath);
                errors.add(new PublishError(PublishErrors.MissingAssetReference, itemId, "Asset is missing at path: " + assetRefPath));
                doesAllAssetsExists = false;
            }
        }

        if (doesAllAssetsExists) {
            logger.debug(String.format("Assets validation succeed for tocItem %s: %s. Validated %d files.", contentItem.getEntityType(), itemId, assetsPaths.size()));
        } else {
            logger.error(String.format("Assets validation failed for item: %s", itemId));
        }

        return doesAllAssetsExists;
    }

    /**
     * @param assetPath
     * @return the absolute path of the file
     */
    private String getAbsolutePath(String assetPath, String publisherCmsLocation) {
        return String.format("%s/%s", publisherCmsLocation, assetPath);
    }

    public boolean doAllSequencesExistOnDB(ContentItem contentItem, List<PublishError> errors) throws DsException {
        if (!lessonAndAssessment.contains(contentItem.getEntityType())) {
            logger.warn(String.format("Sequence validation method should be ran only on lessons and assessments.\nThe validation was executed on unverifiable entity: %s with id: %s", contentItem.getEntityType(), contentItem.getContentId()));
            return true;
        }

        DBObject contentData = contentItem.getContentData();
        String courseId = contentItem.getCGSData().get("courseId").toString();
        String tocItemId = contentItem.getContentId();
        logger.debug(String.format("Assets validation started for item: %s with type: %s", tocItemId, contentItem.getEntityType()));
        boolean doesAllAssetsExists = true;
        List<String> sequenceIds = tocItemDataService.getSequencesListFromContentItem(contentItem);

        if (!sequenceService.isAllSequencesExistOnDB(courseId, tocItemId, sequenceIds)) {
            doesAllAssetsExists = false;
            for (String sequenceId : sequenceIds) {
                if (!sequenceService.sequenceExists(sequenceId, tocItemId, courseId)) {
                    String message = String.format("Missing sequenceId %s, for tocItem: %s, course: %s: ", sequenceId, tocItemId, courseId);
                    logger.error(message);
                    errors.add(new PublishError(PublishErrors.MissingSequenceReference, message));

                }
            }
        }


        if (doesAllAssetsExists) {
            logger.debug(String.format("Sequences validation succeed for item %s: %s, validated %d sequences",contentItem.getEntityType(), tocItemId, sequenceIds.size()));
            return doesAllAssetsExists;
        } else {
            logger.error(String.format("Sequences validation failed for item %s: %s, validated %d sequences",contentItem.getEntityType(), tocItemId, sequenceIds.size()));
            return doesAllAssetsExists;
        }
    }

    /**
     * Main method for validation an entire course recursively - both course node and the toc items.
     * Asserts that all assets such as applets, media & pdfs exist on the cms file system
     * and also that all the sequences connected to the course\tocItems exist on DB
     *
     * @param contentNode
     * @param errors
     * @param cmsPublisherHomeLocation
     * @throws DaoException
     */
    public boolean doesAllDBResourcesAndFSAssetsExist(ContentItem contentNode, List<PublishError> errors, String cmsPublisherHomeLocation) throws DsException {
        boolean doesAllResourcesAndAssetsExist = true;
        if (lessonAndAssessment.contains(contentNode.getEntityType())) { // handle lessons and assessments
            if (!doAllSequencesExistOnDB(contentNode, errors)) { // validate sequences (not relevant for course node)
                doesAllResourcesAndAssetsExist = false;
            }
        }
        if (!doAllAssetsExistOnFileSystem(contentNode, errors, cmsPublisherHomeLocation)) {   // check assets on file system for both course and tocItems
            doesAllResourcesAndAssetsExist = false;
        }

        if (doesAllResourcesAndAssetsExist) {
            logger.info("Validation for sequences (on DB) and resources on file system - passed successfully.");
        } else {
            logger.error(String.format("Validation failed: %s", Arrays.toString(errors.toArray())));

        }
        return doesAllResourcesAndAssetsExist;
    }
}