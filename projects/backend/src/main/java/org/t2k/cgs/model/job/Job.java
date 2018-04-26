package org.t2k.cgs.model.job;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.t2k.cgs.model.utils.ErrorCode;

import java.io.Serializable;
import java.util.*;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 13/08/13
 * Time: 16:31
 */
@Document(collection = "jobs")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Job implements Serializable {

    public enum Status {PREPARED, PENDING, STARTED, IN_PROGRESS, CANCELED, FAILED, COMPLETED}

    public enum Type {
        UploadEBookFile,
        UPLOAD_AND_UPDATE_EBOOK,
        UPDATE_EBOOK,
        IMPORT_TOC_ITEM,
        COURSE_ES_INDEXATION
    }

    @Id
    private String jobId;
    private Date creationDate;
    /**
     * Date time when the job ended.
     */
    private Date endDate;
    private Type type;
    private Map<String, Integer> componentsProgressInPercent = new HashMap<>();
    private JobProperties properties = new JobProperties();
    private Status status = Status.STARTED;
    private String text;
    private String refEntityId;
    private Map<String, String> errors = new HashMap<>();
    private List<String> warnings = new ArrayList<>();
    private String response;
    private String websocketTopic;
    /**
     * An object holding custom details, that don't have a predefined format, but differ from job type to job type
     */
    private Object customData; // may be redundant with properties

    public Job() {
    }

    public Job(String jobId) {
        this.jobId = jobId;
        this.creationDate = new Date();
        status = Status.STARTED;
    }

    public Job(String jobId, Type uploadEBookFile) {
        this(jobId);
        this.creationDate = new Date();
        this.type = uploadEBookFile;
    }

    private static Job newInstance(Builder builder) {
        Job job = new Job();
        job.creationDate = new Date();
        job.jobId = builder.jobId;
        job.type = builder.type;
        if (builder.properties != null) job.properties = builder.properties;
        job.status = builder.status;
        job.text = builder.text;
        job.refEntityId = builder.refEntityId;
        if (builder.errors != null) job.errors = builder.errors;
        if (builder.warnings != null) job.warnings = builder.warnings;
        job.response = builder.response;
        job.websocketTopic = builder.websocketTopic;
        return job;
    }

    public static final class Builder {

        private String jobId;
        private Type type;
        private JobProperties properties;
        private Status status;
        private String text;
        private String refEntityId;
        private Map<String, String> errors;
        private List<String> warnings;
        private String response;
        private String websocketTopic;

        public Builder(String jobId, Type type, Status status) {
            this.jobId = jobId;
            this.type = type;
            this.status = status;
        }

        public Job build() {
            return newInstance(this);
        }

        public Builder setProperties(JobProperties properties) {
            this.properties = properties;
            return this;
        }

        public Builder setText(String text) {
            this.text = text;
            return this;
        }

        public Builder setRefEntityId(String refEntityId) {
            this.refEntityId = refEntityId;
            return this;
        }

        public Builder setErrors(Map<String, String> errors) {
            this.errors = errors;
            return this;
        }

        public Builder setWarnings(List<String> warnings) {
            this.warnings = warnings;
            return this;
        }

        public Builder setResponse(String response) {
            this.response = response;
            return this;
        }

        public Builder setWebsocketTopic(String websocketTopic) {
            this.websocketTopic = websocketTopic;
            return this;
        }
    }


    public String getJobId() {
        return jobId;
    }

    /**
     * @return a copy of the component progress map of the Job
     */
    public Map<String, Integer> getComponentsProgressInPercent() {
        return new HashMap<>(componentsProgressInPercent);
    }

    /**
     * @param component the job component to set the progress for
     * @param progress  Progress value between 0 and 100
     */
    public void updateComponentProgress(JobComponent component, Integer progress) {
        if (progress < 0 || progress > 100) {
            throw new IllegalArgumentException("Progress value must be between 0 and 100");
        }
        componentsProgressInPercent.put(component.getValue(), progress);
    }

    /**
     * @return a copy of the properties map of the Job
     */
    public JobProperties getProperties() {
        return properties;
    }

    public void setProperties(JobProperties properties) {
        this.properties = properties;
    }

    /**
     * @return a copy of the warnings list on the job
     */
    public List<String> getWarnings() {
        return new ArrayList<>(warnings);
    }

    public void addWarnings(List<String> warnings) {
        this.warnings.addAll(warnings);
    }

    public void addWarning(String warnings) {
        this.warnings.add(warnings);
    }

    public String getResponse() {
        return this.response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    /**
     * @return a copy of the errors map on the job
     */
    public Map<String, String> getErrors() {
        return new HashMap<>(errors);
    }

    /**
     * Adds the error codes and error messages to the errors map of the job
     * If the an error code already exists in the errors map, we add append the new error message to its value
     */
    public void addErrors(Map<ErrorCode, String> errors) {
        errors.forEach(this::addError);
    }

    /**
     * Adds the error code and error message to the errors map of the job
     * If the error code already exists in the errors map, we add append the new error message to its value
     */
    public void addError(ErrorCode errorCode, String errorMessage) {
        String existingErrorMessage = this.errors.get(errorCode.getCode());
        errorMessage = existingErrorMessage == null ? errorMessage : existingErrorMessage + ";\n" + errorMessage;
        this.errors.put(errorCode.getCode(), errorMessage);
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getRefEntityId() {
        return refEntityId;
    }

    public void setRefEntityId(String refEntityId) {
        this.refEntityId = refEntityId;
    }

    public Type getType() {
        return type;
    }

    public String getWebsocketTopic() {
        return websocketTopic;
    }

    /**
     * An object holding custom details, that don't have a predefined format, but differ from job type to job type
     */
    public Object getCustomData() {
        return customData;
    }

    /**
     * @param customData an object holding custom details, that don't have a predefined format, but differ from job type to job type
     */
    public void setCustomData(Object customData) {
        this.customData = customData;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    /**
     * Date time when the job ended.
     */
    public Date getEndDate() {
        return endDate;
    }

    public void setEndDate(Date endDate) {
        this.endDate = endDate;
    }

    /**
     * Returns a brief description of this Job. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * Job{"jobId": "123jasdnvasqwe", "type": "UploadEBookFile", "componentsProgressInPercent": {...},
     * properties": {...}, "status": "COMPLETED"}
     */
    @Override
    public String toString() {
        return "Job{" +
                "\"jobId\": \"" + jobId + '\"' +
                ", \"type\": \"" + type + '\"' +
                ", \"componentsProgressInPercent\": " + componentsProgressInPercent +
                ", \"properties\": " + properties +
                ", \"status\": \"" + status + '\"' +
                ", \"text\": \"" + text + '\"' +
                ", \"refEntityId\": \"" + refEntityId + '\"' +
                ", \"errors\": " + errors +
                ", \"warnings\": " + warnings +
                ", \"response\": \"" + response + '\"' +
                ", \"websocketTopic\": \"" + websocketTopic + '\"' +
                ", \"customData\": " + customData +
                '}';
    }
}