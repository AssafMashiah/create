package org.t2k.cgs.service.standards.parser;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.t2k.cgs.domain.model.standards.StandardNode;
import org.t2k.cgs.service.standards.stringProcessing.LowerCaseProcessor;
import org.t2k.cgs.service.standards.stringProcessing.SpecialCharactersDecoderProcessor;
import org.t2k.cgs.service.standards.stringProcessing.StringProcessor;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.LinkedList;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/27/12
 * Time: 11:51 AM
 */
@Service("standardsParser")
public class CSVStandardsParser implements StandardsParser {

    private StringProcessor descriptionProcessor;
    private StringProcessor nameProcessor;
    private StringProcessor gradeLevelProcessor;

    public CSVStandardsParser() {
        this.descriptionProcessor = new SpecialCharactersDecoderProcessor();
        this.nameProcessor = new SpecialCharactersDecoderProcessor();
        this.gradeLevelProcessor = new LowerCaseProcessor();
    }

    @Override
    public List<StandardNode> parseStandards(String csvString) throws IOException {

        BufferedReader bufferedReader = new BufferedReader(new StringReader(csvString));
        StandardNode firstNode = null;
        List<StandardNode> standards = new LinkedList<StandardNode>();
        int orderCounter = 0;

        //create standards Nodes

            //Ignore first line as it describes the package
            bufferedReader.readLine();

            String line;
            boolean isFirstNode = true;
            while ((line = bufferedReader.readLine()) != null) {

                // we add an artificial non empty column, to avoid the split trimming empty columns at the end
                String[] lineParts = (line + "\t|").split("\t");
                lineParts = StringUtils.trimArrayElements(lineParts);

                StandardNode node = new StandardNode();
                node.setOrderIndex(++orderCounter); //set order and inc counter

                if (StringUtils.hasText(lineParts[4])) {
                    node.setGradeLevel(gradeLevelProcessor.processString(lineParts[4]));
                }

                if (StringUtils.hasText(lineParts[5])) {
                    node.setPedagogicalId(lineParts[5]);
                }

                if (StringUtils.hasText(lineParts[6])) {
                    node.setParentPedagogicalId(lineParts[6]);
                }

                if (StringUtils.hasText(lineParts[7])) {
                    node.setTaggable(Boolean.parseBoolean(lineParts[7]));
                }

                if (StringUtils.hasText(lineParts[8])) {
                    node.setName(nameProcessor.processString(lineParts[8]));
                }

                if (StringUtils.hasText(lineParts[9])) {
                    node.setDescription(descriptionProcessor.processString(lineParts[9]));
                }

                standards.add(node);

                if (isFirstNode) {
                    isFirstNode = false;

                    firstNode = node;
                }

            }

        //create root node
        StandardNode root = new StandardNode();
        root.setPedagogicalId(firstNode.getParentPedagogicalId());
        standards.add(root);

        return standards;
    }
}