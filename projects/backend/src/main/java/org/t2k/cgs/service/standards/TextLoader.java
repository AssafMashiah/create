package org.t2k.cgs.service.standards;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;
import org.t2k.cgs.domain.usecases.standards.PackageDetailsRetriever;
import org.t2k.cgs.domain.model.standards.StandardsDao;
import org.t2k.cgs.domain.model.standards.StandardNode;
import org.t2k.cgs.domain.model.standards.StandardPackageDetails;
import org.t2k.cgs.domain.model.standards.TextStandardsSource;
import org.t2k.cgs.service.standards.parser.JSONConverter;
import org.t2k.cgs.service.standards.parser.SimpleJSONConverter;
import org.t2k.cgs.service.standards.parser.StandardsParser;
import org.t2k.cgs.service.standards.tree.SimpleTreeConstructionStrategy;
import org.t2k.cgs.service.standards.tree.TreeConstructionStrategy;
import org.t2k.cgs.service.standards.validators.CorrectNumberOfColumnsValidator;
import org.t2k.cgs.service.standards.validators.UniquePedagogicalIdValidator;

import javax.inject.Inject;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Comparator;
import java.util.Date;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/19/12
 * Time: 8:35 AM
 */
@Service
public class TextLoader {

    private Logger logger = Logger.getLogger(TextLoader.class);

    private final DateFormat DATE_FORMAT = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");

    private StandardsDao standardsDao;
    private JSONConverter jsonConverter;
    private PackageDetailsRetriever packageDetailsRetriever;
    private CorrectNumberOfColumnsValidator correctNumberOfColumnsValidator;
    private TreeConstructionStrategy treeConstructionStrategy;
    private StandardsParser standardsParser;
    private UniquePedagogicalIdValidator uniquePedagogicalIdValidator;

    @Inject
    public TextLoader(StandardsDao standardsDao,
                      PackageDetailsRetriever packageDetailsRetriever,
                      StandardsParser standardsParser) {
        Assert.notNull(standardsDao);
        Assert.notNull(packageDetailsRetriever);
        Assert.notNull(standardsParser);

        this.standardsDao = standardsDao;
        this.packageDetailsRetriever = packageDetailsRetriever;
        this.standardsParser = standardsParser;

        this.jsonConverter = new SimpleJSONConverter();
        this.correctNumberOfColumnsValidator = new CorrectNumberOfColumnsValidator(10);
        this.treeConstructionStrategy = new SimpleTreeConstructionStrategy();
        this.uniquePedagogicalIdValidator = new UniquePedagogicalIdValidator();
    }

    public void installStandardPackage(StandardPackageDetails standardPackageDetails, String content) throws Exception {
        logger.info("installStandardPackage. About to install standard package: " + standardPackageDetails.toString());
        TextStandardsSource stdPackage = new TextStandardsSource(standardPackageDetails, content);

        validateStandardPackageContent(content);

        List<StandardNode> standards = standardsParser.parseStandards(content);
        StandardNode root = treeConstructionStrategy.constructTree(standards);

        validateStandardHierarchyTree(standards);

        StandardPackageDetails packageDetails = packageDetailsRetriever.getPackageDetails(stdPackage.getContent(), stdPackage.getPurpose(), DATE_FORMAT.format(new Date()));
        compareStandardPackageDetailsWithManifest(stdPackage, packageDetails);

        logger.info(String.format("Validation passed SUCCESSFULLY for standard package: %s, subject area: %s", stdPackage.getStandardName(), stdPackage.getSubjectArea()));

        // Check if this version already exist in the database
        packageDetails.setVersion(stdPackage.getVersion());
        boolean isVersionExists = standardsDao.checkIfVersionExists(packageDetails);

        if (isVersionExists) {
            String errorMsg = String.format("Standard package %s validation failed: the same package version (%s) was already uploaded.", stdPackage.getStandardName(), packageDetails.getVersion());
            logger.error(errorMsg);
            throw new IllegalArgumentException(errorMsg);
        } else {
            VersionComparator versionComparator = new VersionComparator();
            int result = 0;

            String latestVersion = standardsDao.getLatestVersion(packageDetails);
            if (latestVersion != null) {
                result = versionComparator.compare(packageDetails.getVersion(), latestVersion);
            }

            if (result < 0) {
                String errorMsg = String.format("Standard package %s upload failed: a newer version of this package (version: %s) already exists in the database", stdPackage.getStandardName(), latestVersion);
                logger.error(errorMsg);
                throw new Exception(errorMsg);
            } else {
                packageDetails.setLatest(true);

                // Convert to JSON String
                String packageJsonString = jsonConverter.convertToJson(root, packageDetails);
                standardsDao.saveNewVersion(packageJsonString, packageDetails);
            }
        }

        logger.debug(String.format("Standard package %s, subjectArea %s, version %s was installed successfully.", packageDetails.getName(), packageDetails.getSubjectArea(), packageDetails.getVersion()));
    }

    /**
     * Compare the package Details with the manifest file. The standard name and subjectArea should be the same.
     * The version will no longer be increased by 1 , but it will be determined by the manifest.
     *
     * @param stdPackage
     * @param packageDetails
     */
    private void compareStandardPackageDetailsWithManifest(TextStandardsSource stdPackage, StandardPackageDetails packageDetails) {
        String errorMsg = null;
        if (stdPackage.getStandardName() == null || stdPackage.getStandardName().isEmpty()) {
            errorMsg = "Standard package validation failed: The manifest file do not contain a standard name";
        } else if (stdPackage.getSubjectArea() == null || stdPackage.getSubjectArea().isEmpty()) {
            errorMsg = String.format("Standard package %s validation failed: The manifest file do not contain a subject area", stdPackage.getStandardName());
        } else if (stdPackage.getVersion() == null || stdPackage.getVersion().isEmpty()) {
            errorMsg = String.format("Standard package %s validation failed: The manifest file do not contain a version", stdPackage.getStandardName());
        } else if (!isNumeric(stdPackage.getVersion()) || !legalVersionFormat(stdPackage.getVersion())) {
            errorMsg = String.format("Standard package %s validation failed: the standard version in the manifest file (version: '%s') should be in the format of <number>.<number>", stdPackage.getStandardName(), stdPackage.getVersion());
        } else if (!stdPackage.getStandardName().equalsIgnoreCase(packageDetails.getName())) {
            errorMsg = String.format("Standard package %s validation failed: The standard name in the manifest file '%s' do not match the standard name in txt file '%s'", stdPackage.getStandardName(), stdPackage.getStandardName(), packageDetails.getName());
        } else if (!stdPackage.getSubjectArea().equalsIgnoreCase(packageDetails.getSubjectArea())) {
            errorMsg = String.format("Standard package %s validation failed: The standard subject area in the manifest file '%s' do not match the standard subject area in txt file '%s'", stdPackage.getStandardName(), stdPackage.getSubjectArea(), packageDetails.getSubjectArea());
        } else if (stdPackage.getSubjectArea().contains("_") || stdPackage.getStandardName().contains("_") || stdPackage.getVersion().contains("_")) {
            errorMsg = String.format("Standard package %s validation failed: Package name, subject area and version should not contain underscore: '_'.", stdPackage.getStandardName());
        }

        if (errorMsg != null) {
            logger.error(errorMsg);
            throw new IllegalArgumentException(errorMsg);
        }
    }

    private void validateStandardHierarchyTree(List<StandardNode> standards) {
        List<String> errors = uniquePedagogicalIdValidator.validate(standards);
        if (!errors.isEmpty()) {
            for (String errorMsg : errors) {
                logger.error(errorMsg);
            }

            throw new IllegalArgumentException(errors.toString());
        }
    }

    private void validateStandardPackageContent(String content) {
        List<String> errors = correctNumberOfColumnsValidator.validateFormat(content);
        if (!errors.isEmpty()) {
            for (String errorMsg : errors) {
                logger.error(errorMsg);
            }

            throw new IllegalArgumentException(errors.toString());
        }
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

    /////////////////////
    // Private Classes //
    /////////////////////

    private static class VersionComparator implements Comparator {

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
                    } while (tokenizer1.MoveNext());

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
                } while (tokenizer2.MoveNext());

                // Version two is longer than version one, but zero
                return 0;
            }

            return 0;
        }
    }

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
}