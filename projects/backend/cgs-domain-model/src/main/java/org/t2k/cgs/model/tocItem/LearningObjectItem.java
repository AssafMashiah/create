package org.t2k.cgs.model.tocItem;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.t2k.cgs.model.classification.TaggedStandards;

import javax.validation.constraints.Pattern;
import java.util.ArrayList;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class LearningObjectItem {
    private String cid;
    private String title;
    private String overview;
    private String type;
    private List<TaggedStandards> standards;
    private String checkingType;
    private Boolean containsInstructionalSequence;
    @Pattern(regexp = "^P(\\d+Y)?(\\d+M)?(\\d+D)?(T(((\\d+H)(\\d+M)?(\\d+(\\.\\d{1,2})?S)?)|((\\d+M)(\\d+(\\.\\d{1,2})?S)?)|(\\d+(\\.\\d{1,2})?S)))?$")
    private String typicalLearningTime;
    private String taskWeight;
    private String assessmentType;
    private String scoreType;
    private Integer maxScore;
    private Object redoQuiz;
    private Boolean useForDifferentialRecommendation;
    private Object recommendationCriteria;
    private List<TocItemSequence> sequences = new ArrayList<>();

    public String getCid() {
        return cid;
    }

    public String getTitle() {
        return title;
    }

    public String getOverview() {
        return overview;
    }

    public String getType() {
        return type;
    }

    public List<TaggedStandards> getStandards() {
        return standards;
    }

    public String getCheckingType() {
        return checkingType;
    }

    public Boolean getContainsInstructionalSequence() {
        return containsInstructionalSequence;
    }

    public String getTypicalLearningTime() {
        return typicalLearningTime;
    }

    public String getTaskWeight() {
        return taskWeight;
    }

    public String getAssessmentType() {
        return assessmentType;
    }

    public String getScoreType() {
        return scoreType;
    }

    public Integer getMaxScore() {
        return maxScore;
    }

    public Object getRedoQuiz() {
        return redoQuiz;
    }

    public Boolean getUseForDifferentialRecommendation() {
        return useForDifferentialRecommendation;
    }

    public Object getRecommendationCriteria() {
        return recommendationCriteria;
    }

    public List<TocItemSequence> getSequences() {
        return sequences;
    }
}
