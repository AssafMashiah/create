package org.t2k.cgs.service.ebooks.epub;

import com.t2k.configurations.Configuration;
import org.apache.commons.io.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.ebooks.EpubValidationResult;
import org.t2k.cgs.utils.ZipHelper;

import javax.annotation.PostConstruct;
import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class EpubValidator {

    private Logger logger = Logger.getLogger(this.getClass());

    @Autowired
    private Configuration configuration;

    @Value("classpath:epubCheck/epubcheck-4.0.1.zip")
    private Resource epubValidatorZip;
    private String tempEpubCheckJarPath = "out/epubCheckJar/";
    private File epubCheckTempExtractionFolder = new File(tempEpubCheckJarPath);

    // initialization - use this to unzip the jar, called from spring bean init
    @PostConstruct
    public void copyJarToFileSystem() throws Exception {
        logger.debug("unzipping EpubValidator jar into file system");
        String filename = epubValidatorZip.getFilename();
        if (!epubValidatorZip.exists()) {
            throw new Exception(String.format("EpubValidator zip file %s does not exist.", filename));
        }
        logger.info(String.format("Initializing EpubValidator jar from zip file : %s", filename));

        if (epubCheckTempExtractionFolder.exists() && epubCheckTempExtractionFolder.isDirectory())
            FileUtils.cleanDirectory(epubCheckTempExtractionFolder); // remove existing xsds from directory

        try {
            logger.debug(String.format("Unzipping epubcheck jar + dependencies to: %s", epubCheckTempExtractionFolder.getAbsolutePath()));
            ZipHelper.decompressInputStream(epubValidatorZip.getInputStream(), epubCheckTempExtractionFolder.getAbsolutePath()); // decompressing the zip
        } catch (Exception e) {
            logger.error(String.format("Error decompressing file %s", epubValidatorZip.getURL()), e);
            throw e;
        }
    }

    private String getEpubCheckJarPath() {
        return epubCheckTempExtractionFolder.getAbsolutePath() + "/epubcheck-4.0.1/epubcheck.jar";
    }

    /**
     * Validates the epub in the filepath against the epub3 official validation library
     * @param filePathToValidate of an epub3 file that we want to validate
     * @return an object with the validation result and error message if exists
     */
    public EpubValidationResult validateEpubFile(String filePathToValidate) {
        try {
            ExitCodeErrorsAndWarnings exitCodeErrorsAndWarnings = validateUsingExternalProcess(filePathToValidate);
//            ExitCodeErrorsAndWarnings exitCodeErrorsAndWarnings = validateUsingLibrary(filePathToValidate);

            ErrorsAndWarnings outputMessages = exitCodeErrorsAndWarnings.errorsAndWarnings;
            int exitCode = exitCodeErrorsAndWarnings.exitCode;
            if (exitCode != 0) { // validation failed due to errors
                if (outputMessages.errors != null && !outputMessages.errors.isEmpty()) {
                    if (outputMessages.errors.size() == 1 && outputMessages.errors.get(0).equals("Check finished with errors")) { // this means we had errors which were filtered by our error white list and therefore, this epub file is valid.
                        return new EpubValidationResult(true);
                    }

                    return new EpubValidationResult(outputMessages.errors);
                } else { // there are certain cases where there are no error messages but the process still fails, for example when there was no file found.
                    return new EpubValidationResult("Could not validate import file");
                }
            } else { // validation passed
                return new EpubValidationResult(true);
            }
        } catch (Exception e) {
            return new EpubValidationResult(e.getMessage());
        }
    }

    private ExitCodeErrorsAndWarnings validateUsingExternalProcess(String filePathToValidate) throws IOException, InterruptedException {
        Process process = null;
        ExitCodeErrorsAndWarnings result = new ExitCodeErrorsAndWarnings();
        try {
            String javaCommand = configuration.getProperty("javaPath") + "/java";
            String jarExecutionCommand = "-jar";
            String quietFlag = "-q"; // -q means that the process produces messages only on failure\warning
            String validatorJarFilePath = getEpubCheckJarPath();

            // running process: java -jar ..epubCheck.jar {{epub file}}.epub -q
            ProcessBuilder processBuilder = new ProcessBuilder(javaCommand, jarExecutionCommand, validatorJarFilePath, filePathToValidate, quietFlag);
            processBuilder.redirectErrorStream(true);
            process = processBuilder.start();

            result.errorsAndWarnings = getStringFromInputStream(process.getInputStream());
            result.exitCode = process.waitFor();
        } catch (Exception e) {
            throw e;
        } finally {
            if (process != null) {
                process.destroy();
            }
        }
        return result;
    }

//    private ExitCodeErrorsAndWarnings validateUsingLibrary(String filePathToValidate) {
//        ExitCodeErrorsAndWarnings result = new ExitCodeErrorsAndWarnings();
//        Report validationReport = new DefaultReportImpl(filePathToValidate, null, true);
//
//        EpubCheck epubCheck = new EpubCheck(new File(filePathToValidate), validationReport);
////            boolean valid = epubCheck.validate();
//        result.exitCode = epubCheck.doValidate();
//        PipedInputStream pipedInputStream = null;
//        try {
//            pipedInputStream = new PipedInputStream();
//            PipedOutputStream pipedOutputStream = new PipedOutputStream(pipedInputStream);
//            new Thread(() -> {
//                try {
//                    validationReport.getDictionary().dumpMessages(new OutputStreamWriter(pipedOutputStream));
//                } catch (IOException e) {
//                    e.printStackTrace();
//                } finally {
//                    try {
//                        pipedOutputStream.close();
//                    } catch (IOException e) {
//                        logger.error("Unable to close PipedOutputStream", e);
//                    }
//                }
//            }).start();
//
//            result.errorsAndWarnings = getStringFromInputStream(pipedInputStream);
//        } catch (IOException e) {
//            logger.error("IO exception encountered on validating epub using library", e);
//        } finally {
//            try {
//                pipedInputStream.close();
//            } catch (IOException e) {
//                logger.error("Unable to close PipedInputStream", e);
//            }
//        }
//        return result;
//    }


    /**
     * @param inputStream to read an parse
     * @return the errors made as a result of the validation process if exists
     * @throws IOException
     */
    private ErrorsAndWarnings getStringFromInputStream(InputStream inputStream) throws IOException {
        ErrorsAndWarnings errorsAndWarnings = new ErrorsAndWarnings();
        List<String> eBooksErrorsWhiteList = Arrays.asList(configuration.getProperty("eBooksErrorsWhiteList").split(";"));

        try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;
            while ((line = br.readLine()) != null) {
                if (line.isEmpty()) {
                    continue;
                }

                for (String errorInWhiteList : eBooksErrorsWhiteList) {
                    if (line.contains(errorInWhiteList)) {
                        line = null;
                        break;
                    }
                }

                if (line == null) {
                    continue;
                } else if (line.startsWith("ERROR")) {
                    errorsAndWarnings.errors.add(line);
                } else if (line.startsWith("WARNING")) {
                    errorsAndWarnings.warnings.add(line);
                } else { // we'll get here if no file exist for example
                    errorsAndWarnings.errors.add(line);
                }
            }
        } finally {
            inputStream.close();
        }

        return errorsAndWarnings;
    }

    public void setEpubValidatorZip(Resource epubValidatorZip) {
        this.epubValidatorZip = epubValidatorZip;
    }

    private class ExitCodeErrorsAndWarnings {
        int exitCode;
        ErrorsAndWarnings errorsAndWarnings;
    }

    private class ErrorsAndWarnings {

        private List<String> errors;
        private List<String> warnings;

        private ErrorsAndWarnings() {
            errors = new ArrayList<>();
            warnings = new ArrayList<>();
        }
    }
}