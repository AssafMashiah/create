package org.t2k.cgs.security;

import com.google.gson.annotations.SerializedName;
import org.codehaus.jackson.annotate.JsonProperty;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 21/05/14
 * Time: 14:27
 */
public class SubjectArea {

    public String getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(String subjectId) {
        this.subjectId = subjectId;
    }

    @SerializedName("id")   // Annotation for GSON, that is used only in getAuthenticationData method.
                            // TODO: remove GSON usage
    @JsonProperty("id")
    @Field("id")
    private String subjectId;



    @Override
    public String toString() {
        return "SubjectArea{" +
                "id='" + subjectId + '\'' +
                '}';
    }
}
