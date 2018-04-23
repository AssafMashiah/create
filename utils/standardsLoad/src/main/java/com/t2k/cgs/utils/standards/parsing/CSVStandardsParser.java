package com.t2k.cgs.utils.standards.parsing;

import com.t2k.cgs.utils.standards.errors.StandardsParsingException;
import com.t2k.cgs.utils.standards.model.StandardNode;
import com.t2k.cgs.utils.standards.stringProcessing.StringProcessor;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.util.StringUtils;

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
public class CSVStandardsParser implements StandardsParser {

    private StringProcessor descriptionProcessor;
    private StringProcessor nameProcessor;
    private StringProcessor gradeLevelProcessor;


    @Override
    public List<StandardNode> parseStandards(String csvString) throws StandardsParsingException {

        BufferedReader bufferedReader = new BufferedReader(new StringReader(csvString));
        StandardNode firstNode = null;
        List<StandardNode> standards = new LinkedList<StandardNode>();
        int orderCounter = 0;

        //create standards Nodes
        try {

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
        } catch (IOException e) {
            throw new StandardsParsingException("failed reading the content", e);
        }

        //create root node
        StandardNode root = new StandardNode();
        root.setPedagogicalId(firstNode.getParentPedagogicalId());
        standards.add(root);


        return standards;
    }

    ///////////////////////
    // Injection Setters //
    ///////////////////////

    @Required
    public void setNameProcessor(StringProcessor nameProcessor) {
        this.nameProcessor = nameProcessor;
    }

    @Required
    public void setDescriptionProcessor(StringProcessor descriptionProcessor) {
        this.descriptionProcessor = descriptionProcessor;
    }

    @Required
    public void setGradeLevelProcessor(StringProcessor gradeLevelProcessor) {
        this.gradeLevelProcessor = gradeLevelProcessor;
    }
}
