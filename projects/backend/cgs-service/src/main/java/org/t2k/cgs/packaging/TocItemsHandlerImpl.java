package org.t2k.cgs.packaging;

import com.mongodb.DBObject;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonNode;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.node.ArrayNode;
import org.codehaus.jackson.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.t2k.cgs.dao.courses.CoursesDao;
import org.t2k.cgs.dataServices.exceptions.ErrorCodes;
import org.t2k.cgs.dataServices.exceptions.ValidationException;
import org.t2k.cgs.ebooks.EBookService;
import org.t2k.cgs.model.classification.TaggedStandards;
import org.t2k.cgs.model.course.CourseCGSObject;
import org.t2k.cgs.model.ebooks.EBook;
import org.t2k.cgs.model.packaging.CGSPackage;
import org.t2k.cgs.model.tocItem.Format;
import org.t2k.cgs.model.tocItem.TocItemCGSObject;
import org.t2k.cgs.standards.parser.StandardsHelper;
import org.t2k.cgs.tocItem.TocItemDataService;
import org.t2k.cgs.utils.PackageSchemaConversionUtil;
import org.t2k.sample.dao.exceptions.DaoException;

import java.io.File;
import java.io.IOException;
import java.util.*;

/**
 * Instances of this class are created in {@link TocItemsHandlerConfiguration}
 */
public class TocItemsHandlerImpl implements TocItemsHandler {

    private static Logger logger = Logger.getLogger(TocItemsHandlerImpl.class);

    @Autowired
    private CoursesDao coursesDao;

    @Autowired
    private EBookService eBookService;

    @Autowired
    @Qualifier(value = "lessonsDataServiceBean")
    private TocItemDataService tocItemDataService;

    private Boolean changeFileNamesToSha1;

    private StandardsHelper standardsHelper = new StandardsHelper();

    private ObjectMapper mapper = new ObjectMapper();

    public TocItemsHandlerImpl(boolean changeFileNamesToSha1) {
        this.changeFileNamesToSha1 = changeFileNamesToSha1;
    }

    @Override
    public void modifyTocItemsAndHandleStandards(PackageHandlerImpl packageHandler) throws Exception {
        CGSPackage cgsPackage = packageHandler.getCGSPackage();
        logger.info("modifyTocItemsAndHandleStandards: packId: " + cgsPackage.getPackId());

        HashMap<String, EBook> eBooksUsedInCourse = eBookService.getPublisherEBooksAndIdsByCourse(cgsPackage.getPublisherId(), cgsPackage.getCourseId());

        Collection<File> tocItemFiles = getTocItemFiles(cgsPackage);
        Iterator<File> iterator = tocItemFiles.iterator();
        while (iterator.hasNext() && !packageHandler.isCanceled()) { // going over lessons and assessments
            File tocItemFile = iterator.next();
            modifyTocItemFileAndAddStandardsToPackage(packageHandler, tocItemFile, eBooksUsedInCourse);
        }
    }

    /**
     * @param cgsPackage - cgs package that could contain folders with lessons and assessments
     * @return - a list of all the files containing lessons and assessment manifests
     */
    private Collection<File> getTocItemFiles(CGSPackage cgsPackage) {
        List<File> tocItemFiles = new ArrayList<>();

        //handle lessons
        File lessonsDir = new File(cgsPackage.getLocalResourcesLocation().getLessonsPath());
        if (!lessonsDir.exists()) {
            logger.info(String.format("No lessons exist for course %s", cgsPackage.getPackId()));
        } else {
            Collection<File> lessonsFiles = FileUtils.listFiles(lessonsDir, null, true);
            tocItemFiles.addAll(lessonsFiles);
            logger.info(String.format("modifyTocItemsAndHandleStandards: number of lessons in FS: %d", lessonsFiles.size()));
        }

        // handle assessments
        File assessmentsDir = new File(cgsPackage.getLocalResourcesLocation().getAssessmentsPath());
        if (!assessmentsDir.exists()) {
            logger.info(String.format("No assessments exist for course %s", cgsPackage.getPackId()));
        } else {
            Collection<File> assessmentsFiles = FileUtils.listFiles(assessmentsDir, null, true);
            tocItemFiles.addAll(assessmentsFiles);
            logger.info("modifyTocItemsAndHandleStandards: number of assessments in FS: " + assessmentsFiles.size());
        }

        return tocItemFiles;
    }

    private void modifyTocItemFileAndAddStandardsToPackage(PackageHandlerImpl packageHandler, File tocItemFile, HashMap<String, EBook> ebooksUsedInCourse) throws Exception {
        String lessonString = FileUtils.readFileToString(tocItemFile, "UTF-8");
        JsonNode lessonRootNode = mapper.readTree(lessonString);
        PackageSchemaConversionUtil.convertPackageData(lessonRootNode);
        handleTocItemCustomizationPack(lessonRootNode, packageHandler);

        // removing resources references from lesson manifest
        ((ObjectNode) lessonRootNode).remove("overview"); // remove the Additional Information from the manifest
        packageHandler.scanResourceTableAndFilterByPrefix(lessonRootNode, Arrays.asList(ContentParseUtil.CGS_DATA), changeFileNamesToSha1);

        if (lessonRootNode.get("type").asText().equals("lesson") && lessonRootNode.get(TocItemCGSObject.FORMAT).getTextValue().equals(Format.EBOOK.name())) {
            packageHandler.generateBlankPageHtml(lessonRootNode);
//            packageHandler.generateThumbnailsForPagesWithHotSpots(lessonRootNode);

            // extract pages text for creating text search file
            packageHandler.createTextSearchFileForLesson(lessonRootNode, ebooksUsedInCourse);

            // Jouve support - add "pagesSource" attribute to lesson which contains Jouve Studio pages. Needed for affecting the GUI and functionality of the Lesson player (CREATE-4179 - Hide/Show jouve enrichment)
            boolean isJouveLesson = packageHandler.addPagesSourceForJouveLesson(lessonRootNode, ebooksUsedInCourse);

            // Jouve support - add "enrichments" attribute to pages which contain Jouve enrichment
            if (isJouveLesson) {
                packageHandler.addJouveEnrichmentForJouvePages(lessonRootNode, ebooksUsedInCourse);
            }
        }

        extractTocItemStandards(lessonRootNode, packageHandler.getCGSPackage().getIncludeAncestorsStandards(), packageHandler);
        mapper.writeValue(tocItemFile, lessonRootNode); // write to file
        packageHandler.addResourceToPackage(tocItemFile.getAbsolutePath());
    }

    private void extractTocItemStandards(JsonNode lessonRootNode, Boolean includeAncestorsStandards, PackageHandlerImpl packageHandler) throws DaoException, IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode standards = lessonRootNode.get("standards");

        Set<TaggedStandards> lessonStandards = new HashSet<>();
        if (standards != null) {
            Iterator<JsonNode> elements = standards.getElements();
            while (elements.hasNext()) {
                lessonStandards.add(objectMapper.readValue(elements.next(), TaggedStandards.class));
            }
        }

        if (includeAncestorsStandards) {
            addAncestorsStandards(lessonRootNode, packageHandler.getCGSPackage(), lessonStandards);
        }

        JsonNode jsonNode = objectMapper.valueToTree(lessonStandards);
        ((ObjectNode) lessonRootNode).put("standards", jsonNode);

        for (TaggedStandards taggedStandards : lessonStandards) {
            packageHandler.addToLessonsStandards(taggedStandards);
        }
    }

    //injects customizationPack property and resource into lesson/assessment
    private void handleTocItemCustomizationPack(JsonNode tocItemRootNode, PackageHandlerImpl packageHandler) throws ValidationException {
        String customizationPackResourceId = tocItemDataService.getNextAvailableResourceId(tocItemRootNode);

        if (packageHandler.getCourseCustomizationPackResourceNode() == null) {
            String msg = String.format("Item in course %s doesn't contain a reference to a customization pack. Aborting publish.", packageHandler.getCGSPackage().getCourseId());
            logger.error(msg);
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, msg);
        }

        try {
            //create new resources based on course resource
            ObjectNode tocItemCustomizationPackResourceNode = (ObjectNode) new ObjectMapper().readTree(packageHandler.getCourseCustomizationPackResourceNode().traverse());
            tocItemCustomizationPackResourceNode.put(ContentParseUtil.RES_ID, customizationPackResourceId);
            //add to resource list
            ArrayNode resources = (ArrayNode) tocItemRootNode.get(ContentParseUtil.RESOURCES);
            if (resources == null) {
                resources = new ObjectMapper().createArrayNode();
                ((ObjectNode) tocItemRootNode).put(ContentParseUtil.RESOURCES, resources);
            }
            resources.add(tocItemCustomizationPackResourceNode);

            //add to resource list
            ObjectNode tocItemCustomizationPackNode = (ObjectNode) new ObjectMapper().readTree(packageHandler.getCourseCustomizationPackNode().traverse());
            tocItemCustomizationPackNode.put(ContentParseUtil.RESOURCE_ID, customizationPackResourceId);
            ((ObjectNode) tocItemRootNode).put(ContentParseUtil.CUSTOMIZATIONPACK, tocItemCustomizationPackNode);

        } catch (Exception e) {
            throw new ValidationException(ErrorCodes.CONTENT_IS_NOT_VALID, e.getMessage(), e);
        }
    }


    private void addAncestorsStandards(JsonNode lessonRootNode, CGSPackage cgsPackage, Set<TaggedStandards> lessonStandards) throws DaoException, IOException {
        String tocCid = lessonRootNode.get("cid").getTextValue();
        DBObject course = coursesDao.getCourse(cgsPackage.getCourseId());
        CourseCGSObject courseCGSObject = new CourseCGSObject(course);
        Set<TaggedStandards> routeStandards = standardsHelper.getTaggedStandardsFromRootToTocItem(courseCGSObject, tocCid);
        standardsHelper.addAllTaggedStandardsToSet(lessonStandards, routeStandards);
    }
}