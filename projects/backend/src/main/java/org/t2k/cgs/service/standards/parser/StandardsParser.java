package org.t2k.cgs.service.standards.parser;

import org.t2k.cgs.domain.model.standards.StandardNode;

import java.io.IOException;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/27/12
 * Time: 11:50 AM
 */
public interface StandardsParser {

    List<StandardNode> parseStandards(String csvString) throws IOException;
}