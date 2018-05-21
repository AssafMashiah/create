package org.t2k.cgs.persistence.dao;

import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.t2k.cgs.domain.model.lock.TransactionsDao;
import org.t2k.cgs.persistence.dao.MongoDao;
import org.t2k.cgs.domain.model.lock.Transaction;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 01/11/12
 * Time: 10:21
 */
@Component("transactionsDao")
public class TransactionsMongoDao extends MongoDao implements TransactionsDao {

    protected static final String TRANSACTIONS_COLLECTION = "transactions";

    @Override
    public void removeTransactionOnCourse(String userName, String courseId) {
        getMongoTemplate().remove(Query.query(Criteria.where("courseId").is(courseId).
                and("userName").is(userName)), Transaction.class);
    }

    @Override
     public boolean checkNAddTransaction(String userName, String courseId, Date date) {
        List<Transaction> transaction = findByCourse(courseId);
        if(transaction == null || transaction.isEmpty()) {
            Transaction t = new Transaction(date, userName, courseId, true);
            getMongoTemplate().save(t);
            return true;
        }
        return false;
    }

    @Override
    public boolean addTransaction(String userName, String courseId, Date date) {
        List<Transaction> transaction = findByCourse(courseId);
        boolean publishing = false;
        if(transaction != null && !transaction.isEmpty() ){
            for(Transaction tr : transaction ){
                publishing |=  tr.isPublishing();
            }
        }
        //add a transaction only if there is no publishing transaction
        if(transaction == null || transaction.isEmpty() || !publishing ) {
            Transaction t = new Transaction(date, userName, courseId, false);
            getMongoTemplate().save(t);
            return true;
        }
        return false;
    }

    @Override
    public List<Transaction> findByCourse(String courseId) {
        return getMongoTemplate().find(Query.query(Criteria.where("courseId").is(courseId)), Transaction.class);
    }

    @Override
    public List<Transaction> getAllTransactions() throws DaoException {
        try {
            return getMongoTemplate().findAll(Transaction.class, TRANSACTIONS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void removeAllSystemTransactions() throws DaoException {
        try {
            Query query = new Query(Criteria.where("userName").regex("^system.*$", "i")); // Case insensitive search regex
            getMongoTemplate().remove(query, TRANSACTIONS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void removeAllUserTransactions(String username) throws DaoException {
        try {
            Query query = new Query(Criteria.where("userName").is(username));
            getMongoTemplate().remove(query, TRANSACTIONS_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void removeAllTransactions() {
        getMongoTemplate().remove(new Query(),Transaction.class);
    }
}
