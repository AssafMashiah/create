package org.t2k.cgs.domain.model.lock;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.springframework.data.mongodb.core.mapping.Document;
import org.t2k.cgs.persistence.dao.EntityType;
import org.t2k.cgs.utils.JsonDateSerializer;

import java.io.Serializable;
import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 30/10/12
 * Time: 16:30
 */
@Document
@JsonAutoDetect
public class Lock implements Serializable{


    public final static String DB_USERNAME="userName";
    public final static String DB_PUBLISHER_ID="userPublisherId";



    private String entityId;
    private String contentId;
    private String contentVersion;

    private EntityType entityType;

    private String entityName;
    private String userName;
    private String userEmail;
    private long userPublisherId;
    private Date lockDate;


    public Lock(String entityId, String contentId, String contentVersion , EntityType entityType, String userName, String userEmail , long userPublisherId, String entityName) {
        this.entityId = entityId;
        this.entityType = entityType;
        this.userName = userName;
        this.userEmail = userEmail;
        this.userPublisherId=userPublisherId;
        this.contentId=contentId;
        this.contentVersion=contentVersion;
        this.entityName=entityName;

        this.lockDate=new Date();
    }





    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public EntityType getEntityType() {
        return entityType;
    }

    public void setEntityType(EntityType entityType) {
        this.entityType = entityType;
    }


    public String getEntityName() {
        return entityName;
    }

    public void setEntityName(String entityName) {
        this.entityName = entityName;
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

    public long getUserPublisherId() {
        return userPublisherId;
    }

    public void setUserPublisherId(long userPublisherId) {
        this.userPublisherId = userPublisherId;
    }


    @JsonSerialize(using=JsonDateSerializer.class)
    public Date getLockDate() {
        return lockDate;
    }

    public void setLockDate(Date lockDate) {
        this.lockDate = lockDate;
    }


    public String getContentId() {
        return contentId;
    }

    public void setContentId(String contentId) {
        this.contentId = contentId;
    }

    public String getContentVersion() {
        return contentVersion;
    }

    public void setContentVersion(String contentVersion) {
        this.contentVersion = contentVersion;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Lock)) return false;

        Lock lock = (Lock) o;

        if (userPublisherId != lock.userPublisherId) return false;
        if (entityId != null ? !entityId.equals(lock.entityId) : lock.entityId != null) return false;
        if (entityType != lock.entityType) return false;
        if (userEmail != null ? !userEmail.equals(lock.userEmail) : lock.userEmail != null) return false;
        if (userName != null ? !userName.equals(lock.userName) : lock.userName != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = entityId != null ? entityId.hashCode() : 0;
        result = 31 * result + (entityType != null ? entityType.hashCode() : 0);
        result = 31 * result + (userName != null ? userName.hashCode() : 0);
        result = 31 * result + (userEmail != null ? userEmail.hashCode() : 0);
        result = 31 * result + (int) (userPublisherId ^ (userPublisherId >>> 32));
        result = 31 * result + (lockDate != null ? lockDate.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Lock{" +
                "entityId='" + entityId + '\'' +
                ", contentId='" + contentId + '\'' +
                ", contentVersion='" + contentVersion + '\'' +
                ", entityType=" + entityType +
                ", entityName='" + entityName + '\'' +
                ", userName='" + userName + '\'' +
                ", userEmail='" + userEmail + '\'' +
                ", userPublisherId=" + userPublisherId +
                ", lockDate=" + lockDate +
                '}';
    }
}
