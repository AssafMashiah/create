package com.t2k.cgs.utils.standards.stringProcessing;

import org.springframework.beans.factory.annotation.Required;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 10:41 AM
 */
public class StringProcessingSequence implements StringProcessor {

    private List<StringProcessor> processingList;


    @Override
    public String processString(String str) {

        String result = str;

        for(StringProcessor sp : processingList) {
            result = sp.processString(result);
        }

        return result;
    }

    ///////////////////////
    // Injection Setters //
    ///////////////////////

    @Required
    public void setProcessingList(List<StringProcessor> processingList) {
        this.processingList = processingList;
    }
}
