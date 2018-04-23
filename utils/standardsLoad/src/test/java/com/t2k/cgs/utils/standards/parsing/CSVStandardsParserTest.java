package com.t2k.cgs.utils.standards.parsing;

import com.t2k.cgs.utils.standards.errors.StandardsParsingException;
import com.t2k.cgs.utils.standards.model.StandardNode;
import com.t2k.cgs.utils.standards.stringProcessing.SpecialCharactersDecoderProcessor;
import com.t2k.cgs.utils.standards.stringProcessing.StringProcessor;
import org.apache.log4j.Logger;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.testng.Assert.*;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/27/12
 * Time: 11:55 AM
 */
@Test
public class CSVStandardsParserTest {

    private static Logger logger = Logger.getLogger(CSVStandardsParserTest.class);
    private static final String SIMPLE_CSV_TXT =
            "FRANCE\t\tEDITIS\tMATH\t\tFR\t\t\t\tFrance - Programme et progression\n" +
            "FRANCE\t\tEDITIS\tMATH\tFOURTH\tFR.4\tFR\tFR_D\t\tFrance - Programme et progression – Mathématiques CM1" ;

    private static final String COMPLEX_CSV_TXT =
            "SINGAPORE\t\tSLO\tMATH\t\tSM\t\t\t\tMathematics\n" +
            "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3\tSM\t\t\tMathematics, Primary 3\n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1\tSM.3\tFALSE \t\tNumbers To 10 000\n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1.1\tSM.3.1\tFALSE\t\tCounting. Pupils will be able to:\n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1.1.1\tSM.3.1.1\tFALSE\t\tcount in ones, tens, hundreds and thousands, read and write their corresponding numbers and number words\n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1.1.2\tSM.3.1.1\tFALSE\t\trecognise concrete representation of numbers to 10 000, \n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1.1.3\tSM.3.1.1\tFALSE\t\trecognise that 10 hundreds = 1 thousand\n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1.1.4\tSM.3.1.1\tFALSE\t\ttranslate numbers from (i) models to words and figures (ii) figures to words (iii) words to figures \n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1.1.5\tSM.3.1.1\tFALSE\t\trecognise and interpret sentences associated with tens and ones\n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1.2\tSM.3.1\tFALSE\t\tPlace Value. Pupils will be able to:\n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1.2.1\tSM.3.1.2\tFALSE\t\tRepresent numbers as thousands, hundreds, tens and ones in a place value table\n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1.2.2\tSM.3.1.2\tFALSE\t\tShow concrete representations with place value tables in thousands, hundreds, tens and ones given a number to 10 000\n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1.2.3\tSM.3.1.2\tFALSE\t\tRead and write numerals given a set of concrete representation and vice versa from place value tables\n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1.2.4\tSM.3.1.2\tTrue\t\tState the place and value of each digit in a number\n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1.2.5\tSM.3.1.2\tTrue\t\tWrite a 4-digit number in terms of thousands, hundreds, tens and ones\n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3.1.2.6\tSM.3.1.2\tTrue\t\tWrite a 4-digit number as the sum of the values of each digit in the number\n";

    private static final String ESCAPING_CHARACTERS_CSV_TXT =
            "SINGAPORE\t\tSLO\tMATH\t\tSM\t\t\t\tMathematics\n" +
                    "SINGAPORE\t\tSLO\tMATH\tTHIRD\tSM.3\tSM\t\t\t Special Quotes: “”\n" ;





    private CSVStandardsParser standardsParser;

    @BeforeMethod
    private void initTests() {
        standardsParser = new CSVStandardsParser();
        standardsParser.setDescriptionProcessor(new SpecialCharactersDecoderProcessor());
        standardsParser.setGradeLevelProcessor(new SpecialCharactersDecoderProcessor());
    }

    @Test
    public void testSimple() throws Exception {

        List<StandardNode> nodes = this.standardsParser.parseStandards(SIMPLE_CSV_TXT);

        assertNotNull(nodes);
        assertEquals(nodes.size(), 2);

        StandardNode root = getNodeById(nodes, "FR");
        StandardNode child = getNodeById(nodes, "FR.4");

        assertNull(root.getGradeLevel());
        assertNull(root.getDescription());
        assertFalse(root.isTaggable());
        assertNull(root.getParentPedagogicalId());

        assertEquals(child.getGradeLevel(), "FOURTH");
        assertEquals(child.getParentPedagogicalId(), "FR");
        assertNotNull(child.getDescription());
        assertEquals(child.isTaggable(), false);

    }

    @Test
    public void testComplex() throws Exception {

        List<StandardNode> nodes = this.standardsParser.parseStandards(COMPLEX_CSV_TXT);

        assertNotNull(nodes);

        assertEquals(nodes.size(), 16);


        StandardNode root = getNodeById(nodes, "SM");


        assertNull(root.getGradeLevel());
        assertNull(root.getDescription());
        assertFalse(root.isTaggable());
        assertNull(root.getParentPedagogicalId());

        assertEquals(countDescriptions(nodes), 15);
        assertEquals(countTaggables(nodes), 3);

    }


    @Test
    public void escapingCharactersProcessingTest() throws StandardsParsingException {
        List<StandardNode> nodes = this.standardsParser.parseStandards(ESCAPING_CHARACTERS_CSV_TXT);
        for (StandardNode node : nodes)
            logger.debug(node.getDescription());
    }


    @Test
        public void testStringProcessing() throws Exception {

            final String gradeLevel = "MMMM";
            final String description = "BOOM";

            StringProcessor gradeLevelP = mock(StringProcessor.class);
            StringProcessor descriptionLevelP = mock(StringProcessor.class);

            standardsParser.setGradeLevelProcessor(gradeLevelP);
            standardsParser.setDescriptionProcessor(descriptionLevelP);

            when(gradeLevelP.processString(anyString())).thenReturn(gradeLevel);
            when(descriptionLevelP.processString(anyString())).thenReturn(description);

            List<StandardNode> nodes = standardsParser.parseStandards(SIMPLE_CSV_TXT);

            StandardNode child = getNodeById(nodes, "FR.4");

            assertEquals(child.getGradeLevel(), gradeLevel);
            assertEquals(child.getDescription(), description);

            verify(gradeLevelP).processString("FOURTH");
            verify(descriptionLevelP).processString("France - Programme et progression – Mathématiques CM1");

        }


    private StandardNode getNodeById(List<StandardNode> nodes, String pedagogicalId) {
        for (StandardNode node : nodes) {
            if (node.getPedagogicalId().equals(pedagogicalId)) {
                return node;
            }
        }
        return null;
    }


    private int countDescriptions(List<StandardNode> nodes){
        int counter = 0;
        for(StandardNode node: nodes){
            if(node.getDescription() != null) counter++;
        }
        return counter;
    }

    private int countTaggables(List<StandardNode> nodes){
            int counter = 0;
            for(StandardNode node: nodes){
                if(node.isTaggable()) counter++;
            }
            return counter;
        }


}
