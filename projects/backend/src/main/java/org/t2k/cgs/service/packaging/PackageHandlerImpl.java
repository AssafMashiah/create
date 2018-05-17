package org.t2k.cgs.service.packaging;

import atg.taglib.json.util.JSONArray;
import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.apache.log4j.MDC;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ArrayNode;
import org.codehaus.jackson.node.ObjectNode;
import org.codehaus.jackson.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.ValidationException;
import org.t2k.cgs.domain.usecases.ebooks.EBookService;
import org.t2k.cgs.domain.model.ebooks.EBookPagesSourceTypes;
import org.t2k.cgs.domain.usecases.lock.TransactionService;
import org.t2k.cgs.domain.model.classification.TaggedStandards;
import org.t2k.cgs.domain.model.ebooks.EBook;
import org.t2k.cgs.domain.model.ebooks.JouveEnrichment;
import org.t2k.cgs.domain.model.ebooks.Page;
import org.t2k.cgs.domain.model.ebooks.PageInsideLesson;
import org.t2k.cgs.domain.model.ebooks.overlayElement.OverlayElement;
import org.t2k.cgs.domain.usecases.packaging.*;
import org.t2k.cgs.domain.usecases.publisher.PublishError;
import org.t2k.cgs.domain.model.tocItem.Format;
import org.t2k.cgs.domain.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.domain.usecases.packaging.executors.PackagePublishExecutor;
import org.t2k.cgs.domain.usecases.ThumbnailsGeneratorService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemDataService;
import org.t2k.cgs.utils.FilesUtils;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.codehaus.jackson.map.DeserializationConfig.Feature.FAIL_ON_UNKNOWN_PROPERTIES;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 25/11/12
 * Time: 13:49
 */
@Service("packageHandler")
@Scope("prototype")
public class PackageHandlerImpl implements PackageHandler {

    public static final String IS_BLANK_PAGE = "isBlankPage";
    private static Logger logger = Logger.getLogger(PackageHandlerImpl.class);

    public static final String BLANK_PAGE_TEMPLATE_HTML = "templates/blankPageTemplate.html";
    public static final String BLANK_PAGE_RESOURCES_FOLDER_NAME = "resources";
    public static final String VIRTUAL_DATA = "virtualData";
    public static final String BLANK_PAGE_VIRTUAL_DATA = VIRTUAL_DATA;
    public static final String HREF = "href";
    public static final String BLANK_PAGE_HREF = HREF;
    public static final String BLANK_PAGES_FOLDER = "blankPages";
    public static final String OVERLAY_ELEMENTS = "overlayElements";
    public static final String PAGE_ID = "pageId";
    public static final String TITLE = "title";
    public static final String PAGES = "pages";
    public static final String LEARNING_OBJECTS = "learningObjects";
    public static final String THUMBNAILS = "thumbnails";
    public static final String ENRICHMENTS = "enrichments";


    @Autowired
    private PackageExecutorsFactory packageExecutorsFactory;

    @Autowired
    private PackagingService packagingService;

    @Autowired
    private PackageManager packageManager;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private PackageStepsUpdater packageStepsUpdater;

    @Autowired
    private SchemaHandler schemaHandler;

    @Autowired
    private PackageResourceHandler packageResourceHandler;

    @Autowired
    private ThumbnailsGeneratorService thumbnailsGeneratorService;

    @Autowired
    private FilesUtils filesUtils;

    @Autowired
    @Qualifier("lessonsDataServiceBean")
    private TocItemDataService tocItemDataService;

    @Autowired
    private EBookService eBookService;

    private CGSPackage cgsPackage;
    private boolean isCanceled;
    private PackageZipper packageZipper;
    private Set<String> resourcesToPackage = new HashSet<>();
    private JsonNode courseNode = null;
    private JsonNode courseCustomizationPackNode = null;
    private JsonNode courseCustomizationPackResourceNode = null;
    private Set<TaggedStandards> lessonsStandards = new HashSet<>();
    private String zippedFileForScorm = null;
    private ObjectMapper objectMapper = new ObjectMapper();
    private static final String SEQUENCE_EXTENSION = ".json";

    /**
     * Main method for packaging and publishing process.
     * Creates an instance of PackagePublishExecutor, and uses it to pack and publish.
     * this method updates the jobs and package statuses and handles their exceptions & errors.
     * * @throws DsException
     */
    @Override
    public void packageCourse() throws DsException {
        logger.info(String.format("packageCourse: %s", cgsPackage.getCourseId()));

        try {
            if (isCanceled()) { // check if a user cancelled the packaging process
                performCancelProcedure();
                return;
            }

            packageResourceHandler.copyCourseResourcesForPublish(cgsPackage);
            if (isCanceled()) { // check if a user cancelled the packaging process
                performCancelProcedure();
                return;
            }

            // Call executors factory
            PublishTarget publishingTarget = cgsPackage.getPublishTarget();
            logger.info(String.format("Starting to handle publishing for: %s", publishingTarget));
            PackagePublishExecutor publishingExecutor = packageExecutorsFactory.get(publishingTarget, cgsPackage.getCatalogName());

            packageStepsUpdater.changePackagePhaseToInProgressUpdatingManifestsReferences(cgsPackage, 0);
            publishingExecutor.handlePackageManifest(this);
            if (isCanceled()) { // check if a user cancelled the packaging process
                performCancelProcedure();
                return;
            }

            packageStepsUpdater.changePackagePhaseToInProgressUpdatingManifestsReferences(cgsPackage, 33);
            publishingExecutor.handleTocItems(this);
            packageStepsUpdater.changePackagePhaseToInProgressUpdatingManifestsReferences(cgsPackage, 66);
            if (isCanceled()) { // check if a user cancelled the packaging process
                performCancelProcedure();
                return;
            }

            schemaHandler.addCgsSchemaVersionToPackage(this);
            packageStepsUpdater.changePackagePhaseToInProgressUpdatingManifestsReferences(cgsPackage, 100);
            releaseTransaction(cgsPackage); // release transaction - it is not needed after all resources are copied

            if (!packageHasErrors()) {
                packageStepsUpdater.changePackagePhaseToInProgressPackaging(cgsPackage, 0);
                if (isCanceled()) { // check if a user cancelled the packaging process
                    performCancelProcedure();
                    return;
                }

                zipPackageManifestsAndResources();
                if (isCanceled()) { // check if a user cancelled the packaging process
                    performCancelProcedure();
                    return;
                }

                packageStepsUpdater.changePackagePhaseToInProgressPackaging(cgsPackage, 100);

                try {
                    publishingExecutor.finalZippingAndSendingToTarget(this);
                } catch (Exception e) {
                    cgsPackage.addError(new PublishError(e.getMessage())); // the error got from the server that we tries to perform the upload to.
                    logger.error(String.format("Error occurred while zipping and sending to target %s", cgsPackage.getPublishTarget()), e);
                    return;
                }

                packageStepsUpdater.changePackagePhaseToCompleted(cgsPackage); // publish is successful
            } else {
                String message = String.format("packageCourse: failed. will not go to compressing, since the package has errors: %s", Arrays.toString(cgsPackage.getErrors().toArray()));
                logger.warn(message);
            }
        } catch (Throwable e) {
            logger.error("packageCourse failed.", e);
            cgsPackage.addError(new PublishError(e.getMessage())); // the error got from the server that we try to perform the upload to.
        } finally {
            if (packageHasErrors()) { // if the package process threw an exception or other problems, start this procedure
                packageStepsUpdater.changePackageToFailedPhase(cgsPackage);
            }
            packageManager.onTaskFinished(cgsPackage.getPackId());
        }
    }

    private void performCancelProcedure() throws DsException {
        logger.info(String.format("changePackagePhaseToCanceled: %s", cgsPackage.getCourseId()));
        cgsPackage.setPackagePhase(PackagePhase.CANCELED);
        saveCgsPackage();
        packageManager.releaseLock(cgsPackage);
        releaseTransaction(cgsPackage); // to be on the safe side - we will release the transaction any way
    }

    private boolean packageHasErrors() {
        return !cgsPackage.getErrors().isEmpty();
    }

    /**
     * Creates a zip file for the current package
     *
     * @throws Exception
     */
    private void zipPackageManifestsAndResources() throws Exception {
        logger.info(String.format("Starting to zip %d files for packageId: %s, that handles course %s", resourcesToPackage.size(), this.cgsPackage.getPackId(), this.cgsPackage.getCourseId()));
        packageZipper.setFilesUrls(resourcesToPackage);
        packageZipper.compress();
        logger.info(String.format("Zipping %d files complete for packageId: %s, that handles course %s", resourcesToPackage.size(), this.cgsPackage.getPackId(), this.cgsPackage.getCourseId()));
    }

    public void scanResourceTableAndFilterByPrefix(JsonNode tocItemRootNode, List<String> prefixesToRemove, Boolean changeFileNamesToSha1) throws Exception {
        String[] prefixesToRemoveArr = new String[prefixesToRemove.size()];
        prefixesToRemove.toArray(prefixesToRemoveArr);
        logger.info(String.format("scanResourceTable: start packId: %s", cgsPackage.getPackId()));
        int numOfResources = 0;
        JsonNode resourcesNodes = tocItemRootNode.get(ContentParseUtil.RESOURCES);
        if (resourcesNodes != null) {
            Iterator<JsonNode> iterator = resourcesNodes.iterator();
            while (iterator.hasNext()) {
                boolean isAsset = true;
                JsonNode resourceNode = iterator.next();

                JsonNode resourceRef = resourceNode.get(ContentParseUtil.RESOURCE_HREF);
                if (resourceRef != null && StringUtils.startsWithAny(resourceRef.getTextValue(), prefixesToRemoveArr)) {
                    iterator.remove();
                    isAsset = false;
                }

                Iterator<String> elements = resourceNode.getFieldNames();
                while (elements.hasNext()) {
                    String element = elements.next();
                    if (element.equals(ContentParseUtil.SOURCE) || element.equals(ContentParseUtil.EDITOR_STATE)) {
                        elements.remove();
                    }
                }

                if (isAsset) {
                    numOfResources++;
                    markResourceForPackage(resourceNode, changeFileNamesToSha1);
                }
            }
            logger.info(String.format("scanResourceTable: finished. Number of resources = %d", numOfResources));
        } else {
            logger.info("scanResourceTable: found a tocItem with no resources...");
        }
    }

    /**
     * extracts the data from the resource node.
     * the resource contains a href to the CMS assets location.
     * if the asset exists in the CMS- the method will add this URI to the resources to
     * package list.
     *
     * @param resourceNode - tocItem's single resource node from resources array
     * @throws Exception
     */
    void markResourceForPackage(JsonNode resourceNode, Boolean changeFileNamesToSha1) throws Exception {
        removeAppletFilesThatNeedToBeExcludedFromResourceNode(resourceNode);

        List<String> assetsPaths = getAssetsPathsFromResource(resourceNode, true);
        for (String assetRefPath : assetsPaths) {
            String assetTruePath = redirectPath(assetRefPath);
            File asset = new File(assetTruePath);
            if (assetRefPath.startsWith(PackagingLocalContext.SEQUENCE_PATH_ELEMENT)) {    // Handling sequence
                if (changeFileNamesToSha1) { // the process will change file names to sha1 on their content
                    String newSqFileName = changeSequenceFileToSHA1(asset);
                    newSqFileName = PackagingLocalContext.SEQUENCE_PATH_ELEMENT + newSqFileName;
                    assetTruePath = cgsPackage.getLocalResourcesLocation().getBasePath() + "/" + newSqFileName;
                    ((ObjectNode) resourceNode).put(ContentParseUtil.RESOURCE_HREF, newSqFileName);
                }
            }

            addResourceToPackage(assetTruePath);
        }
    }

    /**
     * Checks if the given resourceNode contains an applet resources, finds its manifest and gets the files to exclude from packaging
     * by checking the bundles field for "editor" type.
     * Now, we iterate over all hrefs and remove ones that match any exclusion regex\string.
     *
     * @param resourceNode - tocItem's single resource node from resources array
     */
    private void removeAppletFilesThatNeedToBeExcludedFromResourceNode(JsonNode resourceNode) throws Exception {
        Set<String> excludedSpecificAppletFiles = new HashSet<>();
        Set<Matcher> excludedAppletFilesRegExes = new HashSet<>();
        if (resourceNode.get(ContentParseUtil.RESOURCE_TYPE) != null && resourceNode.get(ContentParseUtil.RESOURCE_TYPE).getTextValue().equals("lib")) {
            String resourceBaseDir = resourceNode.get("baseDir").getTextValue();
            if (resourceBaseDir.startsWith(PackagingLocalContext.APPLET_PATH_ELEMENT)) {
                File manifest = new File(redirectPath(String.format("%s/manifest.json", resourceBaseDir)));
                try {
                    String jsonManifest = FileUtils.readFileToString(manifest);
                    JSONObject jsonObj = new JSONObject(jsonManifest);

                    if (jsonObj.has("bundles")) {
                        JSONArray bundles = (JSONArray) jsonObj.get("bundles");
                        for (Object bundleObject : bundles) {
                            JSONObject bundle = ((JSONObject) bundleObject);
                            if (bundle.has("type") && bundle.getString("type").equals("editor") && bundle.has("fileset")) {
                                JSONArray filesToExclude = bundle.getJSONArray("fileset");

                                //for each excluded file or wild card, concat to full path and collect to exclude
                                for (int j = 0; j < filesToExclude.length(); j++) {
                                    String fileToExclude = filesToExclude.getString(j);
                                    String pathToExclude = String.format("%s", (fileToExclude.endsWith("/") ? fileToExclude.replace(fileToExclude.substring(fileToExclude.length() - 1), "") : fileToExclude));
                                    if (pathToExclude.endsWith(".*")) {
                                        excludedAppletFilesRegExes.add(Pattern.compile(pathToExclude).matcher(""));
                                    } else {
                                        excludedSpecificAppletFiles.add(pathToExclude);
                                    }
                                }
                            }
                        }
                    }

                    if (!excludedSpecificAppletFiles.isEmpty() || !excludedAppletFilesRegExes.isEmpty()) {
                        List<String> appletsToBeSavedToResourcesArray = new ArrayList<>();
                        List<String> assetsPaths = getAssetsPathsFromResource(resourceNode, false);
                        for (String assetRefPath : assetsPaths) {
                            // First, check the hash-map for a specific file (no wild card)
                            if (excludedSpecificAppletFiles.contains(assetRefPath)) {
                                continue; // If we found one, don't add it to the package's resources list
                            }
                            // Otherwise, check by regular expression
                            boolean isExcludedAppletFileFound = false;
                            for (Matcher excludedAppletFilesRegExe : excludedAppletFilesRegExes) {
                                if (excludedAppletFilesRegExe.reset(assetRefPath).find()) {
                                    isExcludedAppletFileFound = true;
                                    break;
                                }
                            }
                            if (isExcludedAppletFileFound) {
                                continue;
                            }
                            appletsToBeSavedToResourcesArray.add(assetRefPath); // if the applet's href is not filtered out by a regex or a specific exclusion - keep it in tocItem resources list
                        }
                        ArrayNode hrefs = objectMapper.valueToTree(appletsToBeSavedToResourcesArray);
                        ((ObjectNode) resourceNode).putArray(ContentParseUtil.RESOURCE_HREFS).addAll(hrefs);

                    }


                } catch (IOException | JSONException e) {
                    String appletId = resourceBaseDir.split("/")[1];
                    String errorMsg = String.format("failed to extract the manifest.json file for applet %s, for packageId: %s, courseId: %s.", appletId, cgsPackage.getPackId(), cgsPackage.getCourseId());

                    logger.error(errorMsg, e);
                    throw new Exception(errorMsg, e);
                }
            }
        }
    }

    private String changeSequenceFileToSHA1(File sequence) throws IOException {
        String newName = DigestUtils.sha1Hex(FileUtils.readFileToByteArray(sequence));
        newName = breakFileName(newName + SEQUENCE_EXTENSION);
        File newSqFile = new File(String.format("%s/%s", sequence.getParent(), newName));
        newSqFile.getParentFile().mkdirs();
        if (!sequence.renameTo(newSqFile)) {
            throw new IOException(String.format("Could not rename sequence File : %s", sequence.getName()));
        }
        return newName;
    }

    private String breakFileName(String newName) {
        String d1 = newName.substring(0, 2);
        String d2 = newName.substring(2, 4);
        newName = d1 + "/" + d2 + "/" + newName;
        return newName;
    }

    /**
     * Returns a list of the resource node.
     * Assets can be in a lib, in that case, the method will return all the assets that are
     * in the 'hrefs' list.
     *
     * @param resourceNode - tocItem's single resource node from resources array
     * @return a list of the absolute file paths of the files that exist in the resourceNode
     */
    private List<String> getAssetsPathsFromResource(JsonNode resourceNode, boolean addBaseDir) {
        List<String> resourceRefList = new ArrayList<>();
//        if (resourceNode.get(ContentParseUtil.RESOURCE_TYPE) != null &&
//                (resourceNode.get(ContentParseUtil.RESOURCE_TYPE).getTextValue().equals("lib"))) {
        if (resourceNode.get(ContentParseUtil.RESOURCE_HREFS) != null) { // supports all resources that have hrefs
            String resourceBaseDir = resourceNode.get("baseDir").getTextValue();
            Iterator<JsonNode> resRefIterator = resourceNode.get(ContentParseUtil.RESOURCE_HREFS).getElements();
            while (resRefIterator.hasNext()) {
                if (addBaseDir)
                    resourceRefList.add(resourceBaseDir + "/" + resRefIterator.next().getTextValue());
                else
                    resourceRefList.add(resRefIterator.next().getTextValue());
            }
        } else {
            resourceRefList.add(resourceNode.get(ContentParseUtil.RESOURCE_HREF).getTextValue());
        }
        return resourceRefList;
    }

    private String redirectPath(String refValuePath) {
        //redirect to sequence resource (local copy - not in the cms)
        if (refValuePath.startsWith(PackagingLocalContext.SEQUENCE_PATH_ELEMENT)) {
            refValuePath = StringUtils.replace(refValuePath, PackagingLocalContext.SEQUENCE_PATH_ELEMENT, cgsPackage.getLocalResourcesLocation().getSequencesPath(), 1);

        } else {
            //cms abs path
            refValuePath = String.format("%s/%s", cgsPackage.getCmsPublisherHomeLocation(), refValuePath);
        }
        return refValuePath;
    }

    private void saveCgsPackage() throws DsException {
        packagingService.saveCGSPackage(cgsPackage);
    }

    public void addResourceToPackage(String resourcePath) {
        resourcesToPackage.add(resourcePath);
    }

    @Override
    public CGSPackage getCGSPackage() {
        return this.cgsPackage;
    }

    /**
     * delete the transaction for the course in cgsPackage.getCourseId()
     *
     * @param cgsPackage - cgs packege to release
     * @throws DsException
     */
    private void releaseTransaction(CGSPackage cgsPackage) throws DsException {
        logger.debug(String.format("releaseTransaction. About to release transaction for course %s", cgsPackage.getCourseId()));
        try {
            transactionService.stopTransaction(cgsPackage.getCourseId(), cgsPackage.getUserName());
        } catch (DsException e) {
            logger.error(String.format("Sever error: could not release transaction for course %s", cgsPackage.getCourseId()), e);
            throw e;
        }
    }

    @Override
    public void cancelProcess() {
        logger.info(String.format("cancelProcess: packId: %s", cgsPackage.getPackId()));
        try {
            isCanceled = true;
            packageResourceHandler.setCanceled(true);
            packageZipper.setCanceled(true);
            if (cgsPackage.getPackagePhase().equals(PackagePhase.PENDING)) // if the package is pending - perform cancelling procedure
                performCancelProcedure();
        } catch (DsException e) {
            PublishError publishError = new PublishError(String.format("Error occurred while canceling process: %s", e.getMessage()));
            logger.error(String.format("cancelProcess errorId: %s. The error is in the cancelling process itself for packageId: %s, courseId: %s.", publishError.getErrorId(), cgsPackage.getPackId(), cgsPackage.getCourseId()), e);
            cgsPackage.addError(publishError);
            try {
                saveCgsPackage();
            } catch (Exception ex) {
                logger.error(String.format("Could not save the cgs packageId:%s for courseId: %s after cancellation process failure", cgsPackage.getPackId(), cgsPackage.getCourseId()), ex);
            }
        }
    }

    @Override
    public void run() {
        packageManager.notifyPendingWorkQueue();
        try {
            addUserDataForLoggingToThreadParams(cgsPackage.getUserName(), cgsPackage.getPublisherId());
            logger.info(String.format("---PACKAGE STARTED-- :%s", cgsPackage.getPackId()));
            packageCourse();
        } catch (DsException e) {
            logger.error(String.format("Error running the packageCourse process for packageId: %s, courseId: %s.", cgsPackage.getPackId(), cgsPackage.getCourseId()), e);

        } finally {
            logger.debug("removeUserDataForLoggingFromThreadParams");
            removeUserDataForLoggingFromThreadParams();
            logger.debug("removeUserDataForLoggingFromThreadParams - completed");
        }
    }

    private void removeUserDataForLoggingFromThreadParams() {
        Object user = MDC.get("username");
        Object account = MDC.get("accountId");

        logger.debug(String.format(">>>>> removeUserDataForLoggingFromThreadParams - Removing user name: %s account: %s", user, account));
        MDC.remove("username");
        MDC.remove("accountId");
    }

    public void addUserDataForLoggingToThreadParams(String userName, int publisherId) {
        logger.debug(">>>>> addUserDataForLoggingToThreadParams - adding user name: " + userName + " account: " + publisherId);
        MDC.put("username", userName);
        MDC.put("accountId", publisherId);
    }

    /// Getters and Setters

    public void init(CGSPackage cgsPackage) {
        this.cgsPackage = cgsPackage;
        this.packageZipper = new PackageZipper(packageStepsUpdater, cgsPackage);
    }

    public boolean isCanceled() {
        return isCanceled;
    }

    public void setCourseNode(JsonNode courseRootNode) {
        this.courseNode = courseRootNode;
    }

    public JsonNode getCourseNode() {
        return this.courseNode;
    }

    public void setCourseCustomizationPackResourceNode(JsonNode courseCustomizationPackResourceNode) {
        this.courseCustomizationPackResourceNode = courseCustomizationPackResourceNode;
    }

    public JsonNode getCourseCustomizationPackResourceNode() {
        return courseCustomizationPackResourceNode;
    }

    public void setCourseCustomizationPackNode(JsonNode courseCustomizationPackNode) {
        this.courseCustomizationPackNode = courseCustomizationPackNode;
    }

    public JsonNode getCourseCustomizationPackNode() {
        return courseCustomizationPackNode;
    }

    public void setZippedFileForScorm(String zippedFileForScorm) {
        this.zippedFileForScorm = zippedFileForScorm;
    }

    public String getZippedFileForScorm() {
        return zippedFileForScorm;
    }

    public Set<TaggedStandards> getLessonsStandards() {
        return lessonsStandards;
    }

    public void addToLessonsStandards(TaggedStandards standardToAdd) {
        boolean stdIdExists = false;

        // looping over the lessons standards to see if there is a standard with the same package id,
        // if there is one, check if we need to add extra pedIds to it and add if we do.
        for (TaggedStandards taggedStandard : getLessonsStandards()) {
            // case the standard package ID exists on the course - insert only non existing pedagogical ids
            if (taggedStandard.getStdPackageId().equals(standardToAdd.getStdPackageId())) {
                stdIdExists = true;
                Set<String> existingPedIds = new HashSet<>(taggedStandard.getPedagogicalIds());
                for (String pedId : standardToAdd.getPedagogicalIds()) {
                    if (!existingPedIds.contains(pedId))
                        taggedStandard.getPedagogicalIds().add(pedId);
                }
                return;
            }
        }

        // case the standard package ID did not exist on the course - add it as is
        if (!stdIdExists) {
            getLessonsStandards().add(standardToAdd);
        }
    }

    public void addEBooksToPackage(List<String> eBooksIds) {

        if (eBooksIds == null || eBooksIds.isEmpty()) {
            return;
        }
        logger.info(String.format("Adding %s eBooks to package", eBooksIds.size()));
        String publisherEBooksPath = cgsPackage.getCmsPublisherHomeLocation().replaceAll("courses.*", "") + "ebooks/";
        for (String eBookId : eBooksIds) {
            File eBookDir = new File(publisherEBooksPath + eBookId);
            List<File> allEBookDirFiles = filesUtils.getAllFiles(eBookDir);
            for (File file : allEBookDirFiles) {
                addResourceToPackage(file.getAbsolutePath());
            }
        }
    }

    /**
     * generates all the blank pages html of a lesson
     *
     * @param lessonRootNode- lesson node, as saved on mongo
     * @throws IOException
     */
    public void generateBlankPageHtml(JsonNode lessonRootNode) throws IOException {
        logger.info(String.format("generateBlankPages: generating blank pages for lessonId: %s", lessonRootNode.get(TocItemCGSObject.CID).getTextValue()));
        List<ObjectNode> allLessonPages = getAllLessonPages(lessonRootNode);
        if (allLessonPages == null || allLessonPages.isEmpty()) {
            return;
        }

        //prepare data for html generation
        ArrayNode resources = null;
        if (lessonRootNode.has(ContentParseUtil.RESOURCES)) {
            resources = (ArrayNode) lessonRootNode.get(ContentParseUtil.RESOURCES);
        }
        final ArrayNode finalResources = resources;

        String blankPageTemplate = getBlankPageTemplate();
        String courseId = cgsPackage.getCourseId();
        String cmsBasePath = cgsPackage.getCmsPublisherHomeLocation();
        String eBookBasePathForPublish = cgsPackage.getLocalResourcesLocation().getEBooksPath();

        //generate html for each page that has a "virtual data" property
        for (ObjectNode page : allLessonPages) {
            if (page.has(BLANK_PAGE_VIRTUAL_DATA)) {
                String generatedFilePath = generateBlankPageHtmlFromPage(page, finalResources, courseId, eBookBasePathForPublish, cmsBasePath, new String(blankPageTemplate));
                addResourceToPackage(generatedFilePath);
            }
        }
    }

    public String getBlankPageTemplate() throws IOException {
        String blankPage;
        try {
            blankPage = filesUtils.readResourcesAsString(this.getClass(), BLANK_PAGE_TEMPLATE_HTML);
        } catch (IOException e) {
            logger.error("Error trying to read blank page template.", e);
            cgsPackage.addError(new PublishError(e.getMessage()));
            throw e;
        }
        return blankPage;
    }

    /**
     * @param page                    - page with virtual data property
     * @param resources               - list of lesson resource
     * @param courseId
     * @param eBookBasePathForPublish -  path where the tmp publish files are stored
     * @param cmsBasePath             -  base path where the media files are saved on the server
     * @param blankPage               -  blank page template string
     * @return
     */
    public String generateBlankPageHtmlFromPage(ObjectNode page, ArrayNode resources, String courseId, String eBookBasePathForPublish, String cmsBasePath, String blankPage) throws IOException {

        String blankPageRelativeOutputFolder = String.format("%s/%s", courseId, BLANK_PAGES_FOLDER);
        String blankPagePath = String.format("%s/%s", eBookBasePathForPublish, blankPageRelativeOutputFolder);
        JsonNode virtualData = page.get(BLANK_PAGE_VIRTUAL_DATA);
        blankPage = generateBlankPageData(blankPage, virtualData, resources, cmsBasePath, blankPagePath);

        File pagesDir = new File(blankPagePath);
        if (!pagesDir.exists()) {
            pagesDir.mkdirs();
        }

        String htmlFileName = String.format("%s.html", UUID.randomUUID().toString());
        File pageFile = new File(pagesDir, htmlFileName);
        try {
            FileUtils.writeStringToFile(pageFile, blankPage);
        } catch (IOException e) {
            logger.error(String.format("Error trying to write blank page data to publish folder: %s", pageFile.getAbsolutePath()), e);
            cgsPackage.addError(new PublishError(e.getMessage()));
            throw e;
        }
        //update the page href to the new file generated
        String pageRelativePath = String.format("%s%s/%s", PackagingLocalContext.EBOOK_PATH_ELEMENT, blankPageRelativeOutputFolder, htmlFileName);
        page.put(BLANK_PAGE_HREF, pageRelativePath);
        //remove virtual data property, because that is it no longer needed, when it exists the lessonPlayer.js added a wrong prefix to the page
        page.remove(BLANK_PAGE_VIRTUAL_DATA);
        //this property is used by the thumbnail generator
        page.put(IS_BLANK_PAGE, true);
        return pageFile.getAbsolutePath();
    }

    /**
     * generates an html file with the properties from the page's virtual data
     *
     * @param blankPage     - blank page template string
     * @param virtualData   - page's virtual data
     * @param resources     - list of lesson resources
     * @param cmsBasePath   - path of cms files
     * @param blankPagePath - output folder of the blank page
     * @return generated html file absoulte path
     * @throws IOException
     */
    private String generateBlankPageData(String blankPage, JsonNode virtualData, ArrayNode resources, String cmsBasePath, String blankPagePath) throws IOException {

        Iterator<Map.Entry<String, JsonNode>> virtualDataPropertiesIter = virtualData.getFields();
        while (virtualDataPropertiesIter.hasNext()) {
            Map.Entry<String, JsonNode> property = virtualDataPropertiesIter.next();
            String propertyKey = property.getKey();
            JsonNode propertyValueNode = property.getValue();
            switch (propertyKey) {
                case "background-image":
                    if (propertyValueNode.isTextual()) {
                        String resourceId = propertyValueNode.getTextValue();
                        String resourceRelativePath = getResourceHref(resources, resourceId);
                        String mediaPath = String.format("%s/%s", cmsBasePath, resourceRelativePath);
                        String copiedResourceRelativePath = copyEBookResource(mediaPath, blankPagePath);
                        blankPage = blankPage.replace(String.format("{{#%s}}%s:url({{{%s}}});{{/%s}}", propertyKey, propertyKey, propertyKey, propertyKey), String.format("%s:url(\"%s\");", propertyKey, copiedResourceRelativePath));
                    } else {
                        blankPage = blankPage.replace(String.format("{{#%s}}%s:url({{{%s}}});{{/%s}}", propertyKey, propertyKey, propertyKey, propertyKey), "");
                    }
                    break;
                default:
                    if (propertyValueNode != null) {
                        String propertyValue = propertyValueNode.getTextValue();
                        blankPage = blankPage.replace(String.format("{{#%s}}%s:{{%s}};{{/%s}}", propertyKey, propertyKey, propertyKey, propertyKey), String.format("%s:%s;", propertyKey, propertyValue));
                    } else {
                        blankPage = blankPage.replace(String.format("{{#%s}}%s:{{%s}};{{/%s}}", propertyKey, propertyKey, propertyKey, propertyKey), "");
                    }
                    break;
            }
        }
        return blankPage;
    }

    /**
     * finds a resource path by resId
     *
     * @param resources- list of lesson resource
     * @param resId-     the resource to find
     * @return- the resource relative path
     */
    private String getResourceHref(ArrayNode resources, String resId) {
        for (JsonNode resource : resources) {
            if (resource.get(ContentParseUtil.RES_ID).getTextValue().equals(resId)) {
                return resource.get(ContentParseUtil.RESOURCE_HREF).getTextValue();
            }
        }
        return null;
    }

    /**
     * copy a media resource from the media folder to the blank page ebook folder
     *
     * @param resourceAbsolutePath                 - path of the media file
     * @param blankPageEBookAbsolutePathForPublish - destination base path
     * @return
     */
    private String copyEBookResource(String resourceAbsolutePath, String blankPageEBookAbsolutePathForPublish) throws IOException {
        File source = new File(resourceAbsolutePath);
        File eBookResourcesFolder = new File(String.format("%s/%s", blankPageEBookAbsolutePathForPublish, BLANK_PAGE_RESOURCES_FOLDER_NAME));
        if (!eBookResourcesFolder.exists()) {
            eBookResourcesFolder.mkdirs();
        }

        try {
            FileUtils.copyFileToDirectory(source, eBookResourcesFolder);
        } catch (IOException e) {
            logger.error("Error trying to copy blank page ebook backgroundImage resource.", e);
            cgsPackage.addError(new PublishError(e.getMessage()));
            throw e;
        }

        addResourceToPackage(String.format("%s/%s", eBookResourcesFolder.getAbsolutePath(), source.getName()));
        return String.format("%s/%s", BLANK_PAGE_RESOURCES_FOLDER_NAME, source.getName());
    }

    public void generateThumbnailsForPagesWithHotSpots(JsonNode lessonRootNode) throws Exception {
        logger.info(String.format("generateThumbnailsForPagesWithHotSpots: About to generate thumbnails for pages with hotspots for lesson: %s, packId: %s", lessonRootNode.get(TocItemCGSObject.CID).getTextValue(), cgsPackage.getPackId()));
        List<ObjectNode> allLessonPages = getAllLessonPages(lessonRootNode);
        if (allLessonPages == null || allLessonPages.isEmpty()) {
            return;
        }

        Map<String, PageInsideLesson> virtualPagesAndPagesWithHotSpots = getVirtualPagesAndPagesWithHotSpots(allLessonPages);
        if (virtualPagesAndPagesWithHotSpots.isEmpty()) {
            return;
        }

        replaceContentResourcesWithActualHRefs(lessonRootNode, virtualPagesAndPagesWithHotSpots);

        allLessonPages.forEach(pageNodes -> {
            String pageCId = pageNodes.get("cid").getTextValue();
            if (virtualPagesAndPagesWithHotSpots.containsKey(pageCId)) {
                pageNodes.put("thumbnailHref", virtualPagesAndPagesWithHotSpots.get(pageCId).getThumbnailHref());
            }
        });

        // copy the folder with all the generated blank pages from the publish folder (at ../t2k/cgs/content/resources) to ebooks
        // folder so we can generate thumbnails for it using the http-server that generates them.
        File virtualPagesForPublishDir = new File(cgsPackage.getLocalResourcesLocation().getEBooksPath(), cgsPackage.getCourseId());
        File tempEBookDirForVirtualAndHotSpotsPages = new File(cgsPackage.getEBooksLocation(), cgsPackage.getCourseId());
        if (virtualPagesForPublishDir.exists()) {
            FileUtils.copyDirectory(virtualPagesForPublishDir, tempEBookDirForVirtualAndHotSpotsPages);
        }

        File thumbnailsNewDir = new File(virtualPagesForPublishDir, THUMBNAILS);
        if (!thumbnailsNewDir.exists()) {
            thumbnailsNewDir.mkdirs();
        }

        thumbnailsGeneratorService.generateThumbnailsUsingDynamicPlayer(new ArrayList<>(virtualPagesAndPagesWithHotSpots.values()), cgsPackage.getPublisherId(), cgsPackage.getLocalResourcesLocation().getBasePath(), null);

        // copy the thumbnails into the publish directory and remove the temporary directory we created for them in the ebooks directory under the publisher.
        FileUtils.deleteDirectory(tempEBookDirForVirtualAndHotSpotsPages);

        // add each thumbnail to the resources list of the publish package
        for (File thumbnail : thumbnailsNewDir.listFiles()) {
            addResourceToPackage(thumbnail.getAbsolutePath());
        }
    }

    private void replaceContentResourcesWithActualHRefs(JsonNode lessonRootNode, Map<String, PageInsideLesson> virtualPagesAndPagesWithHotSpots) {
        Map<String, String> resources = new HashMap<>();
        lessonRootNode.get("resources").getElements().forEachRemaining(resource -> {
            if (resource.has("href")) {
                resources.put(resource.get("resId").getTextValue(), resource.get("href").getTextValue());
            }
        });

        virtualPagesAndPagesWithHotSpots.values().forEach(page -> {
            page.getOverlayElements().forEach(overlayElement -> {
                Map<String, String> data = overlayElement.getContent().getData();
                Map<String, String> newData = new HashMap<>(data.size());
                data.forEach((key, value) -> {
                    if (key.equals("resourceRefId")) {
                        newData.put("resource", resources.get(value));
                    } else if (key.equals("resourceHref")) {
                        newData.put("resource", value);
                    } else {
                        newData.put(key, value);
                    }
                });

                data.clear();
                data.putAll(newData);
            });

            String eBooksRelativePath = cgsPackage.getLocalResourcesLocation().getEBooksPath().substring(cgsPackage.getLocalResourcesLocation().getBasePath().length() + 1);
            page.setThumbnailHref(String.format("%s%s/thumbnails/%s.jpg", eBooksRelativePath, cgsPackage.getCourseId(), UUID.randomUUID().toString()));
        });
    }

    private Map<String, PageInsideLesson> getVirtualPagesAndPagesWithHotSpots(List<ObjectNode> allLessonPages) throws IOException {
        Map<String, PageInsideLesson> virtualPages = new HashMap<>();
        for (ObjectNode page : allLessonPages) {
            if (page.get(OVERLAY_ELEMENTS).size() > 0 || page.has(VIRTUAL_DATA)) {
                // we create a page instance for each page node and we only need its pageId, eBookId (which is the courseId) and href, so we set originalIndex=0 and thumbnailHref null because we don't use them anyway.
                List<OverlayElement> overlayElements = objectMapper.configure(FAIL_ON_UNKNOWN_PROPERTIES, false).readValue(page.get(OVERLAY_ELEMENTS), new TypeReference<List<OverlayElement>>() {
                });
                PageInsideLesson virtualPage = new PageInsideLesson(page.get(PAGE_ID).getTextValue(), cgsPackage.getCourseId(), page.get(TITLE).getTextValue(), page.get(HREF).getTextValue(), 0, null, overlayElements);
                virtualPages.put(page.get("cid").getTextValue(), virtualPage);
            }
        }

        return virtualPages;
    }

    private List<ObjectNode> getAllLessonPages(JsonNode lessonRootNode) throws IOException {
        logger.info(String.format("getAllLessonPages: getting all pages from lessonId: %s", lessonRootNode.get(TocItemCGSObject.CID).getTextValue()));
        String format = lessonRootNode.get(TocItemCGSObject.FORMAT).getTextValue();
        if (!format.equals(Format.EBOOK.name()) || !lessonRootNode.has(LEARNING_OBJECTS)) {
            return null;
        }

        List<ObjectNode> pagesNodes = new ArrayList<>();
        JsonNode learningObjects = lessonRootNode.get(LEARNING_OBJECTS);
        for (JsonNode learningObject : learningObjects) {
            if (!learningObject.has(PAGES)) {
                continue;
            }

            for (JsonNode pageNode : learningObject.get(PAGES)) {
                pagesNodes.add((ObjectNode) pageNode);
            }
        }

        return pagesNodes;
    }

    public void createTextSearchFileForLesson(JsonNode lessonRootNode, HashMap<String, EBook> eBooksUsedInCourse) throws IOException, ValidationException {
        List<ObjectNode> allLessonPages = getAllLessonPages(lessonRootNode);
        Map<String, String> pageToTextMap = new HashMap<>();

        // populate the pageToTextMap with text of the relevant pages (using eBooksUsedInCourse which is HashMap with all the needed eBooks)
        if (allLessonPages != null) {
            allLessonPages.forEach(pageNode -> {
                String cid = pageNode.get("cid").getTextValue();
                String text = "";
                if (!pageNode.has("isBlankPage") || !pageNode.get("isBlankPage").asBoolean()) { // continue to get the text only if this is not a blank page (virtual page) don't get the text from it (there's no text)
                    String pageId = pageNode.get("pageId").getTextValue();
                    String eBookId = pageNode.get("eBookId").getTextValue();
                    text = eBookService.getPageTextByPageId(eBooksUsedInCourse.get(eBookId), pageId);
                }
                pageToTextMap.put(cid, text);
            });
        }


        // create new json file with the pageToTextMap data
        String lessonText = objectMapper.writeValueAsString(pageToTextMap);
        String pageToTextMapSha1 = DigestUtils.sha1Hex(lessonText);
        String lessonTextsDirPath = cgsPackage.getLocalResourcesLocation().getLessonsTextPath();
        File lessonTextsDir = new File(lessonTextsDirPath);
        if (!lessonTextsDir.exists()) {
            lessonTextsDir.mkdirs();
        }

        FileUtils.writeStringToFile(new File(lessonTextsDirPath, pageToTextMapSha1 + ".json"), lessonText);

        // Add to 'resources' attribute the manifest for the offline mode (has structure of: href to file, file type, resourceId)
        if (!lessonRootNode.has(ContentParseUtil.RESOURCES))

        {
            ArrayNode emptyArray = new ObjectMapper().createArrayNode();
            ((ObjectNode) lessonRootNode).put(ContentParseUtil.RESOURCES, emptyArray);
        }

        String resourceId = tocItemDataService.getNextAvailableResourceId(lessonRootNode);
        ArrayNode resources = (ArrayNode) lessonRootNode.get(ContentParseUtil.RESOURCES);

        ObjectNode newResource = new ObjectMapper().createObjectNode();
        newResource.put("href", "text/" + pageToTextMapSha1 + ".json");
        newResource.put("type", "lesson-text");
        newResource.put("resId", resourceId);
        resources.add(newResource);

        // Add 'lessonTextRef' attribute to the manifest for the lesson player search (has structure of: resource Id)
        ((ObjectNode) lessonRootNode).put("lessonTextRef", resourceId);

        addResourceToPackage(cgsPackage.getLocalResourcesLocation().getLessonsTextPath() + pageToTextMapSha1 + ".json");
    }

    public boolean addPagesSourceForJouveLesson(JsonNode lessonRootNode, HashMap<String, EBook> eBooksUsedInCourse) throws IOException, ValidationException {
        List<ObjectNode> allLessonPages = getAllLessonPages(lessonRootNode);
        boolean isJouveLesson = false;
        // iterate lesson pages in order to check if they came from Jouve Studio eBook
        if (allLessonPages != null) {
            for (ObjectNode pageNode : allLessonPages) {
                if (!pageNode.has("isBlankPage") || !pageNode.get("isBlankPage").asBoolean()) { // continue to get the text only if this is not a blank page (virtual page) don't get the text from it (there's no text)
                    String eBookId = pageNode.get("eBookId").getTextValue();
                    EBook eBook = eBooksUsedInCourse.get(eBookId);

                    // check is it page from Jouve studio eBook (for stories: Hide/Show enrichment, enrichment list)
                    if (eBook.getPagesSource() != null && eBook.getPagesSource().equals(EBookPagesSourceTypes.JOUVE)) {                        isJouveLesson = true;
                        break;
                    }
                }
            }
        }

        // Add 'pagesSource' attribute to the manifest for the lesson player on order to identify it as JOUVE content (for stories: Hide and Show enrichment, enrichment list)
        if (isJouveLesson) {
            ((ObjectNode) lessonRootNode).put("pagesSource", "JOUVE");
            return true;
        }
        return false;
    }

    public void addJouveEnrichmentForJouvePages(JsonNode lessonRootNode, HashMap<String, EBook> eBooksUsedInCourse) throws IOException, ValidationException {
        List<ObjectNode> allLessonPages = getAllLessonPages(lessonRootNode);
        // iterate lesson pages in order to check if they came from Jouve Studio eBook
        if (allLessonPages == null || allLessonPages.isEmpty()) {
            return;
        }

        for (ObjectNode lessonPageNode : allLessonPages) {
            if (!lessonPageNode.has("isBlankPage") || !lessonPageNode.get("isBlankPage").asBoolean()) { // continue to get the text only if this is not a blank page (virtual page) don't get the text from it (there's no text)
                String eBookId = lessonPageNode.get("eBookId").getTextValue();
                EBook eBook = eBooksUsedInCourse.get(eBookId);
                // iterate eBook pages in order to find the lesson page source
                for (Page ebookPage : eBook.getStructure().getPages()) {
                    // get the pageId of the page from the lesson (and remove its " character)
                    String lessonPageId = lessonPageNode.get("pageId").toString().replace("\"", "");
                    // find the lesson page in the eBook collection
                    if (lessonPageId.equals(ebookPage.getId())) {
                        // in case the page has jouve Enrichment, add them to the pageNode
                        ArrayList<JouveEnrichment> jouveEnrichmentList = ebookPage.getJouveEnrichmentList();
                        if (jouveEnrichmentList != null) {
                            JsonNode jsonNode = objectMapper.valueToTree(jouveEnrichmentList);
                            lessonPageNode.put(ENRICHMENTS, jsonNode);
                        }
                        break;
                    }
                }
            }
        }


    }


}