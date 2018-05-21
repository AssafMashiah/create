package org.t2k.cms.model;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 05/02/13
 * Time: 09:43
 */
public class CmsLocations {

    public final static String APPLETS_LOCATION_PREFIX = "applets";
    public final static String COURSE_ASSETS_LOCATION_PATTERN = "publishers/{publisherId}/courses/{courseId}";
    public final static String APPLETS_LOCATION_PATTERN = APPLETS_LOCATION_PREFIX +"/{appletId}/{appletVersion}";
    public final static String COURSE_ASSETS_APPLETS_LOCATION_PATTERN = "/" + COURSE_ASSETS_LOCATION_PATTERN + "/" + APPLETS_LOCATION_PATTERN;

    public static String resolve(String pattern, Object ... parameters){
        String newPattern = pattern;
        for (int i = 0; i < parameters.length; i++){
            newPattern = newPattern.replaceFirst("[{][0-9a-zA-z]+[}]", parameters[i].toString());
        }
        return newPattern;
    }
}
