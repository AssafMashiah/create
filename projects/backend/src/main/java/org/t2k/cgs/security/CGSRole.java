package org.t2k.cgs.security;

/**
 * Created with IntelliJ IDEA.
 * User: micha.shlain
 * Date: 7/2/13
 * Time: 2:43 PM
 */
public enum CGSRole {


    T2K_ADMIN,
    ADMIN,
    PUBLISHER_ADMIN,
    GROUP_ADMIN,
    AUTHOR,
    CONTENT_DEVELOPER,
    REVIEWER,
    EDITOR;


    public static CGSRole forName(String name) {

        for (CGSRole type : CGSRole.values()) {
            if (type.name().equals(name)) {
                return type;
            }
        }
        return null;
    }
}
