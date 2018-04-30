package org.t2k.cgs.domain.usecases.standards;

import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.lock.LockUser;
import org.t2k.cgs.domain.model.classification.StandardsChange;
import org.t2k.cgs.domain.model.classification.StandardsDiff;
import org.t2k.cgs.domain.model.course.CourseCGSObject;
import org.t2k.cgs.domain.model.standards.StandardPackageDetails;
import org.t2k.cgs.domain.model.standards.StandardsDeleteResponse;

import java.io.IOException;
import java.util.List;

/**
 * Created by elad.avidan on 23/07/2014.
 */
public interface StandardsService {

    void loadStandards(String standardPackageText, StandardPackageDetails standardPackageDetails) throws Exception;

    List<StandardsDeleteResponse> getStandardsDeleteResponseList(String packageName, String subjectArea);

    String getStandardsPackage(String packageName, String subjectArea, String version) throws DsException;

    String getStandardPackagesHeaders() throws DsException;

    StandardsDiff getDiff(String packageName, String subjectArea, String oldVersion, String newVersion) throws DsException;

    StandardsChange prepareForStandardsPackageUpdate(LockUser lockUser, int publisherId, String courseId, String packageName, String subjectArea, String version) throws DsException;

    void updateStandardsPackage(LockUser lockUser, int publisherId, String courseId, String packageName, String subjectArea, String version) throws DsException, IOException;

    StandardsChange prepareForStandardsPackageDelete(LockUser lockUser, int publisherId, String courseId, String packageName, String subjectArea) throws DsException;

    void deleteStandardsPackage(LockUser lockUser, int publisherId, String courseId, String packageName, String subjectArea) throws DsException, IOException;

    void abortStandardsPackageChange(LockUser lockUser, int publisherId, String courseId, String packageName, String subjectArea) throws DsException;

    void deleteStandardsPackage(String packName, String area);

    List<CourseCGSObject> getCoursesByStandardPackage(String packageName, String subjectArea);
}