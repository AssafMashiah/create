package org.t2k.cgs.service.standards;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.t2k.cgs.domain.model.standards.StandardPackageDetails;
import org.t2k.cgs.domain.usecases.standards.PackageDetailsRetriever;
import org.t2k.cgs.service.standards.stringProcessing.*;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 11:13 AM
 */
@Service
public class PackageDetailsRetrieverImpl implements PackageDetailsRetriever {

    private final String UTF8_BOM = "\uFEFF";

    private StringProcessor countryStringProcessor;
    private StringProcessor stateStringProcessor;
    private StringProcessor nameStringProcessor;
    private StringProcessor subjectAreaStringProcessor;

    public PackageDetailsRetrieverImpl() {
        this.countryStringProcessor = new NullStringProcessor();
        this.nameStringProcessor = new LowerCaseProcessor();
        this.stateStringProcessor = new NullStringProcessor();

        List<StringProcessor> processingList = new ArrayList<>(3);
        Map<String, String> dictionaryMap = new HashMap<>(1);
        dictionaryMap.put("MATH_US", "MATH");
        processingList.add(new DictionaryReplacingProcessor(dictionaryMap));
        processingList.add(new LowerCaseProcessor());
        Map<String, String> dictionaryMap2 = new HashMap<>(2);
        dictionaryMap2.put("language_arts", "languageArts");
        dictionaryMap2.put("road_safety", "roadSafety");
        processingList.add(new DictionaryReplacingProcessor(dictionaryMap2));
        this.subjectAreaStringProcessor = new StringProcessingSequence(processingList);
    }

    @Override
    public StandardPackageDetails getPackageDetails(String csvString, String purpose, String date) throws Exception {

        StandardPackageDetails packageDetails = new StandardPackageDetails();

        try {
            BufferedReader bufferedReader = new BufferedReader(new StringReader(csvString));

            String firstLine = bufferedReader.readLine().trim();
            // remove bom - if exists
            firstLine = firstLine.replace(UTF8_BOM, "");

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
                throw new Exception("Could not find rootId for package details");
            }

            if (StringUtils.hasText(lineParts[8])) {
                packageDetails.setDescription(lineParts[8]);
            } else {
                // If not description defined, fallback to the package name
                packageDetails.setDescription(packageDetails.getName());
            }

            packageDetails.setPurpose(purpose);

            packageDetails.setCreated(date);

        } catch (IOException e) {
            throw new Exception("failed reading the content", e);
        }

        return packageDetails;
    }
}