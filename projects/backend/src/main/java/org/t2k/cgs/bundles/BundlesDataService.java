package org.t2k.cgs.bundles;

import org.apache.commons.fileupload.FileItem;
import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.model.bundle.Bundle;

import java.io.File;
import java.io.IOException;
import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: yohai.akoka
 * Date: 06/08/14
 * Time: 09:39
 */
public interface BundlesDataService {

    /**
     * validates the fileitem uploaded by user
     * @param file - uploaded file
     * @throws DsException
     */
    void validateUploadedFileMimeTypeAndHasFormField(FileItem file) throws DsException;

    /**
     * Validates and saves the uploaded file form and format bundle in the file into the DB.
     * @param publisherId - the publisher that this bundle will be connected to
     * @param fileItem - uploaded zip file of the bundle
     * @throws DsException
     * @throws IOException
     */
    void validateAndSave(int publisherId, FileItem fileItem) throws DsException, IOException;

    /**
     * Validates and saves the uploaded file form and format bundle in the file into the DB.
     * @param publisherId - the publisher that this bundle will be connected to
     * @param bundleFile - File containg a zipped bundle (possibly got from user upload)
     * @throws DsException
     * @throws IOException
     */
    void save(int publisherId, File bundleFile) throws DsException, IOException;

    /**
     * Deletes bundle (if exists) both from DB and file system
     * @param publisherId - publisherId on cgs
     * @param bundleId - unique ID for the bundle
     * @throws DsException
     * @throws IOException
     */
    void deleteBundle(int publisherId, String bundleId) throws DsException, IOException;

    /**
     * Return the bundles directory of a publisher @publisherId
     * @param publisherId - publisherId on cgs
     * @return local path for bundles directory of the publisher
     */
    String getPublisherBundleDirectoryPath(int publisherId);

    /**
     * @param publisherId - publisherId on cgs
     * @param bundleId - unique bundle ID for publisher
     * @return - directory path of a specific bundle @bundleId of publisher @publisherId
     */
    String getBundleDirectory(int publisherId, String bundleId);

    /**
     * @param publisherId - publisherId on cgs
     * @return - a list of bundles that publisher @publisherId have on DB and file system
     */
    List<Bundle> getBundlesByAccountId(int publisherId);

    List<Bundle> getByAccountId(int accountId) throws DsException;

    Bundle getByAccountId(int publisherId1, String bundleName) throws DsException;

    void deleteOldBundlesFolders(int xDaysAgo) throws DsException;
}