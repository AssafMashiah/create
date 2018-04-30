package org.t2k.cgs.service.standards.validators;

import org.t2k.cgs.domain.model.standards.StandardNode;

import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 5:25 PM
 */
public class UniquePedagogicalIdValidator {

    public List<String> validate(List<StandardNode> listOfStandards) {
        List<String> errors = new LinkedList<>();
        Set<String> encounteredPedagogicalIds = new HashSet<>();

        for (StandardNode node : listOfStandards) {
            if (encounteredPedagogicalIds.contains(node.getPedagogicalId())) {
                errors.add(String.format("Found duplicate pedagogicalId: '%s'", node.getPedagogicalId()));
            } else {
                encounteredPedagogicalIds.add(node.getPedagogicalId());
            }
        }

        return errors;
    }
}