package com.t2k.cgs.utils.standards.parsing;

import com.t2k.cgs.utils.standards.model.PackageDetails;
import com.t2k.cgs.utils.standards.model.StandardNode;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/21/12
 * Time: 10:45 AM
 */
public interface JSONConverter {

    String convertToJson(StandardNode standardsTree, PackageDetails packageDetails);

}
