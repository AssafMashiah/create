package org.t2k.sample.dao.mongoDao;

import com.mongodb.DBObject;
import com.mongodb.util.JSON;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.t2k.sample.dao.IPortfolioDao;
import org.t2k.sample.dao.exceptions.DaoException;
import org.t2k.sample.dao.mapStore.IStorage;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 22/10/12
 * Time: 09:02
 */
@Component
public class PortfolioMongoDao implements IPortfolioDao {


    @Inject
    private MongoTemplate cgsMongoTemplate;


    ///////////////////////////////////////////////////
    ///   MONGO COLLECTIONS                        ////
    ///////////////////////////////////////////////////
    private final static String PORTFOLIOS="portfolios";



    @Override
    public List<String> getAllPortfolios() throws DaoException {
        List<DBObject> docs= cgsMongoTemplate.findAll(DBObject.class, PORTFOLIOS);
        List<String> result=new ArrayList<String>();
        for (DBObject doc: docs){
            result.add(JSON.serialize(doc));
            System.out.println(doc);
        }
        return result;
    }

    @Override
    public String getPortfolio(String portfolioId) throws DaoException {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void updatePortfolio(String portfolioId, long value) throws DaoException {
        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public boolean deletePortfolio(String portfolioId) throws DaoException {
        Query query = new Query(Criteria.where("pId").is(portfolioId));
        cgsMongoTemplate.remove(query);
        return true;
    }

    @Override
    public void addNewPortfolio(String portfolioStr) throws DaoException {
        DBObject portfolioDoc= (DBObject) JSON.parse(portfolioStr);
        cgsMongoTemplate.insert(portfolioDoc, PORTFOLIOS);

    }

    @Override
    public void clearStore() throws DaoException {
        cgsMongoTemplate.dropCollection(PORTFOLIOS);
    }

    @Override
    public void setStorage(IStorage storage) {
        cgsMongoTemplate.createCollection(PORTFOLIOS);
    }
}
