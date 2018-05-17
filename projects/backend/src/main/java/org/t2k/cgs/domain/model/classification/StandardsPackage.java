package org.t2k.cgs.domain.model.classification;

import com.mongodb.DBObject;

import javax.validation.constraints.NotNull;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 5/6/13
 * Time: 2:18 PM
 */
public class StandardsPackage {

    @NotNull
    private String stdPackageId;
    private String name;
    private String subjectArea;
    private String version;

    public static StandardsPackage of(DBObject dbObject) {
        StandardsPackage standardsPackage = new StandardsPackage();
        standardsPackage.stdPackageId = (String) dbObject.get("stdPackageId");
        standardsPackage.name = (String) dbObject.get("name");
        standardsPackage.subjectArea = (String) dbObject.get("subjectArea");
        standardsPackage.version = (String) dbObject.get("version");
        return standardsPackage;
    }


    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSubjectArea() {
        return subjectArea;
    }

    public void setSubjectArea(String subjectArea) {
        this.subjectArea = subjectArea;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getStdPackageId() {
        return stdPackageId;
    }

    public void setStdPackageId(String stdPackageId) {
        this.stdPackageId = stdPackageId;
    }
}
