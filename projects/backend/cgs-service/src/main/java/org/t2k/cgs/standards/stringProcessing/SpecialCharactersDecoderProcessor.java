package org.t2k.cgs.standards.stringProcessing;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/29/12
 * Time: 4:20 PM
 */
public class SpecialCharactersDecoderProcessor implements StringProcessor {

    @Override
    public String processString(String str) {
        String value = str;

        //replace &gt.
        value = value.replace("&gt.",">");
        //replace &lt.
        value = value.replace("&lt.","<");
        //replace &quote;
        value = value.replace("&quot;","'");
        //replace \u201C
        value =  value.replace("\u201C","\"");
        //replace \u201D
        value =  value.replace("\u201D","\"");
        return value;
    }
}
