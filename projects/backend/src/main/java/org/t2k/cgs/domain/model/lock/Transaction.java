package org.t2k.cgs.domain.model.lock;

import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 30/10/12
 * Time: 16:30
 */

@Document(collection = "transactions")
public class Transaction {

    private Date transactionDate;
    private String userName;
    private String courseId;
    private boolean publishing;

    public Transaction(Date transactionDate, String userName, String courseId, boolean publishing) {

        this.transactionDate = transactionDate;
        this.userName = userName;
        this.courseId = courseId;
        this.publishing = publishing;
    }

    public Date getTransactionDate() {

        return transactionDate;
    }

    public void setTransactionDate(Date transactionDate) {

        this.transactionDate = transactionDate;
    }

    public String getUserName() {

        return userName;
    }

    public void setUserName(String userName) {

        this.userName = userName;
    }

    public String getCourseId() {

        return courseId;
    }

    public void setCourseId(String courseId) {

        this.courseId = courseId;
    }


    @Override
    public String toString() {

        return "by: "+this.getUserName() + "on: " + this.getCourseId() +
                "at: " + this.getTransactionDate().toString();
    }

    public boolean isPublishing() {

        return publishing;
    }

    public void setPublishing(boolean publishing) {

        this.publishing = publishing;
    }
}
