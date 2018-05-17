package org.t2k.cgs.service.packaging;

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.packaging.CGSPackage;
import org.t2k.cgs.domain.usecases.packaging.ContentValidator;
import org.t2k.cgs.domain.usecases.packaging.SchemaHandler;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 22/06/14
 * Time: 15:51
 */
@Service
public class SchemaHandlerImpl implements SchemaHandler {

    @Autowired
    private ContentValidator contentValidator;

    private static Logger logger = Logger.getLogger(SchemaHandlerImpl.class);

    @Override
    public void addCgsSchemaVersionToPackage(PackageHandlerImpl packageHandler) throws Exception {

        try {
            Resource courseJsonSchemaResource = contentValidator.getCourseJsonSchemaResource();

            BufferedReader reader = new BufferedReader(new InputStreamReader(courseJsonSchemaResource.getInputStream()));
            String line;
            StringBuilder schema = new StringBuilder();
            while ((line = reader.readLine()) != null) {
                schema.append(line);
            }
            String basePath = packageHandler.getCGSPackage().getLocalResourcesLocation().getBasePath();
            String schemaPath = String.format("%s/schema/%s", basePath, contentValidator.getSchemaName());
            FileUtils.writeStringToFile(new File(schemaPath), schema.toString(), "UTF-8");
            packageHandler.addResourceToPackage(schemaPath);
        } catch (IOException e) {
            CGSPackage cgsPackage =  packageHandler.getCGSPackage();
            logger.warn(String.format("addCgsSchemaVersionToPackage : could not add schema for packageId: %s, courseId: %s .. ignoring .",cgsPackage.getPackId(),cgsPackage.getCourseId()),e);
        }
    }

}
