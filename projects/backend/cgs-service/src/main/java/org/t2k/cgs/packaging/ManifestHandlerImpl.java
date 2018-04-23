package org.t2k.cgs.packaging;

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ArrayNode;
import org.codehaus.jackson.node.JsonNodeFactory;
import org.codehaus.jackson.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.t2k.cgs.dao.courses.CoursesDao;
import org.t2k.cgs.dao.standards.StandardsDao;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.dataServices.exceptions.ErrorCodes;
import org.t2k.cgs.dataServices.exceptions.ResourceNotFoundException;
import org.t2k.cgs.dataServices.exceptions.ValidationException;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.utils.PackageSchemaConversionUtil;
import org.t2k.sample.dao.exceptions.DaoException;
import org.t2k.utils.ISO8601DateFormatter;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;

/**
 * Instances of this class are created in {@link ManifestHandlerConfiguration}
 */
public class ManifestHandlerImpl implements ManifestHandler {

    private static Logger logger = Logger.getLogger(ManifestHandlerImpl.class);

    private static Logger publishLog = Logger.getLogger("publishing");

    @Autowired
    private CoursesDao coursesDao;

    @Autowired
    private StandardsDao standardsDao;

    private boolean doChangeFileNamesToSha1;

    private boolean doCleanExcludedResourcesFromManifest;

    public ManifestHandlerImpl(boolean doChangeFileNamesToSha1,
                               boolean doCleanExcludedResourcesFromManifest) {
        this.doChangeFileNamesToSha1 = doChangeFileNamesToSha1;
        this.doCleanExcludedResourcesFromManifest = doCleanExcludedResourcesFromManifest;
    }

    @Override
    public void handlePackageManifest(PackageHandlerImpl packageHandler) throws Exception {
        CGSPackage cgsPackage = packageHandler.getCGSPackage();
        logger.info("handlePackageManifest: packId: " + cgsPackage.getPackId());
        try {
            if (!packageHandler.isCanceled()) {
                JsonNode courseRootNode = getCourseJson(cgsPackage);
                ((ObjectNode) courseRootNode).put("publisher", cgsPackage.getPublisherName());

                packageHandler.setCourseNode(courseRootNode);
                handleCourseCustomizationPackNodes(packageHandler);

                if (getDoCleanExcludedResourcesFromManifest()) {
                    JsonNode jNode = packageHandler.getCourseNode().get("toc");
                    cleanExcludedFromManifest(jNode, cgsPackage.getScormExcludeTocItemsIds());
                }
                cleanManifest(packageHandler);

                List<String> prefixesToRemove = new ArrayList<>();
                prefixesToRemove.add(ContentParseUtil.CGS_DATA);
                packageHandler.scanResourceTableAndFilterByPrefix(packageHandler.getCourseNode(), prefixesToRemove, doChangeFileNamesToSha1());
                scanStandardsTable(packageHandler.getCourseNode(), packageHandler);
                PackageSchemaConversionUtil.convertPackageData(packageHandler.getCourseNode());

                signManifest(packageHandler);
                File courseFile = new File(String.format("%s/manifest", cgsPackage.getLocalResourcesLocation().getBasePath()));
                logger.info(String.format("handlePackageManifest: write file to tmp: %s", courseFile.getAbsolutePath()));
                ObjectMapper mapper = new ObjectMapper();
                mapper.writeValue(courseFile, courseRootNode);
                packageHandler.addResourceToPackage(courseFile.getAbsolutePath());  // adding manifest to package's resources set
                List<String> eBooks = new ObjectMapper().convertValue(courseRootNode.get("eBooksIds"), ArrayList.class);
                packageHandler.addEBooksToPackage(eBooks);
            } else {
                logger.info("handlePackageManifest cancelled.");
            }
        } catch (Exception e) {
            logger.error(String.format("handlePackageManifest failed for packageId: %s, courseId: %s.", cgsPackage.getPackId(), cgsPackage.getCourseId()), e);
            throw e;
        }
    }

    private void scanStandardsTable(JsonNode courseNode, PackageHandlerImpl packageHandler) throws DsException {
        CGSPackage cgsPackage = packageHandler.getCGSPackage();
        logger.info("scanStandardsTable: start packId: " + cgsPackage.getPackId());
        int numOfStandardPackages = 0;
        JsonNode standardPackagesNode = courseNode.get(ContentParseUtil.STANDARD_PACKAGES);
        if (standardPackagesNode != null) {
            Iterator<JsonNode> iterator = standardPackagesNode.iterator();
            boolean standardsDirExists = false;
            while (iterator.hasNext()) {
                JsonNode standardPackageNode = iterator.next();

                String name = standardPackageNode.get(ContentParseUtil.STANDARD_PACKAGE_NAME).getTextValue();
                String subjectArea = standardPackageNode.get(ContentParseUtil.STANDARD_PACKAGE_SUBJECT_AREA).getTextValue();
                String version = standardPackageNode.get(ContentParseUtil.STANDARD_PACKAGE_VERSION).getTextValue();
                String standardPackage = standardsDao.getStandardsPackage(name, subjectArea, version);

                if (standardPackage == null) {
                    logger.warn(String.format("Standard package %s, %s, %s wasn't found and will not be included in the package", name, subjectArea, version));
                    continue;
                }

                try {
                    if (!standardsDirExists) {
                        File standardsDir = new File(String.format("%s/standards", cgsPackage.getLocalResourcesLocation().getBasePath()));
                        FileUtils.forceMkdir(standardsDir);
                        standardsDirExists = true;
                    }

                    String standardsPackageFileName = String.format("%s_%s_%s.json", name, subjectArea, version);
                    File standardsPackageFile = new File(String.format("%s/standards/%s", cgsPackage.getLocalResourcesLocation().getBasePath(), standardsPackageFileName));

                    FileUtils.writeStringToFile(standardsPackageFile, standardPackage, "UTF-8");

                    packageHandler.addResourceToPackage(standardsPackageFile.getAbsolutePath());

                    numOfStandardPackages++;
                } catch (IOException e) {
                    logger.error(String.format("Failed to package standards: {%s, %s, %s} for packageId: %s, courseId: %s.", name, subjectArea, version, cgsPackage.getPackId(), cgsPackage.getCourseId()), e);

                }
            }
            logger.info(String.format("scanStandardsTable: number of packages = %d", numOfStandardPackages));
        } else {
            logger.info("scanStandardsTable: found a course with no standard packages ..");
        }
    }

    private JsonNode getCourseJson(CGSPackage cgsPackage) throws DaoException, ResourceNotFoundException, IOException {
        String courseId = cgsPackage.getCourseId();
        CourseCGSObject course = coursesDao.getCourse(courseId, false);
        if (course == null) {
            throw new ResourceNotFoundException(courseId, String.format("Course not found in storage %s", courseId));
        }

        if (course != null) {
            publishLog.debug(String.format("COURSE VERSION FROM DB: %s", course.getCgsCourseVersion()));
        }

        String courseJson = course.serializeContentData();
        ObjectMapper mapper = new ObjectMapper();
        return mapper.readTree(courseJson);
    }

    private boolean cleanExcludedFromManifest(JsonNode tocItem, List<String> excluded) {
        JsonNode items = tocItem.get("tocItems");
        Iterator<JsonNode> itItems = items.iterator();
        while (itItems.hasNext()) {
            JsonNode item = itItems.next();
            boolean empty = cleanExcludedFromManifest(item, excluded);
            if (empty)
                itItems.remove();
        }

        JsonNode refs = tocItem.get("tocItemRefs");
        Iterator<JsonNode> itRefs = refs.iterator();
        while (itRefs.hasNext()) {
            JsonNode ref = itRefs.next();
            if (excluded.contains(ref.get("cid").getTextValue())) {
                itRefs.remove();
            }
        }

        Iterator<JsonNode> check1 = refs.iterator();
        Iterator<JsonNode> check2 = items.iterator();
        return !check1.hasNext() && !check2.hasNext();
    }

    private void signManifest(PackageHandlerImpl packageHandler) {
        CGSPackage cgsPackage = packageHandler.getCGSPackage();
        logger.info(String.format("signManifest: packId: %s", cgsPackage.getPackId()));

        //sets the pack version //
        JsonNode courseNode = packageHandler.getCourseNode();
        if (courseNode.get(ContentParseUtil.VERSION) != null) {
            ((ObjectNode) courseNode).put(ContentParseUtil.VERSION, cgsPackage.getVersion());
        }

        //sets the pack update time//
        ((ObjectNode) courseNode).put(ContentParseUtil.UPDATED, ISO8601DateFormatter.fromDate(new Date()));
    }

    private void cleanManifest(PackageHandlerImpl packageHandler) {
        logger.info(String.format("cleanManifest: packId: %s", packageHandler.getCGSPackage().getPackId()));
        Iterator<String> fieldNamesIter = packageHandler.getCourseNode().getFieldNames();
        while (fieldNamesIter.hasNext()) {
            String fieldName = fieldNamesIter.next();
            if (fieldName.equals(ContentParseUtil.LESSON_TEMPLATES)) {
                fieldNamesIter.remove();
            }
            if (fieldName.equals(ContentParseUtil.HEADER)) {
                fieldNamesIter.remove();
            }
            if (fieldName.equals(ContentParseUtil.CUSTOMIZATIONPACK)) {  //remove customization pack from course and add it to assessment and lessons
                fieldNamesIter.remove();
            }
            if (fieldName.equals(ContentParseUtil.USS_TTS_SERVICES)) {         // remove
                fieldNamesIter.remove();                                                                            // usage
            }                                                                                                                                  // of
            if (fieldName.equals(ContentParseUtil.TTS_SERVICES)) {                // text to speech services
                fieldNamesIter.remove();
            }
        }
    }

    // Initializes CustomizationPack related nodes
    // Removes the CustomizationPack resource from course resource list
    // Cleans CGS related hrefs
    private void handleCourseCustomizationPackNodes(PackageHandlerImpl packageHandler) throws ValidationException {
        //TODO: @Elad - I noted that there is already a value in packageHandler.getCourseCustomizaionPackNode. maybe we don't need to set it again here.
        CGSPackage cgsPackage = packageHandler.getCGSPackage();
        JsonNode courseNode = packageHandler.getCourseNode();
        if (courseNode.get(ContentParseUtil.CUSTOMIZATIONPACK) == null) {
            logger.debug(String.format("No customization pack found for course %s", cgsPackage.getCourseId()));
            return;
        }

        packageHandler.setCourseCustomizationPackNode(courseNode.get(ContentParseUtil.CUSTOMIZATIONPACK));
        JsonNode courseCustomizationPackNode = packageHandler.getCourseCustomizationPackNode();
        //dig for customizationPack resource
        String customizationPackResId = courseCustomizationPackNode.get(ContentParseUtil.RESOURCE_ID).getTextValue();
        if (customizationPackResId == null) {
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID,
                    String.format("CustomizationPack in %s does not contain resource reference", cgsPackage.getCourseId()));
        }

        JsonNode resourcesNodes = courseNode.get(ContentParseUtil.RESOURCES);
        if (resourcesNodes == null) {
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID,
                    String.format("Course %s does not contain CustomizationPack resource", cgsPackage.getCourseId()));
        }

        // keep only the specific customizationPackUsed, set it to manifest, and remove it from the list
        ArrayNode allResourceNodes = (ArrayNode) resourcesNodes;
        ArrayNode resourceNodeCleaned = JsonNodeFactory.instance.arrayNode();
        for (JsonNode resourceNode : allResourceNodes) {
            String resId = resourceNode.get(ContentParseUtil.RES_ID).getTextValue();
            if (resId.equals(customizationPackResId)) {
                packageHandler.setCourseCustomizationPackResourceNode(resourceNode);
            } else {
                resourceNodeCleaned.add(resourceNode);
            }
        }
        ((ObjectNode) courseNode).put(ContentParseUtil.RESOURCES, resourceNodeCleaned);

        if (packageHandler.getCourseCustomizationPackResourceNode() == null) {
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID,
                    String.format("Course %s does not contain CustomizationPack resource", cgsPackage.getCourseId()));
        }

        if (packageHandler.getCourseCustomizationPackResourceNode().get(ContentParseUtil.RESOURCE_HREFS) == null)
            return;

        JsonNode customizationPackResourcesNode = packageHandler.getCourseCustomizationPackResourceNode();

        // take only elements not starting with cgs/
        ArrayNode resourceHrefs = (ArrayNode) customizationPackResourcesNode.get(ContentParseUtil.RESOURCE_HREFS);
        ArrayNode resourceHrefsWithoutCgsPrefix = JsonNodeFactory.instance.arrayNode();
        for (JsonNode res : resourceHrefs) {
            if (!res.getTextValue().startsWith("cgs/")) {
                resourceHrefsWithoutCgsPrefix.add(res);
            }
        }
        ((ObjectNode) packageHandler.getCourseCustomizationPackResourceNode()).put(ContentParseUtil.RESOURCE_HREFS, resourceHrefsWithoutCgsPrefix);
    }

    public Boolean getDoCleanExcludedResourcesFromManifest() {
        return doCleanExcludedResourcesFromManifest;
    }

    public Boolean doChangeFileNamesToSha1() {
        return doChangeFileNamesToSha1;
    }
}