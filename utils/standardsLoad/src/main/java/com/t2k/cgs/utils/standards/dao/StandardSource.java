package com.t2k.cgs.utils.standards.dao;

import org.springframework.dao.DataAccessException;

/**
 * Abstraction of a element that represent a standard source
 * containing a string csv content
 *
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 11:58 AM
 */
public interface StandardSource {

    /**
     * Get the CSV content of the standard package
     *
     * @return
     * @throws DataAccessException
     */
    String getContent() throws DataAccessException;

    /**
     * Get name of the standard package source
     *
     * @return
     */
    String getName();

}
