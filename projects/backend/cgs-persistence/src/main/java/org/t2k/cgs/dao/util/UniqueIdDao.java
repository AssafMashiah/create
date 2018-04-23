package org.t2k.cgs.dao.util;

import org.t2k.sample.dao.exceptions.DaoException;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/3/13
 * Time: 2:41 PM
 */
public interface UniqueIdDao {

    int getNextId(String collectionName) throws DaoException;

}
