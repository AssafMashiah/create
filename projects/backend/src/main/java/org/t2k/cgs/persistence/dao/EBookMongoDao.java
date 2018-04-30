package org.t2k.cgs.persistence.dao;

import com.mongodb.DBObject;
import com.mongodb.DBRef;
import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Component;
import org.t2k.cgs.domain.model.ebooks.EBooksDao;
import org.t2k.cgs.persistence.dao.MongoDao;
import org.t2k.cgs.domain.model.ebooks.EBookConversionServiceTypes;
import org.t2k.cgs.domain.model.ebooks.EBook;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 15/10/2015
 * Time: 09:18
 */
@Component
public class EBookMongoDao extends MongoDao implements EBooksDao {

    private Logger logger = Logger.getLogger(this.getClass());

    private final String EBOOK_COLLECTION = "ebooks";
    public static final String EBOOK_ID = "eBookId";
    private final String PUBLISHER_ID = "publisherId";
    private final String CONVERSION_LIBRARY = "conversionLibrary";
    private final String CONVERSION_LIBRARY_VERSION = "conversionLibraryVersion";
    private final String BOOK_TITLE = "structure.title";
    private final String SHA1 = "sha1";

    @Override
    public void save(EBook eBook) {
        getMongoTemplate().save(eBook, EBOOK_COLLECTION);
    }

    @Override
    public void remove(String eBookId, int publisherId) {
        Query query = new Query();
        query.addCriteria(Criteria.where(EBOOK_ID).is(eBookId)
                .and(PUBLISHER_ID).is(publisherId));
        getMongoTemplate().remove(query, EBOOK_COLLECTION);
    }

    @Override
    public List<EBook> getEBooksByIds(List<String> eBooksIds) {
        Query query = new Query(Criteria.where(EBOOK_ID).in(eBooksIds));
        return getMongoTemplate().find(query, EBook.class, EBOOK_COLLECTION);
    }

    /**
     * @param sha1             -             sha1 on original file
     * @param publisherId      -      publisher id
     * @param conversionVendor - conversion library user for converting the ebook : IDR, PDFEX, QOPPA, EPUB
     * @return EBook instance if found, or Null if no eBook found with the given SHA1 and conversion library for the publisherId.
     */
    @Override
    public EBook getEBookBySha1ConversionLibraryVersionAndPublisherId(String sha1, int publisherId, EBookConversionServiceTypes conversionVendor, String conversionLibraryVersion) {

        Query query = new Query(Criteria.where(SHA1).is(sha1)
                .and(PUBLISHER_ID).is(publisherId)
                .and(CONVERSION_LIBRARY).is(conversionVendor)
                .and(CONVERSION_LIBRARY_VERSION).is(conversionLibraryVersion));
        return getMongoTemplate().findOne(query, EBook.class, EBOOK_COLLECTION);
    }

    @Override
    public EBook getByPublisherAndEBookId(String eBookId, int publisherId) {
        Query query = new Query(Criteria.where(PUBLISHER_ID).is(publisherId)
                .and(EBOOK_ID).is(eBookId));
        return getMongoTemplate().findOne(query, EBook.class, EBOOK_COLLECTION);
    }

    @Override
    public List<EBook> getAllPublisherEBooks(int publisherId) throws DaoException {
        try {
            Query query = new Query(Criteria.where(PUBLISHER_ID).is(publisherId));
            query.with(new Sort(Sort.Direction.ASC, BOOK_TITLE));
            return getMongoTemplate().find(query, EBook.class, EBOOK_COLLECTION);
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }

    @Override
    public void removeAllItems(String collectionName) throws DataAccessException {
        throw new IllegalAccessError();
    }

    @Override
    public DBRef getDBRefByEBook(EBook eBook) throws DaoException {
        logger.debug(String.format("getDBRefByEBook. eBookId: %s, title: %s", eBook.getEBookId(), eBook.getStructure().getTitle()));
        try {
            Query query = Query.query(Criteria.where(EBOOK_ID).is(eBook.getEBookId()));
            DBObject eBookDBObject = getMongoTemplate().findOne(query, DBObject.class, EBOOK_COLLECTION);
            DBRef result = null;

            if (eBookDBObject != null) {
                result = new DBRef(getMongoTemplate().getDb(), EBOOK_COLLECTION, eBookDBObject.get("_id"));
            }

            return result;
        } catch (DataAccessException e) {
            throw new DaoException(e);
        }
    }
}