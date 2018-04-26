package org.t2k.cgs.model.publishing;

import java.util.UUID;

/**
 * Created with IntelliJ IDEA.
 * User: Elad.Avidan
 * Date: 07/09/2014
 * Time: 11:36
 */
public class PublishError {

    private String errorId;
    private PublishErrors publishError;
    private String resourceId; // tocItemId, courseId, etc...
    private String message;

    public PublishError() { } // Being used by MongoDB when fetching the CGSPackage objects.

    public PublishError(String message) {
        this.errorId = UUID.randomUUID().toString();
        this.message = message;
    }

    public PublishError(PublishErrors publishError, String message) {
        this(message);
        this.publishError = publishError;
    }

    public PublishError(PublishErrors publishError, String resourceId, String message) {
        this(publishError, message);
        this.resourceId = resourceId ;
    }

    public String getErrorId() {
        return this.errorId;
    }

    public String getMessage() {
        return this.message;
    }

    public PublishErrors getPublishError() {
        return publishError;
    }

    public String getResourceId() {
        return resourceId;
    }

    @Override
    public String toString() {
        if (message != null && !message.isEmpty())
            return String.format("{ errorId: %s, publishError: %s, resourceId: %s, message: %s }", errorId, publishError != null ? publishError.name() : null , resourceId, message);
        else
            return String.format("{ errorId: %s, publishError: %s, resourceId: %s }", errorId, publishError != null ? publishError.name() : null, resourceId);
    }
}