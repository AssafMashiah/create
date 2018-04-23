package com.t2k.cgs.utils.standards.stringProcessing;

import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 9:37 AM
 */
public class DictionaryReplacingProcessor implements StringProcessor {

    private Map<String,String> dictionary;

    @Override
    public String processString(String str) {
        if(dictionary.containsKey(str)){
            return dictionary.get(str);
        } else {
            return str;
        }
    }

    ///////////////////////
    // Injection Setters //
    ///////////////////////


    public void setDictionary(Map<String, String> dictionary) {
        this.dictionary = dictionary;
    }
}
