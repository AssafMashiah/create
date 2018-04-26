package org.t2k.cgs.ebooks;

import org.t2k.cgs.model.ebooks.EBook;

/**
 * Service responsible with eBook removal
 *
 * @author Alex Burdusel on 2016-10-07.
 */
public interface EBookCleanupService {

    String getEBookFolderById(int publisherId, String eBookId);

    void removeEBook(String eBookId, int publisherId);

    void removeEBook(EBook eBook);

    void removeEBook(String eBookDir, String eBookId, int publisherId);
}
