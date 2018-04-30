package org.t2k.cgs.domain.model.user;

import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: elad.avidan
 * Date: 06/01/2015
 * Time: 11:33
 */
public class UserSession {

    private String sessionId;
    private int userId;
    private String username;
    private Date creationDate;
    private Date destructionDate;
    private UserSessionStatus status;

    public UserSession(String sessionId, int userId, String username) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.username = username;
        this.creationDate = new Date();
        this.status = UserSessionStatus.Authenticated;
    }

    public String getSessionId() {
        return sessionId;
    }

    public int getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    public Date getDestructionDate() {
        return destructionDate;
    }

    public void setCreationDate(Date creationDate) {
        this.creationDate = creationDate;
    }

    public void setDestructionDate(Date destructionDate) {
        this.destructionDate = destructionDate;
    }

    public UserSessionStatus getStatus() {
        return status;
    }

    public void setStatus(UserSessionStatus status) {
        this.status = status;
    }

    /**
     * Returns a brief description of this UserSession. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * UserSession{"sessionId": "1EEDDASWE123DD", "userId": 564, "creationDate": "Thu Sep 15 15:33:28 EEST 2016",
     * destructionDate: "None"}
     */
    @Override
    public String toString() {
        return "UserSession{" +
                "\"sessionId\": \"" + sessionId + '\"' +
                ", \"userId\": " + userId +
                ", \"creationDate\": \"" + creationDate + '\"' +
                ", \"destructionDate\": \"" + (destructionDate == null ? "None" : destructionDate) + '\"' +
                '}';
    }
}
