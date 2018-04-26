package org.t2k.cgs.standards.stringProcessing;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 10:41 AM
 */
public class StringProcessingSequence implements StringProcessor {

    private List<StringProcessor> processingList;

    public StringProcessingSequence(List<StringProcessor> processingList) {
        this.processingList = processingList;
    }

    @Override
    public String processString(String str) {
        String result = str;
        for (StringProcessor sp : processingList) {
            result = sp.processString(result);
        }

        return result;
    }
}
