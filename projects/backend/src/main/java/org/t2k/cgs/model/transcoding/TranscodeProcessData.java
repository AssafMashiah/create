package org.t2k.cgs.model.transcoding;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.t2k.utils.JsonDateSerializer;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: Elad.Avidan
 * Date: 09/03/2015
 * Time: 17:33
 */
public class TranscodeProcessData implements Serializable {

    private NameFormat nameFormat;
    private String id;
    private int progressPercentage;
    private Status status;
    private Date creationDate;
    private Date finishedDate;
    private String convertedFilePath;
    private List<String> errors = new ArrayList<>();

    public TranscodeProcessData() { }

    public String getId() {
        return id;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public void setFinishedDate() {
        this.finishedDate = new Date();
    }

    public int getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(int progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public NameFormat getNameFormat() {
        return nameFormat;
    }

    public String getConvertedFilePath() {
        return convertedFilePath;
    }

    public void setConvertedFilePath(String convertedFilePath) {
        this.convertedFilePath = convertedFilePath;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void addError(String error){
        errors.add(error);
    }

    @JsonSerialize(using = JsonDateSerializer.class)
    public Date getCreationDate() {
        return creationDate;
    }

    @JsonSerialize(using = JsonDateSerializer.class)
    public Date getFinishedDate() {
        return finishedDate;
    }
}