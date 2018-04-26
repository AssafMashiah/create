package org.t2k.cgs.dao.util;

import org.springframework.dao.DataAccessException;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 02/11/12
 * Time: 23:02
 */
public interface GenericDaoOperations {

    void removeAllItems(String collectionName) throws DataAccessException;
}
