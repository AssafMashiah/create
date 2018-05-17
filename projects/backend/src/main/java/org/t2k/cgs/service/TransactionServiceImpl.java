package org.t2k.cgs.service;

import atg.taglib.json.util.JSONObject;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.lock.TransactionService;
import org.t2k.cgs.domain.model.lock.TransactionsDao;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.InitServiceException;
import org.t2k.cgs.domain.model.lock.Transaction;
import org.t2k.sample.dao.exceptions.DaoException;

import javax.annotation.PostConstruct;
import java.util.Date;
import java.util.List;

@Service
public class TransactionServiceImpl implements TransactionService {

    private static Logger logger = Logger.getLogger(TransactionServiceImpl.class);

    @Autowired
    private TransactionsDao transactionsDao;

    /**
     * An initiation method to setup the manager resources.
     */
    @PostConstruct
    public void init() {
        logger.info("Init Transaction Service...");
        try {
            transactionsDao.removeAllSystemTransactions();
        } catch (DaoException e) {
            String msg = "init: Problem when removing transactions.";
            logger.error(msg);
            throw new InitServiceException(msg, e);
        }
    }

    @Override
    public List<Transaction> getTransactionForCourse(String courseId) {
        return transactionsDao.findByCourse(courseId);
    }

    @Override
    public List<Transaction> getAllTransactions() throws DsException {
        try {
            return transactionsDao.getAllTransactions();
        } catch (DaoException e) {
            throw new DsException(e);
        }
    }

    @Override
    public boolean checkNStartTransaction(String courseId, String userName, Date date) throws DsException {
        return transactionsDao.checkNAddTransaction(userName, courseId, date);
    }

    @Override
    public boolean startTransaction(String courseId, String userName, Date date) throws DsException {
        return transactionsDao.addTransaction(userName, courseId, date);
    }

    @Override
    public void stopTransaction(String courseId, String userName) throws DsException {
        transactionsDao.removeTransactionOnCourse(userName, courseId);
    }

    @Override
    public void stopAllTransactions() throws DsException {
        transactionsDao.removeAllTransactions();
    }

    @Override
    public void stopAllUserTransactions(String username) throws DsException {
        try {
            transactionsDao.removeAllUserTransactions(username);
        } catch (DaoException e) {
            logger.error(String.format("stopAllUserTransactions Failed to remove transactions of user: %s", username));
            throw new DsException(e);
        }
    }

    @Override
    public String createValidationErrorMessage(String courseId, String publishUsername) {
        try {
            JSONObject j = new JSONObject();
            j.put("courseId", courseId);
            j.put("publishUsername", publishUsername);
            return j.toString();
        } catch (Exception e) {
            logger.error(String.format("Error creating a validation error message for %s", courseId), e);
            return "{}";
        }
    }

    @Override
    public boolean doesCourseHaveTransactions(String courseId) {
        List<Transaction> t;
        try {
            t = getTransactionForCourse(courseId);
        } catch (Exception e) {
            logger.error(String.format("Error getting transaction list for course %s", courseId), e);
            return true; //to be super safe, if there is an exception - treat it as there is a transaction
        }
        return (t != null && !t.isEmpty());
    }
}