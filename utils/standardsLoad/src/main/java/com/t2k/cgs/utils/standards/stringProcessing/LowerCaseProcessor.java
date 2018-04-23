package com.t2k.cgs.utils.standards.stringProcessing;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 10:41 AM
 */
public class LowerCaseProcessor implements StringProcessor {

    @Override
    public String processString(String str) {
        return str.toLowerCase();
    }
}
