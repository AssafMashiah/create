package org.t2k.cgs.packaging;

import atg.taglib.json.util.JSONArray;
import atg.taglib.json.util.JSONException;
import atg.taglib.json.util.JSONObject;
import com.t2k.common.utils.PublishModeEnum;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.classification.ScormStandardsPackage;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.model.packaging.ExtraDataAboutPackageForScorm;
import org.t2k.cgs.model.tocItem.TocItemIndicationForScorm;
import org.t2k.cgs.packaging.validators.PublishedScormZipValidator;
import org.t2k.cgs.standards.parser.StandardsHelper;
import org.t2k.cgs.utils.FilesUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by elad.avidan on 01/12/2014.
 */
@Service
public class ScormManifestBuilder {


    private static Logger logger = Logger.getLogger(ScormManifestBuilder.class);

    @Autowired
    private StandardsHelper standardsHelper;

    @Autowired
    private FilesUtils filesUtils;

    @Autowired
    private PublishedScormZipValidator publishedScormZipValidator;

    private enum ScormType {COURSE, LESSON}

    private final String T2K_LESSON_SCORM_2004_V4_LOM = "t2k_lesson_scorm2004_v4_lom_";
    private final String T2K_COURSE_SCORM_2004_V4_LOM = "t2k_course_scorm2004_v4_lom_";
    private final String SCORM_MANIFEST_TEMPLATE = "manifestTemplates/scorm2004.xml";
    private final String SCORM_MANIFEST_FILE_NAME = "imsmanifest.xml";
    private final String INDEX_HTML_FILE_PATH = "scp/index.html";
    private final String VCARD_CARTRIDGE_RETURN_AND_NEW_LINE_MARKS = "&#13;&#10;";
    private final String DATE_FORMAT = "yyyy-MM-dd";
    private final String OVERVIEW = "overview";
    private final String COURSE_NAME = "COURSE_NAME";
    private final String LOCALE = "LOCALE";
    private final String COURSE_CID = "COURSE_CID";
    private final String COURSE_VERSION = "COURSE_VERSION";

    // Field types
    private final String TEXT = "text";
    private final String DATE = "date";
    private final String CUSTOM_FIELDS = "customFields";
    private final String STANDARDS = "standards";
    private final String CID = "cid";
    private final String DATA = "data";
    private final String ITEMS_DATA = "itemsData";
    private final String TOC = "toc";
    private final String ITEM = "item";
    private final String TITLE = "title";
    private final String TOC_ITEMS = "tocItems";
    private final String TOC_ITEM_REFS = "tocItemRefs";
    private final String ITEMS = "items";
    private final String IS_HIDDEN = "isHidden";
    private final String TYPE = "type";
    private final String ORIGINAL = "original";

    // Tabs types
    private final String VALUE = "value";
    private final String LOM = "lom";
    private final String CLASSIFICATION = "classification";
    private final String PURPOSE = "purpose";
    private final String TAXON_PATH = "taxonPath";
    private final String SOURCE = "source";
    private final String TAXON = "taxon";
    private final String ID = "id";
    private final String ENTRY = "entry";
    private final String DESCRIPTION = "description";
    private final String KIND = "kind";
    private final String RELATION = "relation";
    private final String RESOURCES = "resources";
    private final String RESOURCE = "resource";
    private final String COST = "cost";
    private final String RIGHTS = "rights";
    private final String EDUCATIONAL = "educational";
    private final String LEARNING_RESOURCE_TYPE = "learningResourceType";
    private final String INTERACTIVITY_LEVEL = "interactivityLevel";
    private final String SEMANTIC_DENSITY = "semanticDensity";
    private final String INTENDED_END_USER_ROLE = "intendedEndUserRole";
    private final String CONTEXT = "context";
    private final String TYPICAL_AGE_RANGE = "typicalAgeRange";
    private final String DIFFICULTY = "difficulty";
    private final String TYPICAL_LEARNING_TIME = "typicalLearningTime";
    private final String DURATION = "duration";
    private final String LOM_V_1_0 = "LOMv1.0";
    private final String TECHNICAL = "technical";
    private final String INSTALLATION_REMARKS = "installationRemarks";
    private final String STRING = "string";
    private final String GENERAL = "general";
    private final String META_METADATA = "metaMetadata";
    private final String ROLE = "role";
    private final String ENTITY = "entity";
    private final String DATE_TIME = "dateTime";
    private final String CONTRIBUTE = "contribute";
    private final String LANGUAGE = "language";
    private final String IDENTIFIER = "identifier";
    private final String CATALOG = "catalog";
    private final String IDENTIFIERREF = "identifierref";
    private final String IMSSS_SEQUENCING = "imsss:sequencing";

    /**
     * @param cgsPackage
     * @param scormManifestOutputDir
     * @param courseManifestPath
     * @param lessonsManifestsDirPath
     * @param standardsManifestsDirPath
     * @param extraDataAboutPackageForScorm
     * @param filesIncludedInThePackage     All files included in the scorm content package should be declared and
     *                                      referenced in the manifest to ensure conformity. References to them need to be
     *                                      relative from package root
     * @return
     */
    public File buildScormManifest(CGSPackage cgsPackage, File scormManifestOutputDir, String courseManifestPath,
                                   String lessonsManifestsDirPath,
                                   String standardsManifestsDirPath,
                                   ExtraDataAboutPackageForScorm extraDataAboutPackageForScorm,
                                   List<String> filesIncludedInThePackage) throws Exception {
        File scormManifest = null;
        switch (cgsPackage.getPublishTarget()) {
            case LESSON_TO_FILE:
            case LESSON_TO_CATALOG:
            case LESSON_TO_URL:
                for (TocItemIndicationForScorm itemIndicationForScorm : cgsPackage.getScormSelectedTocItems()) {
                    if (!itemIndicationForScorm.isHidden()) {
                        String lessonManifestPath = String.format("%s/%s", lessonsManifestsDirPath, itemIndicationForScorm.getId());
                        scormManifest = buildScormManifestForLesson(courseManifestPath, lessonManifestPath,
                                standardsManifestsDirPath, scormManifestOutputDir.getAbsolutePath(), extraDataAboutPackageForScorm,
                                filesIncludedInThePackage);
                    }
                }
                break;
            case COURSE_TO_FILE:
            case COURSE_TO_CATALOG:
            case COURSE_TO_URL:
                scormManifest = buildScormManifestForCourse(courseManifestPath, standardsManifestsDirPath,
                        scormManifestOutputDir.getAbsolutePath(), extraDataAboutPackageForScorm,
                        filesIncludedInThePackage);
                break;
            default:
                logger.error(String.format("Invalid target for SCORM publish: %s", cgsPackage.getPublishTarget()));
        }
        return scormManifest;
    }

    /**
     * @param coursePath
     * @param lessonPath
     * @param standardsPath
     * @param scormManifestOutputDir
     * @param extraDataAboutPackageForScorm
     * @param filesIncludedInThePackage     All files included in the scorm content package should be declared and
     *                                      referenced in the manifest to ensure conformity. References to them need to be
     *                                      relative from package root
     * @return
     */
    private File buildScormManifestForLesson(String coursePath, String lessonPath, String standardsPath, String scormManifestOutputDir,
                                             ExtraDataAboutPackageForScorm extraDataAboutPackageForScorm,
                                             List<String> filesIncludedInThePackage) throws Exception {
        String lessonId = null;
        String courseId = null;
        File scormManifestOutputFile = null;

        try {
            JSONObject courseObject = new JSONObject(FileUtils.readFileToString(new File(coursePath)));
            JSONObject lessonObject = new JSONObject(FileUtils.readFileToString(new File(lessonPath)));
            lessonId = lessonObject.getString(CID);
            courseId = courseObject.getString(ID);
            JSONObject lessonDataObject = lessonObject.getJSONObject(DATA);
            JSONObject courseDataObject = courseObject.getJSONObject(DATA);

            logger.debug(String.format("createManifestForScorm. About to build a SCORM XML file for lesson %s in course %s", lessonId, courseId));

            // copy the SCORM manifest to the package location
            String manifestTemplate = filesUtils.readResourcesAsString(this.getClass(), SCORM_MANIFEST_TEMPLATE);
            Map<String, String> replaceMap = getRequiredFieldsInScormXml(ScormType.LESSON, courseObject, lessonObject, extraDataAboutPackageForScorm);
            manifestTemplate = getScormManifestWithParameters(replaceMap, manifestTemplate);

            HashMap<String, String> courseCustomFieldsMap = new HashMap<>();
            HashMap<String, String> lessonCustomFieldsMap = new HashMap<>();
            createMapOfScormFieldsForLesson(courseDataObject, lessonDataObject, courseCustomFieldsMap, lessonCustomFieldsMap);

            Document doc = getDocument(manifestTemplate);
            addPropertiesToXmlElements(ScormType.LESSON, standardsPath, lessonObject, courseCustomFieldsMap, lessonCustomFieldsMap, replaceMap,
                    filesIncludedInThePackage, doc);

            scormManifestOutputFile = writeScormManifestXmlToFile(scormManifestOutputDir + "/" + SCORM_MANIFEST_FILE_NAME, doc);
            logger.debug("SCORM Validation started");
            publishedScormZipValidator.validateScormXml(scormManifestOutputFile);
            logger.debug("SCORM Validation completed");
        } catch (ParserConfigurationException e) {
            String errorMsg = String.format("Failed to create an XML document builder for lesson %s of course %s", lessonId, courseId);
            logger.error(errorMsg, e);
        } catch (JSONException e) {
            String errorMsg = String.format("Failed to parse the JSON manifests files at: %s, %s", lessonPath, coursePath);
            logger.error(errorMsg, e);
        } catch (IOException e) {
            String errorMsg = String.format("Failed to read JSON manifests files: %s, %s", lessonPath, coursePath);
            logger.error(errorMsg, e);
        } catch (DsException e) {
            logger.error(e.getMessage(), e);
        } catch (ParseException e) {
            String errorMsg = String.format("Failed to parse customFields JSON from manifests files: %s, %s", lessonPath, coursePath);
            logger.error(errorMsg, e);
        } catch (SAXException e) {
            String errorMsg = "Failed to parse the template XML manifest file";
            logger.error(errorMsg, e);
        } catch (TransformerException e) {
            String errorMsg = String.format("Failed to create an XML transformer for writing the SCORM manifest to file for lesson %s of course %s", lessonId, courseId);
            logger.error(errorMsg, e);
            throw e;
        } catch (Exception e) {
            handleBadSchemaError(coursePath, scormManifestOutputFile, e);
        }

        return scormManifestOutputFile;
    }

    /**
     * @param coursePath
     * @param standardsPath
     * @param scormManifestOutputDir
     * @param extraDataAboutPackageForScorm
     * @param filesIncludedInThePackage     All files included in the scorm content package should be declared and
     *                                      referenced in the manifest to ensure conformity. References to them need to be
     *                                      relative from package root
     * @return
     * @throws Exception
     */
    private File buildScormManifestForCourse(String coursePath, String standardsPath, String scormManifestOutputDir,
                                             ExtraDataAboutPackageForScorm extraDataAboutPackageForScorm,
                                             List<String> filesIncludedInThePackage) throws Exception {
        String courseId = null;
        File scormManifestOutputFile = null;

        try {
            JSONObject courseObject = new JSONObject(FileUtils.readFileToString(new File(coursePath)));
            courseId = courseObject.getString(ID);

            logger.debug(String.format("createManifestForScorm. About to build a SCORM XML file for course %s", courseId));

            // copy the SCORM manifest to the package location
            String manifestTemplate = filesUtils.readResourcesAsString(this.getClass(), SCORM_MANIFEST_TEMPLATE);
            Map<String, String> replaceMap = getRequiredFieldsInScormXml(ScormType.COURSE, courseObject, null, extraDataAboutPackageForScorm);
            manifestTemplate = getScormManifestWithParameters(replaceMap, manifestTemplate);

            HashMap<String, String> courseCustomFieldsMap = new HashMap<>();
            createMapOfScormFieldsForCourse(courseObject.getJSONObject(DATA), courseCustomFieldsMap);

            Document doc = getDocument(manifestTemplate);
            addPropertiesToXmlElements(ScormType.COURSE, standardsPath, courseObject, courseCustomFieldsMap, null, replaceMap,
                    filesIncludedInThePackage, doc);

            scormManifestOutputFile = writeScormManifestXmlToFile(scormManifestOutputDir + File.separator + SCORM_MANIFEST_FILE_NAME, doc);
            publishedScormZipValidator.validateScormXml(scormManifestOutputFile);
        } catch (ParserConfigurationException e) {
            String errorMsg = String.format("Failed to create an XML document builder for course %s", courseId);
            logger.error(errorMsg, e);
        } catch (JSONException e) {
            String errorMsg = String.format("Failed to parse the JSON manifest file at: %s", coursePath);
            logger.error(errorMsg, e);
        } catch (IOException e) {
            String errorMsg = String.format("Failed to read JSON manifest file: %s", coursePath);
            logger.error(errorMsg, e);
        } catch (DsException e) {
            logger.error(e.getMessage(), e);
        } catch (ParseException e) {
            String errorMsg = String.format("Failed to parse customFields JSON from manifest file: %s", coursePath);
            logger.error(errorMsg, e);
        } catch (SAXException e) {
            String errorMsg = "Failed to parse the template XML manifest file";
            logger.error(errorMsg, e);
        } catch (TransformerException e) {
            String errorMsg = String.format("Failed to create an XML transformer for writing the SCORM manifest to file for course %s", courseId);
            logger.error(errorMsg, e);
            throw e;
        } catch (Exception e) {
            handleBadSchemaError(coursePath, scormManifestOutputFile, e);
        }

        return scormManifestOutputFile;
    }

    private File handleBadSchemaError(String coursePath, File scormManifestOutputFile, Exception e) throws Exception {
        // cleanup the publish process files
        if (scormManifestOutputFile != null && scormManifestOutputFile.exists()) {
            FileUtils.forceDelete(scormManifestOutputFile);
        }
        FileUtils.forceDelete(new File(coursePath).getParentFile());
        throw e;
    }

    private Document getDocument(String manifestTemplate) throws ParserConfigurationException, SAXException, IOException {
        InputStream stream = new ByteArrayInputStream(manifestTemplate.getBytes(StandardCharsets.UTF_8));
        DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
        return docBuilder.parse(stream);
    }

    private void addPropertiesToXmlElements(ScormType scormType, String standardsPath, JSONObject manifestObject,
                                            HashMap<String, String> courseCustomFieldsMap,
                                            HashMap<String, String> lessonCustomFieldsMap,
                                            Map<String, String> parameters,
                                            List<String> filesIncludedInThePackage,
                                            Document doc)
            throws JSONException, DsException, IOException {
        JSONObject courseDataObject = manifestObject.getJSONObject(DATA);

        addPropertiesToGeneralElement(scormType, courseDataObject, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        addPropertiesToMetaMetadataElement(scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        addPropertiesToTechnicalElement(scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        addPropertiesToEducationalElement(scormType, courseDataObject, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        addPropertiesToRightsElement(scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        addPropertiesToRelationElement(scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        addPropertiesToClassificationElement(courseDataObject, standardsPath, doc);
        addPropertiesToOrganizationsElement(scormType, manifestObject, parameters.get(COURSE_NAME), doc);
        addPropertiesToResourcesElement(scormType, manifestObject, parameters, doc);
        // adds all the files that will be zipped in the archive to the manifest
        List<Element> filesResources = createResourcesElementsForFilesList(doc, filesIncludedInThePackage);
        Element resources = (Element) doc.getElementsByTagName(RESOURCES).item(0); // there should be only one resources tag element
        if (resources != null) {
            filesResources.forEach(resources::appendChild);
        }
    }

    private void addPropertiesToClassificationElement(JSONObject manifestObject, String standardsPath, Document doc) throws JSONException, DsException, IOException {
        logger.debug("addPropertiesToClassificationElement. Create 'classification' tabs for each standards package.");
        Map<String, Collection<String>> standardsPacks = new HashMap<>();

        if (!manifestObject.has(STANDARDS) || manifestObject.getJSONArray(STANDARDS).isEmpty()) {
            return;
        }

        JSONArray standards = manifestObject.getJSONArray(STANDARDS);
        for (Object standard : standards) {
            JSONObject standardJson = (JSONObject) standard;
            standardsPacks.put(standardJson.getString("stdPackageId"), standardJson.getJSONArray("pedagogicalIds"));
        }

        List<ScormStandardsPackage> scormStandardsPackages = standardsHelper.getPedagogicalIdsDescriptionFromStandardsFolder(standardsPacks, new File(standardsPath));
        Node lom = doc.getElementsByTagName(LOM).item(0);
        for (ScormStandardsPackage scormStandardsPackage : scormStandardsPackages) {
            Element classification = createClassificationElementWithStandards(scormStandardsPackage, doc);
            lom.appendChild(classification);
        }
    }

    private void addPropertiesToOrganizationsElement(ScormType scormType,
                                                     JSONObject manifestObject,
                                                     String courseTitle, Document doc) throws JSONException {
        logger.debug("addPropertiesToOrganizationsElement. Add TOC items properties to 'organizations' tab.");
        Element organization = (Element) doc.getElementsByTagName("organization").item(0);
        JSONObject dataObject = manifestObject.getJSONObject(DATA);
        switch (scormType) {
            case COURSE:
                JSONObject toc = dataObject.getJSONObject(TOC);
                JSONObject courseItemsObject = manifestObject.getJSONObject(ITEMS_DATA);
                buildTocItemsTree(toc, courseItemsObject, organization, doc);
                break;
            case LESSON:
                Element courseTitleElement = doc.createElement(TITLE);
                courseTitleElement.appendChild(doc.createTextNode(courseTitle));
                organization.insertBefore(courseTitleElement, organization.getLastChild().getPreviousSibling());

                Element item = doc.createElement(ITEM);
                String identifier = createAttributeIdentifierValueForItemElement(manifestObject);
                String identifierref = createAttributeIdentifierrefValueForItemElement(identifier);
                item.setAttribute(IDENTIFIER, identifier);
                item.setAttribute(IDENTIFIERREF, identifierref);

                Element lessonTitleElement = doc.createElement(TITLE);
                lessonTitleElement.appendChild(doc.createTextNode(dataObject.getString(TITLE)));
                item.appendChild(lessonTitleElement);
                organization.insertBefore(item, organization.getLastChild().getPreviousSibling());
                break;
        }
    }

    private void buildTocItemsTree(JSONObject toc, JSONObject courseItemsObject, Element tree, Document doc) throws JSONException {
        JSONArray tocItems = toc.getJSONArray(TOC_ITEMS);
        JSONArray tocItemRefs = toc.getJSONArray(TOC_ITEM_REFS);
        Element titleElement = doc.createElement(TITLE);
        titleElement.appendChild(doc.createTextNode(toc.getString(TITLE)));
        if (tree.hasChildNodes()) { // we want to add the element before the "sequencing" element
            tree.insertBefore(titleElement, tree.getLastChild().getPreviousSibling());
        } else { // no children - just add it
            tree.appendChild(titleElement);
        }

        if (!tocItems.isEmpty()) {
            for (int i = 0; i < tocItems.length(); i++) {
                JSONObject tocItem = tocItems.getJSONObject(i);
                String identifier = "t2k_" + tocItem.getString(CID);
                Element tocItemElement = createTocItemElement(identifier, doc);
                if (tree.hasChildNodes()
                        && tree.getLastChild().getPreviousSibling() != null
                        && tree.getLastChild().getPreviousSibling().getNodeName().equals(IMSSS_SEQUENCING)) {
                    tree.insertBefore(tocItemElement, tree.getLastChild().getPreviousSibling());
                } else {
                    tree.appendChild(tocItemElement);
                }
                buildTocItemsTree(tocItem, courseItemsObject, tocItemElement, doc);
            }
        }

        if (!tocItemRefs.isEmpty()) {
            for (int i = 0; i < tocItemRefs.length(); i++) {
                JSONObject tocItemRef = tocItemRefs.getJSONObject(i);
                String identifier = createAttributeIdentifierValueForItemElement(tocItemRef);

                //items contains always only one item(this is the data received from scp converter)- so we get the value by get(0)
                String title = ((JSONObject) ((JSONArray) (courseItemsObject.getJSONObject(tocItemRefs.getJSONObject(i).getString(CID))).get(ITEMS)).get(0)).get(TITLE).toString();
                createItemElement(tree, title, identifier, doc, toc.getString(CID));
            }
        }
    }

    private String createAttributeIdentifierValueForItemElement(JSONObject item) throws JSONException {
        return String.format("t2k_%s", item.getString(CID));
    }

    private String createAttributeIdentifierrefValueForItemElement(String identifier) throws JSONException {
        return String.format("%s_resource", identifier);
    }

    private Element createTocItemElement(String identifier, Document doc) throws JSONException {
        Element item = doc.createElement(ITEM);
        item.setAttribute(IDENTIFIER, identifier);
        return item;
    }

    private void createItemElement(Element tree, String title, String identifier, Document doc, String parentCid) throws JSONException {
        Element item = doc.createElement(ITEM);
        // we can't use the cid as identifier because we can have duplicates in case the same lesson appears
        // multiple times in the course and scorm validation will fail
        item.setAttribute(IDENTIFIER, identifier + "_" + parentCid);
        item.setAttribute(IDENTIFIERREF, createAttributeIdentifierrefValueForItemElement(identifier));

        Element titleElement = doc.createElement(TITLE);
        titleElement.appendChild(doc.createTextNode(title));
        item.appendChild(titleElement);

        // if the last node is an "item", add the new item after it. otherwise, add the item before it.
        if (tree.hasChildNodes() && tree.getLastChild() != null && !tree.getLastChild().getNodeName().equals(ITEM)) {
            tree.insertBefore(item, tree.getLastChild().getPreviousSibling());
        } else {
            tree.appendChild(item);
        }
    }

    private void addPropertiesToResourcesElement(ScormType scormType, JSONObject manifestObject,
                                                 Map<String, String> parameters, Document doc) throws JSONException {
        logger.debug("addPropertiesToResourcesElement. Add resources properties to 'resources' tab.");
        List<Element> resourcesElements = new ArrayList<>();
        Element resources = doc.createElement(RESOURCES);
        switch (scormType) {
            case COURSE:
                JSONObject courseDataObject = manifestObject.getJSONObject(DATA);
                JSONObject toc = courseDataObject.getJSONObject(TOC);
                for (JSONObject tocItemRef : getFlattenedTocItemRefsFromToc(toc).values()) {
                    resourcesElements.add(createTocResourceElement(tocItemRef, parameters, doc));
                }
                if (resourcesElements.isEmpty()) return;
                break;
            case LESSON:
                Element resource = createTocResourceElement(manifestObject, parameters, doc);
                resourcesElements.add(resource);
                break;
        }
        for (Element resource : resourcesElements) {
            resources.appendChild(resource);
        }
        Node manifest = doc.getElementsByTagName("manifest").item(0);
        manifest.appendChild(resources);
    }

    private List<Element> createResourcesElementsForFilesList(Document doc, List<String> filesList) {
        List<Element> filesElements = new ArrayList<>(filesList.size());
        if (filesList.size() == 0) {
            return filesElements;
        }
        int indexHtml = filesList.indexOf(INDEX_HTML_FILE_PATH);
        // index.html file must have ID "r1"
        filesElements.add(createResourceElementForFile(doc, "r1", INDEX_HTML_FILE_PATH));
        if (indexHtml >= 0) {
            filesList.remove(indexHtml);
        }
        for (int i = 0; i < filesList.size(); i++) {
            String file = filesList.get(i);
            Element fileElement = createResourceElementForFile(doc, "res" + i, file);
            filesElements.add(fileElement);
        }
        return filesElements;
    }

    private Element createResourceElementForFile(Document doc, String identifier, String file) {
        Element fileElementChild = doc.createElement("file");
        fileElementChild.setAttribute("href", file);
        List<Element> children = new ArrayList<>(1);
        children.add(fileElementChild);
        return createResourceElement(doc, identifier, "webcontent", "sco", file, children);
    }

    /**
     * Extracts a map of unique toc item refs found on the toc. Since the toc can contain the same toc item multiple
     * times on different branches, this method will only contain it once, since we use the CID as key in the map
     *
     * @param toc the toc from which to extract the flattened toc items
     * @return a map having as key the CID of the toc item and as value the toc item json
     * @throws JSONException in case an error is encountered extracting data from the toc JSONObject
     */
    private Map<String, JSONObject> getFlattenedTocItemRefsFromToc(JSONObject toc) throws JSONException {
        Map<String, JSONObject> tocItemRefsResult = new HashMap<>();
        JSONArray tocItems = toc.getJSONArray(TOC_ITEMS);
        JSONArray tocItemRefs = toc.getJSONArray(TOC_ITEM_REFS);
        if (!tocItemRefs.isEmpty()) {
            for (int i = 0; i < tocItemRefs.length(); i++) {
                JSONObject tocItemRef = tocItemRefs.getJSONObject(i);
                tocItemRefsResult.put(tocItemRef.getString(CID), tocItemRef);
            }
        }
        for (int i = 0; i < tocItems.length(); i++) {
            tocItemRefsResult.putAll(getFlattenedTocItemRefsFromToc(tocItems.getJSONObject(i)));
        }
        return tocItemRefsResult;
    }

    private Element createTocResourceElement(JSONObject item, Map<String, String> parameters, Document doc) throws JSONException {
        String type = item.getString(TYPE);

        String href = String.format("scp/index.html?locale=%s&vmode=l&contentPath=../&scorm=t#", parameters.get(LOCALE));
        if (type.equals("lesson")) {
            href = href + String.format("lessonView/%s/courseVersion/%s/%s/%s/lessonVersion/%s",
                    parameters.get(COURSE_CID),
                    parameters.get(COURSE_VERSION),
                    type,
                    item.getString(CID),
                    parameters.get(COURSE_VERSION));
        } else { // --> assessment
            href = href + String.format("assessment/course/%s/courseVersion/%s/%s/%s/assessmentVersion/%s",
                    parameters.get(COURSE_CID),
                    parameters.get(COURSE_VERSION),
                    type,
                    item.getString(CID),
                    parameters.get(COURSE_VERSION));
        }
        Element fileElementChild = doc.createElement("file");
        /**
         REQ_29.6.3.9.1.1 - If the <resource> is local to the content package, then a <file> element must
         exist as a child of the defined <resource> element and the <file> element’s href
         attribute shall be identical to the <resource> element’s href attribute, exclusive
         of any URL parameters that may be specified in the href attribute of the
         <resource> element
         */
        fileElementChild.setAttribute("href", "scp/index.html");
        List<Element> children = new ArrayList<>(1);
        children.add(fileElementChild);
        String identifier = createAttributeIdentifierrefValueForItemElement(createAttributeIdentifierValueForItemElement(item));
        return createResourceElement(doc, identifier, "webcontent", "sco", href, children);
    }

    /**
     * @param doc
     * @param identifier
     * @param type
     * @param scormType  adlcp:scormType value shall be a character string where the character string is either:<br/>
     *                   •sco if the resource is a SCO, or <br/>
     *                   •asset if the resource is an asset.
     * @param href
     * @param children
     * @return
     */
    private Element createResourceElement(Document doc, String identifier, String type, String scormType, String href,
                                          List<Element> children) {
        Element element = doc.createElement(RESOURCE);
        element.setAttribute(IDENTIFIER, identifier);
        element.setAttribute(TYPE, type);
        element.setAttribute("adlcp:scormType", scormType);
        element.setAttribute("href", href);
        if (children != null) {
            children.forEach(element::appendChild);
        }
        return element;
    }

    private Element createClassificationElementWithStandards(ScormStandardsPackage scormStandardsPackage, Document doc) {
        Element classification = doc.createElement(CLASSIFICATION);

        String descriptionString = scormStandardsPackage.getDescription();
        if (descriptionString != null && !descriptionString.isEmpty()) {
            Element description = createElementWithString(DESCRIPTION, descriptionString, doc);
            classification.appendChild(description);
        }

        if (scormStandardsPackage.getPurpose() != null && !scormStandardsPackage.getPurpose().isEmpty()) {
            Element purpose = createElementWithSourceValuePair(PURPOSE, scormStandardsPackage.getPurpose(), doc);
            classification.appendChild(purpose);
        }

        Element taxonPath = doc.createElement(TAXON_PATH);
        Element source = createElementWithString(SOURCE, scormStandardsPackage.getName(), doc);
        taxonPath.appendChild(source);

        for (Map.Entry standard : scormStandardsPackage.getStandards().entrySet()) {
            Element taxon = doc.createElement(TAXON);
            Element id = doc.createElement(ID);
            id.appendChild(doc.createTextNode(standard.getKey().toString()));
            taxon.appendChild(id);

            String description = standard.getValue().toString();
            if (description != null && !description.isEmpty()) {
                if (description.length() > 500) { // taxon entry (standard's description) is limited to 500 characters
                    description = description.substring(0, 499);
                }
                Element entry = createElementWithString(ENTRY, description, doc);
                taxon.appendChild(entry);
            }
            taxonPath.appendChild(taxon);
        }
        classification.appendChild(taxonPath);

        return classification;
    }

    private void addPropertiesToRelationElement(ScormType scormType,
                                                HashMap<String, String> courseCustomFieldsMap,
                                                HashMap<String, String> lessonCustomFieldsMap,
                                                Document doc) {
        logger.debug("addPropertiesToRelationElement. Create 'relation' tab if required.");
        Node kind = createElementWithSourceValuePair(KIND, "relation_kind", scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        Element identifier = createIdentifierElement(scormType, "relation_resource", courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        Element description = createStringElement(DESCRIPTION, "relation_resource_description", scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);

        Element relation = doc.createElement(RELATION);
        if (kind != null) {
            relation.appendChild(kind);
        }

        Element resource = doc.createElement(RESOURCE);
        if (identifier != null) {
            resource.appendChild(identifier);
        }
        if (description != null) {
            resource.appendChild(description);
        }
        if (resource.hasChildNodes()) {
            relation.appendChild(resource);
        }

        if (!relation.hasChildNodes()) {
            return;
        }

        Node lom = doc.getElementsByTagName(LOM).item(0);
        lom.appendChild(relation);
    }

    private void addPropertiesToRightsElement(ScormType scormType, HashMap<String, String> courseCustomFieldsMap, HashMap<String, String> lessonCustomFieldsMap, Document doc) {
        logger.debug("addPropertiesToRightsElement. Create 'rights' tab if required.");
        Node cost = createElementWithSourceValuePair(COST, "rights_cost", scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        Node copyrightAndOtherRestrictions = createElementWithSourceValuePair("copyrightAndOtherRestrictions", "rights_copyrightAndOtherRestrictions", scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        Element description = createStringElement(DESCRIPTION, "rights_description", scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);

        Element rights = doc.createElement(RIGHTS);
        if (cost != null) {
            rights.appendChild(cost);
        }
        if (copyrightAndOtherRestrictions != null) {
            rights.appendChild(copyrightAndOtherRestrictions);
        }
        if (description != null) {
            rights.appendChild(description);
        }

        if (!rights.hasChildNodes()) {
            return;
        }

        Node lom = doc.getElementsByTagName(LOM).item(0);
        lom.appendChild(rights);
    }

    private void addPropertiesToEducationalElement(ScormType scormType, JSONObject manifestObject, HashMap<String, String> courseCustomFieldsMap, HashMap<String, String> lessonCustomFieldsMap, Document doc) throws JSONException {
        logger.debug("addPropertiesToEducationalElement. Add additional properties to 'educational' tab.");
        Node educational = doc.getElementsByTagName(EDUCATIONAL).item(0);
        addSourceValueElementToRootElement(educational, "educational_learningResourceType", LEARNING_RESOURCE_TYPE, scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        addSourceValueElementToRootElement(educational, "educational_interactivityLevel", INTERACTIVITY_LEVEL, scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        addSourceValueElementToRootElement(educational, "educational_semanticDensity", SEMANTIC_DENSITY, scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        addSourceValueElementToRootElement(educational, "educational_intendedEndUserRole", INTENDED_END_USER_ROLE, scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        addSourceValueElementToRootElement(educational, "educational_context", CONTEXT, scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        addStringElement(educational, "educational_typicalAgeRange", TYPICAL_AGE_RANGE, scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        addSourceValueElementToRootElement(educational, "educational_difficulty", DIFFICULTY, scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);

        // add typicalLearningTime element
        if (scormType.equals(ScormType.LESSON) && manifestObject.has(TYPICAL_LEARNING_TIME)) {
            Element typicalLearningTime = doc.createElement(TYPICAL_LEARNING_TIME);
            Element duration = doc.createElement(DURATION);
            duration.appendChild(doc.createTextNode(manifestObject.getString(TYPICAL_LEARNING_TIME)));
            typicalLearningTime.appendChild(duration);
            educational.appendChild(typicalLearningTime);
        }

        // add description element
        addStringElement(educational, "educational_description", DESCRIPTION, scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
    }

    /**
     * Creates a child element, adds it a source-value pair elements if the customFieldKey exists in the lesson or
     * course customFields map. The higher priority is to take the value from the lesson's customFields map. If it's not
     * exists there, it'll be taken from the course's customFields map.
     * If the customFieldKey doesn't exists in either of the maps, returns null.
     *
     * @param childName             - the name of the child element that the source-value pair elements will be added to.
     * @param customFieldKey        - the key that represents the value in the customFields hash-maps.
     * @param courseCustomFieldsMap - the customFields map of the course.
     * @param lessonCustomFieldsMap - the customFields map of the lesson.
     * @param doc                   - a Document object. The document instance that creates all elements.
     * @return - the child element if such customFieldKey exists in either the courseCustomFieldsMap or lessonCustomFieldsMap.
     * Otherwise, returns null.
     */
    private Node createElementWithSourceValuePair(String childName, String customFieldKey, ScormType scormType, HashMap<String, String> courseCustomFieldsMap, HashMap<String, String> lessonCustomFieldsMap, Document doc) {
        String customFieldValue = null;
        if (scormType.equals(ScormType.LESSON)) {
            customFieldValue = lessonCustomFieldsMap.get(customFieldKey);
        }
        if (scormType.equals(ScormType.COURSE) || customFieldValue == null) {
            customFieldValue = courseCustomFieldsMap.get(customFieldKey);
            if (customFieldValue == null) {
                return null;
            }
        }

        return createElementWithSourceValuePair(childName, customFieldValue, doc);
    }

    private Element createElementWithSourceValuePair(String elementName, String valueString, Document doc) {
        Element element = doc.createElement(elementName);
        Element source = doc.createElement(SOURCE);
        Element value = doc.createElement(VALUE);
        source.appendChild(doc.createTextNode(LOM_V_1_0));
        value.appendChild(doc.createTextNode(valueString));
        element.appendChild(source);
        element.appendChild(value);
        return element;
    }

    /**
     * Creates a child element, adds it a source-value pair elements if the customFieldKey exists in the lesson or
     * course customFields map. The higher priority is to take the value from the lesson's customFields map. If it's not
     * exists there, it'll be taken from the course's customFields map.
     * If the customFieldKey doesn't exists in either of the maps, the child element will not be added to the root element.
     *
     * @param root                  - the root element which we want the child element to be added to.
     * @param customFieldKey        - the key that represents the value in the customFields hash-maps.
     * @param childName             - the name of the child element that the source-value pair elements will be added to.
     * @param courseCustomFieldsMap - the customFields map of the course.
     * @param lessonCustomFieldsMap - the customFields map of the lesson.
     * @param doc                   - a Document object. The document instance that creates all elements.
     */
    private void addSourceValueElementToRootElement(Node root, String customFieldKey, String childName, ScormType scormType, HashMap<String, String> courseCustomFieldsMap, HashMap<String, String> lessonCustomFieldsMap, Document doc) {
        Node child = createElementWithSourceValuePair(childName, customFieldKey, scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        if (child != null) {
            root.appendChild(child);
        }
    }

    private void addPropertiesToTechnicalElement(ScormType scormType, HashMap<String, String> courseCustomFieldsMap, HashMap<String, String> lessonCustomFieldsMap, Document doc) {
        logger.debug("addPropertiesToTechnicalElement. Add additional properties to 'technical' tab.");
        Node technical = doc.getElementsByTagName(TECHNICAL).item(0);
        addStringElement(technical, "technical_installationRemarks", INSTALLATION_REMARKS, scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
    }

    /**
     * Creates a child element and adds it a string element with the value found in either the course or lesson customFields maps
     * if found, and adds the child element to the given root element.
     * If the value wasn't found in the maps, the child element will not be added to the root element.
     *
     * @param root                  - the root element which we want the child element to be added to.
     * @param customFieldKey        - the key that represents the value in the customFields hash-maps.
     * @param elementName           - the name of the child element that the string element will be added to.
     * @param courseCustomFieldsMap - the customFields map of the course.
     * @param lessonCustomFieldsMap - the customFields map of the lesson.
     * @param doc                   - a Document object. The document instance that creates all elements.
     */
    private void addStringElement(Node root, String customFieldKey, String elementName, ScormType scormType, HashMap<String, String> courseCustomFieldsMap, HashMap<String, String> lessonCustomFieldsMap, Document doc) {
        Element element = createStringElement(elementName, customFieldKey, scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        if (element != null) {
            root.appendChild(element);
        }
    }

    /**
     * Creates a child element and adds it a string element with the value found in either the course or lesson customFields maps
     * if found, and adds the child element to the given root element.
     * If the value wasn't found in the maps, returns null.
     *
     * @param elementName           - the name of the child element that the string element will be added to.
     * @param customFieldKey        - the key that represents the value in the customFields hash-maps.
     * @param courseCustomFieldsMap - the customFields map of the course.
     * @param lessonCustomFieldsMap - the customFields map of the lesson.
     * @param doc                   - a Document object. The document instance that creates all elements.
     * @return element that contains the string element if such customFieldKey exists in either the courseCustomFieldsMap or lessonCustomFieldsMap.
     * Otherwise, returns null.
     */
    private Element createStringElement(String elementName, String customFieldKey, ScormType scormType, HashMap<String, String> courseCustomFieldsMap, HashMap<String, String> lessonCustomFieldsMap, Document doc) {
        String customFieldValue = null;
        if (scormType.equals(ScormType.LESSON)) {
            customFieldValue = lessonCustomFieldsMap.get(customFieldKey);
        }
        if (scormType.equals(ScormType.COURSE) || customFieldValue == null) {
            customFieldValue = courseCustomFieldsMap.get(customFieldKey);
            if (customFieldValue == null) {
                return null;
            }
        }

        return createElementWithString(elementName, customFieldValue, doc);
    }

    private Element createElementWithString(String elementName, String stringValue, Document doc) {
        Element element = doc.createElement(elementName);
        Element string = doc.createElement(STRING);
        string.appendChild(doc.createTextNode(stringValue));
        element.appendChild(string);
        return element;
    }

    private void addPropertiesToGeneralElement(ScormType scormType, JSONObject manifest, HashMap<String, String> courseCustomFieldsMap,
                                               HashMap<String, String> lessonCustomFieldsMap, Document doc) throws JSONException {
        logger.debug("addPropertiesToGeneralElement. Add additional properties to 'general' tab.");
        Node general = doc.getElementsByTagName(GENERAL).item(0);
        Element identifier = createIdentifierElement(scormType, GENERAL, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        if (identifier != null) {
            general.appendChild(identifier);
        }

        // add description element
        switch (scormType) {
            case COURSE:
                if (manifest.has(OVERVIEW)) {
                    Element description = createElementWithString(DESCRIPTION, manifest.getString(OVERVIEW), doc);
                    general.appendChild(description);
                }
                break;
            case LESSON:
                if (manifest.has(DESCRIPTION)) {
                    Element description = createElementWithString(DESCRIPTION, manifest.getString(DESCRIPTION), doc);
                    general.appendChild(description);
                }
                break;
        }
    }

    private void addPropertiesToMetaMetadataElement(ScormType scormType, HashMap<String, String> courseCustomFieldsMap,
                                                    HashMap<String, String> lessonCustomFieldsMap, Document doc) throws JSONException {
        logger.debug("addPropertiesToMetaMetadataElement. Add additional properties to 'metaMetadata' tab.");
        Node metaMetadata = doc.getElementsByTagName(META_METADATA).item(0);

        // create the identifier tab
        Element identifier = createIdentifierElement(scormType, META_METADATA, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        if (identifier != null) {
            metaMetadata.appendChild(identifier);
        }

        // create the contribute tab
        Element role = createRoleElement(scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        Element entity = createEntityElementWithVCard(scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);
        Element date = createDateElement(scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc);

        Element contribute = doc.createElement(CONTRIBUTE);
        if (role != null) {
            contribute.appendChild(role);
        }
        if (entity != null) {
            contribute.appendChild(entity);
        }
        if (date != null) {
            contribute.appendChild(date);
        }

        if (contribute.hasChildNodes()) {
            metaMetadata.appendChild(contribute);
        }

        // create the language tab
        addLanguageElement(scormType, courseCustomFieldsMap, lessonCustomFieldsMap, doc, metaMetadata);
    }

    private void addLanguageElement(ScormType scormType, HashMap<String, String> courseCustomFieldsMap,
                                    HashMap<String, String> lessonCustomFieldsMap, Document doc, Node metaMetadata) {
        String languageString = null;
        if (scormType.equals(ScormType.LESSON)) {
            languageString = lessonCustomFieldsMap.get("metaMetadata_language");
        }
        if (scormType.equals(ScormType.COURSE) || languageString == null) {
            languageString = courseCustomFieldsMap.get("metaMetadata_language");
            if (languageString == null) {
                return;
            }
        }

        Element language = doc.createElement(LANGUAGE);
        language.appendChild(doc.createTextNode(languageString));
        metaMetadata.appendChild(language);
    }

    private Element createDateElement(ScormType scormType, HashMap<String, String> courseCustomFieldsMap,
                                      HashMap<String, String> lessonCustomFieldsMap, Document doc) {
        if (scormType.equals(ScormType.LESSON)
                && (lessonCustomFieldsMap.containsKey("metaMetadata_contribute_date")
                || lessonCustomFieldsMap.containsKey("metaMetadata_contribute_date_description"))) {
            return createDateFromCustomFields(lessonCustomFieldsMap, doc);
        } else if (courseCustomFieldsMap.containsKey("metaMetadata_contribute_date") || courseCustomFieldsMap.containsKey("metaMetadata_contribute_date_description")) {
            return createDateFromCustomFields(courseCustomFieldsMap, doc);
        }

        return null;
    }

    private Element createDateFromCustomFields(HashMap<String, String> customFieldsMap, Document doc) {
        Element date = null;
        if (customFieldsMap.containsKey("metaMetadata_contribute_date")) {
            date = doc.createElement(DATE);
            Element dateTime = doc.createElement(DATE_TIME);
            dateTime.appendChild(doc.createTextNode(customFieldsMap.get("metaMetadata_contribute_date")));
            date.appendChild(dateTime);
        }

        if (customFieldsMap.containsKey("metaMetadata_contribute_date_description")) {
            if (date == null) {
                date = doc.createElement(DATE);
            }

            Element description = createElementWithString(DESCRIPTION, customFieldsMap.get("metaMetadata_contribute_date_description"), doc);
            date.appendChild(description);
        }

        return date;
    }

    private Element createEntityElementWithVCard(ScormType scormType, HashMap<String, String> courseCustomFieldsMap, HashMap<String, String> lessonCustomFieldsMap, Document doc) {
        String vCard = null;
        if (scormType.equals(ScormType.LESSON) && (lessonCustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_title") || lessonCustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_name") ||
                lessonCustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_familyName") || lessonCustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_email") ||
                lessonCustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_phone"))) {
            vCard = createVCardFromCustomFields(lessonCustomFieldsMap);
        } else if (courseCustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_title") || courseCustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_name") ||
                courseCustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_familyName") || courseCustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_email") ||
                courseCustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_phone")) {
            vCard = createVCardFromCustomFields(courseCustomFieldsMap);
        }

        if (vCard == null) {
            return null;
        }

        Element entity = doc.createElement(ENTITY);
        entity.appendChild(doc.createTextNode(vCard));
        return entity;
    }

    private String createVCardFromCustomFields(HashMap<String, String> CustomFieldsMap) {
        StringBuilder vCard = new StringBuilder(String.format("BEGIN:VCARD%s", VCARD_CARTRIDGE_RETURN_AND_NEW_LINE_MARKS));
        vCard.append(String.format("VERSION:2.1%s", VCARD_CARTRIDGE_RETURN_AND_NEW_LINE_MARKS));
        if (CustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_title")) {
            vCard.append("TITLE:");
            vCard.append(CustomFieldsMap.get("metaMetadata_contribute_entity_vcard_title"));
            vCard.append(VCARD_CARTRIDGE_RETURN_AND_NEW_LINE_MARKS);
        }

        boolean isFirstNameDefined = CustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_name");
        boolean isLastNameDefined = CustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_familyName");
        if (isFirstNameDefined || isLastNameDefined) {
            vCard.append("FN:");
            if (isFirstNameDefined && isLastNameDefined) {
                vCard.append(CustomFieldsMap.get("metaMetadata_contribute_entity_vcard_name"));
                vCard.append(" ");
                vCard.append(CustomFieldsMap.get("metaMetadata_contribute_entity_vcard_familyName"));
            } else {
                String name = isFirstNameDefined ? CustomFieldsMap.get("metaMetadata_contribute_entity_vcard_name") : CustomFieldsMap.get("metaMetadata_contribute_entity_vcard_familyName");
                vCard.append(name);
            }
            vCard.append(VCARD_CARTRIDGE_RETURN_AND_NEW_LINE_MARKS);
        }

        if (CustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_email")) {
            vCard.append("EMAIL;PREF;INTERNET:");
            vCard.append(CustomFieldsMap.get("metaMetadata_contribute_entity_vcard_email"));
            vCard.append(VCARD_CARTRIDGE_RETURN_AND_NEW_LINE_MARKS);
        }

        if (CustomFieldsMap.containsKey("metaMetadata_contribute_entity_vcard_phone")) {
            vCard.append("TEL;WORK;VOICE:");
            vCard.append(CustomFieldsMap.get("metaMetadata_contribute_entity_vcard_phone"));
            vCard.append(VCARD_CARTRIDGE_RETURN_AND_NEW_LINE_MARKS);
        }

        vCard.append("END:VCARD");
        return vCard.toString();
    }

    private Element createRoleElement(ScormType scormType, HashMap<String, String> courseCustomFieldsMap, HashMap<String, String> lessonCustomFieldsMap, Document doc) {
        String roleString = null;
        if (scormType.equals(ScormType.LESSON)) {
            roleString = lessonCustomFieldsMap.get("metaMetadata_contribute_role");
        }
        if (scormType.equals(ScormType.COURSE) || roleString == null) {
            roleString = courseCustomFieldsMap.get("metaMetadata_contribute_role");
            if (roleString == null) {
                return null;
            }
        }

        return createElementWithSourceValuePair(ROLE, roleString, doc);
    }

    /**
     * Creates an identifier element that may be constructed from catalog and entry elements. If the lesson's customFields
     * contain values for at least one of the two elements (catalog or entry), the identifier will be set with these elements,
     * but if the lesson's customFields don't contain any catalog or entry values, they will be taken from the course's
     * customFields. If the course's customFields don't contain the either, null will be returned.
     *
     * @param identifierPartialKey  - the prefix of the identifier's key as appears in the customFields maps without the
     *                              _identifier_catalog and _identifier_entry parts. For example: for the key
     *                              "general_identifier_catalog", the required prefix is "general".
     * @param courseCustomFieldsMap - the customFields map of the course.
     * @param lessonCustomFieldsMap - the customFields map of the lesson.
     * @param doc                   - a Document object. The document instance that creates all elements.
     * @return the identifier element if the required values were found in the lessonCustomFieldsMap or courseCustomFieldsMap.
     * Otherwise, returns null.
     */
    private Element createIdentifierElement(ScormType scormType, String identifierPartialKey, HashMap<String, String> courseCustomFieldsMap, HashMap<String, String> lessonCustomFieldsMap, Document doc) {
        Element identifier = null;
        String catalogCustomFieldKey = String.format("%s_identifier_catalog", identifierPartialKey);
        String entryCustomFieldKey = String.format("%s_identifier_entry", identifierPartialKey);

        if (scormType.equals(ScormType.LESSON)) { // if SCORM for lesson, at first, we need to check if the lesson contains the identifier's properties
            if (lessonCustomFieldsMap.containsKey(catalogCustomFieldKey)) {
                identifier = doc.createElement(IDENTIFIER);
                Element catalog = doc.createElement(CATALOG);
                catalog.appendChild(doc.createTextNode(lessonCustomFieldsMap.get(catalogCustomFieldKey)));
                identifier.appendChild(catalog);
            }

            if (lessonCustomFieldsMap.containsKey(entryCustomFieldKey)) {
                if (identifier == null) {
                    identifier = doc.createElement(IDENTIFIER);
                }
                Element entry = doc.createElement(ENTRY);
                entry.appendChild(doc.createTextNode(lessonCustomFieldsMap.get(entryCustomFieldKey)));
                identifier.appendChild(entry);
            }
        }

        if (identifier == null) { // if it's SCORM for course or the lesson doesn't contains them, check the course
            if (courseCustomFieldsMap.containsKey(catalogCustomFieldKey)) {
                identifier = doc.createElement(IDENTIFIER);
                Element catalog = doc.createElement(CATALOG);
                catalog.appendChild(doc.createTextNode(courseCustomFieldsMap.get(catalogCustomFieldKey)));
                identifier.appendChild(catalog);
            }

            if (courseCustomFieldsMap.containsKey(entryCustomFieldKey)) {
                if (identifier == null) {
                    identifier = doc.createElement(IDENTIFIER);
                }
                Element entry = doc.createElement(ENTRY);
                entry.appendChild(doc.createTextNode(courseCustomFieldsMap.get(entryCustomFieldKey)));
                identifier.appendChild(entry);
            }
        }
        return identifier;
    }

    /**
     * Fills the 2 hash-maps with key-value pairs that will contain as keys the SCORM CID fields as they appear in the course
     * and lesson customFields properties.
     * One hash-map will represent the course and the second one will represent the lesson.
     *
     * @param courseObject          - the course manifest as JSONObject
     * @param lessonObject          - the lesson manifest as JSONObject
     * @param courseCustomFieldsMap - the hash-map of the course custom fields.
     * @param lessonCustomFieldsMap - the hash-map of the lesson custom fields.
     * @throws JSONException
     * @throws ParseException
     */
    private void createMapOfScormFieldsForLesson(JSONObject courseObject, JSONObject lessonObject,
                                                 HashMap<String, String> courseCustomFieldsMap,
                                                 HashMap<String, String> lessonCustomFieldsMap) throws JSONException, ParseException {
        logger.debug("createMapOfScormFieldsForLesson. About to create custom fields maps for course and lesson.");

        JSONArray lessonCustomFields = new JSONArray();
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(DATE_FORMAT);

        if (lessonObject.has(CUSTOM_FIELDS)) {
            lessonCustomFields = lessonObject.getJSONArray(CUSTOM_FIELDS);
        }

        // first, we take the custom fields from course level
        createMapOfScormFieldsForCourse(courseObject, courseCustomFieldsMap);

        // now, we take the custom fields from lesson level
        fillCustomFieldsMap(T2K_LESSON_SCORM_2004_V4_LOM, lessonCustomFields, simpleDateFormat, lessonCustomFieldsMap);
    }

    private void createMapOfScormFieldsForCourse(JSONObject courseObject, HashMap<String, String> courseCustomFieldsMap) throws JSONException, ParseException {
        logger.debug("createMapOfScormFieldsForCourse. About to create custom fields map for course.");

        JSONArray courseCustomFields = new JSONArray();
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat(DATE_FORMAT);

        if (courseObject.has(CUSTOM_FIELDS)) {
            courseCustomFields = courseObject.getJSONArray(CUSTOM_FIELDS);
        }

        fillCustomFieldsMap(T2K_COURSE_SCORM_2004_V4_LOM, courseCustomFields, simpleDateFormat, courseCustomFieldsMap);
    }

    private void fillCustomFieldsMap(String cidPrefix, JSONArray customFieldsArray, SimpleDateFormat simpleDateFormat,
                                     HashMap<String, String> customFieldsMap) throws JSONException, ParseException {
        for (Object object : customFieldsArray) {
            String cid = ((JSONObject) object).getString(CID);
            if (cid.startsWith(cidPrefix)) {
                cid = cid.replace(cidPrefix, "");
                JSONObject value = ((JSONObject) object).getJSONObject(VALUE);
                switch (((JSONObject) object).getString(TYPE)) {
                    case TEXT:
                        String text = value.getString(TEXT).trim();
                        if (!text.isEmpty())
                            customFieldsMap.put(cid, text);
                        break;
                    case DATE:
                        String dateString = value.getString(DATE);
                        if (!dateString.isEmpty()) {
                            Date date = simpleDateFormat.parse(value.getString(DATE));
                            customFieldsMap.put(cid, simpleDateFormat.format(date));
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }

    private Map<String, String> getRequiredFieldsInScormXml(ScormType scormType, JSONObject courseObject, JSONObject lessonObject, ExtraDataAboutPackageForScorm extraDataAboutPackageForScorm) throws JSONException {
        JSONObject courseDataObject = courseObject.getJSONObject(DATA);
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

        // replace manifest context
        Map<String, String> replaceMap = new HashMap<>();
        replaceMap.put(COURSE_CID, courseObject.getString("id"));
        replaceMap.put("LANGUAGE", courseDataObject.getJSONArray("contentLocales").getString(0).replace("_", "-"));
        replaceMap.put(LOCALE, courseDataObject.getJSONArray("contentLocales").getString(0));
        replaceMap.put(COURSE_VERSION, courseObject.getString("version"));
        replaceMap.put(COURSE_NAME, courseDataObject.getString(TITLE));
        replaceMap.put("ACCOUNT_NAME", extraDataAboutPackageForScorm.getPublisherName());
        replaceMap.put("PUBLISH_MODE", extraDataAboutPackageForScorm.getPublishModeEnum().equals(PublishModeEnum.PRODUCTION) ? "final" : "draft");
        replaceMap.put("PUBLISH_START_DATE", sdf.format(extraDataAboutPackageForScorm.getPublishStartDate()));
        replaceMap.put("SCP_AND_COURSE_FOLDERS_SIZE", String.valueOf(extraDataAboutPackageForScorm.getFileSize()));
        if (scormType.equals(ScormType.COURSE)) {
            replaceMap.put("TITLE", courseDataObject.getString(TITLE));
        } else if (scormType.equals(ScormType.LESSON)) {
            JSONObject lessonDataObject = lessonObject.getJSONObject(DATA);
            replaceMap.put("LESSON_CID", lessonObject.getString(CID));
            replaceMap.put("TITLE", lessonDataObject.getString(TITLE));
            replaceMap.put("LESSON_NAME", lessonDataObject.getString(TITLE));
        }

        return replaceMap;
    }

    private String getScormManifestWithParameters(Map<String, String> parameters, String scormManifest) {
        for (Map.Entry entry : parameters.entrySet()) {
            scormManifest = scormManifest.replace(String.format("${%s}", entry.getKey()), StringEscapeUtils.escapeXml(entry.getValue().toString()));
            logger.debug(String.format("updated scorm manifest with: %s : %s", entry.getKey(), entry.getValue().toString()));
        }
        return scormManifest;
    }

    private File writeScormManifestXmlToFile(String scormManifestOutputPath, Document doc) throws TransformerException {
        // create a transformer which will transform the document into XML file
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "4"); // apache's variable that defines how many spaces to use in tabs indentation.
        File scormManifestOutputFile = new File(scormManifestOutputPath);
        if (!scormManifestOutputFile.getParentFile().exists()) {
            scormManifestOutputFile.getParentFile().mkdir();
        }
        // write the content into XML file
        transformer.transform(new DOMSource(doc), new StreamResult(scormManifestOutputFile));
        return scormManifestOutputFile;
    }
}