package com.t2k.cgs.utils.standards.validators;

import com.t2k.cgs.utils.standards.model.StandardNode;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 5:15 PM
 */
public interface StandardsValidator extends Validator {

    void validate(StandardNode standardsTree, List<StandardNode> listOfStandards);

}
