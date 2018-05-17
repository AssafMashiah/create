package org.t2k.cgs.domain.model.tocItem;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.domain.model.CGSResource;
import org.t2k.cgs.domain.model.Header;
import org.t2k.cgs.domain.model.classification.StandardsPackage;
import org.t2k.cgs.domain.model.classification.TaggedStandards;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * @author Alex Burdusel on 2016-08-11.
 */
public class AssessmentContentData extends TocItemContentData {

    public enum StarterType {
        student, teacher
    }

    public enum CheckingType {
        manual, auto, mixed, none
    }

    @JsonProperty
    private boolean containsInstructionalSequence;

    @JsonProperty
    private boolean useForDifferentialRecommendation;

    @JsonProperty
    private boolean placement;

    private CheckingType checkingType;

    private StarterType startByType;

    @Valid
    private List<TocItemSequence> sequences;

    public static AssessmentContentData newInstance(Builder builder) {
        AssessmentContentData contentData = new AssessmentContentData();
        contentData.type = EntityType.ASSESSMENT.getName();
        contentData.schema = builder.schema;
        contentData.cid = builder.cid;
        contentData.header = builder.header;
        contentData.title = builder.title;
        contentData.contentLocales = builder.contentLocales;
        contentData.standards = builder.standards;
        contentData.standardPackages = builder.standardPackages;
        contentData.resources = builder.resources;
        contentData.checkingType = builder.checkingType;
        contentData.containsInstructionalSequence = builder.containsInstructionalSequence;
        contentData.sequences = builder.sequences;
        contentData.startByType = builder.startByType;
        contentData.useForDifferentialRecommendation = builder.useForDifferentialRecommendation;
        contentData.placement = builder.placement;
        return contentData;
    }

    public static class Builder {
        private String cid;
        private Header header;
        private String title;
        private String schema;
        private Set<String> contentLocales = new HashSet<>();
        private Set<TaggedStandards> standards = new HashSet<>();
        private Set<StandardsPackage> standardPackages = new HashSet<>();
        private Set<CGSResource> resources = new HashSet<>();
        private CheckingType checkingType;
        private boolean containsInstructionalSequence;
        private List<TocItemSequence> sequences = new ArrayList<>();
        private StarterType startByType;
        private boolean useForDifferentialRecommendation;
        private boolean placement;

        public Builder cid(String cid) {
            this.cid = cid;
            return this;
        }

        public Builder header(Header header) {
            this.header = header;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder schema(String schema) {
            this.schema = schema;
            return this;
        }

        public Builder contentLocales(Set<String> contentLocales) {
            this.contentLocales = contentLocales;
            return this;
        }

        public Builder standards(Set<TaggedStandards> standards) {
            this.standards = standards;
            return this;
        }

        public Builder standardPackages(Set<StandardsPackage> standardPackages) {
            this.standardPackages = standardPackages;
            return this;
        }

        public Builder addResources(Set<CGSResource> resources) {
            this.resources.addAll(resources);
            return this;
        }

        public Builder checkingType(CheckingType checkingType) {
            this.checkingType = checkingType;
            return this;
        }

        public Builder containsInstructionalSequence(boolean containsInstructionalSequence) {
            this.containsInstructionalSequence = containsInstructionalSequence;
            return this;
        }

        public Builder sequences(List<TocItemSequence> sequences) {
            this.sequences = sequences;
            return this;
        }

        public Builder startByType(StarterType startByType) {
            this.startByType = startByType;
            return this;
        }

        public Builder useForDifferentialRecommendation(boolean useForDifferentialRecommendation) {
            this.useForDifferentialRecommendation = useForDifferentialRecommendation;
            return this;
        }

        public Builder placement(boolean placement) {
            this.placement = placement;
            return this;
        }
    }


    public CheckingType getCheckingType() {
        return checkingType;
    }

    public boolean containsInstructionalSequence() {
        return containsInstructionalSequence;
    }

    public List<TocItemSequence> getSequences() {
        return sequences;
    }

    @Override
    public String getSequenceHolderCid(TocItemSequence sequence) {
        return this.cid;
    }

    @Override
    public String getSequenceHolderCid(String sequenceCid) {
        return this.cid;
    }

    /**
     * {@inheritDoc}
     *
     * @throws IllegalArgumentException if the {@code sequenceToReplace} does not exist in the toc item
     */
    @Override // TODO: 12/15/16 test
    public void replaceTocItemSequence(TocItemSequence sequenceToReplace, TocItemSequence replacement) {
        int index = this.sequences.indexOf(sequenceToReplace);
        if (index == -1) {
            throw new IllegalArgumentException(String.format("Sequence to replace '%s' does not exist on toc item '%s'",
                    sequenceToReplace.getCid(), this.getCid()));
        }
        this.sequences.set(index, replacement);
    }

    @Override
    public void removeSequence(TocItemSequence sequenceToRemove) {
        int index = this.sequences.indexOf(sequenceToRemove);
        if (index == -1) {
            throw new IllegalArgumentException(String.format("Sequence to remove '%s' does not exist on toc item '%s'",
                    sequenceToRemove.getCid(), this.getCid()));
        }
        this.sequences.remove(sequenceToRemove);
    }

    public StarterType getStartByType() {
        return startByType;
    }

    public boolean isUsedForDifferentialRecommendation() {
        return useForDifferentialRecommendation;
    }

    public boolean isPlacement() {
        return placement;
    }

    @Override
    public String toString() {
        return "AssessmentContentData{" +
                "\"type\": \"" + type + '\"' +
                ", \"schema\": \"" + schema + '\"' +
                ", \"cid\": \"" + cid + '\"' +
                ", \"header\": \"" + header + '\"' +
                ", \"title\": \"" + title + '\"' +
                ", \"contentLocales\": \"" + contentLocales + '\"' +
                ", \"standards\": \"" + standards + '\"' +
                ", \"standardPackages\": \"" + standardPackages + '\"' +
                ", \"resources\": \"" + resources + '\"' +
                ", \"checkingType\": \"" + checkingType + '\"' +
                ", \"containsInstructionalSequence\": \"" + containsInstructionalSequence + '\"' +
                ", \"sequences\": \"" + sequences + '\"' +
                ", \"startByType\": \"" + startByType + '\"' +
                ", \"useForDifferentialRecommendation\": \"" + useForDifferentialRecommendation + '\"' +
                ", \"placement\": \"" + placement + '\"' +
                "}";
    }
}
