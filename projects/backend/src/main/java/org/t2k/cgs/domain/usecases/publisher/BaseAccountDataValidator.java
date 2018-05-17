package org.t2k.cgs.domain.usecases.publisher;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.log4j.Logger;
import org.eel.kitchen.jsonschema.main.JsonSchema;
import org.eel.kitchen.jsonschema.main.JsonSchemaFactory;
import org.eel.kitchen.jsonschema.report.ValidationReport;
import org.eel.kitchen.jsonschema.util.JsonLoader;
import org.springframework.core.io.Resource;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;
import org.t2k.cgs.config.app.BaseAccountDataValidatorConfiguration;
import org.t2k.cgs.domain.model.exceptions.ValidationException;
import org.t2k.cgs.domain.model.utils.CGSValidationReport;

import java.io.*;

/**
 * Instances of this validator are created in {@link BaseAccountDataValidatorConfiguration}
 */
public class BaseAccountDataValidator implements Validator {
    private static Logger logger = Logger.getLogger(BaseAccountDataValidator.class);

    private Resource accountDataJsonSchemaResource;
    private boolean active = true;
    private JsonSchema jsonPublisherValidator = null;

    final JsonSchemaFactory factory = new JsonSchemaFactory.Builder().build();

    public BaseAccountDataValidator(Resource accountDataJsonSchemaResource,
                                    boolean active) throws IOException, ValidationException {
        this.accountDataJsonSchemaResource = accountDataJsonSchemaResource;
        this.active = active;
        initValidators();
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return String.class.isAssignableFrom(clazz);
    }

    @Override
    public void validate(Object target, Errors errors) {
        CGSValidationReport cgsValidationReport = null;
        try {
            JsonNode publisherJsonNode = JsonLoader.fromReader(new StringReader(target.toString()));

            ValidationReport validate = jsonPublisherValidator.validate(publisherJsonNode);

            if (!validate.isSuccess()) {
                errors.reject("publisher.invalid");
                for (String message : validate.getMessages()) {
                    logger.error(">>>>>" + message);
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void initValidators() throws IOException, ValidationException {
        logger.info("initValidators : ");

        Reader reader = null;
        try {
            reader = new BufferedReader(new InputStreamReader(accountDataJsonSchemaResource.getInputStream()));
            logger.info(" JSON Schema file : " + accountDataJsonSchemaResource.getFilename());
            JsonNode jsonNodeCourseSchema = JsonLoader.fromReader(reader);
            jsonPublisherValidator = factory.fromSchema(jsonNodeCourseSchema, "/accountType");

        } finally {
            if (reader != null) {
                reader.close();
            }
        }
        if (active) {
            logger.info("VALIDATION (account) IS ACTIVE!!! ");
        }
    }
}
