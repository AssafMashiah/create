package org.t2k.cgs.dao.tts;

import org.springframework.dao.DataAccessException;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 11/12/13
 * Time: 15:35
 */
public interface TextToSpeechProviderDao {

    String getTextToSpeechProviders() throws DataAccessException;
}
