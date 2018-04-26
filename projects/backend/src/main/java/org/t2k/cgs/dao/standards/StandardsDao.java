package org.t2k.cgs.dao.standards;

import com.mongodb.DBObject;
import com.mongodb.DBRef;
import org.springframework.dao.DataAccessException;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.classification.StandardPackage;
import org.t2k.cgs.model.standards.StandardPackageDetails;
import org.t2k.sample.dao.exceptions.DaoException;

/**
 * Created by elad.avidan on 22/07/2014.
 */
public interface StandardsDao {

    /**
     * Get full standard package by package and subject area, version is optional
     *
     * @param packageName
     * @param subjectArea
     * @param version     - if null the latest version will be returned
     * @return
     * @throws org.springframework.dao.DataAccessException
     */
    String getStandardsPackage(String packageName, String subjectArea, String version) throws DataAccessException, DsException;

    /**
     * Get all latest standard packages
     *
     * @return
     * @throws DataAccessException
     */
    String getStandardPackagesHeaders() throws DataAccessException;

    DBObject getStandardsPackageFullInfo(String packageName, String subjectArea, String version) throws DaoException;

    boolean saveStandardDBObject(DBObject standard, boolean isLatest) throws DaoException;

    DBRef getDBRefByStandard(DBObject standard) throws DaoException;

    String getLatestVersion(DBObject standardPackage) throws DaoException;

    StandardPackage getStandardsPackageObject(String packageName, String subjectArea, String version) throws DsException;

    void deleteStandardPackageAllVersions(String packName, String area);

    Integer getExistingVersionMinor(StandardPackageDetails details);

    String getLatestVersion(StandardPackageDetails details) throws DataAccessException;

    boolean checkIfVersionExists(StandardPackageDetails details) throws DataAccessException;

    void saveNewVersion(String jsonStr, StandardPackageDetails details) throws DataAccessException;

    void removeStandardsPackage(StandardPackageDetails details) throws DataAccessException;
}