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
public class LoType {

    @SerializedName("id")   // Annotation for GSON, that is used only in getAuthenticationData method.
    // TODO: remove GSON usage
    @JsonProperty("id")
    @Field("id")
    private String loTypeId;

    private String display;

    public String getLoTypeId() {
        return loTypeId;
    }

    public void setLoTypeId(String loTypeId) {
        this.loTypeId = loTypeId;
    }

    public String getDisplay() {
        return display;
    }

    public void setDisplay(String display) {
        this.display = display;
    }

    @Override
    public String toString() {
        return "SubjectArea{" +
                "loTypeId='" + loTypeId + '\'' +
                ", display='" + display + '\'' +
                '}';
    }
}
