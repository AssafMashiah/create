package org.t2k.cgs.security;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

/**
 * Created with IntelliJ IDEA.
 * User: asaf.shochet
 * Date: 1/21/15
 * Time: 10:21 AM
 * To change this template use File | Settings | File Templates.
 */
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
@JsonSerialize(include = JsonSerialize.Inclusion.NON_NULL)
public class ContentPublishSettings {
    private Boolean enablePublishToFile;
    private Boolean enablePublishToCatalog;
    private Boolean enablePublishToUrl;
    private Boolean enableCourseLevelsCustomizationForScorm;

}
