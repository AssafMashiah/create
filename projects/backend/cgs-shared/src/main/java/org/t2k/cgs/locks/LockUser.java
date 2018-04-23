package org.t2k.cgs.locks;

import org.t2k.cgs.security.CGSUserDetails;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 29/11/12
 * Time: 13:21
 */
public class LockUser {

    private CGSUserDetails cgsUserDetails;

    private String userName;
    private String userFirstName;
    private String userLastName;
    private String userEmail;
    private int publisherId;

    public LockUser(CGSUserDetails cgsUserDetails) {
        if (cgsUserDetails == null) {
            throw new IllegalArgumentException("[Assertion failed] - cgsUserDetails argument is required; it must not be null");
        }
        this.cgsUserDetails = cgsUserDetails;
        this.userName = cgsUserDetails.getUsername();
        this.userFirstName = cgsUserDetails.getFirstName();
        this.userLastName = cgsUserDetails.getLastName();
        this.userEmail = cgsUserDetails.getEmail();
        if (cgsUserDetails.getRelatesTo() != null) this.publisherId = cgsUserDetails.getRelatesTo().getId();
    }

    public LockUser(String userName, String userFirstName, String userLastName, String userEmail, int publisherId) {
        this.userName = userName;
        this.userFirstName = userFirstName;
        this.userLastName = userLastName;
        this.userEmail = userEmail;
        this.publisherId = publisherId;
    }

    public String getUserName() {
        return userName;
    }

    public String getFirstName() {
        return userFirstName;
    }

    public String getLastNameName() {
        return userLastName;
    }

    public int getPublisherId() {
        return publisherId;
    }

    public String getEmail() {
        return userEmail;
    }


    @Override
    public String toString() {
        return "LockUser{" +
                "publisherId=" + publisherId +
                ", userEmail='" + userEmail + '\'' +
                ", userLastName='" + userLastName + '\'' +
                ", userFirstName='" + userFirstName + '\'' +
                ", userName='" + userName + '\'' +
                '}';
    }
}
