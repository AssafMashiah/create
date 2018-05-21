package org.t2k.cgs.service.publish;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.model.user.ExternalPartnersDao;
import org.t2k.cgs.domain.usecases.publisher.ExternalPartnersService;
import org.t2k.cgs.domain.usecases.publisher.ExternalPartnerSettings;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.List;
import java.util.Random;
import java.util.UUID;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 1/6/15
 * Time: 9:50 PM
 */
@Service
public class ExternalPartnersServiceImpl implements ExternalPartnersService {

    @Autowired
    private ExternalPartnersDao externalPartnersDao;

    private Logger logger = Logger.getLogger(ExternalPartnersServiceImpl.class);

    @Override
    public void addBaseExternalPartnersDataForPublisherId(Integer publisherId) {
        String secretKey;
        try {
            secretKey = generateRandomKey();
        } catch (NoSuchAlgorithmException e) {
            logger.error("Error generating a random secret key when creating external partner settings for publisher " + publisherId + ", using a partially random password instead");
            secretKey = UUID.randomUUID().toString().replaceAll("-", "");// sets a basic password. we use this if there is an exception in the generateRandomKey method
        }
        ExternalPartnerSettings baseSettings = new ExternalPartnerSettings(publisherId, secretKey);
        externalPartnersDao.insertOrUpdateExternalPartnerSetting(baseSettings);
    }

    private String generateRandomKey() throws NoSuchAlgorithmException {
        char[] characterSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".toCharArray();
        int length = 16;
        Random random = new SecureRandom();
        char[] result = new char[length];
        for (int i = 0; i < result.length; i++) {
            // picks a random index out of character set > random character
            int randomCharIndex = random.nextInt(characterSet.length);
            result[i] = characterSet[randomCharIndex];
        }
        return new String(result);
    }


    @Override
    public List<ExternalPartnerSettings> getExternalPartnersByPublisherId(int publisherId) {
        return externalPartnersDao.getExternalPartnersByPublisherId(publisherId);
    }

    @Override
    public List<ExternalPartnerSettings> getExternalPartnersByExternalAccountId(String externalAccountId) {
        return externalPartnersDao.getExternalPartnerByExternalAccountId(externalAccountId);
    }

    @Override
    public void deleteAllDataRegardingPublisherId(int publisherId) {
        externalPartnersDao.deleteAllExternalPartnersOfPublisherId(publisherId);
    }
}
