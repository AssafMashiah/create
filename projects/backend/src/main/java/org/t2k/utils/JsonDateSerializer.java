package org.t2k.utils;

import com.fasterxml.jackson.databind.JsonSerializer;

import java.io.IOException;
import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 15/11/12
 * Time: 10:38
 */
public class JsonDateSerializer extends JsonSerializer<Date> {
    @Override
    public void serialize(Date date, com.fasterxml.jackson.core.JsonGenerator jsonGenerator, com.fasterxml.jackson.databind.SerializerProvider serializerProvider) throws IOException, com.fasterxml.jackson.core.JsonProcessingException {
       String formattedDate = ISO8601DateFormatter.fromDate(date);

        jsonGenerator.writeString(formattedDate);
    }


}