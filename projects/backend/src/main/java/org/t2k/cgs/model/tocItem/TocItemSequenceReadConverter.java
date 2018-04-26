package org.t2k.cgs.model.tocItem;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.DBObject;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

/**
 * @author Alex Burdusel on 2017-01-04.
 */
@ReadingConverter
public class TocItemSequenceReadConverter implements Converter<DBObject, TocItemSequence> {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Override
    public TocItemSequence convert(DBObject source) {
        return OBJECT_MAPPER.convertValue(source, TocItemSequence.class);
    }
}
