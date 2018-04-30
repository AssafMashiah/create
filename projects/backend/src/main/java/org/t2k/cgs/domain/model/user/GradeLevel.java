package org.t2k.cgs.domain.model.user;

import com.google.gson.annotations.SerializedName;
import org.codehaus.jackson.annotate.JsonProperty;
import org.springframework.data.mongodb.core.mapping.Field;

import java.io.Serializable;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 21/05/14
 * Time: 14:27
 */
public class GradeLevel implements Serializable {

    @SerializedName("id")   // Annotation for GSON, that is used only in getAuthenticationData method.
                            // TODO: remove GSON usage
    @JsonProperty("id")
    @Field("id")
    private String gradeId;

    public String getGradeId() {
        return gradeId;
    }

    public void setGradeId(String gradeId) {
        this.gradeId = gradeId;
    }



    @Override
    public String toString() {
        return "GradeLevel{" +
                "id='" + gradeId + '\'' +
                '}';
    }
}
