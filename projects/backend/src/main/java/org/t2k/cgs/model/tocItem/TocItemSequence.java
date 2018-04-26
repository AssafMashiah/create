package org.t2k.cgs.model.tocItem;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import org.t2k.cgs.dataServices.EntityType;
import org.t2k.cgs.model.sequence.Sequence;

/**
 * An object representing a sequence inside a toc item (lesson or assessment), without the detailed DL content, to which
 * it points
 *
 * @author Alex Burdusel on 2016-12-09.
 * @see TocItem
 * @see TocItemContentData
 * @see Sequence
 */
@JsonDeserialize(using = TocItemSequenceDeserializer.class)
public abstract class TocItemSequence {

    /**
     * Used by mongo when deserializing, since we have inheritance
     */
    @JsonIgnore
    private String _class;

    /**
     * The content ID of the sequence. We allow this field to be mutable by creating a setter to ease-up the import
     * process (migrated from frontend)
     */
    protected String cid;

    /**
     * The content ID of the sequence. We allow this field to be mutable by creating a setter to ease-up the import
     * process (migrated from frontend)
     */
    void setCid(String cid) {
        this.cid = cid;
    }

    public String getCid() {
        return cid;
    }

    public abstract EntityType getType();

    /**
     * Used by mongo when deserializing, since we have inheritance
     */
    @JsonIgnore
    public String get_class() {
        return _class;
    }
}
