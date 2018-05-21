package org.t2k.cgs.domain.model.classification;

import org.springframework.data.annotation.Id;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 08/12/14
 * Time: 16:51
 * To change this template use File | Settings | File Templates.
 */
public class StandardPackage {
    @Id
    private String id;
    private String name;
    private String description;
    private String subjectArea;
    private String purpose;
    private String country;
    private String version;
    private String created;
    private String state;
    private boolean isLatest;
    private StandardNode standards;

    public StandardPackage() {  } //dummy constructor for json mapping from DB

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getSubjectArea() {
        return subjectArea;
    }

    public String getPurpose() {
        return purpose;
    }

    public String getCountry() {
        return country;
    }

    public String getVersion() {
        return version;
    }

    public String getCreated() {
        return created;
    }

    public boolean isLatest() {
        return isLatest;
    }

    public StandardNode getStandards() {
        return standards;
    }

    public String getState() {
        return state;
    }
}
