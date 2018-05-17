package org.t2k.cgs.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.TextToSpeechProviderService;
import org.t2k.cgs.domain.usecases.TextToSpeechProviderDao;
import org.t2k.cgs.domain.model.exceptions.DsException;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 11/12/13
 * Time: 15:48
 */
@Service
public class TextToSpeechProviderServiceImpl implements TextToSpeechProviderService {
    @Autowired
    private TextToSpeechProviderDao textToSpeechProviderDao;

    @Override
    public String getTextToSpeechProviders() throws DsException {
        try {
            return textToSpeechProviderDao.getTextToSpeechProviders();
        } catch (DataAccessException e) {
            throw new DsException(e);
        }
    }
}
