package org.t2k.cgs.service;

import org.t2k.cgs.domain.model.ContentItemBase;
import org.t2k.cgs.persistence.dao.EntityType;

import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: micha.shlain
 * Date: 10/31/12
 * Time: 2:19 PM
 */
public class SimpleContentItem implements ContentItemBase {

    private EntityType entityType;
    private String contentId;
    private String entityId;
    private String version;
    private String title;
    private Date lastModified = new Date();

    public SimpleContentItem(String entityId, String version, String contentId, String typeName, String title) {
        this.contentId = contentId;
        this.entityId = entityId;
        this.version = version;
        this.entityType = EntityType.forName(typeName);
        this.title = title;
    }

    public SimpleContentItem(String entityId, String version, String contentId, EntityType entityType, String title) {
        this.contentId = contentId;
        this.entityId = entityId;
        this.version = version;
        this.entityType = entityType;
        this.title = title;
    }

    @Override
    public Date getLastModified() {
        return null;  //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public EntityType getEntityType() {
        return this.entityType;
    }

    @Override
    public String getContentId() {
        return this.contentId;
    }

    @Override
    public void setContentId(String contentId) {
        this.contentId = contentId;
    }

    @Override
    public String getEntityId() {
        return this.entityId;
    }

    @Override
    public String getContentVersionNumber() {
        return this.version;
    }

    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }


}
