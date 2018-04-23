package org.t2k.cgs.ebooks;

import org.apache.log4j.Logger;
import org.t2k.cgs.model.ebooks.UploadEBookData;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 18/10/2015
 * Time: 08:00
 */
public class UploadEBookThread implements EBookHandlingRunnable {

    private Logger logger = Logger.getLogger(this.getClass());

    private EBookService eBookService;

    private UploadEBookData uploadEBookData;

    private EBookManager eBookManager;

    public UploadEBookThread(UploadEBookData uploadEBookData, EBookService eBookService, EBookManager eBookManager) {
        this.uploadEBookData = uploadEBookData;
        this.eBookService = eBookService;
        this.eBookManager = eBookManager;
    }

    @Override
    public void run() {
        logger.debug(String.format("UploadEBookThread.run(): About to upload ebook file %s to FS.", this.uploadEBookData.getUploadedEBookFile().getName()));
        eBookService.uploadEBookFile(this.uploadEBookData, eBookManager);
        logger.debug(String.format("UploadEBookThread.run(): Upload complete for ebook file %s to FS.", this.uploadEBookData.getUploadedEBookFile().getName()));
    }

    @Override
    public void cancelProcess() {
        logger.debug(String.format("UploadEBookThread.cancelProcess(): About to cancel upload process of ebook file %s to FS.", this.uploadEBookData.getUploadedEBookFile().getName()));
        eBookService.cancelProcess(this.uploadEBookData);
        logger.debug(String.format("UploadEBookThread.cancelProcess(): Successfully cancelled upload process of ebook file %s to FS.", this.uploadEBookData.getUploadedEBookFile().getName()));
    }
}