package org.t2k.cgs.utils;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.ArrayUtils;
import org.apache.log4j.Logger;
import org.springframework.web.multipart.MultipartFile;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.usecases.JobService;

import java.io.*;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;
import java.util.Map;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import java.util.stream.Collectors;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 14/08/13
 * Time: 11:47
 */
public class FilesUtils {

    public static final int UPDATE_JOB_PROGRESS_PER_X_FILES = 100;
    private Logger logger = Logger.getLogger(FilesUtils.class);

    private int filesCounter;

    // for progress tracking monitoring
    private JobService jobService = null;

    public FilesUtils(JobService jobService) {
        this.jobService = jobService;
        this.filesCounter = 0;
    }

    public void copy(InputStream is, String targetFilePath, boolean overwrite) throws IOException {
        File targetFile = new File(targetFilePath);

        File parentDir = new File(targetFile.getParent());
        if (!parentDir.exists()) {
            parentDir.mkdirs();
        }

        if (overwrite && targetFile.exists()) {
            targetFile.delete();
        }

        targetFile.createNewFile();

        byte[] buffer = new byte[51200];
        int length;
        try (BufferedOutputStream bufferedOutputStream = new BufferedOutputStream(new FileOutputStream(targetFile))) {
            while ((length = is.read(buffer)) > 0) {
                bufferedOutputStream.write(buffer, 0, length);
            }
        }
    }

    /**
     * @param jarFile
     * @param dirPath      the path of the directory inside the jar
     * @param destination  destination where to extract the directory
     * @param preserveTree weather to preserve the dir structure inside the dirpath or spool all the files in the
     *                     destination dir
     * @return the list of extracted files names
     */
    public List<String> extractDirFromJar(File jarFile, String dirPath, String destination, boolean preserveTree) {
        int bufferSize = 4096;
        List<String> extractedFiles = new ArrayList<>();
        JarFile jar = null;
        try {
            jar = new JarFile(jarFile);
            File destinationDir = new File(destination);
            if (!destinationDir.exists()) {
                destinationDir.mkdir();
            }
            Enumeration<? extends JarEntry> jarFileEntries = jar.entries();
            while (jarFileEntries.hasMoreElements()) {
                JarEntry entry = jarFileEntries.nextElement();
                if (!entry.getName().startsWith(dirPath)) {
                    continue;
                }
                //strip the dirpath inside the jar from the extract file path
                String destPath = entry.getName().replaceAll(dirPath + "/", "");
                File destFile = new File(destination, destPath);
                if (preserveTree) {
                    File destDir = destFile.getParentFile();
                    destDir.mkdirs();
                } else {
                    destFile = new File(destination, destFile.getName());
                }
                if (!entry.isDirectory()) {
                    BufferedInputStream input = new BufferedInputStream(jar.getInputStream(entry));
                    int b;
                    byte data[] = new byte[bufferSize];
                    BufferedOutputStream output = new BufferedOutputStream(new FileOutputStream(destFile), bufferSize);
                    while ((b = input.read(data, 0, bufferSize)) != -1) {
                        output.write(data, 0, b);
                    }
                    output.flush();
                    output.close();
                    input.close();
                    extractedFiles.add(entry.getName());
                }
            }
        } catch (IOException e) {
            logger.error("Error extracting directory from jar", e);
            if (jar != null) {
                try {
                    jar.close();
                } catch (IOException ex) {
                    logger.error("Error trying to close the jar", ex);
                }
            }
        }
        return extractedFiles;
    }

    private void copyFolderRecursively(File src, File dest, String jobId, int totalFilesCount) throws Exception {
        if (src.isDirectory()) {
            if (!dest.exists()) { // if directory not exists, create it
                dest.mkdirs();
            }

            // list all the directory contents
            String files[] = src.list();

            for (String file : files) {
                // construct the src and dest file structure
                File srcFile = new File(src, file);
                File destFile = new File(dest, file);
                // recursive copy
                copyFolderRecursively(srcFile, destFile, jobId, totalFilesCount);
            }

        } else { // if file, then copy it
            // use bytes stream to support all file types
            try (InputStream in = new FileInputStream(src);
                 OutputStream out = new FileOutputStream(dest)) {

                byte[] buffer = new byte[1024];

                int length;
                // copy the file content in bytes
                while ((length = in.read(buffer)) > 0) {
                    out.write(buffer, 0, length);
                }

                ++filesCounter;
                int filesProgress = filesCounter * 100 / totalFilesCount;

                try {
                    if (filesCounter % UPDATE_JOB_PROGRESS_PER_X_FILES == 0) {
                        jobService.updateJobProgress(jobId, "copy files", filesProgress, Job.Status.IN_PROGRESS);
                    }
                } catch (Exception e) {
                    logger.warn(e);
                }
            }
        }
    }

    public void copyFolder(File src, File dest, String jobId) throws Exception {
        filesCounter = 0;
        jobService.updateJobProgress(jobId, "copy files", 0, Job.Status.IN_PROGRESS);
        int totalFiles = getNumberOfFiles(src);
        copyFolderRecursively(src, dest, jobId, totalFiles);
    }

    private int getNumberOfFiles(File dir) {
        int count = 0;
        if (dir.exists()) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        count += getNumberOfFiles(file);
                    } else
                        count++;
                }
            }
        }
        return count;
    }

    public void deleteDirectory(File directory, String jobId) throws IOException {
        filesCounter = 0;
        jobService.updateJobProgress(jobId, "delete staging directory", 0, Job.Status.IN_PROGRESS);
        int numberOfFiles = getNumberOfFiles(directory);
        deleteDirectoryRecursively(directory, numberOfFiles, jobId);
        jobService.updateJobProgress(jobId, "delete staging directory", 100, Job.Status.IN_PROGRESS);
    }

    private void deleteDirectoryRecursively(File directory, int totalNumberOfFiles, String jobId) throws IOException {
        if (!directory.exists()) {
            return;
        }

        if (directory.isDirectory()) {
            File[] files = directory.listFiles();
            if (files == null) {  // null if security restricted
                throw new IOException(String.format("Failed to list contents of %s", directory));
            }

            for (File file : files) {
                deleteDirectoryRecursively(file, totalNumberOfFiles, jobId);
            }
        }

        FileUtils.forceDelete(directory);
        filesCounter++;

        try {
            if (filesCounter % UPDATE_JOB_PROGRESS_PER_X_FILES == 0) {
                jobService.updateJobProgress(jobId, "delete staging directory", filesCounter * 100 / totalNumberOfFiles, Job.Status.IN_PROGRESS);
            }
        } catch (Exception e) {
            logger.warn(e);
        }
    }

    public String readResourcesAsString(Class clazz, String localPath) throws IOException {
        InputStream resourceAsStream = null;
        try {
            resourceAsStream = clazz.getClassLoader().getResourceAsStream(localPath);
            java.util.Scanner s = new java.util.Scanner(resourceAsStream).useDelimiter("\\A");
            return s.hasNext() ? s.next() : "";
        } finally {
            resourceAsStream.close();
        }
    }

    public List<File> getAllFiles(File dir) {
        List<File> allFiles = new ArrayList<>();
        File[] files = dir.listFiles();
        for (File file : files) {
            if (file.isDirectory()) {
                allFiles.addAll(getAllFiles(file));
            } else {
                allFiles.add(file);
            }
        }

        return allFiles;
    }

    /**
     * @param dir       directory to list files from
     * @param recursive include all files in directory and all subdirectories
     * @param relative  weather to retrieve relative path from the directory's root or absolute path to the file
     * @return a list of files found in the directory
     */
    public static List<String> listFiles(File dir, boolean recursive, boolean relative) {
        if (!relative) {
            return FileUtils.listFiles(dir, null, recursive).stream()
                    .map(File::getPath).collect(Collectors.toList());
        }

        return FileUtils.listFiles(dir, null, true)
                .stream()
                .map(file -> file.getPath()
                        .replace('\\', '/')
                        .replaceAll(dir.getParent().replace('\\', '/') + "/", ""))
                .collect(Collectors.toList());
    }

    public void setJobService(JobService jobService) {
        this.jobService = jobService;
    }

    /**
     * <p>
     * Method to hash a file using SHA-1 in the form of hexadecimal string. This method uses a combination of file name
     * and file data to build the hex string.
     * </p>
     * <p>
     * For hashing the data, the algorithm takes a block from the start of the file and a block from the end of the file.
     * The block size is given as parameter. If the given block size exceeds half of the file size, meaning the two
     * blocks exceed the file size, the entire file is used for hashing and the name of the file is no longer included
     * in the hash.
     * </p>
     * <p>
     * NOTE: There is a trade-off between speed and accuracy - the smaller the block size, the faster the hashing process,
     * the larger the block size, the more accurate the hashing is.
     * </p>
     *
     * @param filePath  path to the file for which the hash should be generated
     * @param blockSize size of the block to be used for hashing the file data in bytes.
     * @return SHA-1 digest as a hexadecimal string
     * @throws IOException if an error occurs reading the file
     */
    public static String fastSha1Hash(String filePath, int blockSize) throws IOException {
        File file = new File(filePath);
        int fileSize = (int) file.length();
        if (blockSize > fileSize / 2) { // fixes java.io.IOException: Negative seek offset for smaller files
            byte[] bytes = FileUtils.readFileToByteArray(file);
            return DigestUtils.sha1Hex(bytes);
        }
        try (RandomAccessFile raFile = new RandomAccessFile(file, "r")) {
            byte[] nameBytes = filePath.getBytes();
            byte[] dataBytes = new byte[blockSize * 2];
            // Read into the first half of the buffer, the First Block from the file.
            raFile.read(dataBytes, 0, blockSize);
            // Move cursor to the Last Block.
            raFile.seek(fileSize - blockSize);
            // Read into the second half of the buffer, the Last Block from the file.
            raFile.read(dataBytes, blockSize, blockSize);
            return DigestUtils.sha1Hex(ArrayUtils.addAll(dataBytes, nameBytes));
        }
    }

    /**
     * @param multipartFile
     * @param destinationFile
     * @param overwriteExisting
     * @return The new file saved to disk or the existing one if overwriteExisting was false.
     * @throws IOException
     */
    public static File saveMultipartFileToDisk(MultipartFile multipartFile,
                                               String destinationFile,
                                               boolean overwriteExisting) throws IOException {
        File savedFile = new File(destinationFile);
        if (savedFile.exists() && overwriteExisting) {
            savedFile.delete();
        } else if (savedFile.exists()) {
            return savedFile;
        } else {
            savedFile.createNewFile();
        }
        multipartFile.transferTo(savedFile);
        return savedFile;
    }

    /**
     * Replaces all occurrences of a given string in a given text file
     *
     * @param file              text file to replace the string in
     * @param stringToReplace   the string to replace in the text file (regular expression)
     * @param replacementString the string to be substituted for each match
     * @return the text content of the file after update
     * @throws IOException in case an error is encountered editing the text file
     */
    public static String replaceStringInFile(File file, String stringToReplace, String replacementString) throws IOException {
        String fileString = FileUtils.readFileToString(file);
        fileString = fileString.replaceAll(stringToReplace, replacementString);
        try (FileWriter fw = new FileWriter(file)) {
            fw.write(fileString);
        }
        return fileString;
    }

    /**
     * Replaces all occurrences of a given string in a given text file
     *
     * @param file             text file to replace the string in
     * @param stringsToReplace a map containing as keys the strings to replace in the text file (regular expression)
     *                         and as values the strings to be substituted for each match
     * @return the text content of the file after update
     * @throws IOException in case an error is encountered editing the text file
     */
    public static String replaceStringsInFile(File file, Map<String, String> stringsToReplace) throws IOException {
        String fileString = FileUtils.readFileToString(file);
        for (String stringToReplace : stringsToReplace.keySet()) {
            String replacementString = stringsToReplace.get(stringToReplace);
            fileString = fileString.replaceAll(stringToReplace, replacementString);
        }
        try (FileWriter fw = new FileWriter(file)) {
            fw.write(fileString);
        }
        return fileString;
    }
}
