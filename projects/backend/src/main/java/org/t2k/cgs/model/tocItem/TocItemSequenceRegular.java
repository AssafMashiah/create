package org.t2k.cgs.model.tocItem;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.model.CGSResource;
import org.t2k.cgs.model.classification.TaggedStandards;
import org.t2k.cgs.model.course.DifferentiationLevel;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @author Alex Burdusel on 2016-12-12.
 */
@JsonDeserialize(as = TocItemSequenceRegular.class)
public class TocItemSequenceRegular extends TocItemSequence {

    private String type; // sequence or assessmentSequence // fixme change to entity type and save to db as string

    private String title;

    private String mimeType;
    /**
     * A reference to the resource pointing towards the detailed content of the sequence
     */
    private String contentRef;
    /**
     * A reference to the resource pointing towards the thumbnail of the sequence
     */
    private String thumbnailRef;
    /**
     * References to resources used in the sequence
     */
    private Set<String> resourceRefId = new HashSet<>();
    /**
     * A list of tasks contained by the sequence
     */
    @Valid
    private List<Task> tasks = new ArrayList<>();
    @Valid
    private Set<TaggedStandards> standards = new HashSet<>();
    private Object teacherGuide;
    @Valid
    private List<DifferentiationLevel> differentiation;

    public static TocItemSequenceRegular newInstance(String seqId, String title, CGSResource resource, TocItem tocItem) {
        TocItemSequenceRegular regular = new TocItemSequenceRegular();
        regular.cid = seqId;

        regular.type = (tocItem.getEntityType() == EntityType.ASSESSMENT)
                ? EntityType.SEQUENCE_ASSESSMENT.getName()
                : EntityType.SEQUENCE_REGULAR.getName();

        regular.title = title;
        regular.mimeType = "DL";
        regular.contentRef = resource.getResId();
        regular.resourceRefId = Collections.singleton(resource.getResId());
        return regular;
    }

    /**
     * Creates a new instance of a toc item sequence from an existing one, with the given ID and having the given
     * resources
     *
     * @param sequence
     * @param newSeqId
     * @param resource resource pointing to the {@link org.t2k.cgs.model.sequence.Sequence} document for the sequence
     * @return
     */
    public static TocItemSequenceRegular newInstance(TocItemSequenceRegular sequence, String newSeqId, CGSResource resource, TocItem tocItem) {
        TocItemSequenceRegular regular = new TocItemSequenceRegular();
        regular.cid = newSeqId;
        regular.title = sequence.title;
        regular.mimeType = sequence.mimeType;

        regular.type = (tocItem.getEntityType() == EntityType.ASSESSMENT)
                ? EntityType.SEQUENCE_ASSESSMENT.getName()
                : EntityType.SEQUENCE_REGULAR.getName();

        regular.contentRef = resource.getResId();
        regular.resourceRefId.addAll(sequence.resourceRefId);
        regular.resourceRefId.remove(sequence.contentRef);
        regular.resourceRefId.add(regular.contentRef);

        regular.thumbnailRef = sequence.getThumbnailRef();
        regular.tasks.addAll(sequence.tasks);
        regular.standards.addAll(sequence.standards);
        regular.teacherGuide = sequence.teacherGuide;
        regular.differentiation = (sequence.differentiation == null) ? null : new ArrayList<>(sequence.differentiation);
        return regular;
    }

    public String getTitle() {
        return title;
    }

    public String getMimeType() {
        return mimeType;
    }

    /**
     * @return A reference to the resource pointing towards the detailed content of the sequence
     */
    public String getContentRef() {
        return contentRef;
    }

    /**
     * @return A copy of the references to resources used in the sequence
     */
    public List<String> getResourceRefId() {
        return new ArrayList<>(resourceRefId);
    }

    /**
     * @return A copy of the list of tasks contained by the sequence
     */
    public List<Object> getTasks() {
        return new ArrayList<>(tasks);
    }

    /**
     * @return A copy of the list of standards contained by the sequence
     */
    public List<TaggedStandards> getStandards() {
        return new ArrayList<>(standards);
    }

    public Object getTeacherGuide() {
        return teacherGuide;
    }

    public List<DifferentiationLevel> getDifferentiation() {
        return differentiation;
    }

    @Override
    public EntityType getType() {
        return EntityType.forName(type);
    }

    /**
     * A reference to the resource pointing towards the thumbnail of the sequence
     */
    public String getThumbnailRef() {
        return thumbnailRef;
    }
}
