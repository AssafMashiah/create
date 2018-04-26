package org.t2k.cgs.model.ebooks;

import org.t2k.cgs.model.job.Job;

/**
 * Object used by the EBookManager during {@link EBook} processing
 *
 * @author Alex Burdusel on 2016-09-02.
 */
public interface EBookManagerData {
    /**
     * @return of the {@link Job} used in the {@link EBook} processing
     */
    String getJobId();

    /**
     * @return ID of the publisher running the process
     */
    int getPublisherId();

    /**
     * @return directory where the {@link EBook} being processed is stored
     */
    String getEBookDir();

    /**
     * @return eBookId of the {@link EBook} being processed
     */
    String getEBookId();

    /**
     * @return true if the job was canceled, false otherwise
     */
    boolean isCancelled();

    /**
     * Cancels the job
     */
    void setCancelled();
}
