package org.t2k.cgs.utils.directory;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import org.t2k.cgs.domain.usecases.ebooks.EbookJobComponent;
import org.t2k.cgs.domain.model.job.Job;
import org.t2k.cgs.domain.usecases.JobService;
import org.t2k.cgs.utils.SystemUtils;

import java.io.File;

@Service
@Scope("prototype")
public class DirectoryMonitor implements Runnable {

    private static final long SLEEP_CONSTANT_MILISECONDS = 1300;
    private File directoryPath;
    private String jobId;
    private int totalPages;

    // Set to true as long as the loop is running.
    private Boolean isRunning;

    // Will be set to true only when exiting.
    private Boolean isCompleted;

    @Autowired
    private JobService jobService;

    @Autowired
    private SystemUtils systemUtils;

    public DirectoryMonitor() {
    }

    public DirectoryMonitor(File directoryPath, String jobId, int totalPages) {
        this.directoryPath = directoryPath;
        this.jobId = jobId;
        this.totalPages = totalPages;

        this.isRunning = true;
        this.isCompleted = false;
    }

    @Override
    public void run() {

        logger.debug(String.format("Job [%s] - Monitoring HTML Page Files on Directory: %s", this.jobId, this.directoryPath));
        if (this.totalPages < 1) {
            logger.debug(String.format("Job [%s] - Expected total number of pages is 0.  aborting directory monitor on path: %s", this.jobId, this.directoryPath));
            return;
        }

        while (this.isRunning) {
            systemUtils.sleep(SLEEP_CONSTANT_MILISECONDS); // comment

            File[] htmlPageFiles = directoryPath.listFiles(new HtmlPageFilesFilter());

            if (htmlPageFiles != null) {
                int percentage = (int) Math.round(htmlPageFiles.length / (this.totalPages / 100.0));
                logger.debug(String.format("Job [%s] - PDF To HTML Progress: %d%%", this.jobId, percentage));
                jobService.updateJobProgress(jobId, EbookJobComponent.PROGRESS_BUILD_STRUCTURE.getTitle(), percentage, Job.Status.IN_PROGRESS);

                if (htmlPageFiles.length >= totalPages) {
                    this.isRunning = false;
                }
            } else {
                logger.debug(String.format("Job [%s] - HTML Page-Files not generated yet in directory: %s", this.jobId, this.directoryPath));
            }
        }

        logger.debug(String.format("Job [%s] - PDF to HTML Conversion Completed. (100%%)", this.jobId));

        this.isCompleted = true;
    }

    public void stop() {
        logger.debug(String.format("Request to STOP Directory Monitor for JobId: %s, Path: %s", this.jobId, this.directoryPath == null ? "N/A" : this.directoryPath.getAbsolutePath()));
        this.isRunning = false;
        while (!isCompleted) {
            logger.debug("Waiting for Directory Monitor to complete...");
            systemUtils.sleep(60);
        }
    }

    private Logger logger = Logger.getLogger(this.getClass());
}
