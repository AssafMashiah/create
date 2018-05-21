package org.t2k.cgs.domain.model.tocItem;

import org.t2k.cgs.domain.model.CGSResource;
import org.t2k.cgs.domain.model.ContentData;
import org.t2k.cgs.domain.model.Header;
import org.t2k.cgs.domain.model.classification.StandardsPackage;
import org.t2k.cgs.domain.model.course.Course;
import org.t2k.cgs.domain.model.course.Importable;

import javax.validation.constraints.Pattern;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * @author Alex Burdusel on 2016-08-11.
 */
public abstract class TocItemContentData extends ContentData implements Importable<TocItemContentData> {

    protected Object teacherGuide; // FIXME: 8/11/16

    protected String description;

    protected String imageResourceRef;

    protected List<String> keywords;

    protected String objective;

    protected boolean hideDescriptionAndObjective;

    protected Format format;

    protected List<Object> glossary;

    @Pattern(regexp = "^P(\\d+Y)?(\\d+M)?(\\d+D)?(T(((\\d+H)(\\d+M)?(\\d+(\\.\\d{1,2})?S)?)|((\\d+M)(\\d+(\\.\\d{1,2})?S)?)|(\\d+(\\.\\d{1,2})?S)))?$")
    // FIXME: 8/11/16
    protected String typicalLearningTime;

    public Object getTeacherGuide() {
        return teacherGuide;
    }

    public String getDescription() {
        return description;
    }

    public boolean isHideDescriptionAndObjective() {
        return hideDescriptionAndObjective;
    }

    public String getImageResourceRef() {
        return imageResourceRef;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public String getObjective() {
        return objective;
    }

    public Format getFormat() {
        return format;
    }

    public List<Object> getGlossary() {
        return glossary;
    }

    public String getTypicalLearningTime() {
        return typicalLearningTime;
    }

    /**
     * @return a list of sequences contained by the toc item
     */
    public abstract List<TocItemSequence> getSequences();

    /**
     * @param sequence sequence to get parent/holder cid for
     * @return the id of the object holding the sequence
     */
    public abstract String getSequenceHolderCid(TocItemSequence sequence);

    /**
     * @param sequenceCid cid of the sequence to get parent/holder cid for
     * @return the id of the object holding the sequence
     */
    public abstract String getSequenceHolderCid(String sequenceCid);

    /**
     * Replaces a sequence in the toc item with a give one and updates the resources references
     *
     * @param sequenceToReplace    a sequence that exists on the toc item, which will be replaced with a given one
     * @param replacement          the sequence that will replace an existing one
     * @param replacementResources resources required for the replacement sequence
     * @throws IllegalArgumentException if the {@code sequenceToReplace} does not exist in the toc item
     */ // TODO: 12/15/16 test
    public void replaceSequence(TocItemSequence sequenceToReplace,
                                TocItemSequence replacement,
                                Collection<CGSResource> replacementResources) {
        replaceTocItemSequence(sequenceToReplace, replacement);
        removeSequenceResources(sequenceToReplace);
        this.resources.addAll(replacementResources);
    }

    public abstract void removeSequence(TocItemSequence sequenceToRemove);

    /**
     * Replaces a {@code TocItemSequence} in the toc item with a give one. Toc item types need to implement this method
     * accordingly, as they may keep the {@code TocItemSequence} in different structures
     * <p>
     * Resources referenced by the sequences are handled by {@link #replaceSequence}
     *
     * @param sequenceToReplace a sequence that exists on the toc item, which will be replaced with a given one
     * @param replacement       the sequence that will replace an existing one
     * @throws IllegalArgumentException if the {@code sequenceToReplace} does not exist in the toc item
     */
    protected abstract void replaceTocItemSequence(TocItemSequence sequenceToReplace, TocItemSequence replacement);

    /**
     * Removes the resources used by the sequence from the toc item
     *
     * @param sequence a sequence that exists on the toc item for which the resources will be removed
     */
    private void removeSequenceResources(TocItemSequence sequence) {
        if (sequence instanceof TocItemSequenceRegular) {
            TocItemSequenceRegular regular = (TocItemSequenceRegular) sequence;
            this.removeResourceById(regular.getContentRef());
//            regular.getResourceRefId().forEach(this::removeResourceById);
        } else if (sequence instanceof TocItemSequenceDifferential) {
            TocItemSequenceDifferential diffToReplace = (TocItemSequenceDifferential) sequence;
            diffToReplace.getLevels().forEach(differentialSequenceElement
                    -> this.removeResourceById(differentialSequenceElement.getSequence().getContentRef()));
//                    .forEach(this::removeResourceById));
        }
    }

    /**
     * {@inheritDoc}
     * <p>
     * NOTE: this method alters the object and returns the same instance of it, not a new instance
     *
     * @throws IllegalStateException in case the lesson and the course have the same standards package, but with
     *                               different versions
     */
    @Override
    public TocItemContentData transformForImport(Course sourceCourse, Course destinationCourse) { //todo test
        this.cid = UUID.randomUUID().toString();
        // we remove standard packages that are not found on course
        this.standardPackages = this.standardPackages.stream()
                .filter(standardsPackage -> {
                    for (StandardsPackage courseStandardPackage : destinationCourse.getContentData().getStandardPackages()) {
                        if (courseStandardPackage.getName().equals(standardsPackage.getName())
                                && courseStandardPackage.getSubjectArea().equals(standardsPackage.getSubjectArea())
                                && courseStandardPackage.getVersion().equals(standardsPackage.getVersion())) {
                            return true;
                        } else if (courseStandardPackage.getName().equals(standardsPackage.getName())
                                && courseStandardPackage.getSubjectArea().equals(standardsPackage.getSubjectArea())
                                && !courseStandardPackage.getVersion().equals(standardsPackage.getVersion())) {
                            throw new IllegalArgumentException(
                                    String.format("Standards package %s (%s) version %s from imported toc item %s' does not match with the one on the destination course: %s",
                                            standardsPackage.getName(), standardsPackage.getSubjectArea(),
                                            standardsPackage.getVersion(),
                                            this.getTitle(), courseStandardPackage.getVersion()));
                        } else if (!courseStandardPackage.getName().equals(standardsPackage.getName())
                                || !courseStandardPackage.getSubjectArea().equals(standardsPackage.getSubjectArea())) {
                            return false;
                        }
                    }
                    return false;
                })
                .collect(Collectors.toSet());
        this.header = new Header();
        return this;
    }
}
