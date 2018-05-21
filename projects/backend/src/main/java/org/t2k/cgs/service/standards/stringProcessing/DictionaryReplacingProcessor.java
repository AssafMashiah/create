package org.t2k.cgs.service.standards.stringProcessing;

import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 9:37 AM
 */
public class DictionaryReplacingProcessor implements StringProcessor {

    private Map<String, String> dictionary;

    public DictionaryReplacingProcessor(Map<String, String> dictionary) {
        this.dictionary = dictionary;
    }

    @Override
    public String processString(String str) {
        if (dictionary.containsKey(str)) {
            return dictionary.get(str);
        } else {
            return str;
        }
    }
}
