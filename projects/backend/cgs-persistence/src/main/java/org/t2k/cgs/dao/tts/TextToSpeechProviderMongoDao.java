package org.t2k.cgs.dao.tts;

import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.t2k.cgs.dao.MongoDao;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 11/12/13
 * Time: 15:35
 */
@Component
public class TextToSpeechProviderMongoDao extends MongoDao implements TextToSpeechProviderDao{
    private static Logger logger = Logger.getLogger(TextToSpeechProviderMongoDao.class);

    private static final String TTS_PROVIDERS_COLLECTION = "ttsproviders";

    public String getTextToSpeechProviders() throws DataAccessException {
        Query query = new Query();
        query.fields().exclude("_id");

        List<DBObject> result = getMongoTemplate().find(query, DBObject.class, TTS_PROVIDERS_COLLECTION);
        return (result == null) ? (null) : (JSON.serialize(result));
    }

}
