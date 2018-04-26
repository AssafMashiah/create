package org.t2k.cgs.tocItem.tocimport;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.t2k.cgs.dao.cleanups.CleanupsDao;
import org.t2k.cgs.dao.tocItem.TocItemDao;
import org.t2k.cgs.lock.LockService;
import org.t2k.cgs.lock.TransactionService;
import org.t2k.cgs.model.utils.ContentValidator;
import org.t2k.cgs.sequences.SequenceService;
import org.t2k.cgs.tocItem.TocItemDataService;
import org.t2k.cgs.tocItem.TocItemDataServiceImpl;

import javax.inject.Inject;

/**
 * Configuration class to instantiate {@link TocItemDataService} beans
 */
@Configuration
public class TocItemDataServiceConfiguration {

    @Inject
    @Bean(name = "lessonsDataServiceBean")
    public TocItemDataService lessonsDataServiceBean(TocItemDao lessonsDao,
                                                     SequenceService sequenceService,
                                                     CleanupsDao cleanupsDao,
                                                     LockService lockService,
                                                     TransactionService transactionService,
                                                     ContentValidator contentValidator) {
        return new TocItemDataServiceImpl(lessonsDao, sequenceService, cleanupsDao, lockService, transactionService, contentValidator);
    }

    @Inject
    @Bean(name = "assessmentsDataServiceBean")
    public TocItemDataService assessmentsDataServiceBean(TocItemDao assessmentsDao,
                                                         SequenceService sequenceService,
                                                         CleanupsDao cleanupsDao,
                                                         LockService lockService,
                                                         TransactionService transactionService,
                                                         ContentValidator contentValidator) {
        return new TocItemDataServiceImpl(assessmentsDao, sequenceService, cleanupsDao, lockService, transactionService, contentValidator);
    }

}
