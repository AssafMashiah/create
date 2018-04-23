package com.t2k.cgs.utils.standards.metadata;

import com.t2k.cgs.utils.standards.model.PackageDetails;
import com.t2k.cgs.utils.standards.stringProcessing.NullStringProcessor;
import com.t2k.cgs.utils.standards.stringProcessing.StringProcessor;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import static org.testng.Assert.*;
import static org.mockito.Mockito.*;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 11:15 AM
 */
@Test
public class PackageDetailsRetrieverTest {

    private static final String SIMPLE_TREE_TXT =
            "FRANCE\t\tEDITIS\tMATH\t\tFR\t\t\tFrance - Programme et progression" +
             "FRANCE\t\tEDITIS\tMATH\tFOURTH\tFR.4\tFR\tFR_D\tFrance - Programme et progression – Mathématiques CM1";

    private static final String TREE_TXT =
            "USA\tTexas\tTEKS\tLANGUAGE_ARTS\t\t110\t\t\tEnglish Language Arts and Reading\n" +
            "USA\tTexas\tTEKS\tLANGUAGE_ARTS\tFIRST\t110.12\t110\t\tEnglish Language Arts and Reading, Grade 1\n" +
            "USA\tTexas\tTEKS\tLANGUAGE_ARTS\tFIRST\t110.12.1\t110.12\t\tReading/Beginning Reading Skills/Print Awareness. Students understand how English is written and printed. Students are expected to:\n" +
            "USA\tTexas\tTEKS\tLANGUAGE_ARTS\tFIRST\t110.12.1.A\t110.12.1\t1.1.A\trecognize that spoken words are represented in written English by specific sequences of letters.\n" +
            "USA\tTexas\tTEKS\tLANGUAGE_ARTS\tFIRST\t110.12.1.B\t110.12.1\t1.1.B\tidentify upper- and lower-case letters.\n" +
            "USA\tTexas\tTEKS\tLANGUAGE_ARTS\tFIRST\t110.12.1.C\t110.12.1\t1.1.C\tsequence the letters of the alphabet.\n" +
            "USA\tTexas\tTEKS\tLANGUAGE_ARTS\tFIRST\t110.12.1.D\t110.12.1\t1.1.D\trecognize the distinguishing features of a sentence (e.g., capitalization of first word, ending punctuation).\n" +
            "USA\tTexas\tTEKS\tLANGUAGE_ARTS\tFIRST\t110.12.1.E\t110.12.1\t1.1.E\tread texts by moving from top to bottom of the page and tracking words from left to right with return sweep.\n" +
            "USA\tTexas\tTEKS\tLANGUAGE_ARTS\tFIRST\t110.12.1.F\t110.12.1\t1.1.F\tidentify the information that different parts of a book provide (e.g., title, author, illustrator, table of contents).\n";

    private PackageDetailsRetrieverImpl retriever;

    @BeforeMethod
    private void initTests() {
        retriever = new PackageDetailsRetrieverImpl();
        retriever.setCountryStringProcessor(new NullStringProcessor());
        retriever.setNameStringProcessor(new NullStringProcessor());
        retriever.setStateStringProcessor(new NullStringProcessor());
        retriever.setSubjectAreaStringProcessor(new NullStringProcessor());
    }

    @Test
    public void basicTest() throws Exception {
        String date = "DaTe";
        PackageDetails details = retriever.getPackageDetails(SIMPLE_TREE_TXT,null,date);

        assertNotNull(details);
        assertEquals(details.getName(), "EDITIS");
        assertEquals(details.getSubjectArea(), "MATH");
        assertEquals(details.getCountry(), "FRANCE");
        assertNull(details.getState());
        assertEquals(details.getCreated(), date);
        assertNull(details.getVersion());
        assertEquals(details.getRootId(),"FR");

    }

    @Test
    public void processorsTest() throws Exception {

        String name = "AAAA";
        String country = "BBBB";
        String state = "VCVV";
        String subjectArea = "ASADF";

        StringProcessor countryProcessor = mock(StringProcessor.class);
        StringProcessor stateProcessor = mock(StringProcessor.class);
        StringProcessor nameProcessor = mock(StringProcessor.class);
        StringProcessor subjectAreaProcessor = mock(StringProcessor.class);

        when(countryProcessor.processString(anyString())).thenReturn(country);
        when(stateProcessor.processString(anyString())).thenReturn(state);
        when(nameProcessor.processString(anyString())).thenReturn(name);
        when(subjectAreaProcessor.processString(anyString())).thenReturn(subjectArea);

        retriever.setCountryStringProcessor(countryProcessor);
        retriever.setNameStringProcessor(nameProcessor);
        retriever.setStateStringProcessor(stateProcessor);
        retriever.setSubjectAreaStringProcessor(subjectAreaProcessor);

        PackageDetails details = retriever.getPackageDetails(TREE_TXT,null,null);

        assertEquals(details.getCountry(),country);
        assertEquals(details.getState(),state);
        assertEquals(details.getName(),name);
        assertEquals(details.getSubjectArea(),subjectArea);
        assertEquals(details.getRootId(),"110");

        verify(countryProcessor).processString("USA");
        verify(stateProcessor).processString("Texas");
        verify(nameProcessor).processString("TEKS");
        verify(subjectAreaProcessor).processString("LANGUAGE_ARTS");

    }

}
