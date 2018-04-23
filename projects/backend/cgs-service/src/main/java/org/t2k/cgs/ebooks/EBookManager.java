package org.t2k.cgs.ebooks;

import org.t2k.cgs.dataServices.exceptions.DsException;
import org.t2k.cgs.enums.EBookConversionServiceTypes;
import org.t2k.cgs.model.ebooks.EBookManagerData;
import org.t2k.cgs.model.ebooks.UploadEBookResponse;

import java.io.File;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 14/10/2015
 * Time: 19:03
 */
public interface EBookManager {

    UploadEBookResponse addJobToPendingQueue(String jobId, String eBookId, int publisherId, String username, File uploadedEBookFile, EBookConversionServiceTypes conversionLibrary);

    void addJobToPendingQueue(String jobId, EBookHandlingRunnable runnable);

    /**
     * Removes the task associated with the jobId from the {@link EBookManager}, if it is present.
     * <p>
     * Returns the {@link EBookHandlingRunnable} to which the jobId is associated, or null if no mapping was found.
     *
     * @param jobId the jobId for which to remove the task from the {@link EBookManager}
     * @return the {@link EBookHandlingRunnable} to which the jobId is associated, or null if no mapping was found.
     */
    EBookHandlingRunnable removeJob(String jobId);

    void cancelUploadProcess(String jobId) throws DsException;

    void onTaskFinished(EBookManagerData uploadEBookData);
}