package com.t2k.cgs.utils.standards.validators;

import com.t2k.cgs.utils.standards.model.StandardNode;

import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 5:25 PM
 */
public class UniquePedagogicalIdValidator implements StandardsValidator {

    private Set<String> encounteredPedagogicalIds;
    private List<String> errors;
    private boolean isInitialized = false;

    @Override
    public void initialize() {
        this.errors = new LinkedList<String>();
        this.encounteredPedagogicalIds = new HashSet<String>();
        isInitialized = true;
    }

    @Override
    public void validate(StandardNode standardsTree, List<StandardNode> listOfStandards) {

        if(!isInitialized) throw new InternalError("UniquePedagogicalIdValidator was not initialized");

        for (StandardNode node : listOfStandards) {
            if (encounteredPedagogicalIds.contains(node.getPedagogicalId())) {
                this.errors.add("Found duplicate pedagogicalId '" + node.getPedagogicalId() + "'");
            } else {
                encounteredPedagogicalIds.add(node.getPedagogicalId());
            }
        }
    }

    @Override
    public boolean hadErrors() {
        return this.errors.size() > 0;
    }

    @Override
    public Collection<String> getErrorMessages() {
        return this.errors;
    }


}
