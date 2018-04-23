package org.t2k.sample.dao;

import org.t2k.sample.dao.exceptions.DaoException;
import org.t2k.sample.dao.mapStore.IStorage;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 03/10/12
 * Time: 16:08
 */
public interface IPortfolioDao {

    public List<String> getAllPortfolios() throws DaoException;

    public String getPortfolio(String portfolioId) throws DaoException;

    public void updatePortfolio(String portfolioId, long value) throws DaoException;

    public boolean deletePortfolio(String portfolioId) throws DaoException;

    public void addNewPortfolio(String portfolio) throws DaoException;

    public void clearStore() throws DaoException;

    public void setStorage(IStorage storage);



}
