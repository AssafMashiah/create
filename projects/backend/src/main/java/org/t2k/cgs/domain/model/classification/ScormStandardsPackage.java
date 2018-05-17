package org.t2k.cgs.domain.model.classification;

import java.util.HashMap;

/**
 * Created by elad.avidan on 14/12/2014.
 */
public class ScormStandardsPackage {

    private String id;
    private String name;
    private String purpose;
    private String description;
    private HashMap<String, String> standards;

    public ScormStandardsPackage(String id, String name, String purpose, String description, HashMap<String, String> standards) {
        this.id = id;
        this.name = name;
        this.purpose = purpose;
        this.description = description;
        this.standards = standards;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPurpose() {
        return purpose;
    }

    public String getDescription() {
        return description;
    }

    public HashMap<String, String> getStandards() {
        return standards;
    }
}
