package org.t2k.cgs.dao.ebooks;

import com.mongodb.DBRef;
import org.t2k.cgs.dao.util.GenericDaoOperations;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.model.ebooks.EBook;
import org.t2k.sample.dao.exceptions.DaoException;

import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 15/10/2015
 * Time: 09:14
 */
public interface EBooksDao extends GenericDaoOperations {

    void save(EBook eBook);

    void remove(String eBookId, int publisherId);

    List<EBook> getAllPublisherEBooks(int publisherId) throws DaoException;

    DBRef getDBRefByEBook(EBook eBook) throws DaoException;

    List<EBook> getEBooksByIds(List<String> eBooksIds);

    EBook getEBookBySha1ConversionLibraryVersionAndPublisherId(String sha1, int publisherId, EBookConversionServiceTypes conversionVendor, String conversionLibraryVersion);

    EBook getByPublisherAndEBookId(String eBookId, int publisherId);

}