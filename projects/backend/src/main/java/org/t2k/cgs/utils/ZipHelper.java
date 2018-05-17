package org.t2k.cgs.utils;

import com.t2k.common.utils.FileUtils;
import com.t2k.common.utils.ZipUtils;
import org.apache.commons.compress.archivers.zip.ZipArchiveEntry;
import org.apache.commons.compress.archivers.zip.ZipFile;
import org.apache.log4j.Logger;

import java.io.*;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/**
 * Created with IntelliJ IDEA.
 * User: alex.zaikman
 * Date: 12/02/14
 * Time: 17:36
 */

public class ZipHelper {

    private static Logger logger = Logger.getLogger(ZipHelper.class);

    public static void zipDir(List<String> fileAndDirNames, String nameZipFile) throws IOException {
        try (
                FileOutputStream fW = new FileOutputStream(nameZipFile);
                ZipOutputStream zip = new ZipOutputStream(fW)
        ) {

            List<String> missingFiles = new ArrayList<>();
            for (String fileOrDirName : fileAndDirNames) {
                if (!FileUtils.exists(fileOrDirName)) {
                    missingFiles.add(fileOrDirName);
                }
            }

            if (!missingFiles.isEmpty()){
                String msg = String.format("Could not perform zip process due to missing files. Aborting zip process...\nMissing files: %s", Arrays.toString(missingFiles.toArray()));
                logger.error(msg);
                throw new IOException(msg);
            }

            for (String fileOrDirName : fileAndDirNames) {
                addResourceToZip("", fileOrDirName, zip);
            }
        }
    }

    public static void zipDir(String baseFolder, List<String> fileAndDirNames, String nameZipFile) throws IOException {
        try (FileOutputStream fW = new FileOutputStream(nameZipFile);
             ZipOutputStream zip = new ZipOutputStream(fW)) {
            for (String fileOrDirName : fileAndDirNames) {
                if (!FileUtils.exists(fileOrDirName)) {
                    logger.error(String.format("File is missing at zip process: %s", fileOrDirName));
                } else {
                    String relativePath = fileOrDirName.substring(fileOrDirName.lastIndexOf(baseFolder) + baseFolder.length(), fileOrDirName.lastIndexOf("/"));
                    addResourceToZip(relativePath, fileOrDirName, zip);
                }
            }
        }
    }

    private static void addResourceToZip(String path, String srcFolder, ZipOutputStream zip) throws IOException {
        File resource = new File(srcFolder);
        if (resource.isFile())
            addFileToZip(path, srcFolder, zip, false);
        else if (resource.isDirectory())
            addFolderToZip("", srcFolder, zip);
    }

    private static void addFolderToZip(String path, String srcFolder, ZipOutputStream zip) throws IOException {
        File folder = new File(srcFolder);
        if (folder.list() == null) logger.warn(String.format("no files in: %s", folder.getPath()));
        if (folder.list().length == 0) {
            addFileToZip(path, srcFolder, zip, true);
        } else {
            for (String fileName : folder.list()) {
                if (path.equals("")) {
                    addFileToZip(folder.getName(), String.format("%s/%s", srcFolder, fileName), zip, false);
                } else {
                    addFileToZip(String.format("%s/%s", path, folder.getName()), String.format("%s/%s", srcFolder, fileName), zip, false);
                }
            }
        }
    }

    private static void addFileToZip(String path, String srcFile, ZipOutputStream zip, boolean flag) throws IOException {
        File folder = new File(srcFile);
        if (flag) {
            zip.putNextEntry(new ZipEntry(String.format("%s/%s/", path, folder.getName())));
        } else {
            if (folder.isDirectory()) {
                addFolderToZip(path, srcFile, zip);
            } else {
                byte[] buf = new byte[1024];
                int len;
                try (FileInputStream in = new FileInputStream(srcFile)) {
                    if (path.isEmpty())
                        zip.putNextEntry(new ZipEntry(folder.getName()));
                    else
                        zip.putNextEntry(new ZipEntry(String.format("%s/%s", path, folder.getName())));
                    while ((len = in.read(buf)) > 0) {
                        zip.write(buf, 0, len);
                    }
                }
            }
        }
    }

    public static void decompressInputStream(InputStream inputStream, String destination) throws Exception {
        byte[] buffer = new byte[1024];

        try {
            //create output directory is not exists
            File folder = new File(destination).getParentFile();
            if (!folder.exists()) {
                boolean isDirCreated = folder.mkdir();
                if (!isDirCreated) {
                    throw new Exception("Could not create the required directory. Please check permissions.");
                }
            }

            //get the zip file content
            ZipInputStream zis =
                    new ZipInputStream(inputStream);
            //get the zipped file list entry
            ZipEntry ze = zis.getNextEntry();

            while (ze != null) {

                String fileName = ze.getName();
                File newFile = new File(destination + File.separator + fileName);

                 //create all non exists folders
                //else you will hit FileNotFoundException for compressed folder

                if (ze.isDirectory()) {
                    new File(newFile.getParent()).mkdirs();
                } else {
                    FileOutputStream fos = null;

                    new File(newFile.getParent()).mkdirs();

                    fos = new FileOutputStream(newFile);

                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        fos.write(buffer, 0, len);
                    }

                    fos.close();
                }

                ze = zis.getNextEntry();
            }

            zis.closeEntry();
            zis.close();

            System.out.println("Done");

        } catch (IOException ex) {
            ex.printStackTrace();
        }
    }


    public static void decompressZipFile(String zipFile, String destination) throws IOException {

        int BUFFER = 2048;
        ZipFile zip = new ZipFile(zipFile);

        new File(destination).mkdir();   // TODO: validate the result
        Enumeration<ZipArchiveEntry> zipFileEntries = zip.getEntries();

        // Process each entry
        while (zipFileEntries.hasMoreElements()) {
            // grab a zip file entry
            ZipArchiveEntry entry = zipFileEntries.nextElement();
            String currentEntry = entry.getName();
            File destFile = new File(destination, currentEntry);
            //destFile = new File(newPath, destFile.getName());
            File destinationParent = destFile.getParentFile();

            destinationParent.mkdirs();  // TODO: validate the result

            if (!entry.isDirectory()) {
                BufferedInputStream is = new BufferedInputStream(zip.getInputStream(entry));
                int currentByte;
                // establish buffer for writing file
                byte data[] = new byte[BUFFER];

                // write the current file to disk
                FileOutputStream fos = new FileOutputStream(destFile);
                BufferedOutputStream dest = new BufferedOutputStream(fos,
                        BUFFER);
                try {
                    // read and write until last byte is encountered
                    while ((currentByte = is.read(data, 0, BUFFER)) != -1) {
                        dest.write(data, 0, currentByte);
                    }
                } finally {
                    dest.flush();
                    dest.close();
                    is.close();
                    fos.close();
                }
            }
        }
        zip.close();
    }


    public static void decompressZipFileForScorm(String zipFile, String outputFolder) throws IOException {
        ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile));
        ZipEntry ze = zis.getNextEntry();
        while (ze != null) {
            String entryName = ze.getName();
            File f = new File(String.format("%s%s%s", outputFolder, File.separator, entryName));
            //create all folder needed to store in correct relative path.
            f.getParentFile().mkdirs();
            FileOutputStream fos = new FileOutputStream(f);
            int len;
            byte buffer[] = new byte[1024];
            while ((len = zis.read(buffer)) > 0) {
                fos.write(buffer, 0, len);
            }
            fos.close();
            ze = zis.getNextEntry();
        }
        zis.closeEntry();
        zis.close();
    }


    /**
     *
     * @param zipFile - zip file to validate
     * @return an object representing the validation status. This method validates that the zip file doesn't have any folders ending with white spaces
     * @throws IOException
     */
    public static ZipValidationReport validateZipFile(File zipFile) throws IOException{
        ZipInputStream zis = null;
        List<String> invalidPaths = new ArrayList<>();
        HashSet<String> pathsAlreadyChecked = new HashSet<>(); // a set the will hold all the paths that are checked. we use this to avoid double checking of parent folders
        try {
            zis = ZipUtils.openZipFile(zipFile);
            String zipElementPath;
            while ((zipElementPath = ZipUtils.nextEntry(zis)) != null) {
                File fileToCheck = new File(zipElementPath);
                while (fileToCheck!=null){
                    String path = fileToCheck.getPath();
                    if (pathsAlreadyChecked.contains(path)){
                        break; // breaks the while fileToCheck!=null. no need to recheck a path.
                    } else { // this path was not checked before
                        if (path.endsWith(" ") || path.endsWith(".")) {
                            invalidPaths.add(path);
                        }
                        pathsAlreadyChecked.add(path);
                        fileToCheck = fileToCheck.getParentFile();
                    }
                }
            }
            if (invalidPaths.isEmpty()){
                logger.debug(String.format("Zip validation ended: zip %s is valid", zipFile.getAbsolutePath()));
                return new ZipValidationReport(true);
            } else {
                ZipValidationReport zipValidationReport = new ZipValidationReport(false, "Zip should not contain folders ending with white space.\nDetails:\n" + Arrays.toString(invalidPaths.toArray()));
                logger.error(String.format("Zip validation ended: zip %s is not valid. Reason: %s", zipFile.getAbsolutePath(), zipValidationReport.getError()));
                return zipValidationReport;
            }

        } catch (IOException e) {
            ZipValidationReport zipValidationReport = new ZipValidationReport(false,"Zip validation failed with exception: "+e);
            logger.error(String.format("Zip validation for file: %s ended with Exceptions: %s", zipFile.getAbsolutePath(), zipValidationReport.getError()));
            return zipValidationReport;
        } finally {
            if (zis !=null){
                zis.close();
            }
        }

    }

    public static class ZipValidationReport {
        private final boolean isValid;
        private final String error;

        public ZipValidationReport(boolean isValid) {
            this.isValid = isValid;
            this.error = "";
        }

        public ZipValidationReport(boolean isValid, String error) {
            this.isValid = isValid;
            this.error = error;
        }

        public boolean isValid() {
            return isValid;
        }

        public String getError() {
            return error;
        }
    }
}