package com.t2k.cgs.utils.standards.dao;

import org.apache.log4j.Logger;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataRetrievalFailureException;

import java.io.*;
import java.nio.charset.Charset;

/**
 *
 * Implementation of the standard package from the file system
 *
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 11:59 AM
 */
public class FileStandardsSource implements StandardSource {

    private static Logger logger = Logger.getLogger(FileStandardsSource.class);

    private File standardsFile;
    private String content;
    private String subjectArea;
    private String standardName;
    private String version;
    private String purpose;

    public FileStandardsSource(String filePath) {
        this.standardsFile = new File(filePath);
        this.content = null;
    }

    @Override
    public String getName() {
        return this.standardsFile.getName();
    }

    public String getStandardName() {
        return this.standardName;
    }

    public void setStandardName(String standardName) {
        this.standardName = standardName;
    }

    public String getSubjectArea() {
        return this.subjectArea;
    }

    public void setSubjectArea(String subjectArea) {
        this.subjectArea = subjectArea;
    }

    public String getVersion() {
        return this.version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getPurpose() {
        return purpose;
    }
    @Override
    public String getContent() throws DataAccessException {
        if (this.content == null) {

            if (!this.standardsFile.exists()) {
                throw new DataAccessResourceFailureException("File doesn't exist");
            }

            StringBuilder contentBuilder = new StringBuilder();

            logger.info("Loading content from file: " + this.standardsFile.getAbsolutePath());

            FileInputStream inputStream = null;
            try {
                inputStream = new FileInputStream(this.standardsFile);
                BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream, Charset.forName("UTF-8")));

                String line;

                while ((line = bufferedReader.readLine()) != null) {
                    contentBuilder.append(line);
                    contentBuilder.append("\n");
                }
            } catch (IOException e) {
                throw new DataRetrievalFailureException("Failed to read content from file",e);
            } finally {
                if(inputStream != null){
                    try {
                        inputStream.close();
                    } catch (Exception e) {
                        logger.info("FileStandardsSource : getContent : inputStream close failed ");
                    }
                }
            }

            this.content = contentBuilder.toString();
        }
        return content;
    }


}
