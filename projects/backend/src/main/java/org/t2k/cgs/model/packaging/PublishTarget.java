package org.t2k.cgs.model.packaging;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 19/11/12
 * Time: 10:44
 */
public enum PublishTarget {

    /**
     * Packaging phases of a package.
     * IMPORTANT !! - when changing , adding , removing entries to this enum- make sure that
     * you handle them in the packaging process.(like cleanups etc)
     */
    COURSE_TO_CATALOG("courseToCatalog"),
    COURSE_TO_FILE("courseToFile"),
    LESSON_TO_FILE("lessonToFile"),
    LESSON_TO_CATALOG("lessonToCatalog"),
    COURSE_TO_URL("courseToUrl"),
    LESSON_TO_URL("lessonToUrl");

    public static PublishTarget forName(String name) {
        for (PublishTarget type : PublishTarget.values()) {
            if (type.getName().equalsIgnoreCase(name)) {
                return type;
            }
        }
        return null;
    }

    private String name;

    PublishTarget(String name) {
        this.name = name;
    }

    public String getName() {
        return this.name;
    }

}
