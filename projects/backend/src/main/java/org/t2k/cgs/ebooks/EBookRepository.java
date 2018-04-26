package org.t2k.cgs.ebooks;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.t2k.cgs.model.ebooks.EBook;

import java.util.List;

/**
 * @author Alex Burdusel on 2016-09-07.
 */
public interface EBookRepository extends MongoRepository<EBook, String> {

    List<EBook> findByUpdatedEBookIdAndPublisherId(String updatedEBookId, int publisherId);
}
