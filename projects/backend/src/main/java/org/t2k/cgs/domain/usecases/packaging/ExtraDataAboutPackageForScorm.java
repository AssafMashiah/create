package org.t2k.cgs.domain.usecases.packaging;

import com.t2k.common.utils.PublishModeEnum;

import java.util.Date;

/**
 * Created by elad.avidan on 15/12/2014.
 */
public class ExtraDataAboutPackageForScorm {
    private long fileSize;
    private PublishModeEnum publishModeEnum;
    private Date publishStartDate;
    private String publisherName;

    public ExtraDataAboutPackageForScorm(long fileSize, PublishModeEnum publishModeEnum, Date publishStartDate, String publisherName) {
        this.fileSize = fileSize;
        this.publishModeEnum = publishModeEnum;
        this.publishStartDate = publishStartDate;
        this.publisherName = publisherName;
    }

    public long getFileSize() {
        return fileSize;
    }

    public PublishModeEnum getPublishModeEnum() {
        return publishModeEnum;
    }

    public Date getPublishStartDate() {
        return publishStartDate;
    }

    public String getPublisherName() {
        return publisherName;
    }
}
