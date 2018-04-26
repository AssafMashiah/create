package org.t2k.cgs.model;

import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 04/11/12
 * Time: 16:01
 */
public class Version {

    private String number;
    private String comment;
    private String userName;
    private String userEmail;
    private Date date;
    private boolean isTrunk;


    public Version(String userEmail, boolean trunk, String userName, String comment, String number) {
        this.userEmail = userEmail;
        isTrunk = trunk;
        this.userName = userName;
        this.comment = comment;
        this.number = number;
        this.date=new Date();
    }


    public Version(String number, String comment, String userName, String userEmail, Date date, boolean trunk) {
        this.number = number;
        this.comment = comment;
        this.userName = userName;
        this.userEmail = userEmail;
        this.date = date;
        isTrunk = trunk;
    }


    public Version() {
    }

    public String getNumber() {
        return number;
    }

    public void setNumber(String number) {
        this.number = number;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public boolean isTrunk() {
        return isTrunk;
    }

    public void setTrunk(boolean trunk) {
        isTrunk = trunk;
    }
}
