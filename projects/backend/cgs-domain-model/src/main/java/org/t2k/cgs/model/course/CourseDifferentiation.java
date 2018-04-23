package org.t2k.cgs.model.course;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.mongodb.DBObject;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 24/06/14
 * Time: 16:03
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CourseDifferentiation {

    @NotNull
    private int defaultLevelId;

    @NotNull
    @Valid
    private List<DifferentiationLevel> levels = new ArrayList<>();

    public static CourseDifferentiation of(DBObject dbObject) {
        CourseDifferentiation courseDifferentiation = new CourseDifferentiation();
        courseDifferentiation.defaultLevelId = (Integer) dbObject.get("defaultLevelId");
        courseDifferentiation.levels.addAll(((List<DBObject>) dbObject.get("levels"))
                .stream().map(DifferentiationLevel::of)
                .collect(Collectors.toList()));
        return courseDifferentiation;
    }

    public Integer getDefaultLevelId() {
        return defaultLevelId;
    }

    public void setDefaultLevelId(Integer defaultLevelId) {
        this.defaultLevelId = defaultLevelId;
    }

    public List<DifferentiationLevel> getLevels() {
        return levels;
    }

    public void setLevels(List<DifferentiationLevel> levels) {
        this.levels = levels;
    }

    /**
     * @param diffLevelId
     * @return an optional containing the differentiation level with the given ID
     */
    @JsonIgnore
    public Optional<DifferentiationLevel> getLevelById(int diffLevelId) {
        for (DifferentiationLevel differentiationLevel : levels) {
            if (differentiationLevel.getLevelId() == diffLevelId) {
                return Optional.of(differentiationLevel);
            }
        }
        return Optional.empty();
    }

    @Override
    public String toString() {
        return "CourseDifferentiationObject{" +
                "defaultLevelId='" + defaultLevelId + '\'' +
                ", levels=" + levels +
                '}';
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == null) {
            return false;
        }
        if (obj == this) {
            return true;
        }
        if (obj.getClass() != getClass()) {
            return false;
        }
        CourseDifferentiation other = (CourseDifferentiation) obj;
        return this.defaultLevelId == other.defaultLevelId && this.levels.equals(other.levels);
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + this.defaultLevelId;
        result = 31 * result + this.levels.hashCode();
        return result;
    }
}
