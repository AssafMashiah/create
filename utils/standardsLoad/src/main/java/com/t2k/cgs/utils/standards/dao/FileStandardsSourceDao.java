package com.t2k.cgs.utils.standards.dao;

import com.mongodb.util.JSON;
import org.apache.log4j.Logger;
import org.bson.BSONObject;
import org.springframework.beans.factory.annotation.Required;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.EmptyResultDataAccessException;

import java.io.*;
import java.nio.file.Files;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Implementation of te standards source in the file system as txt
 * files that were user in the DTP6.x project
 * <p/>
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 11/20/12
 * Time: 12:02 PM
 */
public class FileStandardsSourceDao implements StandardsSourceDao {

    private static final String PURPOSE = "purpose";
    private static Logger logger = Logger.getLogger(FileStandardsSourceDao.class);
    public static final String NAME = "name";
    public static final String SUBJECT_AREA = "subjectArea";
    public static final String VERSION = "version";
    public static final String ZIP_FILE_EXT = ".cgsstd";

    // sets the source directory to a specific folder. used for tests.
    public void setSourceDirectory(File sourceDirectory) {
        this.sourceDirectory = sourceDirectory;
    }

    private File sourceDirectory;
    private String sourceDirectoryPath;

    public void init() {
        this.sourceDirectory = new File(sourceDirectoryPath);
    }


    public Collection<FileStandardsSource> getStandardPackages() throws Exception {

        logger.info("Checking validity of directory: " + this.sourceDirectoryPath);
        List<FileStandardsSource> standardPackages = new LinkedList<FileStandardsSource>();

        try {
            //make sure data directory is valid
            if (!this.sourceDirectory.exists() || !this.sourceDirectory.isDirectory()) {
                throw new DataAccessResourceFailureException("Data directory configuration is incorrect, it must exist and it must be a directory");
            }

            //Get all the .zip files in the directory
            String[] standardsZipFileNames = sourceDirectory.list(new FilenameFilter() {

                @Override
                public boolean accept(File dir, String name) {
                    return name.endsWith(ZIP_FILE_EXT);
                }
            });

            //make sure data directory contains standards
            if (standardsZipFileNames.length <= 0) {
                throw new EmptyResultDataAccessException("No files with extension " + ZIP_FILE_EXT + " found in the data directory, exiting", 1);
            }

            logger.info("Getting list of standards zip files from :" + sourceDirectory.getAbsolutePath());

            for (String zipFileName : standardsZipFileNames) {

                logger.info("Zip file name :" + zipFileName);

                String desDir = sourceDirectory.getAbsolutePath() + File.separator + zipFileName.substring(0, zipFileName.length() - (ZIP_FILE_EXT.length()));

                File desDirFile = new File(desDir);
                if (!desDirFile.exists()) {
                    logger.info("creating directory: " + desDirFile);
                    desDirFile.mkdirs();
                }

                unzipFile(sourceDirectory.getAbsolutePath() + File.separator + zipFileName, desDir);

                String[] standardsFileNames = desDirFile.list(new FilenameFilter() {

                    @Override
                    public boolean accept(File dir, String name) {
                        return name.endsWith(".txt");
                    }
                });

                if (standardsFileNames.length <= 0) {
                    throw new EmptyResultDataAccessException("No files with extension '.txt' found in " + desDir + " directory, exiting", 1);
                } else if (standardsFileNames.length > 1) {
                    throw new EmptyResultDataAccessException("More than one '.txt' found in " + desDir + " directory, exiting", 1);
                }


                FileStandardsSource fileStandardsSource = new FileStandardsSource(desDir + File.separator + standardsFileNames[0]);

                logger.info("Add standards source file :" + desDir + File.separator + standardsFileNames[0]);

                standardPackages.add(fileStandardsSource);

                String[] standardsJsonFiles = desDirFile.list(new FilenameFilter() {

                    @Override
                    public boolean accept(File dir, String name) {
                        return name.endsWith(".json");
                    }
                });

                if (standardsFileNames.length <= 0) {
                    throw new EmptyResultDataAccessException("No files with extension '.json' found in " + desDir + " directory, exiting", 1);
                } else if (standardsFileNames.length > 1) {
                    throw new EmptyResultDataAccessException("More than one '.json' found in " + desDir + " directory, exiting", 1);
                }

                String manifest = readFile(desDir + File.separator + standardsJsonFiles[0]);

                BSONObject manifestObject = (BSONObject) JSON.parse(manifest);
                String standardName = null;
                String subjectArea = null;
                String version = null;
                String purpose = null;

                if (manifestObject.containsField(NAME)) {
                    standardName = manifestObject.get(NAME).toString();
                }
                if (manifestObject.containsField(SUBJECT_AREA)) {
                    subjectArea = manifestObject.get(SUBJECT_AREA).toString();
                }
                if (manifestObject.containsField(VERSION)) {
                    version = manifestObject.get(VERSION).toString();
                }
                if (manifestObject.containsField(PURPOSE)) {
                    purpose = manifestObject.get(PURPOSE).toString();
                }
                fileStandardsSource.setStandardName(standardName);
                fileStandardsSource.setSubjectArea(subjectArea);
                fileStandardsSource.setVersion(version);
                fileStandardsSource.setPurpose(purpose);

                logger.info("json file content: standardName = " + standardName + " subjectArea = " + subjectArea + " version = " + version);

            }


        } catch (Exception e) {
            logger.error("getStandardPackages exception ", e);
            throw e;
        }
        return standardPackages;
    }


    // Get the file content as a String
    private String readFile(String filename) throws Exception {
        File f = new File(filename);
        byte[] bytes = Files.readAllBytes(f.toPath());
        return new String(bytes, "UTF-8");
    }


    // unzip a file into desLocation
    private void unzipFile(String zipFileName, String desLocation) throws Exception {

        FileInputStream fis;
        ZipInputStream zipIs;
        ZipEntry zEntry;
        fis = new FileInputStream(zipFileName);
        zipIs = new ZipInputStream(new BufferedInputStream(fis));
        while ((zEntry = zipIs.getNextEntry()) != null) {
            try {
                byte[] tmp = new byte[4 * 1024];
                FileOutputStream fos;

                System.out.println("Extracting file to " + desLocation);
                fos = new FileOutputStream(desLocation + File.separator + zEntry);
                int size = 0;
                while ((size = zipIs.read(tmp)) != -1) {
                    fos.write(tmp, 0, size);
                }
                fos.flush();
                fos.close();
            } catch (Exception ex) {
                throw ex;
            }
        }
        zipIs.close();

    }

    ///////////////////////
    // Injection Setters //
    ///////////////////////

    @Required
    public void setSourceDirectoryPath(String sourceDirectoryPath) {
        this.sourceDirectoryPath = sourceDirectoryPath;
    }

    public String getSourceDirectoryPath() {
        return sourceDirectoryPath;
    }
}
