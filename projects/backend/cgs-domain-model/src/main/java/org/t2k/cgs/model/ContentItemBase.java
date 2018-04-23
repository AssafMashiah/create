package org.t2k.cgs.model;

import org.t2k.cgs.dataServices.EntityType;

import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: ophir.barnea
 * Date: 22/10/12
 * Time: 16:16
 */
public interface ContentItemBase {

    String CGS_DATA = "cgsData";
    String CGS_CONTENT = "contentData";
    String HEADER = "header";
    String CID = "cid";
    String LAST_MODIFIED = "last-modified";
    String DELETION_DATE = "deletionDate";
    String PUBLISHED_TO_PROD = "publishedToProduction";
    String TOC_IDS_PUBLISHED_TO_PROD = "tocIdsPublishedToProduction";
    String TOCS = "toc";
    String EDITIONED = "editioned";
    String TOC_ITEMS = "tocItems";
    String TOC_ITEM_REFS = "tocItemRefs";
    String TITLE = "title";
    String TYPE = "type";
    String SCHEMA = "schema";
    String FORMAT = "format";
    String CGS_VERSION = "cgsVersion";

    String CGS_HEADER = CGS_CONTENT + "." + HEADER;
    String CGS_ID = CGS_CONTENT + "." + CID;
    String CGS_LAST_MODIFIED = CGS_HEADER + "." + LAST_MODIFIED;
    String CGS_DELETION_DATE = CGS_HEADER + "." + DELETION_DATE;
    String CGS_TITLE = CGS_CONTENT + "." + TITLE;
    String CGS_TYPE = CGS_CONTENT + "." + TYPE;
    String CGS_SCHEMA = CGS_CONTENT + "." + SCHEMA;
    String CGS_FORMAT = CGS_CONTENT + "." + FORMAT;

    String getContentId();

    void setContentId(String cid);

    EntityType getEntityType();

    String getEntityId();

    String getContentVersionNumber();

    String getTitle();

    Date getLastModified();
}