package org.t2k.cgs.persistence.springrepository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.t2k.cgs.domain.model.user.CGSAccount;

/**
 * @author Alex Burdusel on 2016-07-07.
 */
public interface PublisherRepository extends MongoRepository<CGSAccount, ObjectId> {

    /**
     * @param accountId account/publisher ID
     * @return a publisher account
     */
    CGSAccount findByAccountId(int accountId);
}
