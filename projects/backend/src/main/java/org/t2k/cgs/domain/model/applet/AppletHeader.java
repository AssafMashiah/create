package org.t2k.cgs.domain.model.applet;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import org.springframework.data.mongodb.core.mapping.Field;
import org.t2k.cgs.domain.model.ContentItemBase;
import org.t2k.cgs.domain.model.ContentItemBase;
import org.t2k.cgs.utils.JsonMongoDateSerializer;

import java.util.Date;

/**
 * Created by IntelliJ IDEA.
 * User: anya.grinberg
 * Date: 04/02/13
 * Time: 09:53
 */
public class AppletHeader {
    @Field(value=ContentItemBase.LAST_MODIFIED)                         //for mongo
    Date lastModified = new Date();

    @JsonProperty(ContentItemBase.LAST_MODIFIED)
    @JsonSerialize(using = JsonMongoDateSerializer.class)     //for rest
    public Date getLastModified() {
        return lastModified;
    }

    @JsonProperty(ContentItemBase.LAST_MODIFIED)
    public void setLastModified(Date lastModified) {
        this.lastModified = lastModified;
    }
}
