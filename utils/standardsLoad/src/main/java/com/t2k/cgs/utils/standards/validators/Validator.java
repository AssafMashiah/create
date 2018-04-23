package com.t2k.cgs.utils.standards.validators;

import java.util.Collection;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/9/13
 * Time: 2:28 PM
 */
public interface Validator {
    void initialize();

    boolean hadErrors();

    Collection<String> getErrorMessages();
}
