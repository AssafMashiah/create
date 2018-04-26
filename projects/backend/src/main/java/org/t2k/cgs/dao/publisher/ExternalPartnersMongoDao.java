package org.t2k.cgs.dao.publisher;

import org.apache.log4j.Logger;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.t2k.cgs.dao.MongoDao;
import org.t2k.cgs.security.ExternalPartnerSettings;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 1/6/15
 * Time: 10:15 PM
 */
@Component
public class ExternalPartnersMongoDao extends MongoDao implements ExternalPartnersDao {

    private static final String EXTERNAL_PARTNERS_COLLECTION = "externalPartners";
    public static final String ACCOUNT_ID = "accountId";
    public static final String EXTERNAL_ACCOUNT_ID = "externalAccountId";

    private static Logger logger = Logger.getLogger(ExternalPartnersMongoDao.class);

    @Override
    public void insertOrUpdateExternalPartnerSetting(ExternalPartnerSettings baseSettings) {
        logger.debug(String.format("insertOrUpdateExternalPartnerSetting for publisher %d", baseSettings.getAccountId()));
        getMongoTemplate().save(baseSettings, EXTERNAL_PARTNERS_COLLECTION);
    }

    @Override
    public List<ExternalPartnerSettings> getExternalPartnersByPublisherId(int publisherId) {
        Query q = Query.query(Criteria.where(ACCOUNT_ID).is(publisherId));
        return getMongoTemplate().find(q, ExternalPartnerSettings.class, EXTERNAL_PARTNERS_COLLECTION);
    }

    @Override
    public List<ExternalPartnerSettings> getExternalPartnerByExternalAccountId(String externalAccountId) {
        Query q = Query.query(Criteria.where(EXTERNAL_ACCOUNT_ID).is(externalAccountId));
        return getMongoTemplate().find(q, ExternalPartnerSettings.class, EXTERNAL_PARTNERS_COLLECTION);
    }

    @Override
    public void deleteAllExternalPartnersOfPublisherId(int publisherId) {
        logger.debug(String.format("deleteAllExternalPartnersOfPublisherId: removing all data regarding publisher %d from %s collection", publisherId, EXTERNAL_PARTNERS_COLLECTION));
        Query q = Query.query(Criteria.where(ACCOUNT_ID).is(publisherId));
        getMongoTemplate().remove(q, EXTERNAL_PARTNERS_COLLECTION);
    }
}
