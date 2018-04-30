package org.t2k.cgs.persistence.dao;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 30/10/12
 * Time: 16:53
 */
public enum EntityType {

    COURSE("course"),
    TOC_ITEM("tocItem"),
    LESSON("lesson"),
    ASSESSMENT("assessment"),
    APPLET_MANIFEST("applet"),
    SEQUENCE_DIFFERENTIAL("differentiatedSequenceParent"),
    SEQUENCE_REGULAR("sequence"),
    SEQUENCE_ASSESSMENT("assessmentSequence"),
    SEQUENCE_REF("sequenceRef"),
    EBOOK("eBook");

    @JsonCreator
    public static EntityType forName(String name) {
        for (EntityType type : EntityType.values()) {
            if (type.getName().equals(name)) {
                return type;
            }
        }
        return null;
    }

    private String name;

    EntityType(String name) {
        this.name = name;
    }

    @JsonValue
    public String getName() {
        return this.name;
    }

    @Override
    public String toString() {
        return this.name;
    }
}
