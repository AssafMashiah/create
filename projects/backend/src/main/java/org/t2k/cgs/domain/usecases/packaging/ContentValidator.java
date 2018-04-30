package org.t2k.cgs.domain.usecases.packaging;

import com.fasterxml.jackson.databind.JsonNode;
import com.mongodb.DBObject;
import org.apache.commons.io.FilenameUtils;
import org.apache.log4j.Logger;
import org.eel.kitchen.jsonschema.main.JsonSchema;
import org.eel.kitchen.jsonschema.main.JsonSchemaFactory;
import org.eel.kitchen.jsonschema.report.ValidationReport;
import org.eel.kitchen.jsonschema.util.JsonLoader;
import org.springframework.core.io.Resource;
import org.t2k.cgs.domain.model.ContentItem;
import org.t2k.cgs.domain.model.exceptions.ErrorCodes;
import org.t2k.cgs.domain.model.exceptions.ValidationException;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.model.utils.CGSValidationReport;
import org.t2k.cgs.persistence.dao.EntityType;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 09/11/12
 * Time: 18:18
 */
public class ContentValidator {

    private static Logger logger = Logger.getLogger(ContentValidator.class);

    private JsonSchema jsonCourseValidator = null;
    private JsonSchema jsonLessonValidator = null;
    private JsonSchema jsonDiffSequenceValidator = null;
    private JsonSchema jsonRegSequenceValidator = null;
    private JsonSchema jsonAssessmentValidator = null;
    private JsonSchema jsonSequenceRefValidator = null;

    final JsonSchemaFactory factory = new JsonSchemaFactory.Builder().build();
    //
    private boolean isActive = true;

    private Resource courseJsonSchemaResource;
    private String schemaName;

    public ContentValidator(Resource courseJsonSchemaResource) throws IOException, ValidationException {
        this.courseJsonSchemaResource = courseJsonSchemaResource;
        initValidators();
    }

    /**
     * sets up the validators with the relevant schemas.
     *
     * @throws java.io.IOException
     * @throws ValidationException
     */
    private void initValidators() throws IOException, ValidationException {
        logger.info("initValidators : ");
        try (Reader reader = new BufferedReader(new InputStreamReader(courseJsonSchemaResource.getInputStream()))) {
            logger.info(" JSON Schema file : " + courseJsonSchemaResource.getFilename());
            JsonNode jsonNodeCourseSchema = JsonLoader.fromReader(reader);
            jsonCourseValidator = factory.fromSchema(jsonNodeCourseSchema, "/courseType");
            jsonLessonValidator = factory.fromSchema(jsonNodeCourseSchema, "/lessonType");
            jsonAssessmentValidator = factory.fromSchema(jsonNodeCourseSchema, "/assessmentType");
            jsonDiffSequenceValidator = factory.fromSchema(jsonNodeCourseSchema, "/differentialSequenceType");
            jsonRegSequenceValidator = factory.fromSchema(jsonNodeCourseSchema, "/regularSequenceType");
            jsonSequenceRefValidator = factory.fromSchema(jsonNodeCourseSchema, "/sequenceRefType");
            schemaName = FilenameUtils.getBaseName(courseJsonSchemaResource.getURI().toURL().getPath());
        }
        if (!isActive()) {
            logger.warn("VALIDATION IS NOT ACTIVE!!! ");
        }
    }

    /**
     * A method to validate a content item.
     * Works only if validator is active. otherwise , ignores request.
     * if the content is valid, the method will not throw an exception,
     * if not , an exception with a proper message will be thrown
     *
     * @param contentItem - content item to validte
     * @throws ValidationException thrown when the content item is invalid.
     */
    public void validate(ContentItem contentItem) throws ValidationException {
        CGSValidationReport cgsValidationReport = new CGSValidationReport();
        if (isActive()) {
            switch (contentItem.getEntityType()) {
                case COURSE: {
                    cgsValidationReport = validateCourseJson(contentItem);
                    break;
                }
                case LESSON: {
                    cgsValidationReport = validateLessonJson((TocItemCGSObject) contentItem);
                    break;
                }
                case ASSESSMENT: {
                    cgsValidationReport = validateAssessmentJson((TocItemCGSObject) contentItem);
                    break;
                }
            }
        }
        if (!cgsValidationReport.isSuccess()) {
            StringBuffer stringBuffer = new StringBuffer();
            for (String message : cgsValidationReport.getMessages()) {
                stringBuffer.append(message);
                stringBuffer.append("\n");
            }
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, stringBuffer.toString());
        }
    }

    private CGSValidationReport validateCourseJson(ContentItem course) throws ValidationException {
        try {
            if (logger.isDebugEnabled()) {
                logger.debug("validateCourseJson : courseId: " + course.getContentId());
            }
            if (isActive) {
                JsonNode jsonNodeData = JsonLoader.fromReader(new StringReader(course.serializeContentData()));
                return validateContent(jsonCourseValidator, jsonNodeData);
            } else {
                logger.warn("VALIDATION IS NOT ACTIVE!!! ");
            }
        } catch (IOException e) {
            logger.error("validateCourseJson ", e);
            throw new ValidationException(ErrorCodes.SCHEMA_IO_ERROR, e.getMessage());
        }
        return null;
    }

    private CGSValidationReport validateLessonJson(TocItemCGSObject lesson) throws ValidationException {
        CGSValidationReport cgsValidationReportReturn = new CGSValidationReport();
        try {
            if (logger.isDebugEnabled()) {
                logger.debug(String.format("validateLessonJson : lessonId: %s", lesson.getContentId()));
            }
            if (isActive) {
                JsonNode jsonNodeData = JsonLoader.fromReader(new StringReader(lesson.serializeContentData()));

                CGSValidationReport cgsValidationReportLesson = validateContent(jsonLessonValidator, jsonNodeData);

                List<DBObject> sequences = lesson.getSequences();
                List<CGSValidationReport> cgsValidationReports = validateSequences(sequences);
                cgsValidationReports.add(cgsValidationReportLesson);
                for (CGSValidationReport cgsValidationReport : cgsValidationReports) { //TODO: this loop is messed up
                    if (!cgsValidationReport.isSuccess()) {
                        cgsValidationReportReturn.setSuccess(false);
                    }
                    cgsValidationReportReturn.addMessages(cgsValidationReport.getMessages());
                }
                return cgsValidationReportReturn;

            } else {
                logger.warn("VALIDATION IS NOT ACTIVE!!! ");
            }
        } catch (IOException e) {
            logger.error("validateLessonJson failed", e);
            throw new ValidationException(ErrorCodes.SCHEMA_IO_ERROR, e.getMessage());
        }
        return null;
    }

    private CGSValidationReport validateAssessmentJson(TocItemCGSObject assessment) throws ValidationException {
        try {
            if (logger.isDebugEnabled()) {
                logger.debug(String.format("validateAssessmentJson : assessmentId: %s", assessment.getContentId()));
            }
            if (isActive) {
                JsonNode jsonNodeData = JsonLoader.fromReader(new StringReader(assessment.serializeContentData()));

                return validateContent(jsonAssessmentValidator, jsonNodeData);

            } else {
                logger.warn("VALIDATION IS NOT ACTIVE!!! ");
            }
        } catch (IOException e) {
            logger.error("validateAssessmentJson ", e);
            throw new ValidationException(ErrorCodes.SCHEMA_IO_ERROR, e.getMessage());
        }
        return null;
    }

    //!!!!the tool that we are using does not support validation of list, that contains entities of different types.
    // once the the bug will be fixed in this tool we should use schema validation. See also "genericSequenceType" in schema.json
    private List<CGSValidationReport> validateSequences(List<DBObject> sequences) throws IOException, ValidationException {
        List<CGSValidationReport> cgsValidationReports = new ArrayList<>();

        for (DBObject seqDbObject : sequences) {
            EntityType sequenceType = getSequenceType(seqDbObject);
            String seqCid = seqDbObject.get("cid").toString();
            CGSValidationReport cgsValidationReport = null;
            if (sequenceType.equals(EntityType.SEQUENCE_DIFFERENTIAL)) {
                cgsValidationReport = validateContent(jsonDiffSequenceValidator, JsonLoader.fromString(seqDbObject.toString()));
            } else if (sequenceType.equals(EntityType.SEQUENCE_REGULAR)) {
                cgsValidationReport = validateContent(jsonRegSequenceValidator, JsonLoader.fromString(seqDbObject.toString()));
            } else if (sequenceType.equals(EntityType.SEQUENCE_REF)) {
                cgsValidationReport = validateContent(jsonSequenceRefValidator, JsonLoader.fromString(seqDbObject.toString()));
            } else if (sequenceType.equals(EntityType.SEQUENCE_ASSESSMENT)) {
                cgsValidationReport = validateContent(jsonRegSequenceValidator, JsonLoader.fromString(seqDbObject.toString()));
            }

            if (cgsValidationReport == null || !cgsValidationReport.isSuccess()) {
                logger.error(String.format("validateSequences failed for seqId: %s, type: %s", seqCid, sequenceType));
            }
            cgsValidationReports.add(cgsValidationReport);
        }
        return cgsValidationReports;
    }

    public static EntityType getSequenceType(DBObject sequenceDbObject) {
        if (sequenceDbObject.get("type").equals(EntityType.SEQUENCE_DIFFERENTIAL.getName())) {
            return EntityType.SEQUENCE_DIFFERENTIAL;
        } else if (sequenceDbObject.get("type").equals(EntityType.SEQUENCE_REF.getName())) {
            return EntityType.SEQUENCE_REF;
        } else if (sequenceDbObject.get("type").equals(EntityType.SEQUENCE_ASSESSMENT.getName())) {
            return EntityType.SEQUENCE_ASSESSMENT;
        } else {
            return EntityType.SEQUENCE_REGULAR;
        }
    }

    /**
     * validates a json course string.
     *
     * @param courseJson - course json to validate (as appearing on DB)
     * @return CGSValidationReport with the validation results
     * @throws ValidationException
     */
    public CGSValidationReport validateCourseJson(String courseJson) throws ValidationException {
        try {
            JsonNode jsonNodeData = JsonLoader.fromReader(new StringReader(courseJson));
            return validateContent(jsonCourseValidator, jsonNodeData);
        } catch (IOException e) {
            logger.error("validateCourseJson failed", e);
            throw new ValidationException(ErrorCodes.SCHEMA_IO_ERROR, e.getMessage());
        }
    }

    /**
     * validates a json lesson string.
     *
     * @param lessonJson - lesson manifest as appears on DB
     * @return CGSValidationReport with the validation results
     * @throws ValidationException
     */
    public CGSValidationReport validateLessonJson(String lessonJson) throws ValidationException {
        try {
            JsonNode jsonNodeData = JsonLoader.fromReader(new StringReader(lessonJson));
            return validateContent(jsonLessonValidator, jsonNodeData);
        } catch (IOException e) {
            logger.error("validateLessonJson failed", e);
            throw new ValidationException(ErrorCodes.SCHEMA_IO_ERROR, e.getMessage());
        }
    }

    /**
     * Validates content against a initiated Validator (schema).
     *
     * @param jsonValidator - validation schema to be used for validation
     * @param content       - content to validate
     * @throws org.t2k.cgs.domain.model.exceptions.ValidationException when validation fails
     */
    public CGSValidationReport validateContent(JsonSchema jsonValidator, JsonNode content) throws ValidationException {
        CGSValidationReport cgsValidationReport = new CGSValidationReport();
        ValidationReport validate;

        validate = jsonValidator.validate(content);
        if (!validate.isSuccess()) {
            List<String> messages = validate.getMessages();
            cgsValidationReport.addMessages(messages);
            cgsValidationReport.setSuccess(false);
            logger.error(String.format("validateContent failed: validation errors: %s", cgsValidationReport.getMessages()));
        }
        return cgsValidationReport;
    }

    public boolean isActive() {
        return isActive;
    }

    public Resource getCourseJsonSchemaResource() {
        return courseJsonSchemaResource;
    }

    public String getSchemaName() {
        return schemaName;
    }
}