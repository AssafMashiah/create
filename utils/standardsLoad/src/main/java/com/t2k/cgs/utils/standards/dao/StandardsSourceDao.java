package com.t2k.cgs.utils.standards.dao;

import org.springframework.dao.DataAccessException;

import java.util.Collection;

/**
 * Data access abstraction to the source of the standards
 *
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 11:58 AM
 */
public interface StandardsSourceDao {
/**
     * Get all available standard packages
     *
     * @return list of found standard packages
     * @throws DataAccessException - if access to packages fails or there are no packages found
     */
 
    Collection<FileStandardsSource> getStandardPackages() throws Exception;

}
