package org.t2k.cgs.domain.model.ebooks;

import org.t2k.cgs.domain.model.ebooks.EBook;

import java.util.Set;

/**
 * An object that holds references to and uses eBooks
 *
 * @author Alex Burdusel on 2016-08-26.
 */
public interface EBookHolder {

    /**
     * @param eBook eBook to check if the object is using
     * @return true if this object uses the specified eBook
     * @throws NullPointerException if the specified eBook is null or its eBookId is null
     */
    boolean containsEBook(EBook eBook);

    /**
     * @return a list of all the eBook IDs used by the object
     */
    Set<String> getEBooksIds();

    /**
     * Updates an eBook on the object with the new/updated given one
     *
     * @param newEBook new eBook to be used on the object
     * @param oldEBook eBook currently in use on the object
     * @return true if the eBook was successfully updated, false otherwise
     */
    boolean updateEBook(EBook newEBook, EBook oldEBook);
}
