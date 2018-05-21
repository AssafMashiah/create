package org.t2k.cgs.utils;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonToken;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * @author Alex Burdusel on 2016-07-11.
 */
public class JsonDateDeserializer extends JsonDeserializer<Date> {
    @Override
    public Date deserialize(JsonParser jsonParser, DeserializationContext ctxt) throws IOException {
        JsonToken t = jsonParser.getCurrentToken();
        return parseDate(t, jsonParser, ctxt);
    }

    private Date parseDate(JsonToken t, JsonParser jsonParser, DeserializationContext ctxt) throws IOException {
        if (t == JsonToken.VALUE_STRING) {
            String str = jsonParser.getText().trim();
            try {
                return ISO8601DateFormatter.toDate(str);
            } catch (ParseException isoException) {
                try {
                    return new SimpleDateFormat("yyyy-mm-dd").parse(str);
                } catch (ParseException e) {
                    throw new RuntimeException(e);
                }
            }
        }
        if (t == JsonToken.VALUE_NUMBER_INT) {
            return new Date(jsonParser.getLongValue());
        }
        if (t == JsonToken.START_OBJECT) { // it may be a nested date object like in mongo case
            if (jsonParser.nextToken() == JsonToken.FIELD_NAME) { // move parser to next token
                Date date = parseDate(jsonParser.nextToken(), jsonParser, ctxt);
                jsonParser.nextToken(); // END_OBJECT - move parser to next token
                return date;
            }
        }
        throw ctxt.mappingException(handledType());
    }


}
