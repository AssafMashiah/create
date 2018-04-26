package org.t2k.cgs.model.job;

/**
 * @author Alex Burdusel on 2016-06-29.
 */
public class JobComponentProgress {

    private JobComponent component;
    private int progress;

    /**
     * Creates a new instance of a {@link JobComponentProgress}
     *
     * @param component Component of the job
     * @param progress  Percent of progress (between 0 and 100)
     * @return a new instance of {@link JobComponentProgress}
     * @throws IllegalArgumentException if the progress value is not between 0 and 100
     */
    public static JobComponentProgress newInstance(JobComponent component, int progress) {
        JobComponentProgress componentProgress = new JobComponentProgress();
        if (progress < 0 || progress > 100) {
            throw new IllegalArgumentException("Progress value must be between 0 and 100");
        }
        componentProgress.component = component;
        componentProgress.progress = progress;
        return componentProgress;
    }

    public JobComponent getComponent() {
        return component;
    }

    public int getProgress() {
        return progress;
    }
}
