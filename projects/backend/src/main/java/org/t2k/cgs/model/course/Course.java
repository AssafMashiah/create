package org.t2k.cgs.model.course;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.mongodb.DBObject;
import org.apache.log4j.Logger;
import org.springframework.data.mongodb.core.mapping.Document;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.model.*;
import org.t2k.cgs.model.classification.LearningPath;
import org.t2k.cgs.model.classification.StandardsPackage;
import org.t2k.cgs.model.classification.TaggedStandards;
import org.t2k.cgs.model.ebooks.EBook;
import org.t2k.cgs.security.CustomMetadataPackage;

import javax.persistence.Id;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 24/06/14
 * Time: 17:37
 */
@Document(collection = "courses")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Course implements ContentItemBase, Comparable<Course>, EBookHolder {
    private static final Logger LOGGER = Logger.getLogger(Course.class);

    @Id
    private String _id;

    private CGSData cgsData;

    private CourseContentData contentData;

    public static Course newInstance(String id, int publisherId, CourseContentData contentData) {
        Course course = new Course();
        course._id = id;
        course.cgsData = CGSData.newInstance(publisherId);
        course.contentData = contentData;
        return course;
    }


    public static Course of(CourseCGSObject courseCGSObject) {
        Course course = new Course();
        course._id = courseCGSObject.getCourseId();
        course.cgsData = CGSData.newInstance(courseCGSObject.getPublisherId());
        DBObject cgsContentData = courseCGSObject.getContentData();

        Set<CGSResource> resources = ((List<DBObject>) cgsContentData.get(CourseCGSObject.CGS_COURSE_RESOURCES))
                .stream().map(CGSResource::of).collect(Collectors.toSet());
        Set<TaggedStandards> taggedStandards = ((List<DBObject>) cgsContentData.get("standards"))
                .stream().map(TaggedStandards::of).collect(Collectors.toSet());
        Set<StandardsPackage> standardPackages = ((List<DBObject>) cgsContentData.get(CourseCGSObject.STANDARD_PACKAGES))
                .stream().map(StandardsPackage::of).collect(Collectors.toSet());
        List<Object> customFields = ((List<DBObject>) cgsContentData.get("customFields"))
                .stream().map(CourseMetaDataField::of).collect(Collectors.toList());
        List<CustomMetadataPackage> customMetadataPackages = ((List<DBObject>) cgsContentData.get("customFields"))
                .stream().map(CustomMetadataPackage::of).collect(Collectors.toList());

        course.contentData = new CourseContentData.Builder(courseCGSObject.getCourseId(),
                (String) cgsContentData.get(CourseCGSObject.CGS_AUTHOR),
                (String) cgsContentData.get(CourseCGSObject.TITLE))
                .cid((String) cgsContentData.get(CourseCGSObject.CID))
                .cgsVersion((String) cgsContentData.get(CourseCGSObject.CGS_VERSION))
                .schema((String) cgsContentData.get(CourseCGSObject.SCHEMA))
                .tableOfContents(CourseToc.of((DBObject) cgsContentData.get(CourseCGSObject.CGS_COURSE_TOC)))
                .sample((List<CourseTocItemRef>) cgsContentData.get("sample"))
                .learningPaths((List<LearningPath>) cgsContentData.get("learningPaths"))
                .publisherName((String) cgsContentData.get("publisher"))
                .contentLocales((Set<String>) cgsContentData.get(CourseCGSObject.CGS_COURSE_LOCALES))
                .customizationPack(CourseCustomizationPack.of((DBObject) cgsContentData.get("customizationPack")))
                .includeLearningObject((Boolean) cgsContentData.get("includeLo"))
                .resources(resources)
                .header(Header.of((DBObject) cgsContentData.get(CourseCGSObject.HEADER)))
                .maxDepth((Integer) cgsContentData.get("maxDepth"))
                .standards(taggedStandards)
                .standardPackages(standardPackages)
                .subjectArea((Set<String>) cgsContentData.get("subjectArea"))
                .gradeLevel((Set<String>) cgsContentData.get("gradeLevel"))
                .differentiation(CourseDifferentiation.of((DBObject) cgsContentData.get("differentiation")))
                .toolboxWidgets((Set<ToolboxWidget>) cgsContentData.get("toolboxWidgets"))
                .overview((String) cgsContentData.get("overview"))
                .credits((String) cgsContentData.get("credits"))
                .targetPopulation((String) cgsContentData.get("targetPopulation"))
                .technicalRequirements((String) cgsContentData.get("technicalRequirements"))
                .isbn((String) cgsContentData.get("isbn"))
                .themingLastModified(cgsContentData.get("themingLastModified"))
                .supplementaryNarrationLocales((Set<String>) cgsContentData.get("supplementaryNarrationLocales"))
                .customFields(customFields)
                .customMetadataPackages(customMetadataPackages)
                .build();
        return course;
    }

    public String getId() {
        return _id;
    }

    public CourseContentData getContentData() {
        return contentData;
    }

    //TODO setter to be removed
    public void setContentData(CourseContentData contentData) {
        this.contentData = contentData;
    }

    public CGSData getCgsData() {
        return cgsData;
    }

    /**
     * Returns a brief description of this Course. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * Course{"contentData": {...}, "cgsData": {...}}
     */
    @Override
    public String toString() {
        return "Course{" +
                "\"contentData\": \"" + contentData + '\"' +
                ", \"cgsData\": \"" + cgsData + '\"' +
                '}';
    }

    @Override
    public String getContentId() {
        return contentData.getCid();
    }

    public String getCourseId() {
        return contentData.getCourseId();
    }

    /**
     * This method has no implementation in this class and the setter should be removed from interface in order to keep object immutable
     *
     * @param cid
     */
    @Override
    public void setContentId(String cid) {
        //TODO setter should be removed from interface in order to keep object immutable
    }

    @Override
    public EntityType getEntityType() {
        return EntityType.COURSE;
    }

    @Override
    public String getEntityId() {
        return _id;
    }

    @Override
    public String getContentVersionNumber() {
        return contentData.getVersion();
    }

    @Override
    public String getTitle() {
        return contentData.getTitle();
    }

    @Override
    public Date getLastModified() {
        return contentData.getHeader().getLastModified();
    }

    @Override
    public int compareTo(Course o) {
        if (this == o) {
            return 0;
        }
        int idDiff = this.contentData.getCourseId().compareTo(o.contentData.getCourseId());
        if (idDiff != 0) {
            return idDiff;
        }
        return this.getLastModified().compareTo(o.getLastModified());
    }

    @Override
    public boolean containsEBook(EBook eBook) {
        return contentData.containsEBook(eBook);
    }

    @Override
    public Set<String> getEBooksIds() {
        return contentData.getEBooksIds();
    }

    @Override
    public boolean updateEBook(EBook newEBook, EBook oldEBook) {
        LOGGER.debug(String.format("Updating eBook %s with %s on course %s", oldEBook, newEBook, this.getId()));
        return contentData.updateEBook(newEBook, oldEBook);
    }

    /**
     * @return a list of all {@link CourseTocItemRef} on the course
     */
    @JsonIgnore
    public List<CourseTocItemRef> getTocItemsRefs() {
        return contentData.getToc().getAllTocItemRefs();
    }

    /**
     * @return a list of all {@link CourseTocItemRef} on the course of the given type
     */
    @JsonIgnore
    public List<CourseTocItemRef> getAllTocItemRefs(EntityType type) {
        return contentData.getToc().getAllTocItemRefs(type);
    }

    public boolean hasTocItems() {
        return contentData.getToc() != null && contentData.getToc().getAllTocItemRefs().size() > 0;
    }

    /**
     * @param tocItemCid ID of the toc item to check
     * @return true if the course's toc contains the given toc item ID, false otherwise
     */
    public boolean containsTocItemRef(String tocItemCid) {
        return this.getTocItemsRefs().stream().map(CourseTocItemRef::getCid).collect(Collectors.toList())
                .contains(tocItemCid);
    }

    /**
     * @param tocItemCids IDs of the toc items to check
     * @return true if the course's toc contains the given toc item IDs, false otherwise
     */
    public boolean containsTocItemsRefs(List<String> tocItemCids) {
        return this.getTocItemsRefs().stream().map(CourseTocItemRef::getCid).collect(Collectors.toList())
                .containsAll(tocItemCids);
    }

    /**
     * Returns the reference to a toc item (lesson or assessment)
     *
     * @param cid content ID of the toc item ref
     * @return an optional containing the reference to a toc item (lesson or assessment)
     */
    @JsonIgnore
    public Optional<CourseTocItemRef> getTocItemRef(String cid) {
        return this.getTocItemsRefs().stream()
                .filter(courseTocItemRef -> courseTocItemRef.getCid().equals(cid))
                .findFirst();
    }

    /**
     * Returns the references to a toc items (lesson or assessment)
     *
     * @param cids content IDs of the toc item ref
     * @return the references to the toc items (lesson or assessment) or an empty list if none found
     */
    @JsonIgnore
    public List<CourseTocItemRef> getTocItemsRefs(List<String> cids) {
        return this.getTocItemsRefs().stream()
                .filter(courseTocItemRef -> cids.contains(courseTocItemRef.getCid()))
                .collect(Collectors.toList());
    }

    /**
     * Adds the given toc items refs to the course in in the toc level specified by {@code tocItemCid} and {@code index}
     *
     * @param tocItemRefs the toc items refs to add to the course
     * @param tocItemCid  cid of the toc inside which the toc item refs will be added
     * @param index       position inside the toc at which the refs will be added
     */
    public void addTocItemsRefs(List<CourseTocItemRef> tocItemRefs, String tocItemCid, int index) {
        CourseToc courseToc = getContentData().getToc();


    }

    /**
     * Updates the last modified date on the course with the current timestamp
     *
     * @return the updated header
     */
    public Header updateLastModified() {
        Header existingHeader = this.contentData.getHeader();
        this.contentData.setHeader(Header.newInstance(existingHeader, new Date()));
        return this.contentData.getHeader();
    }
}
