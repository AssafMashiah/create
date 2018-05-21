package org.t2k.cgs.persistence.dao;

import com.t2k.common.utils.FileUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;
import org.t2k.cgs.domain.model.exceptions.DsException;
import org.t2k.cgs.domain.model.exceptions.ResourceNotFoundException;
import org.t2k.cgs.domain.usecases.FileDao;

import java.io.*;


/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 15/10/12
 * Time: 08:35
 */
@Component
public class FileDaoImpl implements FileDao {

    private static Logger logger = Logger.getLogger(FileDaoImpl.class);

    public byte[] getFile(String fullPath) throws DsException {
        fullPath = deleteDoubleSlashes(fullPath);
        File file = new File(fullPath);
        byte[] res;
        int fileSizeInBytes;
        FileInputStream is = null;
        if (file.length() <= Integer.MAX_VALUE) {
            fileSizeInBytes = (int) file.length();
            res = new byte[fileSizeInBytes];
            try {
                is = new FileInputStream(file);
                is.read(res);
                is.close();
            } catch (FileNotFoundException e) {
                if (logger.isDebugEnabled())
                    logger.debug("The file " + fullPath + " doesn't exist");
                throw new ResourceNotFoundException(fullPath, "The file " + fullPath + " does not exist", e);
            } catch (IOException e) {
                if (logger.isDebugEnabled())
                    logger.debug("getFile failed because of an IOException");
                throw new DsException("getFile failed for: " + fullPath, e);
            }
        } else {
            if (logger.isDebugEnabled())
                logger.debug(String.format("The requested file %s is too big", fullPath));
            throw new DsException(String.format("The requested file %s is too big", fullPath));
        }
        return res;
    }

    /*
    Writes byteArray to a file whose path is fullPath.
     */
    public void saveFile(byte[] byteArray, String fullPath) throws DsException {
        fullPath = deleteDoubleSlashes(fullPath);
        File file = new File(fullPath);
        file.getParentFile().mkdirs();
        FileOutputStream fileOutputStream;
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try {
            byteArrayOutputStream.write(byteArray);
            fileOutputStream = new FileOutputStream(file);
            byteArrayOutputStream.writeTo(fileOutputStream);
            byteArrayOutputStream.close();
            fileOutputStream.close();
        } catch (IOException e) {
            if (logger.isDebugEnabled()) {
                logger.debug(String.format("saveFile failed for file: %s because of an IOException", fullPath));
            }
            throw new DsException(String.format("saveFile failed for %s", fullPath), e);
        }
    }

    public void deleteFileIfExists(String fullPath) throws DsException {
        try {
            deleteFile(fullPath);
        } catch (ResourceNotFoundException e) {

        }
    }

    public void deleteFile(String fullPath) throws DsException {
        fullPath = deleteDoubleSlashes(fullPath);
        if (fullPath == null) {
            if (logger.isDebugEnabled()) {
                logger.debug("The path is null");
            }
            throw new DsException("full path cannot be null");
        }
        File file = new File(fullPath);
        if (!file.exists()) {
            if (logger.isDebugEnabled()) {
                logger.debug(String.format("The file %s doesn't exist", fullPath));
            }
            throw new ResourceNotFoundException(fullPath, String.format("The file %s doesn't exist", fullPath));
        }
        if (file.isDirectory()) {
            if (logger.isDebugEnabled()) {
                logger.debug(String.format("The file: %s is a directory", fullPath));
            }
            throw new DsException(String.format("The path leads to a directory and not to a file: %s", fullPath));
        }
        if (!file.canWrite()) {
            if (logger.isDebugEnabled()) {
                logger.debug(String.format("The file %s isn't writable and hence isn't deletable", fullPath));
            }
            throw new DsException(String.format("The file %s isn't writable and hence isn't deletable", fullPath));
        }
        boolean success = file.delete();
        if (!success) {
            if (logger.isDebugEnabled()) {
                logger.debug(String.format("file.delete() returned null on %s", fullPath));
            }
            throw new DsException("Deletion failed");
        }
    }

    @Override
    public void copy(String sourceFullPath, String destinationFullPath) throws DsException {
        try {
            sourceFullPath = deleteDoubleSlashes(sourceFullPath);
            destinationFullPath = deleteDoubleSlashes(destinationFullPath);
            File file = new File(destinationFullPath);
            file.getParentFile().mkdirs();
            InputStream sourceInputStream = new FileInputStream(sourceFullPath);
            FileUtils.copy(sourceInputStream, destinationFullPath, true);
        } catch (Exception e) {
            throw new DsException(String.format("File copy from %s to %s failed", sourceFullPath, destinationFullPath), e);
        }
    }

    public boolean fileExists(String fullPath) {
        return (new File(fullPath)).exists();
    }

    public static boolean endsWithSlash(String str) {
        return str.endsWith("/");
    }

    public String appendSlashIfNeeded(String str) {
        return endsWithSlash(str) ? str : String.format("%s/", str);
    }

    public static String getFileExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf(".");
        return fileName.substring(dotIndex + 1);
    }

    public static String getFileNameWithNoExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf(".");
        return fileName.substring(0, dotIndex);
    }

    public static boolean exists(String path) {
        File file = new File(path);
        return file.exists();
    }

    public static String deleteDoubleSlashes(String path) {
        return path.replaceAll("/+", "/");
    }
}

