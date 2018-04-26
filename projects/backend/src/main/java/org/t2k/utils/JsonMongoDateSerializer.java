package org.t2k.utils;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;
import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 04/02/13
 * Time: 11:30
 */
public class JsonMongoDateSerializer extends JsonSerializer<Date> {

    public void serialize(Date date, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException, JsonProcessingException {
       String formattedDate = ISO8601DateFormatter.fromDate(date);
        jsonGenerator.writeStartObject();
        jsonGenerator.writeObjectField("$date",formattedDate );
        jsonGenerator.writeEndObject();
    }
}
