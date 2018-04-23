package org.t2k.cgs.model.tocItem;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.log4j.Logger;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.model.CGSResource;
import org.t2k.cgs.model.EBookHolder;
import org.t2k.cgs.model.Header;
import org.t2k.cgs.model.classification.StandardsPackage;
import org.t2k.cgs.model.classification.TaggedStandards;
import org.t2k.cgs.model.course.Course;
import org.t2k.cgs.model.ebooks.EBook;
import org.t2k.cgs.model.ebooks.conversion.EBookToCourseTOCItemRef;

import javax.validation.Valid;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author Alex Burdusel on 2016-06-15.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LessonContentData extends TocItemContentData implements EBookHolder {

    private static final Logger LOGGER = Logger.getLogger(LessonContentData.class);

    @JsonProperty
    private boolean isHidden;
    private String pedagogicalLessonType;
    private String displayOddPages;
    /**
     * Reference IDs to eBooks used in the course
     */
    @JsonProperty(value = "eBooksIds")
    private Set<String> eBooksIds;
    @Valid
    private List<LearningObject> learningObjects;

    private static LessonContentData newInstance(Builder builder) {
        LessonContentData contentData = new LessonContentData();
        contentData.type = EntityType.LESSON.getName();
        contentData.schema = "course_v7";
        contentData.cid = builder.cid;
        contentData.header = builder.header;
        contentData.title = builder.title;
        contentData.contentLocales = builder.contentLocales;
        contentData.standards = builder.standards;
        contentData.standardPackages = builder.standardPackages;
        contentData.resources = builder.resources;
        contentData.isHidden = builder.isHidden;
        contentData.pedagogicalLessonType = builder.pedagogicalLessonType;
        contentData.format = builder.format;
        contentData.learningObjects = builder.learningObjects;
        contentData.eBooksIds = builder.eBooksIds;
        contentData.displayOddPages = builder.displayOddPages;
        return contentData;
    }

    public static final class Builder {
        private String cid;
        private Header header;
        private String title;
        private Set<String> contentLocales = new HashSet<>();
        private Set<TaggedStandards> standards = new HashSet<>();
        private Set<StandardsPackage> standardPackages = new HashSet<>();
        private Set<CGSResource> resources = new HashSet<>();
        private boolean isHidden;
        private String pedagogicalLessonType;
        private String displayOddPages;
        private Format format;
        private List<LearningObject> learningObjects;
        private Set<String> eBooksIds;

        /**
         * @param cid lesson ID
         */
        public Builder(String cid) {
            this.cid = cid;
            this.header = new Header();
        }

        /**
         * @param cid lesson ID
         */
        public Builder(String cid,
                       EBook eBook,
                       EBookToCourseTOCItemRef eBookToCourseTOCItemRef) {
            this.cid = cid;
            this.header = new Header();
            this.title = eBookToCourseTOCItemRef.getTitle();
            this.eBooksIds = Collections.singleton(eBook.getEBookId());
            this.learningObjects = eBookToCourseTOCItemRef.getLearningObjects().stream()
                    .map(LearningObject::newInstance).collect(Collectors.toList());
        }

        public Builder setCid(String cid) {
            this.cid = cid;
            return this;
        }

        public Builder setHeader(Header header) {
            this.header = header;
            return this;
        }

        public Builder setTitle(String title) {
            this.title = title;
            return this;
        }

        public Builder setContentLocales(Set<String> contentLocales) {
            this.contentLocales = contentLocales;
            return this;
        }

        public Builder setStandards(Set<TaggedStandards> standards) {
            this.standards = standards;
            return this;
        }

        public Builder setStandardPackages(Set<StandardsPackage> standardPackages) {
            this.standardPackages = standardPackages;
            return this;
        }

        public Builder addResources(Set<CGSResource> resources) {
            this.resources.addAll(resources);
            return this;
        }

        public Builder setPedagogicalLessonType(String pedagogicalLessonType) {
            this.pedagogicalLessonType = pedagogicalLessonType;
            return this;
        }

        public Builder setFormat(Format format) {
            this.format = format;
            return this;
        }

        private Builder setEBooks(List<org.t2k.cgs.model.ebooks.EBook> convertedEBooks) {
            if (this.format != null && this.format != Format.EBOOK) {
                throw new IllegalArgumentException("can only attach eBooks to lessons of type EBOOK");
            }
            this.format = Format.EBOOK;
            this.eBooksIds = new HashSet<>(convertedEBooks.size());
            for (org.t2k.cgs.model.ebooks.EBook eBook : convertedEBooks) {
                this.eBooksIds.add(eBook.getEBookId());
            }
            return this;
        }

        public Builder setLearningObjects(List<LearningObject> learningObjects) {
            this.learningObjects = learningObjects;
            return this;
        }

        public Builder setHidden(boolean hidden) {
            isHidden = hidden;
            return this;
        }

        public Builder setDisplayOddPages(String displayOddPages) {
            this.displayOddPages = displayOddPages;
            return this;
        }

        public LessonContentData build() {
            return newInstance(this);
        }
    }

    public boolean isHidden() {
        return isHidden;
    }

    public String getPedagogicalLessonType() {
        return pedagogicalLessonType;
    }

    public String getDisplayOddPages() {
        return displayOddPages;
    }

    public List<LearningObject> getLearningObjects() {
        return learningObjects;
    }

    @Override
    public boolean containsEBook(EBook eBook) {
        return eBooksIds != null && eBooksIds.contains(eBook.getEBookId());
    }

    @JsonIgnore
    @Override
    public Set<String> getEBooksIds() {
        return eBooksIds;
    }

    @Override
    public boolean updateEBook(EBook newEBook, EBook oldEBook) {
        String oldEBookId = oldEBook.getEBookId();
        if (!getEBooksIds().contains(oldEBookId)) {
            LOGGER.warn(String.format("Lesson %s does not contain any reference to eBook with ID %s",
                    this, oldEBookId));
            return false;
        }
        learningObjects.forEach(learningObject -> learningObject.updateEBook(newEBook, oldEBook));
        eBooksIds.remove(oldEBookId);
        eBooksIds.add(newEBook.getEBookId());
        this.header = Header.newInstance(this.header, new Date());
        return true;
    }

    @Override
    public List<TocItemSequence> getSequences() {
        return (learningObjects == null)
                ? new ArrayList<>(0)
                : learningObjects.stream()
                .flatMap(learningObject -> learningObject.getSequences().stream())
                .collect(Collectors.toList());
    }

    @Override
    public String getSequenceHolderCid(TocItemSequence sequence) {
        for (LearningObject learningObject : learningObjects) {
            if (learningObject.getSequences().contains(sequence)) {
                return learningObject.getCid();
            }
        }
        // missing case for sequences inside differential sequences - but not currently needed
        return null;
    }

    @Override
    public String getSequenceHolderCid(String sequenceCid) {
        for (LearningObject learningObject : learningObjects) {
            for (TocItemSequence sequence : learningObject.getSequences()) {
                if (sequence.getCid().equals(sequenceCid)) {
                    return learningObject.getCid();
                }
            }
        }
        // missing case for sequences inside differential sequences - but not currently needed
        return null;
    }

    /**
     * {@inheritDoc}
     *
     * @throws IllegalArgumentException if the {@code sequenceToReplace} does not exist in the toc item
     */
    @Override
    protected void replaceTocItemSequence(TocItemSequence sequenceToReplace, TocItemSequence replacement) {
        for (LearningObject learningObject : learningObjects) {
            int index = learningObject.getSequences().indexOf(sequenceToReplace);
            if (index != -1) {
                learningObject.getSequences().set(index, replacement);
                return;
            }
        }
        throw new IllegalArgumentException(String.format("Sequence to replace '%s' does not exist on toc item '%s'",
                sequenceToReplace.getCid(), this.getCid()));
    }

    @Override
    public void removeSequence(TocItemSequence sequenceToRemove) {
        for (LearningObject learningObject : learningObjects) {
            int index = learningObject.getSequences().indexOf(sequenceToRemove);
            if (index != -1) {
                learningObject.getSequences().remove(index);
                return;
            }
        }
        throw new IllegalArgumentException(String.format("Sequence to remove '%s' does not exist on toc item '%s'",
                sequenceToRemove.getCid(), this.getCid()));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public LessonContentData transformForImport(Course sourceCourse, Course destinationCourse) {
        LessonContentData contentData = (LessonContentData) super.transformForImport(sourceCourse, destinationCourse);
        if (!destinationCourse.getContentData().includeLo() && contentData.learningObjects.size() > 0) {
            contentData.learningObjects = Collections.singletonList(LearningObject.newInstance(contentData.learningObjects));
        } else if (!sourceCourse.getContentData().includeLo() && destinationCourse.getContentData().includeLo()) {
            // we need to reset the cid, otherwise frontend won't display items that belong to an LO with cid starting with 00000000-0000-4000-9000-
            contentData.learningObjects.forEach(LearningObject::resetCid);
        }
        return contentData;
    }

    @Override
    public String toString() {
        return "LessonContentData{" +
                "\"type\": \"" + type + '\"' +
                ", \"schema\": \"" + schema + '\"' +
                ", \"cid\": \"" + cid + '\"' +
                ", \"header\": " + header +
                ", \"title\": \"" + title + '\"' +
                ", \"contentLocales\": " + contentLocales +
                ", \"standards\": " + standards +
                ", \"standardPackages\": " + standardPackages +
                ", \"pedagogicalLessonType\": \"" + pedagogicalLessonType + '\"' +
                ", \"format\": \"" + format + '\"' +
                ", \"eBooksIds\": " + eBooksIds +
                ", \"learningObjects\": " + learningObjects +
                ", \"resources\": " + resources +
                ", \"displayOddPages\": " + displayOddPages +
                "}";
    }
}
