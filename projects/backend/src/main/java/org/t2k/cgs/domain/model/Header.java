package org.t2k.cgs.domain.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.mongodb.DBObject;
import org.springframework.data.mongodb.core.mapping.Field;
import org.t2k.cgs.utils.JsonDateDeserializer;
import org.t2k.cgs.utils.JsonMongoDateSerializer;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * @author Alex Burdusel on 2016-06-15.
 */
//@JsonInclude(JsonInclude.Include.NON_NULL)
public class Header implements Comparable<Header> {

    @JsonSerialize(using = JsonMongoDateSerializer.class)
    @JsonDeserialize(using = JsonDateDeserializer.class)
    private Date creationDate;

    @JsonProperty(value = "last-modified")
    @Field(value = "last-modified")
    @JsonSerialize(using = JsonMongoDateSerializer.class)
    @JsonDeserialize(using = JsonDateDeserializer.class)
    private Date lastModified = new Date(0);

    @JsonSerialize(using = JsonMongoDateSerializer.class)
    @JsonDeserialize(using = JsonDateDeserializer.class)
    private Date editioned;

    @JsonSerialize(using = JsonMongoDateSerializer.class)
    @JsonDeserialize(using = JsonDateDeserializer.class)
    private Date publishedToProduction;

    private List<String> tocIdsPublishedToProduction;

    public Header() {
        creationDate = new Date();
    }

    public static Header newInstance(Date creationDate) {
        Header header = new Header();
        header.creationDate = creationDate;
        header.lastModified = creationDate; // otherwise course is not listed in the client's all courses list
        return header;
    }

    public static Header of(DBObject dbObject) {
        Header header = new Header();
        header.creationDate = (Date) dbObject.get("creationDate");
        header.lastModified = (Date) dbObject.get(ContentItemBase.LAST_MODIFIED);
        header.publishedToProduction = (Date) dbObject.get(ContentItemBase.PUBLISHED_TO_PROD);
        header.editioned = (Date) dbObject.get(ContentItemBase.EDITIONED);
        header.tocIdsPublishedToProduction = (List<String>) dbObject.get(ContentItemBase.TOC_IDS_PUBLISHED_TO_PROD);
        return header;
    }

    public static Header newInstance(Header existingHeader, Date lastModified) {
        Header header = new Header();
        header.creationDate = existingHeader.getCreationDate();
        header.editioned = existingHeader.editioned;
        header.publishedToProduction = existingHeader.publishedToProduction;
        header.tocIdsPublishedToProduction = ((existingHeader.tocIdsPublishedToProduction == null)
                ? null
                : new ArrayList<>(existingHeader.tocIdsPublishedToProduction));
        header.lastModified = lastModified;
        return header;
    }

    public Date getLastModified() {
        return lastModified;
    }

    public Date getEditioned() {
        return editioned;
    }

    public Date getPublishedToProduction() {
        return publishedToProduction;
    }

    public List<String> getTocIdsPublishedToProduction() {
        return tocIdsPublishedToProduction;
    }

    public Date getCreationDate() {
        return creationDate;
    }

    @Override
    public int compareTo(Header o) {
        if (this == o) {
            return 0;
        }
        int idDiff = this.creationDate.compareTo(o.creationDate);
        if (idDiff != 0) {
            return idDiff;
        }
        return this.lastModified.compareTo(o.lastModified);
    }

    /**
     * Returns a brief description of this Header. The exact details
     * of the representation are unspecified and subject to change,
     * but the following may be regarded as typical:
     * <p>
     * Header{"creationDate": "Thu Sep 15 15:33:28 EEST 2016, "lastModified": "Thu Sep 16 15:35:28 EEST 2016"}
     */
    @Override
    public String toString() {
        return "Header{" +
                "\"creationDate\": \"" + creationDate + '\"' +
                ", \"lastModified\": \"" + lastModified + '\"' +
                ", \"editioned\": \"" + editioned + '\"' +
                ", \"publishedToProduction\": \"" + publishedToProduction + '\"' +
                ", \"tocIdsPublishedToProduction\": " + tocIdsPublishedToProduction +
                '}';
    }
}
