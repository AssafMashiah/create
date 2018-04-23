package org.t2k.cgs.standards.parser;

import org.t2k.cgs.model.standards.StandardNode;
import org.t2k.cgs.model.standards.StandardPackageDetails;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/21/12
 * Time: 10:45 AM
 */
public interface JSONConverter {

    String convertToJson(StandardNode standardsTree, StandardPackageDetails packageDetails);

}
