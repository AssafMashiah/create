package org.t2k.cgs.domain.model.classification;

import org.t2k.cgs.domain.model.course.CourseTocItemRef;

import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Alex Burdusel on 2016-08-10.
 */
public class LearningPathStandardInterval {

    /**
     * reference ID to a standard ({@link TaggedStandards}) included in the course
     */
    @NotNull
    private String stdPackageId;

    /**
     * A pedagogicalId included in the {@link TaggedStandards} referenced by {@link LearningPathStandardInterval#stdPackageId}
     */
    @NotNull
    private String pedagogicalId;

    /**
     * Score interval allocated for the standard/level interval
     */
    @NotNull
    private ScoreInterval scoreInterval;

    /**
     * TOC items required for the interval (mandatory lessons / assessments that a student needs to go through)
     */
    @NotNull
    private List<CourseTocItemRef> tocItemRefs = new ArrayList<>();

    /**
     * reference ID to a standard ({@link TaggedStandards}) included in the course
     */
    public String getStdPackageId() {
        return stdPackageId;
    }

    /**
     * A pedagogicalId included in the {@link TaggedStandards} referenced by {@link LearningPathStandardInterval#stdPackageId}
     */
    public String getPedagogicalId() {
        return pedagogicalId;
    }

    public ScoreInterval getScoreInterval() {
        return scoreInterval;
    }

    /**
     * TOC items required for the
     */
    public List<CourseTocItemRef> getTocItemRefs() {
        return tocItemRefs;
    }

    /**
     * Returns a brief description of this LearningPathStandardInterval. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * LearningPathStandardInterval{"stdPackageId": "qweqwe12", "pedagogicalId": "qwe1dazxcgg", "scoreInterval": {...},
     * "tocItemRefs": {...}}
     */
    @Override
    public String toString() {
        return "LearningPathStandardInterval{" +
                "\"stdPackageId\": \"" + stdPackageId + '\"' +
                ", \"pedagogicalId\": \"" + pedagogicalId + '\"' +
                ", \"scoreInterval\": " + scoreInterval +
                ", \"tocItemRefs\": " + tocItemRefs +
                '}';
    }
}
