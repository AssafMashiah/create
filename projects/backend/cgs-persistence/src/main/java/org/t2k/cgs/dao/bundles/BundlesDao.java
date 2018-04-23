package org.t2k.cgs.dao.bundles;

import org.t2k.cgs.dao.util.GenericDaoOperations;
import org.t2k.cgs.model.bundle.Bundle;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 06/08/14
 * Time: 10:32
 * To change this template use File | Settings | File Templates.
 */
public interface BundlesDao extends GenericDaoOperations {

    void save(Bundle bundle) throws DaoException;

    void remove(int accountId, String bundleId);

    List<Bundle> getByAccountId(int accountId) throws DaoException;

    Bundle getByAccountId(int accountId, String bundleId) throws DaoException;

    List<Bundle> getBundlesCreatedBetweenDates(Date afterDate, Date beforeDate) throws DaoException;
}