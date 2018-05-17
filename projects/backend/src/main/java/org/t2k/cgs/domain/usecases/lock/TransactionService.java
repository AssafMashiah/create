package org.t2k.cgs.domain.usecases.lock;

import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.lock.Transaction;

import java.util.Date;
import java.util.List;

public interface TransactionService {

    List<Transaction> getTransactionForCourse(String courseId);

    List<Transaction> getAllTransactions() throws DsException;

    boolean checkNStartTransaction(String courseId,String userName, Date date ) throws DsException;

    boolean startTransaction(String courseId,String userName, Date date ) throws DsException;

    void stopTransaction(String courseId,String userName ) throws DsException;

    void stopAllTransactions() throws DsException;

    void stopAllUserTransactions(String username) throws DsException;

    String createValidationErrorMessage(String courseId, String publishUsername);

    boolean doesCourseHaveTransactions(String courseId);
}
