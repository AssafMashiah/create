package org.t2k.cgs.model.tocItem;

/**
 * @author Alex Burdusel on 2016-06-17.
 */
public enum PedagogicalLessonType {
    AUTO("auto"),
    CORE("Core"),
    CUSTOM("Custom");

    private String value;

    PedagogicalLessonType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
