package org.t2k.cgs.domain.model.user;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.google.gson.annotations.SerializedName;
import org.codehaus.jackson.annotate.JsonProperty;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 21/05/14
 * Time: 14:52
 */
public class TTSProvider {


    @SerializedName("id")   // Annotation for GSON, that is used only in getAuthenticationData method.
    // TODO: remove GSON usage
    @JsonProperty("id")
    @Field("id")
    private int ttsId;

    private String name;

    private List<String> locales;

    @JsonSerialize(as = TTSConfiguration.class)
    private TTSConfiguration configurations;



    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getLocales() {
        return locales;
    }

    public void setLocales(List<String> locales) {
        this.locales = locales;
    }

    public TTSConfiguration getConfigurations() {
        return configurations;
    }

    public void setConfigurations(TTSConfiguration configurations) {
        this.configurations = configurations;
    }


    public int getTtsId() {
        return ttsId;
    }

    public void setTtsId(int ttsId) {
        this.ttsId = ttsId;
    }

    @Override
    public String toString() {
        return "TTSProvider{" +
                "ttsId=" + ttsId +
                ", name='" + name + '\'' +
                ", locales=" + locales +
                ", configurations=" + configurations +
                '}';
    }
}
