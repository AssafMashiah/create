package com.t2k.cgs.utils.standards;

import com.t2k.cgs.utils.standards.dao.FileStandardsSource;
import com.t2k.cgs.utils.standards.dao.FileStandardsSourceDao;
import com.t2k.cgs.utils.standards.dao.StandardSource;
import com.t2k.cgs.utils.standards.dao.StandardsTargetDao;
import com.t2k.cgs.utils.standards.errors.StandardsLoadingException;
import com.t2k.cgs.utils.standards.errors.TreeParsingException;
import com.t2k.cgs.utils.standards.interaction.UserInteraction;
import com.t2k.cgs.utils.standards.metadata.PackageDetailsRetriever;
import com.t2k.cgs.utils.standards.model.PackageDetails;
import com.t2k.cgs.utils.standards.model.StandardNode;
import com.t2k.cgs.utils.standards.parsing.JSONConverter;
import com.t2k.cgs.utils.standards.parsing.StandardsParser;
import com.t2k.cgs.utils.standards.tree.TreeConstructionStrategy;
import com.t2k.cgs.utils.standards.validators.InputFileContentValidator;
import com.t2k.cgs.utils.standards.validators.StandardsValidator;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.dao.DataAccessException;

import java.io.File;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/19/12
 * Time: 8:35 AM
 */
public class Loader {

    private static final Logger logger = Logger.getLogger(Loader.class);
    private static final DateFormat DF = new SimpleDateFormat("dd/MM/yyyy hh:mm:ss");


    private FileStandardsSourceDao standardsSourceDao;

    private StandardsTargetDao standardsTargetDao;

    private JSONConverter jsonConverter;

    private PackageDetailsRetriever packageDetailsRetriever;
    private StandardsValidator standardsValidator;
    private InputFileContentValidator inputFileContentValidator;

    private TreeConstructionStrategy treeConstructionStrategy;
    private StandardsParser standardsParser;

    private UserInteraction userInteraction;

    public void loadStandards() {
        try {
            execute();
        } catch (StandardsLoadingException e) {
            logger.error(e);
        } catch (DataAccessException e) {
            logger.error(e);
        }
    }

    public void execute() throws StandardsLoadingException {
        logger.info("Starting standards loading process");
        Collection<FileStandardsSource> packages = null;

        try {
            packages = standardsSourceDao.getStandardPackages();
        } catch (Exception e) {
            this.userInteraction.outputMessage("Load standards FAILED");
        }

        this.userInteraction.outputMessage("");
        this.userInteraction.outputMessage("Found packages: ");
        this.userInteraction.outputMessage("===============");

        for (StandardSource standardPackage : packages) {
            this.userInteraction.outputMessage(" - " + standardPackage.getName());
        }

        List<PackageAndTree> loadingList = new LinkedList<PackageAndTree>();

        this.userInteraction.outputMessage("");
        this.userInteraction.outputMessage("Loading and Validating:");
        this.userInteraction.outputMessage("=======================");

        for (FileStandardsSource standardPackage : packages) {
            boolean anyValidationErrorsFound = false;

            inputFileContentValidator.initialize();

            String content = standardPackage.getContent();

            inputFileContentValidator.validateFormat(content);

            if (inputFileContentValidator.hadErrors()) {
                for (String errorMsg : inputFileContentValidator.getErrorMessages()) {
                    logger.error(errorMsg);
                    logger.error("Errors found while validating:" + standardPackage.getName());
                }
                logger.error("Exiting!");
                return;
            }

            List<StandardNode> standards = standardsParser.parseStandards(standardPackage.getContent());
            StandardNode root;

            try {
                root = treeConstructionStrategy.constructTree(standards);
            } catch (TreeParsingException e) {
                String errorMsg = String.format("Failed to construct tree from standards node of package %s", standardPackage.getName());
                logger.error(errorMsg, e);
                throw e;
            }

            standardsValidator.initialize();
            standardsValidator.validate(root, standards);

            if (standardsValidator.hadErrors()) {
                this.userInteraction.outputMessage(" - package " + standardPackage.getName() + "  validation FAILED");

                for (String errorMsg : standardsValidator.getErrorMessages()) {
                    this.userInteraction.outputMessage("   - " + errorMsg);
                }

                logger.error("Exiting!");
                cleanup();
                return;
            }

            PackageDetails packageDetails = packageDetailsRetriever.getPackageDetails(standardPackage.getContent(), standardPackage.getPurpose(), DF.format(new Date()));

            // Compare the package Details with the manifest file. The standard name and subjectArea should be the same.
            // The version will no longer be increased by 1 , but it will be determined by the manifest.


            if (standardPackage.getStandardName() == null) {
                anyValidationErrorsFound = true;
                this.userInteraction.outputMessage(" - package " + packageDetails.getName() + "  validation FAILED");
                this.userInteraction.outputMessage(" - " + "The manifest file do not contain a standard name");
            } else if (standardPackage.getSubjectArea() == null) {
                anyValidationErrorsFound = true;
                this.userInteraction.outputMessage(" - package " + packageDetails.getName() + "  validation FAILED");
                this.userInteraction.outputMessage(" - " + "The manifest file do not contain a subject area");
            } else if (standardPackage.getVersion() == null) {
                anyValidationErrorsFound = true;
                this.userInteraction.outputMessage(" - package " + packageDetails.getName() + "  validation FAILED");
                this.userInteraction.outputMessage(" - " + "The manifest file do not contain a version");
            } else if (!isNumeric(standardPackage.getVersion())) {
                anyValidationErrorsFound = true;
                this.userInteraction.outputMessage(" - package " + standardPackage.getName() + "  validation FAILED");
                this.userInteraction.outputMessage(" - " + "The standard version in the manifest file (version '" + standardPackage.getVersion()
                        + "') should be in the format of <number>.<number>");
            } else if (!legalVersionFormat(standardPackage.getVersion())) {
                anyValidationErrorsFound = true;
                this.userInteraction.outputMessage(" - package " + standardPackage.getName() + "  validation FAILED");
                this.userInteraction.outputMessage(" - " + "The standard version in the manifest file (version '" + standardPackage.getVersion()
                        + "') should be in the format of <number>.<number>");
            } else if (!standardPackage.getStandardName().equalsIgnoreCase(packageDetails.getName())) {
                anyValidationErrorsFound = true;
                this.userInteraction.outputMessage(" - package " + standardPackage.getName() + "  validation FAILED");
                this.userInteraction.outputMessage(" - " + "The standard name in the manifest file '" + standardPackage.getStandardName()
                        + "' do not match the standard name in txt file '" + packageDetails.getName() + "'");
            } else if (!standardPackage.getSubjectArea().equalsIgnoreCase(packageDetails.getSubjectArea())) {
                anyValidationErrorsFound = true;
                this.userInteraction.outputMessage(" - package " + standardPackage.getName() + "  validation FAILED");
                this.userInteraction.outputMessage(" - " + "The standard subject Area in the manifest file '" + standardPackage.getSubjectArea()
                        + "' do not match the standard name in txt file '" + packageDetails.getSubjectArea() + "'");
            } else if (standardPackage.getSubjectArea().contains("_") || standardPackage.getStandardName().contains("_") || standardPackage.getVersion().contains("_")) {
                anyValidationErrorsFound = true;
                this.userInteraction.outputMessage(" - package " + standardPackage.getName() + "  validation FAILED");
                this.userInteraction.outputMessage(" - " + "Package name, subject area and version should not contain underscore: '_'.");
            }

            loadingList.add(new PackageAndTree(packageDetails, root, standardPackage.getVersion()));

            if (anyValidationErrorsFound) {
                this.userInteraction.outputMessage("");
                this.userInteraction.outputMessage("Some packages validation failed, will not proceed with loading, exiting");
                cleanup();
                return;
            } else {
                this.userInteraction.outputMessage("");
                logger.info("Validation passed SUCCESSFULLY for: " + standardPackage.getName());
                this.userInteraction.outputMessage("");
            }

        }

        if (!this.userInteraction.askYesOrNoQuestion("Do you want to proceed with loading the standards?")) {
            this.userInteraction.outputMessage("User choose not to continue with loading, exiting");
            cleanup();
            return;
        }

        boolean loadAllPackages = true;

        for (PackageAndTree item : loadingList) {

            StandardNode root = item.getStandardsTree();
            PackageDetails packageDetails = item.getPackageDetails();


            //Check the this version already exist in the database
            packageDetails.setVersion(item.getVersion());
            boolean versionExists = standardsTargetDao.checkIfVersionExists(packageDetails);

            if (versionExists) {
                loadAllPackages = false;
                this.userInteraction.outputMessage(" - package " + packageDetails.getName() + ":" + packageDetails.getSubjectArea() + ":" + packageDetails.getVersion());
                this.userInteraction.outputMessage("   - " + " The same package version (" + packageDetails.getVersion() + ") already exists in the database");
            } else {

                VersionComprator cmp = new VersionComprator();
                int result = 0;

                String latestVersion = standardsTargetDao.getLatestVersion(packageDetails);
                if (latestVersion != null) {
                    result = cmp.compare(packageDetails.getVersion(), latestVersion);
                }

                if (result < 0) {
                    loadAllPackages = false;
                    this.userInteraction.outputMessage(" - package " + packageDetails.getName() + ":" + packageDetails.getSubjectArea() + ":" + packageDetails.getVersion());
                    this.userInteraction.outputMessage("   - " + " A newer version of this package (version: " + latestVersion + ") already exists in the database");
                } else {
                    packageDetails.setLatest(true);

                    //Convert to JSON String
                    String packageJsonString = this.jsonConverter.convertToJson(root, packageDetails);
                    //save to Mongo and update latest flag
                    this.standardsTargetDao.saveNewVersion(packageJsonString, packageDetails);

                    this.userInteraction.outputMessage(" - Package " + packageDetails.getName() + ":" + packageDetails.getSubjectArea());
                    this.userInteraction.outputMessage("\tloaded SUCCESSFULLY with version " + item.getVersion());
                }
            }
        }

        if (loadAllPackages)
            this.userInteraction.outputMessage("All loading finished SUCCESSFULLY");

        cleanup();
    }


    // check that the version contains only digits and '.'
    private boolean isNumeric(String str) {
        boolean containsOnlyDigits = false;

        if (str != null) {
            for (char c : str.toCharArray()) {
                if (Character.isDigit(c) || c == '.') {
                    containsOnlyDigits = true;
                } else {
                    containsOnlyDigits = false;
                    break;
                }
            }
        }
        return containsOnlyDigits;
    }


    // check that the version format is only X.Y
    private boolean legalVersionFormat(String str) {
        boolean legalVersionFormat = true;
        Integer numberOfDots = 0;
        if (str != null) {
            for (char c : str.toCharArray()) {
                if (c == '.') {
                    ++numberOfDots;
                }
                if (numberOfDots > 1) {
                    legalVersionFormat = false;
                    break;
                }
            }
            if (numberOfDots == 0) {
                legalVersionFormat = false;
            }
        }
        return legalVersionFormat;

    }


    // delete all the temporary folders generated by the unzip
    private void cleanup() {

        String sourceDirectoryPath = standardsSourceDao.getSourceDirectoryPath();
        File sourceDirectoryFile = new File(sourceDirectoryPath);

        File[] files = sourceDirectoryFile.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    deleteDir(file);
                }
            }
        }
    }

    // clean all the staging area directories created by unzipping the standards zip files

    private void deleteDir(File dirName) {

        if (dirName.exists()) {

            File[] files = dirName.listFiles();
            if (files != null) {
                for (File file : files) {
                    file.delete();
                }
            }
            if (dirName.list().length == 0) {
                dirName.delete();
            }
        }
    }

    ///////////////////////
    // Injection Setters //
    ///////////////////////
    @Required
    public void setStandardsSourceDao(FileStandardsSourceDao standardsSourceDao) {
        this.standardsSourceDao = standardsSourceDao;
    }

    @Required
    public void setPackageDetailsRetriever(PackageDetailsRetriever packageDetailsRetriever) {
        this.packageDetailsRetriever = packageDetailsRetriever;
    }

    @Required
    public void setStandardsValidator(StandardsValidator standardsValidator) {
        this.standardsValidator = standardsValidator;
    }

    @Required
    public void setStandardsTargetDao(StandardsTargetDao standardsTargetDao) {
        this.standardsTargetDao = standardsTargetDao;
    }

    @Required
    public void setJsonConverter(JSONConverter jsonConverter) {
        this.jsonConverter = jsonConverter;
    }

    @Required
    public void setTreeConstructionStrategy(TreeConstructionStrategy treeConstructionStrategy) {
        this.treeConstructionStrategy = treeConstructionStrategy;
    }

    @Required
    public void setStandardsParser(StandardsParser standardsParser) {
        this.standardsParser = standardsParser;
    }

    @Required
    public void setUserInteraction(UserInteraction userInteraction) {
        this.userInteraction = userInteraction;
    }

    @Required
    public void setInputFileContentValidator(InputFileContentValidator inputFileContentValidator) {
        this.inputFileContentValidator = inputFileContentValidator;
    }

    /////////////////////
    // Private Classes //
    /////////////////////

    private static class VersionComprator implements Comparator {

        public boolean equals(Object o1, Object o2) {
            return compare(o1, o2) == 0;
        }

        public int compare(Object o1, Object o2) {
            String version1 = (String) o1;
            String version2 = (String) o2;

            VersionTokenizer tokenizer1 = new VersionTokenizer(version1);
            VersionTokenizer tokenizer2 = new VersionTokenizer(version2);

            int number1 = 0, number2 = 0;
            String suffix1 = "", suffix2 = "";

            while (tokenizer1.MoveNext()) {
                if (!tokenizer2.MoveNext()) {
                    do {
                        number1 = tokenizer1.getNumber();
                        suffix1 = tokenizer1.getSuffix();
                        if (number1 != 0 || suffix1.length() != 0) {
                            // Version one is longer than number two, and non-zero
                            return 1;
                        }
                    }
                    while (tokenizer1.MoveNext());

                    // Version one is longer than version two, but zero
                    return 0;
                }

                number1 = tokenizer1.getNumber();
                suffix1 = tokenizer1.getSuffix();
                number2 = tokenizer2.getNumber();
                suffix2 = tokenizer2.getSuffix();

                if (number1 < number2) {
                    // Number one is less than number two
                    return -1;
                }
                if (number1 > number2) {
                    // Number one is greater than number two
                    return 1;
                }

                boolean empty1 = suffix1.length() == 0;
                boolean empty2 = suffix2.length() == 0;

                if (empty1 && empty2) continue; // No suffixes
                if (empty1) return 1; // First suffix is empty (1.2 > 1.2b)
                if (empty2) return -1; // Second suffix is empty (1.2a < 1.2)

                // Lexical comparison of suffixes
                int result = suffix1.compareTo(suffix2);
                if (result != 0) return result;

            }
            if (tokenizer2.MoveNext()) {
                do {
                    number2 = tokenizer2.getNumber();
                    suffix2 = tokenizer2.getSuffix();
                    if (number2 != 0 || suffix2.length() != 0) {
                        // Version one is longer than version two, and non-zero
                        return -1;
                    }
                }
                while (tokenizer2.MoveNext());

                // Version two is longer than version one, but zero
                return 0;
            }
            return 0;
        }
    }

    // VersionTokenizer.java
    private static class VersionTokenizer {
        private final String _versionString;
        private final int _length;

        private int _position;
        private int _number;
        private String _suffix;
        private boolean _hasValue;

        public int getNumber() {
            return _number;
        }

        public String getSuffix() {
            return _suffix;
        }

        public boolean hasValue() {
            return _hasValue;
        }

        public VersionTokenizer(String versionString) {
            if (versionString == null)
                throw new IllegalArgumentException("versionString is null");

            _versionString = versionString;
            _length = versionString.length();
        }

        public boolean MoveNext() {
            _number = 0;
            _suffix = "";
            _hasValue = false;

            // No more characters
            if (_position >= _length)
                return false;

            _hasValue = true;

            while (_position < _length) {
                char c = _versionString.charAt(_position);
                if (c < '0' || c > '9') break;
                _number = _number * 10 + (c - '0');
                _position++;
            }

            int suffixStart = _position;

            while (_position < _length) {
                char c = _versionString.charAt(_position);
                if (c == '.') break;
                _position++;
            }

            _suffix = _versionString.substring(suffixStart, _position);

            if (_position < _length) _position++;

            return true;
        }
    }


    private static class PackageAndTree {

        private PackageDetails packageDetails;
        private StandardNode standardsTree;
        private String version;

        private PackageAndTree(PackageDetails packageDetails, StandardNode standardsTree, String version) {
            this.packageDetails = packageDetails;
            this.standardsTree = standardsTree;
            this.version = version;
        }

        public PackageDetails getPackageDetails() {
            return packageDetails;
        }

        public StandardNode getStandardsTree() {
            return standardsTree;
        }

        public String getVersion() {
            return version;
        }

    }

}
