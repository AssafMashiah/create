package org.t2k.cgs.tts;

import org.t2k.cgs.dataServices.exceptions.DsException;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 11/12/13
 * Time: 15:45
 */
public interface TextToSpeechProviderService {
    String getTextToSpeechProviders() throws DsException;
}
