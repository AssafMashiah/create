package com.t2k.cgs.utils.standards.stringProcessing;

import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.testng.Assert.assertEquals;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 9:40 AM
 */
@Test
public class StringProcessorsTest {


    @BeforeMethod
    private void initTests() {

    }


    @Test
    public void dictionaryProcessor() throws Exception {

        DictionaryReplacingProcessor processor = new DictionaryReplacingProcessor();

        Map<String, String> dictionary = new HashMap<String, String>();
        dictionary.put("micha", "MICHA");
        dictionary.put("ophir", "OPHIR");

        processor.setDictionary(dictionary);

        assertEquals(processor.processString("micha"), "MICHA");
        assertEquals(processor.processString("ophir"), "OPHIR");
        assertEquals(processor.processString("eran"), "eran");

    }


    @Test
    public void nullProcessor() throws Exception {
        NullStringProcessor processor = new NullStringProcessor();

        assertEquals(processor.processString("micha"), "micha");
        assertEquals(processor.processString("ophir"), "ophir");
        assertEquals(processor.processString("eran"), "eran");


    }

    @Test
    public void lowerCaseProcessor() throws Exception {
        LowerCaseProcessor processor = new LowerCaseProcessor();

        assertEquals(processor.processString("MICHA"), "micha");
        assertEquals(processor.processString("OPHIR"), "ophir");
        assertEquals(processor.processString("ERAN"), "eran");


    }

    @Test
    public void sequenceProcessor() throws Exception {

        StringProcessingSequence processor = new StringProcessingSequence();
        List<StringProcessor> list = new ArrayList<StringProcessor>();

        DictionaryReplacingProcessor dprocessor = new DictionaryReplacingProcessor();

        Map<String, String> dictionary = new HashMap<String, String>();
        dictionary.put("micha", "OPHIR");
        dictionary.put("ophir", "MICHA");

        dprocessor.setDictionary(dictionary);

        list.add(dprocessor);
        list.add(new LowerCaseProcessor());

        processor.setProcessingList(list);

        assertEquals(processor.processString("micha"), "ophir");
        assertEquals(processor.processString("ophir"), "micha");
        assertEquals(processor.processString("eran"), "eran");
        assertEquals(processor.processString("ERAN"), "eran");


    }

}
