package org.t2k.cgs.domain.model.tocItem;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * @author Alex Burdusel on 2016-11-15.
 */
public enum LearningFramework {
    CLASS("class"),
    GROUP("group"),
    INDIVIDUAL("individual"),
    PARTNER("partner");

    private String value;

    @JsonCreator
    LearningFramework(String value) {
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
