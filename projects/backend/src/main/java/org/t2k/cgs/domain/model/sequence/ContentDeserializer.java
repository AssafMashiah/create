package org.t2k.cgs.domain.model.sequence;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.io.IOException;

/**
 * @author Alex Burdusel on 2016-12-13.
 */
public class ContentDeserializer extends JsonDeserializer<Content> {
    @Override
    public Content deserialize(JsonParser jp, DeserializationContext ctxt) throws IOException, JsonProcessingException {
        ObjectMapper mapper = (ObjectMapper) jp.getCodec();
        ObjectNode root = mapper.readTree(jp);
        ContentType type = ContentType.valueOf(root.get("type").asText());
        switch (type) {
            case sequence:
                return mapper.readValue(root.toString(), SequenceContent.class);
            default:
                throw new JsonMappingException(
                        String.format("Can not construct instance of Content, problem: type '%s' not supported", type));
        }
    }
}
