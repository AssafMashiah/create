package com.t2k.cgs.utils.standards.dao;

import com.t2k.cgs.utils.standards.model.PackageDetails;
import org.springframework.dao.DataAccessException;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/21/12
 * Time: 10:21 AM
 */
public interface StandardsTargetDao {


    public Integer getExistingVersionMinor(PackageDetails details);

    public String getLatestVersion(PackageDetails details) throws DataAccessException;

    public boolean checkIfVersionExists(PackageDetails details) throws DataAccessException;

    public void saveNewVersion(String jsonStr, PackageDetails details) throws DataAccessException;

    public void removeStandardsPackage(PackageDetails details) throws DataAccessException;

    public String getStandardsPackage(String packageName, String subjectArea, String version) throws Exception;

}
