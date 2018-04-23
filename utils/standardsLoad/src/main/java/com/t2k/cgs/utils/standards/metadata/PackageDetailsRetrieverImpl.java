package com.t2k.cgs.utils.standards.metadata;

import com.t2k.cgs.utils.standards.errors.PackageDetailsParsingException;
import com.t2k.cgs.utils.standards.model.PackageDetails;
import com.t2k.cgs.utils.standards.stringProcessing.StringProcessor;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.util.StringUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 11:13 AM
 */
public class PackageDetailsRetrieverImpl implements PackageDetailsRetriever {


    private static final String UTF8_BOM = "\uFEFF";

    private StringProcessor countryStringProcessor;
    private StringProcessor stateStringProcessor;
    private StringProcessor nameStringProcessor;
    private StringProcessor subjectAreaStringProcessor;
    private StringProcessor descriptionProcessor;


    @Override
    public PackageDetails getPackageDetails(String csvString, String purpose, String date) throws PackageDetailsParsingException {

        PackageDetails packageDetails = new PackageDetails();

        try {
            BufferedReader bufferedReader = new BufferedReader(new StringReader(csvString));

            String firstLine = bufferedReader.readLine().trim();
            //remove bom - if exists
            firstLine = firstLine.replace(UTF8_BOM,"");

            String[] lineParts = firstLine.split("\t");
            lineParts = StringUtils.trimArrayElements(lineParts);

            if (StringUtils.hasText(lineParts[0])) {
                packageDetails.setCountry(countryStringProcessor.processString(lineParts[0]));
            }

            if (StringUtils.hasText(lineParts[1])) {
                packageDetails.setState(stateStringProcessor.processString(lineParts[1]));
            }

            if (StringUtils.hasText(lineParts[2])) {
                packageDetails.setName(nameStringProcessor.processString(lineParts[2]));
            }

            if (StringUtils.hasText(lineParts[3])) {
                packageDetails.setSubjectArea(subjectAreaStringProcessor.processString(lineParts[3]));
            }

            if (StringUtils.hasText(lineParts[5])) {
                packageDetails.setRootId(lineParts[5]);
            } else {
                throw new PackageDetailsParsingException("Could not find rootId for package details");
            }

            if(StringUtils.hasText(lineParts[8])) {
                packageDetails.setDescription(lineParts[8]);
            } else {
                //If not description defined, fallback to the package name
                packageDetails.setDescription(packageDetails.getName());
            }

            packageDetails.setPurpose(purpose);

            packageDetails.setCreated(date);

        } catch (IOException e) {
            throw new PackageDetailsParsingException("failed reading the content", e);
        }

        return packageDetails;
    }

    ///////////////////////
    // Injection Setters //
    ///////////////////////

    @Required
    public void setCountryStringProcessor(StringProcessor countryStringProcessor) {
        this.countryStringProcessor = countryStringProcessor;
    }

    @Required
    public void setStateStringProcessor(StringProcessor stateStringProcessor) {
        this.stateStringProcessor = stateStringProcessor;
    }

    @Required
    public void setNameStringProcessor(StringProcessor nameStringProcessor) {
        this.nameStringProcessor = nameStringProcessor;
    }

    @Required
    public void setSubjectAreaStringProcessor(StringProcessor subjectAreaStringProcessor) {
        this.subjectAreaStringProcessor = subjectAreaStringProcessor;
    }

    @Required
    public void setDescriptionStringProcessor(StringProcessor descriptionProcessor) {
        this.descriptionProcessor = descriptionProcessor;
    }
}
