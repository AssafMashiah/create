package org.t2k.cgs.domain.model.classification;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Alex Burdusel on 2016-08-10.
 */
public class LearningPath {

    /**
     * ID of the placement assessment managing the the learning path
     */
    @NotNull
    private String assessmentCid;

    /**
     * Standards/levels intervals included in the learning path
     */
    @Valid
    @NotNull
    @Size(min = 1)
    private List<LearningPathStandardInterval> standardIntervals = new ArrayList<>();

    public String getAssessmentCid() {
        return assessmentCid;
    }

    public List<LearningPathStandardInterval> getStandardIntervals() {
        return standardIntervals;
    }

    /**
     * Returns a brief description of this LearningPath. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * LearningPath{"assessmentCid": "sd123asd", "standardIntervals": {...}}
     */
    @Override
    public String toString() {
        return "LearningPath{" +
                "\"assessmentCid\": \"" + assessmentCid + '\"' +
                ", \"standardIntervals\": " + standardIntervals +
                '}';
    }
}
