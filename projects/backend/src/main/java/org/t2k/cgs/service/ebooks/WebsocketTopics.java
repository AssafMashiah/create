package org.t2k.cgs.service.ebooks;

/**
 * @author Alex Burdusel on 2016-06-28.
 */
public class WebsocketTopics {

    /**
     * General job topic for websocket - concatenate jobId to it
     */
    public static final String JOB = "/topic/job/";
    /**
     * Specialised upload and convert topic - concatenate jobId to it
     */
    public static final String UPLOAD_AND_CONVERT = "/topic/uploadAndConvert/";
    /**
     * Specialised update eBook topic - concatenate jobId to it
     */
    public static final String UPDATE_EBOOK = "/topic/updateEBook/";
}
