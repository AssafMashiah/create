package com.t2k.cgs.utils.standards.tree;

import com.t2k.cgs.utils.standards.errors.TreeParsingException;
import com.t2k.cgs.utils.standards.model.StandardNode;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/27/12
 * Time: 12:22 PM
 */
public interface TreeConstructionStrategy {

    StandardNode constructTree(List<StandardNode> nodes) throws TreeParsingException;

}
