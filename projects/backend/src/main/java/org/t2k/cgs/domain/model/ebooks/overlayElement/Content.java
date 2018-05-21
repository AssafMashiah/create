package org.t2k.cgs.domain.model.ebooks.overlayElement;

import org.codehaus.jackson.annotate.JsonAutoDetect;

import java.util.HashMap;
import java.util.Map;

import static org.codehaus.jackson.annotate.JsonAutoDetect.Visibility.ANY;
import static org.codehaus.jackson.annotate.JsonAutoDetect.Visibility.NONE;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 24/01/2016
 * Time: 08:33
 */
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE, creatorVisibility = NONE)
public class Content {

    private String type;
    private Map<String, String> data;

    private Content() { } // in use by json serializer

    public Content(String type, String resourceRefId) {
        this.type = type;
        this.data = new HashMap<>();
        this.data.put("resourceRefId", resourceRefId);
    }

    public Map<String, String> getData() {
        return data;
    }
}