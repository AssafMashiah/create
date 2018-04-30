package org.t2k.cgs.service.standards.stringProcessing;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 9:46 AM
 */
public class NullStringProcessor implements StringProcessor {

    @Override
    public String processString(String str) {
        return str;
    }
}
