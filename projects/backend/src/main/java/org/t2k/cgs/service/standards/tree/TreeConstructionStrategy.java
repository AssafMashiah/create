package org.t2k.cgs.service.standards.tree;

import org.t2k.cgs.domain.model.standards.StandardNode;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/27/12
 * Time: 12:22 PM
 */
public interface TreeConstructionStrategy {

    StandardNode constructTree(List<StandardNode> nodes) throws Exception;
}