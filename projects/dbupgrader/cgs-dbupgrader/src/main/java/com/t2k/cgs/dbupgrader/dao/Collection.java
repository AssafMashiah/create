package com.t2k.cgs.dbupgrader.dao;

/**
 * @author Alex Burdusel on 2016-10-06.
 */
public enum Collection {

    COURSES_COLLECTION("courses"),
    LESSONS_COLLECTION("lessons"),
    ASSESSMENT_COLLECTION("assessments"),
    PUBLISHER_COLLECTION("publishers"),
    USERS_COLLECTION("users"),
    ROLES_COLLECTION("roles"),
    GROUPS_COLLECTION("groups"),
    SEQUENCES_COLLECTION("sequences"),
    STANDARDS_COLLECTION("standards"),
    EBOOKS_COLLECTION("ebooks");

    private String name;

    Collection(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
