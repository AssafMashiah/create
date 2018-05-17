package org.t2k.cgs.domain.model.course;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.domain.model.CGSResource;
import org.t2k.cgs.domain.model.ContentData;
import org.t2k.cgs.domain.model.ebooks.EBookHolder;
import org.t2k.cgs.domain.model.Header;
import org.t2k.cgs.domain.model.classification.LearningPath;
import org.t2k.cgs.domain.model.classification.StandardsPackage;
import org.t2k.cgs.domain.model.classification.TaggedStandards;
import org.t2k.cgs.domain.model.ebooks.EBook;
import org.t2k.cgs.domain.model.CustomMetadataPackage;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Object containing the content of a course
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseContentData extends ContentData implements EBookHolder {

    private static final Logger LOGGER = Logger.getLogger(CourseContentData.class);

    @NotNull
    @Pattern(regexp = "^[\\d]+\\.[\\d]+(\\.[\\d]+){0,1}$")
    private String version = "1.0.0";

    @NotNull
    private String author;

    @NotNull
    @Pattern(regexp = "^[\\d]+\\.[\\d]+\\.[\\d]+(\\.[\\d]+)?$")
    private String cgsVersion;

    @NotNull
    private String courseId;

    @JsonProperty
    private boolean includeLo = true;

    private int maxDepth = 3;

    @NotNull
    private String publisher;

    private Set<String> subjectArea;

    private Set<String> gradeLevel;

    private CourseToc toc;

    /**
     * TOC items to be marked as sample on the course before the publish process. When a course has sample toc items,
     * only them will be available for playing in teach.
     */
    @JsonProperty
    private List<CourseTocItemRef> sample;

    @Valid
    private List<LearningPath> learningPaths;

    private CourseDifferentiation differentiation;

    /**
     * Widget applets used in Teach toolbox feature
     */
    @Valid
    private Set<ToolboxWidget> toolboxWidgets;

    private String credits;

    private String copyright;

    /**
     * ID of the cover resource
     */
    @Pattern(regexp = "resource_[0-9]+")
    private String coverRefId;

    private String targetPopulation;

    private String technicalRequirements;

    @Pattern(regexp = "^ISBN(?:-1[03])?[:\\s]\\s*(?:\\d+[- ]){3,}\\d?[xX]?$")
    private String isbn;

    /**
     * Reference IDs to eBooks used in the course
     */
    @JsonProperty(value = "eBooksIds")
    private Set<String> eBooksIds;

    private List<Object> lessonTemplates;
    @Pattern(regexp = "resource_[0-9]+")
    private String cssRefId;
    private Object pedagogicalLoTypes;
    private Object differentiationClasses;
    private boolean useTtsServices;
    private Object ttsServices;
    private Object format;

    private Object themingLastModified;
    @Valid
    private List<CustomMetadataPackage> customMetadataPackages;

    public CourseContentData() {
        this.cid = UUID.randomUUID().toString();
        this.header = new Header();
    }

    private static CourseContentData newInstance(Builder builder) {
        CourseContentData contentData = new CourseContentData();
        contentData.type = EntityType.COURSE.getName();
        contentData.cid = ((builder.cid != null) ? builder.cid : contentData.cid);
        contentData.courseId = builder.courseId;
        contentData.author = builder.author;
        contentData.cgsVersion = builder.cgsVersion;
        contentData.schema = builder.schema == null ? "course_v7" : builder.schema;
        contentData.eBooksIds = builder.eBooksIds;
        contentData.toc = builder.toc;
        contentData.sample = builder.sample;
        contentData.learningPaths = builder.learningPaths;
        contentData.title = builder.title;
        contentData.publisher = builder.publisher;
        contentData.contentLocales = builder.contentLocales;
        if (contentData.contentLocales.size() == 0) {
            throw new IllegalArgumentException("The course must have at least one content locale");
        }
        contentData.customizationPack = builder.customizationPack;
        contentData.includeLo = builder.includeLo;
        contentData.resources = builder.resources;
        // the following are used for copying existing course
        contentData.header = builder.header != null ? builder.header : contentData.header;
        contentData.maxDepth = builder.maxDepth != null ? builder.maxDepth : contentData.maxDepth;
        contentData.standards = builder.standards != null ? builder.standards : contentData.standards;
        contentData.standardPackages = builder.standardPackages != null ? builder.standardPackages : contentData.standardPackages;
        contentData.subjectArea = builder.subjectAreas;
        contentData.gradeLevel = builder.gradeLevel;
        contentData.differentiation = builder.differentiation;
        contentData.toolboxWidgets = builder.toolboxWidgets;
        contentData.overview = builder.overview;
        contentData.credits = builder.credits;
        contentData.copyright = builder.copyright;
        contentData.coverRefId = builder.coverRefId;
        contentData.targetPopulation = builder.targetPopulation;
        contentData.technicalRequirements = builder.technicalRequirements;
        contentData.isbn = builder.isbn;
        contentData.themingLastModified = builder.themingLastModified;
        contentData.supplementaryNarrationLocales = builder.supplementaryNarrationLocales;
        contentData.customFields = builder.customFields != null ? builder.customFields : contentData.customFields;
        contentData.customMetadataPackages = builder.customMetadataPackages;
        return contentData;
    }

    public String getCopyright() {
        return copyright;
    }

    /**
     * ID of the cover resource
     */
    public String getCoverRefId() {
        return coverRefId;
    }

    /**
     * @return cover resource object
     */
    public Optional<CGSResource> getCover() {
        return resources.stream()
                .filter(resource -> resource.getResId().equals(coverRefId))
                .findFirst();
    }

    @JsonIgnore
    public void addEBookIds(Set<String> eBookId) {
        if (eBooksIds == null) eBooksIds = new HashSet<>();
        eBooksIds.addAll(eBookId);
    }

    @Override
    public boolean containsEBook(EBook eBook) {
        return eBooksIds != null && eBooksIds.contains(eBook.getEBookId());
    }

    /**
     * Reference IDs to eBooksRefs used in the course
     */
    @Override
    @JsonIgnore
    public Set<String> getEBooksIds() {
        return eBooksIds == null ? Collections.emptySet() : new HashSet<>(eBooksIds);
    }

    public List<Object> getLessonTemplates() {
        return lessonTemplates;
    }

    public String getCssRefId() {
        return cssRefId;
    }

    public Object getPedagogicalLoTypes() {
        return pedagogicalLoTypes;
    }

    public Object getDifferentiationClasses() {
        return differentiationClasses;
    }

    public boolean isUsingTTSServices() {
        return useTtsServices;
    }

    public Object getTtsServices() {
        return ttsServices;
    }

    public List<LearningPath> getLearningPaths() {
        return learningPaths;
    }

    /**
     * TOC items to be marked as sample on the course before the publish process. When a course has sample toc items,
     * only them will be available for playing in teach.
     */
    public List<CourseTocItemRef> getSample() {
        return sample;
    }

    public Set<ToolboxWidget> getToolboxWidgets() {
        return toolboxWidgets;
    }

    /**
     * Sets TOC items to be marked as sample on the course before the publish process. When a course has sample toc items,
     * only them will be available for playing in teach.
     *
     * @throws IllegalArgumentException if one or more of the given sample TOC items are not found in the course toc
     */
    @JsonIgnore // we don't use the setter on deserialization, as toc may be null
    public void setSample(List<CourseTocItemRef> sample) {
        if (sample != null) {
            List<CourseTocItemRef> tocItemRefs = getToc().getAllTocItemRefs();
            if (!tocItemRefs.containsAll(sample)) {
                List<CourseTocItemRef> missingRefs = sample.stream()
                        .filter(sampleRef -> !tocItemRefs.contains(sampleRef))
                        .collect(Collectors.toList());
                throw new IllegalArgumentException("The course does not contain the following toc items requested as sample: " + missingRefs);
            }
        }
        this.sample = sample;
        this.setHeader(Header.newInstance(this.header, new Date()));
    }

    public static final class Builder {
        private String author;
        private String cgsVersion;
        private String cid;
        private String courseId;
        private Header header;
        private boolean includeLo;
        private Integer maxDepth;
        private String publisher;
        private CourseCustomizationPack customizationPack;
        private Set<CGSResource> resources = new HashSet<>();
        private String schema;
        private Set<TaggedStandards> standards;
        private Set<StandardsPackage> standardPackages;
        private String title;
        private Set<String> contentLocales = new HashSet<>();
        private Set<String> subjectAreas;
        private Set<String> gradeLevel;
        private Set<String> eBooksIds;
        private CourseToc toc;
        private List<CourseTocItemRef> sample;
        private List<LearningPath> learningPaths;
        private CourseDifferentiation differentiation;
        private Set<ToolboxWidget> toolboxWidgets;
        private String overview;
        private String credits;
        private String copyright;
        private String coverRefId;
        private String targetPopulation;
        private String technicalRequirements;
        private String isbn;
        private Object themingLastModified;
        private Set<String> supplementaryNarrationLocales;
        private List<Object> customFields;
        private List<CustomMetadataPackage> customMetadataPackages;

        public Builder(String courseId, String author, String courseTitle) {
            this.courseId = courseId;
            this.author = author;
            this.title = courseTitle;
        }

        public Builder publisherName(String publisherName) {
            this.publisher = publisherName;
            return this;
        }

        public Builder cgsVersion(String cgsVersion) {
            this.cgsVersion = cgsVersion;
            return this;
        }

        public Builder cid(String cid) {
            this.cid = cid;
            return this;
        }

        public Builder schema(String schema) {
            this.schema = schema;
            return this;
        }

        /**
         * Reference IDs to eBooks used in the course
         */
        public Builder setEBooksRefs(Set<String> eBooks) {
            this.eBooksIds = eBooks;
            return this;
        }

        public Builder tableOfContents(CourseToc courseToc) {
            this.toc = courseToc;
            return this;
        }

        public Builder learningPaths(List<LearningPath> learningPaths) {
            this.learningPaths = learningPaths;
            return this;
        }

        public Builder customizationPack(CourseCustomizationPack customizationPack) {
            this.customizationPack = customizationPack;
            return this;
        }

        public Builder contentLocales(Set<String> contentLocales) {
            this.contentLocales = contentLocales;
            return this;
        }

        public Builder addContentLocale(String contentLocale) {
            this.contentLocales.add(contentLocale);
            return this;
        }

        public Builder includeLearningObject(boolean includeLo) {
            this.includeLo = includeLo;
            return this;
        }

        public Builder resources(Set<CGSResource> resources) {
            this.resources.addAll(resources);
            return this;
        }

        public Builder addResource(CGSResource resource) {
            this.resources.add(resource);
            return this;
        }

        public Builder header(Header header) {
            this.header = header;
            return this;
        }

        public Builder maxDepth(Integer maxDepth) {
            this.maxDepth = maxDepth;
            return this;
        }

        public Builder standards(Set<TaggedStandards> standards) {
            this.standards = standards;
            return this;
        }

        public Builder standardPackages(Set<StandardsPackage> standardPackages) {
            this.standardPackages = standardPackages;
            return this;
        }

        public Builder subjectArea(Set<String> subjectAreas) {
            this.subjectAreas = subjectAreas;
            return this;
        }

        public Builder gradeLevel(Set<String> gradeLevel) {
            this.gradeLevel = gradeLevel;
            return this;
        }

        public Builder differentiation(CourseDifferentiation differentiation) {
            this.differentiation = differentiation;
            return this;
        }

        public Builder overview(String overview) {
            this.overview = overview;
            return this;
        }

        public Builder credits(String credits) {
            this.credits = credits;
            return this;
        }

        public Builder setCopyright(String copyright) {
            this.copyright = copyright;
            return this;
        }

        public Builder setCover(CGSResource coverResource) {
            if (coverResource == null) return this;
            this.coverRefId = coverResource.getResId();
            this.resources.add(coverResource);
            return this;
        }

        public Builder targetPopulation(String targetPopulation) {
            this.targetPopulation = targetPopulation;
            return this;
        }

        public Builder technicalRequirements(String technicalRequirements) {
            this.technicalRequirements = technicalRequirements;
            return this;
        }

        public Builder isbn(String isbn) {
            this.isbn = isbn;
            return this;
        }

        public Builder themingLastModified(Object themingLastModified) {
            this.themingLastModified = themingLastModified;
            return this;
        }

        public Builder supplementaryNarrationLocales(Set<String> supplementaryNarrationLocales) {
            this.supplementaryNarrationLocales = supplementaryNarrationLocales;
            return this;
        }

        public Builder customFields(List<Object> customFields) {
            this.customFields = customFields;
            return this;
        }

        public Builder customMetadataPackages(List<CustomMetadataPackage> customMetadataPackages) {
            this.customMetadataPackages = customMetadataPackages;
            return this;
        }

        /**
         * TOC items to be marked as sample on the course before the publish process. When a course has sample toc items,
         * only them will be available for playing in teach.
         */
        public Builder sample(List<CourseTocItemRef> sample) {
            this.sample = sample;
            return this;
        }

        public Builder toolboxWidgets(Set<ToolboxWidget> toolboxWidgets) {
            this.toolboxWidgets = toolboxWidgets;
            return this;
        }

        public CourseContentData build() throws IllegalStateException {
            return CourseContentData.newInstance(this);
        }
    }

    public Object getThemingLastModified() {
        return themingLastModified;
    }

    public String getIsbn() {
        return isbn;
    }

    public String getCredits() {
        return credits;
    }

    public String getTargetPopulation() {
        return targetPopulation;
    }

    public String getTechnicalRequirements() {
        return technicalRequirements;
    }

    public String getVersion() {
        return version;
    }

    public String getAuthor() {
        return author;
    }

    public String getCgsVersion() {
        return cgsVersion;
    }

    public String getCid() {
        return cid;
    }

    public String getCourseId() {
        return courseId;
    }

    @JsonIgnore
    public boolean includeLo() {
        return includeLo;
    }

    public int getMaxDepth() {
        return maxDepth;
    }

    public String getPublisher() {
        return publisher;
    }

    /**
     * NOTE: in case coursePathOnDisk is not null and files on disk are removed, the course should be persisted,
     * in order to maintain consistency between the database info and the resources existing on disk
     *
     * @param resourceId       ID of the resource to remove
     * @param coursePathOnDisk full path to the course directory on disk, or null if files on disk should not be removed
     * @return true if a resource with the given ID was found and removed, false otherwise
     * @throws IOException in case deletion from disk was unsuccessful
     */
    public boolean removeResourceById(String resourceId, String coursePathOnDisk) throws IOException {
        for (Iterator<CGSResource> iterator = this.resources.iterator(); iterator.hasNext(); ) {
            CGSResource resource = iterator.next();
            if (resource.getResId().equals(resourceId)) {
                if (coursePathOnDisk != null) {
                    String resourceDirPath = String.format("%s/%s", coursePathOnDisk, resource.getBaseDir());
                    FileUtils.deleteDirectory(new File(resourceDirPath));
                }
                iterator.remove();
                return true;
            }
        }
        return false;
    }

    public List<String> getSubjectArea() {
        return subjectArea == null ? null : new ArrayList<>(subjectArea);
    }

    public List<String> getGradeLevel() {
        return gradeLevel == null ? null : new ArrayList<>(gradeLevel);
    }

    public CourseToc getToc() {
        return toc;
    }

    public CourseDifferentiation getDifferentiation() {
        return differentiation;
    }

    public void setDifferentiation(CourseDifferentiation differentiation) {
        this.differentiation = differentiation;
    }

    public List<CustomMetadataPackage> getCustomMetadataPackages() {
        return customMetadataPackages;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    @Override
    public boolean updateEBook(EBook newEBook, EBook oldEBook) {
        String existingEBookId = oldEBook.getEBookId();
        if (!this.eBooksIds.contains(existingEBookId)) {
            LOGGER.warn(String.format("Course (%s) does not contain any reference to eBook with ID '%s'", this, existingEBookId));
            return false;
        }
        this.eBooksIds.remove(existingEBookId);
        this.eBooksIds.add(newEBook.getEBookId());
        this.header = Header.newInstance(this.header, new Date());
        return true;
    }

    @Override
    public String toString() {
        return "CourseContentData{" +
                "type: \"" + type + '\"' +
                ", version: \"" + version + '\"' +
                ", author: \"" + author + '\"' +
                ", cgsVersion: \"" + cgsVersion + '\"' +
                ", cid: \"" + cid + '\"' +
                ", courseId: \"" + courseId + '\"' +
                ", header: " + header +
                ", includeLo: " + includeLo +
                ", maxDepth: " + maxDepth +
                ", publisher: " + publisher +
                ", customizationPack: " + customizationPack +
                ", resources: " + resources +
                ", schema: \"" + schema + '\"' +
                ", standardPackages: " + standardPackages +
                ", standards: " + standards +
                ", title: \"" + title + '\"' +
                ", contentLocales: " + contentLocales +
                ", subjectArea: " + subjectArea +
                ", gradeLevel: " + gradeLevel +
                ", toc: " + toc +
                ", sample: " + sample +
                ", learningPaths: " + learningPaths +
                ", differentiation: " + differentiation +
                ", toolboxWidgets: " + toolboxWidgets +
                ", overview: \"" + overview + '\"' +
                ", credits: \"" + credits + '\"' +
                ", copyright: \"" + copyright + '\"' +
                ", coverRefId: \"" + coverRefId + '\"' +
                ", targetPopulation: \"" + targetPopulation + '\"' +
                ", technicalRequirements: \"" + technicalRequirements + '\"' +
                ", isbn: \"" + isbn + '\"' +
                ", eBooksIds: " + eBooksIds +
                ", lessonTemplates: " + lessonTemplates +
                ", cssRefId: \"" + cssRefId + '\"' +
                ", pedagogicalLoTypes: " + pedagogicalLoTypes +
                ", differentiationClasses: " + differentiationClasses +
                ", useTtsServices: " + useTtsServices +
                ", ttsServices: " + ttsServices +
                ", format: \"" + format + '\"' +
                ", themingLastModified: " + themingLastModified +
                ", supplementaryNarrationLocales: " + supplementaryNarrationLocales +
                ", customFields: " + customFields +
                '}';
    }
}
