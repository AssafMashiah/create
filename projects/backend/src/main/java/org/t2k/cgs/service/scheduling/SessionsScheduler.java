package org.t2k.cgs.service.scheduling;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.lock.Lock;
import org.t2k.cgs.domain.usecases.lock.LockService;
import org.t2k.cgs.domain.model.lock.Transaction;
import org.t2k.cgs.domain.usecases.lock.TransactionService;
import org.t2k.cgs.domain.usecases.UserSessionService;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Created by IntelliJ IDEA.
 * User: Elad.Avidan
 * Date: 19/01/2015
 * Time: 18:23
 */
@Component
public class SessionsScheduler {

    private Logger logger = Logger.getLogger(SessionsScheduler.class);

    @Autowired
    private LockService lockService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private UserSessionService sessionService;

    @Scheduled(cron = "${sessionSchedulerCronExpression}")
//    @Scheduled(cron = "0 * * * * *")
    // will be triggered every day at 1 a.m - go to t2k.properties to set another CRON expression
    public void clearLocksAndTransactionOfInactiveUsersSessions() throws DsException {
        logger.debug("About to remove locks and transactions of users which have no active sessions.");

        // first, inactive sessions which are active for more than the configured number of days.
        sessionService.setUndefinedSessionsDestructionTimeWithCurrentTimeAndStatus();

        // get a list of all the users (not system users), which acquired locks or transactions
        Set<String> usernames = getUsernamesWhichAcquiredLocksOrTransactions();

        // for each user, check if he has an active session. if he doesn't - release all of his locks and transactions
        for (String username : usernames) {
            if (sessionService.getNumberOfActiveSessionsByUsername(username) == 0) {
                lockService.removeAllLocksOfUser(username);
                transactionService.stopAllUserTransactions(username);
            }
        }

        logger.debug("Remove locks and transactions of users which have no active sessions.");
    }

    /**
     * Gets a list of all the users (not system users), which acquired locks or transactions.
     * @return a list of usernames (not system users), which acquired locks or transactions.
     * @throws DsException
     */
    private Set<String> getUsernamesWhichAcquiredLocksOrTransactions() throws DsException {
        List<Lock> allLocks = lockService.getAllLocks();
        List<Transaction> allTransactions = transactionService.getAllTransactions();
        Set<String> usernames = new HashSet<>();
        for (Lock lock : allLocks) {
            if (!lock.getUserName().startsWith("system") && !lock.getUserName().startsWith("System")) {
                usernames.add(lock.getUserName());
            }
        }

        for (Transaction transaction : allTransactions) {
            if (!transaction.getUserName().startsWith("system") && !transaction.getUserName().startsWith("System")) {
                usernames.add(transaction.getUserName());
            }
        }

        return usernames;
    }
}