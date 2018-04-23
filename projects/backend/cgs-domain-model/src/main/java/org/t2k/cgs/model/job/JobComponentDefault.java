package org.t2k.cgs.model.job;

/**
 * @author Alex Burdusel on 2016-09-06.
 */
public enum JobComponentDefault implements JobComponent {

    ZIP_FILE_CREATION("zip resources files"),
    ZIP_FILE_OPEN("unzip resources files"),
    EXPORT_DB("exporting database and resources"),
    IMPORT_DB("importing database information"),
    EXPORT("export"),
    IMPORT("import"),
    VALIDATE("validate"),
    COURSE_ID("courseId");

    private String value;

    JobComponentDefault(String value) {
        this.value = value;
    }

    @Override
    public String getValue() {
        return value;
    }
}
