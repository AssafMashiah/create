package org.t2k.cgs.config.app;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.t2k.cgs.domain.model.cleanup.CleanupsDao;
import org.t2k.cgs.domain.model.tocItem.TocItemDao;
import org.t2k.cgs.domain.usecases.lock.LockService;
import org.t2k.cgs.domain.usecases.lock.TransactionService;
import org.t2k.cgs.domain.usecases.packaging.ContentValidator;
import org.t2k.cgs.domain.usecases.SequenceService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemDataService;
import org.t2k.cgs.domain.usecases.tocitem.TocItemDataServiceImpl;

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
