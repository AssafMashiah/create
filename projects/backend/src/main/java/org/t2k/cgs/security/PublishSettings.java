package org.t2k.cgs.security;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 1/21/15
 * Time: 10:20 AM
 * To change this template use File | Settings | File Templates.
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonSerialize(include = JsonSerialize.Inclusion.NON_NULL)
public class PublishSettings {

    private ContentPublishSettings lessons;

    private ContentPublishSettings courses;

    private String publishPlayServerUrl;

    private String publishUploadServerUrl;

    public ContentPublishSettings getLessons() {
        return lessons;
    }

    public ContentPublishSettings getCourses() {
        return courses;
    }

    public String getPublishPlayServerUrl() {
        return publishPlayServerUrl;
    }

    public String getPublishUploadServerUrl() {
        return publishUploadServerUrl;
    }
}
