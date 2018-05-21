package org.t2k.cgs.domain.model;

import com.mongodb.DBObject;

import java.util.Date;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 22/10/12
 * Time: 14:47
 */
public interface ContentItem extends ContentItemBase {

    Date getLastModified();

    void setLastModified(Date lastModified);

    void setPublishedToProd(Date lastModified);

    void setTocIdsPublishedToProd(List<String> tocIds);

    void setEditioned(Date editionedDate);

    String getTitle();

    DBObject getContentData();

    DBObject getCGSData();

    DBObject getData();

    DBObject getCgsHeaderData();

    void createNewHeader();

    String serializeContentData();

    String serializeContentHeader();

    /**
     * @return true if the object is a newly created item; false if it is an existing (updated) one
     */
    boolean isNew();
}