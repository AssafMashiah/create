package com.t2k.cgs.utils.standards.parsing;

import com.t2k.cgs.utils.standards.errors.StandardsParsingException;
import com.t2k.cgs.utils.standards.errors.TreeParsingException;
import com.t2k.cgs.utils.standards.model.StandardNode;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/27/12
 * Time: 11:50 AM
 */
public interface StandardsParser {

    List<StandardNode> parseStandards(String csvString) throws StandardsParsingException;

}
