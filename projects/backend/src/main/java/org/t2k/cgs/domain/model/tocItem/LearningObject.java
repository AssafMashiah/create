package org.t2k.cgs.domain.model.tocItem;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.log4j.Logger;
import org.t2k.cgs.domain.usecases.ebooks.conversion.EBookToCourseLearningObject;
import org.t2k.cgs.domain.model.ebooks.EBookHolder;
import org.t2k.cgs.domain.model.classification.TaggedStandards;
import org.t2k.cgs.domain.model.ebooks.EBook;
import org.t2k.cgs.domain.model.ebooks.EBookStructure;
import org.t2k.cgs.domain.model.ebooks.Page;

import javax.validation.Valid;
import javax.validation.constraints.Pattern;
import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * @author Alex Burdusel on 2016-06-15.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LearningObject implements EBookHolder {

    private static final Logger LOGGER = Logger.getLogger(LearningObject.class);

    private String cid;
    private boolean displayed = true;
    private String title;
    private String type;
    private String overview;
    private List<String> keywords;
    private String pedagogicalLoType;
    @JsonProperty
//    private Modality modality;
    private String modality;
    private boolean differential;
    //    private LearningFramework learningFramework;
    private String learningFramework;
    @Pattern(regexp = "^P(\\d+Y)?(\\d+M)?(\\d+D)?(T(((\\d+H)(\\d+M)?(\\d+(\\.\\d{1,2})?S)?)|((\\d+M)(\\d+(\\.\\d{1,2})?S)?)|(\\d+(\\.\\d{1,2})?S)))?$")
    private String typicalLearningTime;
    private String objective;
    private Object teacherGuide;
    private String difficulty;
//    private Difficulty difficulty;

    @Valid
    private List<TaggedStandards> standards;
    private List<String> skills;
    private LearningObjectItem item;
    @Valid
    private List<LessonPage> pages;
    @Valid
    private List<TocItemSequence> sequences = new ArrayList<>();

    public static LearningObject newInstance(EBookToCourseLearningObject eBookToCourseLearningObject) {
        LearningObject learningObject = new LearningObject();
        learningObject.cid = UUID.randomUUID().toString();
        learningObject.title = eBookToCourseLearningObject.getTitle();
        learningObject.type = "lo";
        learningObject.standards = new ArrayList<>();
        learningObject.pages = eBookToCourseLearningObject.getPages().stream()
                .map(LessonPage::newInstance).collect(Collectors.toList());
        return learningObject;
    }

    /**
     * Merges a list of learning objects into a single new learning object, that will hold all the contents the list had.
     *
     * @param learningObjects a list of learning objects to crunch down to a single object
     * @return a new learning objects with the contents of given list of learning objects
     * @throws IllegalArgumentException if the learningObjects list is empty or null
     */
    public static LearningObject newInstance(List<LearningObject> learningObjects) {
        if (learningObjects == null || learningObjects.size() == 0) {
            throw new IllegalArgumentException("learningObjects list must have at least one learning object");
        }
        LearningObject learningObject = new LearningObject();
        learningObject.cid = UUID.randomUUID().toString();
        learningObject.type = "lo";
        learningObject.differential = learningObjects.get(0).differential;
        learningObject.pages = learningObjects.stream()
                .flatMap(learningObject1 ->
                        ((learningObject1.getPages() != null)
                                ? learningObject1.getPages()
                                : new ArrayList<LessonPage>(0))
                                .stream())
                .collect(Collectors.toList());
        if (learningObject.pages.size() == 0) learningObject.pages = null;

        learningObject.sequences = learningObjects.stream()
                .flatMap(learningObject1 -> learningObject1.getSequences().stream())
                .collect(Collectors.toList());

        return learningObject;
    }

    public String getCid() {
        return cid;
    }

    /**
     * Resets the cid of the learning objects to a new, randomly generated one
     * <p>
     * This method is package-private to ensure a minimum immutability, as we only need it during the import lesson
     * process
     */
    void resetCid() {
        this.cid = UUID.randomUUID().toString();
    }

    public String getTitle() {
        return title;
    }

    public String getType() {
        return type;
    }

    public List<TaggedStandards> getStandards() {
        return standards;
    }

    public List<LessonPage> getPages() {
        return pages;
    }

    public List<TocItemSequence> getSequences() {
        if (this.pedagogicalLoType != null && this.pedagogicalLoType.equals("quiz")) {
            return this.item.getSequences();
        }
        return sequences;
    }

    @Override
    public boolean containsEBook(EBook eBook) {
        Set<String> eBooksIds = getEBooksIds();
        return eBooksIds != null && eBooksIds.contains(eBook.getEBookId());
    }

    @Override
    public Set<String> getEBooksIds() {
        return pages.stream().map(LessonPage::getEBookId).collect(Collectors.toSet());
    }

    /**
     * {@inheritDoc}
     *
     * @throws IllegalStateException in case the new eBook is missing one of the pages from the old eBook
     */
    @Override
    public boolean updateEBook(EBook newEBook, EBook oldEBook) {
        String oldEBookId = oldEBook.getEBookId();
        if (!getEBooksIds().contains(oldEBookId)) {
            LOGGER.warn(String.format("Learning object %s does not contain any reference to eBook with ID %s",
                    this, oldEBookId));
            return false;
        }
        EBookStructure newEBookStructure = newEBook.getStructure();
        ListIterator<LessonPage> pagesIterator = pages.listIterator();
        while (pagesIterator.hasNext()) {
            LessonPage lessonPage = pagesIterator.next();
            if (lessonPage.getEBookId() != null && lessonPage.getEBookId().equals(oldEBookId)) {
                Page eBookPage = newEBookStructure.getPageById(lessonPage.getPageId());
                if (eBookPage == null) {
                    throw new IllegalStateException(String.format("new eBook (%s) does not contain page with ID '%s'",
                            newEBook, lessonPage.getPageId()));
                }
                LOGGER.debug("updating learning object " + this);
                LessonPage updatedPage = LessonPage.newInstance(lessonPage, eBookPage);
                pagesIterator.set(updatedPage);
            }
        }
        return true;
    }

    public boolean isDisplayed() {
        return displayed;
    }

    public String getPedagogicalLoType() {
        return pedagogicalLoType;
    }

    public String getModality() {
        return modality;
    }

    public boolean isDifferential() {
        return differential;
    }

    public String getOverview() {
        return overview;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public String getTypicalLearningTime() {
        return typicalLearningTime;
    }

    public String getLearningFramework() {
        return learningFramework;
    }

    public String getObjective() {
        return objective;
    }

    public Object getTeacherGuide() {
        return teacherGuide;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public List<String> getSkills() {
        return skills;
    }

    public LearningObjectItem getItem() {
        return item;
    }

    /**
     * Returns a brief description of this LearningObject. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * LearningObject{"cid": "123dfqwgbc4", "title": "some title", "type": "lo", "standards": [...], "pages": [...]}
     */
    @Override
    public String toString() {
        return "LearningObject{" +
                "\"cid\": \"" + cid + '\"' +
                ", \"title\": \"" + title + '\"' +
                ", \"type\": \"" + type + '\"' +
                ", \"standards\": " + standards +
                ", \"pages\": " + pages +
                '}';
    }
}
