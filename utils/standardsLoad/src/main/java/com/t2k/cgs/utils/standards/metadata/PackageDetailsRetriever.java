package com.t2k.cgs.utils.standards.metadata;

import com.t2k.cgs.utils.standards.errors.PackageDetailsParsingException;
import com.t2k.cgs.utils.standards.model.PackageDetails;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 10:49 AM
 */
public interface PackageDetailsRetriever {

    PackageDetails getPackageDetails(String csvString, String purpose, String date) throws PackageDetailsParsingException;

}
