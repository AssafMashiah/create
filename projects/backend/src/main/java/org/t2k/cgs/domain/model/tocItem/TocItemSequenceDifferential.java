package org.t2k.cgs.domain.model.tocItem;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.t2k.cgs.persistence.dao.EntityType;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * An object representing the parent holding several sequences, for each differentiation level on a course / lesson
 *
 * @author Alex Burdusel on 2016-12-12.
 */
@JsonDeserialize(as = TocItemSequenceDifferential.class)
@JsonIgnoreProperties(ignoreUnknown = true)
public class TocItemSequenceDifferential extends TocItemSequence {

    private String type = EntityType.SEQUENCE_DIFFERENTIAL.toString(); //fixme change to entity type and save to db as string
    private String title;
    @Valid
    private List<DifferentialSequenceElement> levels = new ArrayList<>();

    public static TocItemSequenceDifferential newInstance(String title) {
        TocItemSequenceDifferential differential = new TocItemSequenceDifferential();
        differential.setCid(UUID.randomUUID().toString());
        differential.title = title;
        return differential;
    }

    @Override
    public EntityType getType() {
        return EntityType.forName(type);
    }

    public String getTitle() {
        return title;
    }


    public List<DifferentialSequenceElement> getLevels() {
        return new ArrayList<>(levels);
    }

    /**
     * Adds a new sequence level to the differentiated sequence
     *
     * @param levelId  id of the differentiation level for which the sequence is added
     * @param sequence sequence to add to the specified differentiation level ID
     */
    public void addLevelSequence(int levelId, TocItemSequenceRegular sequence) {
        DifferentialSequenceElement element = new DifferentialSequenceElement();
        element.levelId = levelId;
        element.sequence = sequence;
        this.levels.add(element);
    }

    @JsonIgnore
    public Optional<TocItemSequenceRegular> getSequenceByDiffLevelId(int levelId) {
        return getLevels().stream()
                .filter(diffSeq -> diffSeq.getLevelId() == levelId)
                .map(DifferentialSequenceElement::getSequence)
                .findFirst();
    }

    /**
     * An object containing the id of the differentiation level and the sequence allocated to it
     */
    public static class DifferentialSequenceElement {
        /**
         * Index of the differentiation level
         */
        private int levelId;
        private TocItemSequenceRegular sequence;

        /**
         * Index of the differentiation level
         */
        public int getLevelId() {
            return levelId;
        }

        public TocItemSequenceRegular getSequence() {
            return sequence;
        }
    }
}
