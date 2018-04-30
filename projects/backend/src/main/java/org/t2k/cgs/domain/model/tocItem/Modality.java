package org.t2k.cgs.domain.model.tocItem;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * @author Alex Burdusel on 2016-11-15.
 */
public enum Modality {
    INDIVIDUAL("Individual"),
    PARTNER("Partner"),
    GROUP("Group"),
    CLASS("Class");

    private String value;

    @JsonCreator
    Modality(String value) {
        this.value = value;
    }

    @JsonValue
    @Field
    public String getValue() {
        return value;
    }

    @Override
    public String toString() {
        return value;
    }
}
