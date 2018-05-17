package org.t2k.cgs.domain.usecases.ebooks;

import org.t2k.cgs.domain.model.ebooks.EBook;

import java.util.HashSet;
import java.util.Set;

/**
 * @author Alex Burdusel on 2016-09-02.
 */
public class UpdateEBookData implements EBookManagerData {

    private String jobId;
    private int publisherId;
    /**
     * username of the user that started the process
     */
    private String username;
    private EBook newEBook;
    private String newEBookDir;
    private EBook oldEBook;
    private String oldEBookDir;
    /**
     * IDs of the courses to update the eBook on
     */
    private Set<String> courseIds;
    private boolean uploadedOnCurrentJob;
    private boolean isCancelled;

    private static UpdateEBookData newInstance(Builder builder) {
        UpdateEBookData updateEBookData = new UpdateEBookData();
        updateEBookData.jobId = builder.jobId;
        updateEBookData.publisherId = builder.publisherId;
        updateEBookData.username = builder.username;
        updateEBookData.newEBook = builder.newEBook;
        updateEBookData.newEBookDir = builder.newEBookDir;
        updateEBookData.oldEBook = builder.oldEBook;
        updateEBookData.oldEBookDir = builder.oldEBookDir;
        updateEBookData.courseIds = builder.courseIds == null ? new HashSet<>(0) : builder.courseIds;
        updateEBookData.uploadedOnCurrentJob = builder.uploadedOnCurrentJob;
        return updateEBookData;
    }

    public static final class Builder {

        private String jobId;
        private int publisherId;
        private String username;
        private EBook newEBook;
        private String newEBookDir;
        private EBook oldEBook;
        private String oldEBookDir;
        /**
         * IDs of the courses to update the eBook on
         */
        private Set<String> courseIds;
        private boolean uploadedOnCurrentJob;

        public Builder(String jobId, int publisherId, String username,

                       EBook newEBook,
                       EBook oldEBook, String oldEBookDir) {
            this.jobId = jobId;
            this.publisherId = publisherId;
            this.username = username;
            this.newEBook = newEBook;
            this.oldEBook = oldEBook;
            this.oldEBookDir = oldEBookDir;
        }

        public Builder(UploadEBookData uploadEBookData, EBook newEBook, EBook oldEBook, String oldEBookDir) {
            this.jobId = uploadEBookData.getJobId();
            this.publisherId = uploadEBookData.getPublisherId();
            this.username = uploadEBookData.getUsername();
            this.newEBook = newEBook;
            this.newEBookDir = uploadEBookData.getEBookDir();
            this.oldEBook = oldEBook;
            this.oldEBookDir = oldEBookDir;
        }

        public UpdateEBookData build() {
            return newInstance(this);
        }

        /**
         * IDs of the courses to update the eBook on
         */
        public Builder setCourseIds(Set<String> courseIds) {
            this.courseIds = courseIds;
            return this;
        }

        public Builder setUploadedOnCurrentJob(boolean uploadedOnCurrentJob) {
            this.uploadedOnCurrentJob = uploadedOnCurrentJob;
            return this;
        }

        public Builder setNewEBookDir(String newEBookDir) {
            this.newEBookDir = newEBookDir;
            return this;
        }
    }


    @Override
    public String getJobId() {
        return jobId;
    }

    @Override
    public int getPublisherId() {
        return publisherId;
    }

    @Override
    public String getEBookDir() {
        return newEBookDir;
    }

    @Override
    public String getEBookId() {
        return newEBook.getEBookId();
    }

    @Override
    public boolean isCancelled() {
        return isCancelled;
    }

    @Override
    public synchronized void setCancelled() {
        this.isCancelled = true;
    }

    public EBook getNewEBook() {
        return newEBook;
    }

    public EBook getOldEBook() {
        return oldEBook;
    }

    public String getOldEBookDir() {
        return oldEBookDir;
    }


    /**
     * IDs of the courses to update the eBook on
     */
    public Set<String> getCourseIds() {
        return courseIds;
    }

    /**
     * @return true if the new eBook was uploaded on current job, false otherwise
     */
    public boolean isUploadedOnCurrentJob() {
        return uploadedOnCurrentJob;
    }


    /**
     * username of the user that started the process
     */
    public String getUsername() {
        return username;
    }
}
