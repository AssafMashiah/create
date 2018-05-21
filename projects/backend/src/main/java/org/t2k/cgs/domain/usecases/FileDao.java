package org.t2k.cgs.domain.usecases;

import org.t2k.cgs.domain.model.exceptions.DsException;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 29/10/12
 * Time: 09:44
 */
public interface FileDao {
    byte[] getFile(String fullPath) throws DsException;

    void saveFile(byte[] byteArray, String fullPath) throws DsException;

    void deleteFile(String fullPath) throws DsException;

    boolean fileExists(String fullPath);

    void copy(String sourceFullPath, String destinationFullPath) throws DsException;

    void deleteFileIfExists(String fullPath) throws DsException;

    String appendSlashIfNeeded(String str);
}
