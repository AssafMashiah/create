package org.t2k.cgs.domain.model.course;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.mongodb.DBObject;
import org.springframework.data.mongodb.core.mapping.Field;

import javax.validation.constraints.NotNull;
import java.io.Serializable;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 24/06/14
 * Time: 16:04
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DifferentiationLevel implements Serializable {
    @JsonProperty("id")
    @Field("id")
    @NotNull
    private int levelId;

    @NotNull
    private String name;

    @NotNull
    private String acronym;

    public static DifferentiationLevel of(DBObject dbObject) {
        DifferentiationLevel differentiationLevel = new DifferentiationLevel();
        differentiationLevel.levelId = (Integer) dbObject.get("levelId");
        differentiationLevel.name = (String) dbObject.get("name");
        differentiationLevel.acronym = (String) dbObject.get("acronym");
        return differentiationLevel;
    }

    public int getLevelId() {
        return levelId;
    }

    public void setLevelId(int levelId) {
        this.levelId = levelId;
    }

    public String getAcronym() {
        return acronym;
    }

    public void setAcronym(String acronym) {
        this.acronym = acronym;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return "DifferentiationLevel{" +
                "id=" + levelId +
                ", name='" + name + '\'' +
                ", acronym='" + acronym + '\'' +
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
        DifferentiationLevel other = (DifferentiationLevel) obj;
        return this.levelId == other.levelId && this.name.equals(other.name) && this.acronym.equals(other.acronym);
    }

    @Override
    public int hashCode() {
        int result = 17;
        result = 31 * result + this.name.hashCode();
        result = 31 * result + this.levelId;
        result = 31 * result + this.acronym.hashCode();
        return result;
    }
}
