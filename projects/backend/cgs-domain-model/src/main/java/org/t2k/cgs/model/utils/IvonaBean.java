package org.t2k.cgs.model.utils;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: alex.zaikman
 * Date: 02/02/14
 * Time: 14:08
 */
public class IvonaBean {

    public List<Param> getParams() {
        return params;
    }

    public void setParams(List<Param> params) {
        this.params = params;
    }

    public static class Param{

        private String key;

        private String value;

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public String getValue() {
            return value;
        }

        public void setValue(String value) {
            this.value = value;
        }
    }

    private String text;

    private String email;

    private String apiKey;

    private String codecId;

    private String voiceId;

    private String contentType;

    private List<Param> params;

    public String getEmail() {

        return email;
    }

    public void setEmail(String email) {

        this.email = email;
    }

    public String getApiKey() {

        return apiKey;
    }

    public void setApiKey(String apiKey) {

        this.apiKey = apiKey;
    }

    public String getCodecId() {

        return codecId;
    }

    public void setCodecId(String codecId) {

        this.codecId = codecId;
    }

    public String getVoiceId() {

        return voiceId;
    }

    public void setVoiceId(String voiceId) {

        this.voiceId = voiceId;
    }

    public String getContentType() {

        return contentType;
    }

    public void setContentType(String contentType) {

        this.contentType = contentType;
    }


    public String getText() {

        return text;
    }

    public void setText(String text) {

        this.text = text;
    }

              /*
                   {
                   "email" : "dewe@sds.com"
                      "apiKey" : "ef35423ht6ksdgdgsdfger4"
                       "codecId":"mp3/22050"
                       "voiceId": "ro_carmen"
                        "contentType":"text/plain"
                        "params": {"Paragraph-Break":"400" , ...  }
                   }


              * */
}
