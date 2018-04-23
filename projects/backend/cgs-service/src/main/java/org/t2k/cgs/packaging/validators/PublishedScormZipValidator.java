package org.t2k.cgs.packaging.validators;

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.utils.ZipHelper;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.xml.XMLConstants;
import javax.xml.transform.Source;
import javax.xml.transform.sax.SAXSource;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.validation.Validator;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 24/11/14
 * Time: 21:09
 */
@Service
public class PublishedScormZipValidator {

    private Logger logger = Logger.getLogger(PublishedScormZipValidator.class);

    private final String EMPTY_COURSE_ERROR = "One of '{\"http://www.imsglobal.org/xsd/imscp_v1p1\":item}' is expected.";
    private final String EMPTY_TOCS_ERROR = "One of '{\"http://www.imsglobal.org/xsd/imscp_v1p1\":resources}' is expected.";
    private final String SCORM_MANIFEST = "imsmanifest.xml";
    private final String SCP_FOLDER = "scp";
    private Validator scormXSDValidator;
    private String tempScormSchemaPath = "scorm2004Schemas/";
    private File scormXSDsTempExtractionFolder = new File(tempScormSchemaPath);
    @Value("classpath:scormSchema/scorm2004XSD.zip")
    private Resource scormSchemasZip;

    @Autowired
    private PublishedStandAloneZipValidator publishedStandAloneZipValidator;

    // initializes the scormXSDValidator xsd files from resources/scormSchema folder
    // loads the xml files from a zip, unzips them into a temp folder and uses them
    // to initialize the scormXSDValidator
    @PostConstruct
    public void init() throws Exception {
        logger.debug("initializing scorm xsd schema validator - start");
        String filename = scormSchemasZip.getFilename();
        if (!scormSchemasZip.exists()) {
            throw new Exception(String.format("scormSchemaZip file %s does not exist.", filename));
        }
        logger.info(String.format("Initializing SCORM XSDs from zip file : %s", filename));

        if (scormXSDsTempExtractionFolder.exists() && scormXSDsTempExtractionFolder.isDirectory())
            FileUtils.cleanDirectory(scormXSDsTempExtractionFolder); // remove existing xsds from directory

        try {
            ZipHelper.decompressInputStream(scormSchemasZip.getInputStream(), scormXSDsTempExtractionFolder.getAbsolutePath()); // decompressing the schema zip to use it for validation
        } catch (Exception e) {
            logger.error(String.format("Error decompressing file %s", scormSchemasZip.getURL()), e);
            throw e;
        }

        StreamSource scormSchemaXsdImscp_v1p1 = new StreamSource(new File(scormXSDsTempExtractionFolder, "imscp_v1p1.xsd"));
        StreamSource scormSchemaXsdImsss = new StreamSource(new File(scormXSDsTempExtractionFolder, "imsss_v1p0.xsd"));
        StreamSource scormSchemaXsdLom = new StreamSource(new File(scormXSDsTempExtractionFolder, "lom.xsd"));
        Source[] schemaFile = {scormSchemaXsdImscp_v1p1, scormSchemaXsdImsss, scormSchemaXsdLom};
        SchemaFactory schemaFactory = SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);

        try {
            Schema schema = schemaFactory.newSchema(schemaFile);
            scormXSDValidator = schema.newValidator();
            logger.debug("initializing scorm xsd schema validator - complete");
        } catch (SAXException e) {
            logger.error("Could not init scorm XSD Validator - could not get all .XSD files", e);
            throw e;
        }
    }

    // deletes the temp folder with xsd files created by init method
    @PreDestroy
    public void tearDown() throws IOException {
        if (scormXSDsTempExtractionFolder.exists() && scormXSDsTempExtractionFolder.isDirectory())
            FileUtils.deleteDirectory(scormXSDsTempExtractionFolder);

        logger.debug(String.format("Removed temp folder with scorm XSD files: %s", scormXSDsTempExtractionFolder.getAbsoluteFile()));
    }

    public void validateAndExtractSCORMPackage(File cgsPackedFile, File extractionDirectory, CGSPackage cgsPackage) throws Exception {
        extractZip(cgsPackedFile, extractionDirectory);
        validateExtractedSCORMPackage(extractionDirectory, cgsPackage);
    }

    private void extractZip(File cgsPackedFile, File extractionDirectory) throws Exception {
        logger.debug("Decompressing started");
        ZipHelper.decompressZipFileForScorm(cgsPackedFile.getAbsolutePath(), extractionDirectory.getAbsolutePath());
        logger.debug("Decompressing completed");
        if (extractionDirectory.listFiles() == null) {
            throw new Exception(String.format("Could not list files on the extracted zip directory %s", extractionDirectory));
        }
    }

    public void validateExtractedSCORMPackage(File extractionDirectory, CGSPackage cgsPackage) throws Exception {
        validateAllFilesExistOnRootDir(extractionDirectory, cgsPackage);
        validateCourseZip(extractionDirectory);
    }

    public void validateScormXml(File scormManifest) throws Exception {
        InputStream inputStream = new FileInputStream(scormManifest);
        InputSource is = new InputSource(inputStream);
        SAXSource saxSource = new SAXSource(is);

        try {
            scormXSDValidator.validate(saxSource);
            logger.debug(String.format("%s is a valid SCORM xml", scormManifest.getAbsoluteFile()));
        } catch (Exception e) {
            String message = String.format("Manifest xml validation for SCORM failed.\n%s is NOT valid\nReason: %s", scormManifest.getAbsolutePath(), e.getLocalizedMessage());
            // this specific error message indicates that the xml has no resources in it, meaning that this course has no lessons or assessments
            // in that case we want to give the user a clear message about it.
            if (e.getMessage().contains(EMPTY_COURSE_ERROR) || e.getMessage().contains(EMPTY_TOCS_ERROR)) {
                message = "Cannot publish a course with no lessons or assessments.\n" + message;
            }
            throw new Exception(message, e);
        } finally {
            inputStream.close(); // closing xml input stream
        }
    }

    private void validateCourseZip(File extractedFolder) throws Exception {
        publishedStandAloneZipValidator.validateExtractedStandAlonePackage(getCourseFolder(extractedFolder));
    }

    private void validateAllFilesExistOnRootDir(File extractionDirectory, CGSPackage cgsPackage) throws Exception {
        File[] filesOnRoot = extractionDirectory.listFiles();
        boolean playerFound = false;
        boolean courseFound = false;
        boolean manifestFound = false;

        for (File f : filesOnRoot) {
            String filename = f.getName();
            if (filename.equals(SCORM_MANIFEST))
                manifestFound = true;
            if (filename.equals(SCP_FOLDER))
                playerFound = true;
            if (filename.equals(cgsPackage.getCourseCId()))
                courseFound = true;
        }

        String filesInFolder = Arrays.toString(filesOnRoot);

        if (!manifestFound)
            throw new Exception(String.format("manifest was not found on SCORM zip base dir, Files in folder: %s", filesInFolder));
        if (!courseFound)
            throw new Exception(String.format("course folder was not found on SCORM zip base dir, Files in folder: %s", filesInFolder));
        if (!playerFound)
            throw new Exception(String.format("scp folder was not found on SCORM zip base dir, Files in folder: %s", filesInFolder));
        if (filesOnRoot.length != 3)
            throw new Exception(String.format("The number of files in SCORM zip should be exactly 3: player folder, course folder and manifest, Files in folder: %s", filesInFolder));

    }

    private File getCourseFolder(File extractionDirectory) {
        File[] filesOnRoot = extractionDirectory.listFiles();

        for (File f : filesOnRoot) {
            String filename = f.getName();
            if (!filename.equals(SCORM_MANIFEST) && !filename.equals(SCP_FOLDER)) {
                return f;
            }
        }
        return null;
    }
}