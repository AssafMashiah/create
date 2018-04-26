package org.t2k.cgs.dao;

import org.t2k.cgs.dataServices.exceptions.DsException;

/**
 * Created with IntelliJ IDEA.
 * User: yoni.zohar
 * Date: 29/10/12
 * Time: 09:44
 */
public interface FileDao {
    public byte[] getFile(String fullPath) throws DsException;
    public void saveFile(byte[] byteArray, String fullPath) throws DsException;
    public void deleteFile(String fullPath) throws DsException;
    public boolean fileExists(String fullPath);
    void copy(String sourceFullPath, String destinationFullPath) throws DsException;
    public void deleteFileIfExists(String fullPath) throws DsException;
    public  String appendSlashIfNeeded(String str);
}
