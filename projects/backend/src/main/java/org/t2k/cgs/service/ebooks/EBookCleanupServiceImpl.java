package org.t2k.cgs.service.ebooks;

import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.t2k.cgs.domain.usecases.ebooks.EBookCleanupService;
import org.t2k.cgs.persistence.springrepository.EBookRepository;
import org.t2k.cgs.domain.usecases.ebooks.EBookService;
import org.t2k.cgs.persistence.springrepository.CourseRepository;
import org.t2k.cgs.domain.model.ebooks.EBooksDao;
import org.t2k.cgs.domain.model.ebooks.EBook;

import javax.inject.Inject;
import java.io.File;
import java.io.IOException;
import java.util.List;

/**
 * Service responsible for EBooks cleanup
 *
 * @author Alex Burdusel on 2016-10-04.
 */
@Service("eBookCleanupService")
public class EBookCleanupServiceImpl implements EBookCleanupService {

    private final Logger logger = Logger.getLogger(this.getClass());

    private final CourseRepository courseRepository;
    private final EBooksDao eBooksDao;
    private final EBookRepository eBookRepository;
    private final Configuration configuration;

    @Inject
    public EBookCleanupServiceImpl(EBooksDao eBooksDao,
                                   EBookRepository eBookRepository,
                                   CourseRepository courseRepository,
                                   Configuration configuration) {
        Assert.notNull(courseRepository);
        Assert.notNull(eBookRepository);
        Assert.notNull(eBooksDao);
        Assert.notNull(configuration);
        this.courseRepository = courseRepository;
        this.eBooksDao = eBooksDao;
        this.eBookRepository = eBookRepository;
        this.configuration = configuration;
    }

    @Override
    public String getEBookFolderById(int publisherId, String eBookId) {
        return String.format("%s/publishers/%d/%s/%s",
                configuration.getProperty("cmsHome"), publisherId, configuration.getProperty(EBookService.E_BOOKS_BASE_FOLDER), eBookId);
    }

    public void removeEBook(String eBookId, int publisherId) {
        EBook eBook = eBooksDao.getByPublisherAndEBookId(eBookId, publisherId);
        removeEBook(eBook);
    }

    @Override
    public void removeEBook(EBook eBook) {
        String eBookDir = getEBookFolderById(eBook.getPublisherId(), eBook.getEBookId());
        removeEBook(eBookDir, eBook.getEBookId(), eBook.getPublisherId());
    }

    @Override
    public void removeEBook(String eBookDir, String eBookId, int publisherId) {
        try {
            logger.info("Removing eBook directory " + eBookDir);
            FileUtils.deleteDirectory(new File(eBookDir));
        } catch (IOException e) {
            logger.error("Failed to remove eBook directory " + eBookDir);
        }
        logger.info("Removing from database eBook with eBookId " + eBookId);
        eBooksDao.remove(eBookId, publisherId);
    }

    @Scheduled(cron = "0 0 0 * * SUN") // every Sunday at 0:00
    public void removeUnusedEBooks() {
        List<EBook> eBookList = eBookRepository.findAll();
        logger.info("Checking for unused eBooks");
        eBookList.forEach(eBook -> {
            if (courseRepository.findByPublisherIdAndEBookId(eBook.getPublisherId(), eBook.getEBookId()).size() == 0) {
                logger.info(String.format("Ebook %s is no longer used on any course. Removing...", eBook));
                removeEBook(eBook);
            }
        });
    }
}
