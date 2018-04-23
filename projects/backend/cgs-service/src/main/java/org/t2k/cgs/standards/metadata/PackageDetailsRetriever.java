package org.t2k.cgs.standards.metadata;

import org.t2k.cgs.model.standards.StandardPackageDetails;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 10:49 AM
 */
public interface PackageDetailsRetriever {

    StandardPackageDetails getPackageDetails(String csvString, String purpose, String date) throws Exception;
}