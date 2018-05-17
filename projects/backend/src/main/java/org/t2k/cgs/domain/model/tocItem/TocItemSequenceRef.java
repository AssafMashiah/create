package org.t2k.cgs.domain.model.tocItem;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.t2k.cgs.persistence.dao.EntityType;

/**
 * An object representing a reference to a sequence in another toc item (Eg: a sequence in a hidden lesson)
 *
 * @author Alex Burdusel on 2016-12-12.
 */
@JsonDeserialize(as = TocItemSequenceRef.class)
public class TocItemSequenceRef extends TocItemSequence {

    private String type = EntityType.SEQUENCE_REF.toString(); //fixme change to entity type and save to db as string

    private SequenceRefElement sequenceRef;

    public SequenceRefElement getSequenceRef() {
        return sequenceRef;
    }

    @Override
    public EntityType getType() {
        return EntityType.forName(type);
    }

    /**
     * An object containing the references to a sequence in another toc item (Eg: a sequence in a hidden lesson)
     */
    public static class SequenceRefElement {

        private String lessonCid;
        private String sequenceCid;

        public String getLessonCid() {
            return lessonCid;
        }

        public String getSequenceCid() {
            return sequenceCid;
        }
    }
}
