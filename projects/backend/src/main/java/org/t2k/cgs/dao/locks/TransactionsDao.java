package org.t2k.cgs.dao.locks;

import org.t2k.cgs.locks.Transaction;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 01/11/12
 * Time: 10:19
 */
public interface TransactionsDao {

    void removeAllSystemTransactions() throws DaoException;

    void removeAllUserTransactions(String username) throws DaoException;

    void removeAllTransactions();

    void removeTransactionOnCourse(String userName, String courseId);

    boolean checkNAddTransaction(String userName, String courseId, Date date);

    boolean addTransaction(String userName, String courseId, Date date);

    List<Transaction> findByCourse(String courseId);

    List<Transaction> getAllTransactions() throws DaoException;
}
