package org.t2k.cgs.service.standards.parser;

import org.t2k.cgs.domain.model.standards.StandardPackageDetails;
import org.t2k.cgs.domain.model.standards.StandardNode;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/21/12
 * Time: 10:46 AM
 */
public class SimpleJSONConverter implements JSONConverter {

    @Override
    public String convertToJson(StandardNode standardsTree, StandardPackageDetails packageDetails) {
        StringBuilder jsonBuilder = new StringBuilder();

        jsonBuilder.append("{");
        jsonBuilder.append("\"name\":\"" + packageDetails.getName() + "\",");
        jsonBuilder.append("\"description\":\"" + packageDetails.getDescription() + "\",");
        jsonBuilder.append("\"subjectArea\":\"" + packageDetails.getSubjectArea() + "\",");
        if (packageDetails.getPurpose() != null) {
            jsonBuilder.append("\"purpose\":\"" + packageDetails.getPurpose() + "\",");
        }
        jsonBuilder.append("\"country\":\"" + packageDetails.getCountry() + "\",");
        if (packageDetails.getState() != null) {
            jsonBuilder.append("\"state\":\"" + packageDetails.getState() + "\",");
        }
        jsonBuilder.append("\"version\":\"" + packageDetails.getVersion() + "\",");
        jsonBuilder.append("\"created\":\"" + packageDetails.getCreated() + "\",");
        jsonBuilder.append("\"isLatest\":" + packageDetails.isLatest() + ",");
        jsonBuilder.append("\"standards\" :");

        outputStandards(standardsTree, jsonBuilder);

        jsonBuilder.append("}");

        return jsonBuilder.toString();
    }

    private void outputStandards(StandardNode node, StringBuilder out) {
        out.append("{");
        out.append("\"pedagogicalId\":\"" + node.getPedagogicalId() + "\",");
        if (node.getName() != null) {
            String name = node.getName().replace("\"", "\\\"");
            out.append("\"name\":\"" + name + "\",");
        }

        if (node.getGradeLevel() != null) {
            out.append("\"gradeLevel\":\"" + node.getGradeLevel() + "\",");
        }
        out.append("\"taggable\":\"" + node.isTaggable() + "\",");


        String description = "";
        if (node.getDescription() != null) {
            //need to escape '"' symbols in the description
            description = node.getDescription().replace("\"", "\\\"");
        }
        out.append("\"description\":\"" + description + "\"");

        if (node.getChildren().size() > 0) {

            out.append(",\"children\":[");

            boolean isFirstChild = true;
            for (StandardNode child : node.getChildren()) {
                if (!isFirstChild) {
                    out.append(",");
                }
                outputStandards(child, out);
                isFirstChild = false;
            }

            out.append("]");
        }

        out.append("}");
    }
}