package org.t2k.sample.dao.mapStore;

import org.apache.log4j.Logger;
import org.t2k.sample.dao.IPortfolioDao;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 03/10/12
 * Time: 16:29
 */
public class PortfolioMapStoreDao implements IPortfolioDao {

    private static Logger logger= Logger.getLogger(PortfolioMapStoreDao.class);

    private short maxsize = 100;

    private IStorage<String> store;






    public PortfolioMapStoreDao() {
        store = new MapStore<String>(maxsize);
    }


    @Override
    public List<String> getAllPortfolios() throws DaoException {
        return new ArrayList<String>(store.getValues());
    }

    @Override
    public String getPortfolio(String portfolioId) throws DaoException {
        return store.get(portfolioId);
    }

    @Override
    public void updatePortfolio(String portfolioId, long value) throws DaoException {
        if (store.containsKey(portfolioId)) {
            store.get(portfolioId).concat(String.valueOf(value));
        } else {
            throw new DaoException("the portfolio does not exist for update");
        }
    }

    @Override
    public boolean deletePortfolio(String portfolioId) throws DaoException {
        return store.remove(portfolioId);
    }

    @Override
    public void addNewPortfolio(String portfolio) throws DaoException {
        String key = null;

        if (!store.containsValue(portfolio)) {
            key = String.valueOf(portfolio.hashCode());
            store.put(key, portfolio);
        } else {
            throw new DaoException("The portfolio already exists in the system");
        }
    }




    @Override
    public void clearStore() throws DaoException {
        store.clear();
    }


    @Override
    public void setStorage(IStorage storage) {
        this.store=storage;
    }





}
