package com.t2k.cgs.utils.standards.validators;

import com.t2k.cgs.utils.standards.model.StandardNode;
import org.springframework.beans.factory.annotation.Required;

import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 5:33 PM
 */
public class ValidationSequence implements StandardsValidator {

    List<StandardsValidator> validatorList;
    private boolean isInitialized = false;

    @Override
    public void initialize() {
       for(StandardsValidator validator : validatorList) {
           validator.initialize();
       }

       isInitialized = true;
    }

    @Override
    public void validate(StandardNode standardsTree, List<StandardNode> standardsList) {

        if(!isInitialized) throw new InternalError("initialization() method never called");

        for(StandardsValidator validator : validatorList) {
            validator.validate(standardsTree,standardsList);
        }
    }

    @Override
    public boolean hadErrors() {
        boolean hadErrors = false;
        for(StandardsValidator validator : validatorList) {
                 hadErrors |= validator.hadErrors();
        }

        return hadErrors;
    }

    @Override
    public Collection<String> getErrorMessages() {
        List<String> errorMessages = new LinkedList<String>();
        for(StandardsValidator validator : validatorList) {
            errorMessages.addAll(validator.getErrorMessages());
        }
        return errorMessages;
    }

    ///////////////////////
    // Injection Setters //
    ///////////////////////

    @Required
    public void setValidatorList(List<StandardsValidator> validatorList) {
        this.validatorList = validatorList;
    }
}
