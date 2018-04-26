package org.t2k.cgs.model.sequence;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import java.util.ArrayList;
import java.util.List;

/**
 * A content item inside of a sequence.
 * <p>
 * Content items contain detailed data used by the player. They are kept as map values inside the stringified content
 * field of a {@link Sequence} object. They are represented as a flattened hierarchical with references to their
 * parent and children.
 * <p>
 * This architecture was designed in the front-end and we are trying to replicate it in the back-end. Their data object
 * is not standardised and it differs from one type of content to another very much.
 * <p>
 * When handling the content of a sequence, after manipulation, it should be stringified back into the sequence, as that
 * is the format in which it is used by the players inside create front-end and teach.
 */
@JsonDeserialize(using = ContentDeserializer.class)
public abstract class Content {

    protected String id;
    protected String parent;
    protected List<String> children = new ArrayList<>();

    public abstract ContentType getType();

    public String getId() {
        return id;
    }

    public String getParent() {
        return parent;
    }

    public List<String> getChildren() {
        return children;
    }
}
