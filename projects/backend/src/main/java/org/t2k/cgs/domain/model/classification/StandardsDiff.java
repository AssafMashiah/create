package org.t2k.cgs.domain.model.classification;

import java.util.HashSet;
import java.util.Set;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 5/1/13
 * Time: 11:48 AM
 */
public class StandardsDiff {

    private Set<String> deletedStandards;
    private Set<String> updatedStandards;
    private Set<String> newStandards;

    public StandardsDiff(){
        this.deletedStandards = new HashSet<String>();
        this.newStandards = new HashSet<String>();
        this.updatedStandards = new HashSet<String>();
    }

    public Set<String> getDeletedStandards() {
        return deletedStandards;
    }

    public void addDeletedStandard(String deletedStandard) {
        this.deletedStandards.add(deletedStandard);
    }

    public Set<String> getUpdatedStandards() {
        return updatedStandards;
    }

    public void addUpdatedStandard(String updatedStandard) {
        this.updatedStandards.add(updatedStandard);
    }

    public Set<String> getNewStandards() {
        return newStandards;
    }

    public void addNewStandard(String newStandard) {
        this.newStandards.add(newStandard);
    }
}
