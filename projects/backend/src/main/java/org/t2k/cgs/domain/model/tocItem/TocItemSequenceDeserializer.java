package org.t2k.cgs.domain.model.tocItem;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.t2k.cgs.persistence.dao.EntityType;

import java.io.IOException;

/**
 * @author Alex Burdusel on 2016-12-12.
 */
public class TocItemSequenceDeserializer extends JsonDeserializer<TocItemSequence> {
    @Override
    public TocItemSequence deserialize(JsonParser jp, DeserializationContext ctxt) throws IOException {
        ObjectMapper mapper = (ObjectMapper) jp.getCodec();
        ObjectNode root = mapper.readTree(jp);
        EntityType type = root.get("type") == null
                ? EntityType.SEQUENCE_REGULAR // backward compatibility - there are old sequences without type
                : EntityType.forName(root.get("type").asText());
        switch (type) {
            case SEQUENCE_ASSESSMENT:
            case SEQUENCE_REGULAR:
                return mapper.readValue(root.toString(), TocItemSequenceRegular.class);
            case SEQUENCE_DIFFERENTIAL:
                return mapper.readValue(root.toString(), TocItemSequenceDifferential.class);
            case SEQUENCE_REF:
                return mapper.readValue(root.toString(), TocItemSequenceRef.class);
            default:
                throw new JsonMappingException(
                        String.format("Can not construct instance of TocItemSequence, problem: type '%s' not supported", type));
        }
    }
}
