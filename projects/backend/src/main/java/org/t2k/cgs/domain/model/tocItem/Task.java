package org.t2k.cgs.domain.model.tocItem;

import org.t2k.cgs.domain.model.classification.StandardsPackage;
import org.t2k.cgs.domain.model.classification.TaggedStandards;

import javax.validation.Valid;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Task {

    private String cid;
    private String type;
    private String title;
    private Integer allowedAttempts;
    private String checkingType;
    @Valid
    private Set<TaggedStandards> standards = new HashSet<>();
    @Valid
    private Set<StandardsPackage> standardPackages = new HashSet<>();
    private Object totalScore;
    @Valid
    private List<RubricsCriteria> rubricsCriterias;

    public String getCid() {
        return cid;
    }

    public String getType() {
        return type;
    }

    public String getTitle() {
        return title;
    }

    public Integer getAllowedAttempts() {
        return allowedAttempts;
    }

    public String getCheckingType() {
        return checkingType;
    }

    public Set<TaggedStandards> getStandards() {
        return standards;
    }

    public Set<StandardsPackage> getStandardPackages() {
        return standardPackages;
    }

    public Object getTotalScore() {
        return totalScore;
    }

    public List<RubricsCriteria> getRubricsCriterias() {
        return rubricsCriterias;
    }
}
