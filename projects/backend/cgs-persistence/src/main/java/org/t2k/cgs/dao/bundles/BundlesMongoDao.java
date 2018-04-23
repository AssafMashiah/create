package org.t2k.cgs.dao.bundles;

import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.t2k.cgs.dao.MongoDao;
import org.t2k.cgs.model.bundle.Bundle;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 06/08/14
 * Time: 10:31
 */
@Component
public class BundlesMongoDao extends MongoDao implements BundlesDao {

    private final String BUNDLE_ACCOUNT_ID_KEY = "accountId";
    private final String BUNDLE_ID_KEY = "bundleId";
    private final String BUNDLE_COLLECTION_NAME = "bundles";

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
        throw new IllegalAccessError();
    }

    @Override
    public void save(Bundle bundle) throws DaoException {
        Bundle existingBundle = getByAccountId(bundle.getAccountId(), bundle.getId());
        if (existingBundle != null) {
            existingBundle.setPlugins(bundle.getPlugins());
            existingBundle.setName(bundle.getName());
            existingBundle.setVersion(bundle.getVersion());
            existingBundle.setEntryPoints(bundle.getEntryPoints());
            existingBundle.setResources(bundle.getResources());
            existingBundle.setCreationDate(bundle.getCreationDate());
            getMongoTemplate().save(existingBundle, BUNDLE_COLLECTION_NAME);
        } else {
            getMongoTemplate().save(bundle, BUNDLE_COLLECTION_NAME);
        }
    }

    @Override
    public void remove(int accountId, String bundleId) {
        Query query = new Query();
        query.addCriteria(Criteria.where(BUNDLE_ACCOUNT_ID_KEY).is(accountId).and(BUNDLE_ID_KEY).is(bundleId));
        getMongoTemplate().remove(query, BUNDLE_COLLECTION_NAME);
    }

    @Override
    public List<Bundle> getByAccountId(int accountId) throws DaoException {
        Query query = new Query(Criteria.where(BUNDLE_ACCOUNT_ID_KEY).is(accountId));
        return getMongoTemplate().find(query, Bundle.class, BUNDLE_COLLECTION_NAME);
    }

    @Override
    public Bundle getByAccountId(int accountId, String bundleId) throws DaoException {
        Query query = new Query(Criteria.where(BUNDLE_ACCOUNT_ID_KEY).is(accountId).and(BUNDLE_ID_KEY).is(bundleId));
        return getMongoTemplate().findOne(query, Bundle.class, BUNDLE_COLLECTION_NAME);
    }

    @Override
    public List<Bundle> getBundlesCreatedBetweenDates(Date afterDate, Date beforeDate) throws DaoException {
        try {
            Query query = new Query(Criteria.where("creationDate").lt(beforeDate).gt(afterDate));
            return getMongoTemplate().find(query, Bundle.class, BUNDLE_COLLECTION_NAME);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }
}