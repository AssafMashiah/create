package org.t2k.cgs.domain.usecases.ebooks;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 19/10/2015
 * Time: 16:23
 */
public class UploadEBookResponse {

    private String jobId;

    public UploadEBookResponse(String jobId) {
        this.jobId = jobId;
    }

    public String getJobId() {
        return jobId;
    }
}